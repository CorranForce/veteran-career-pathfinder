/**
 * referral.ts — tRPC router for the Refer-a-Veteran feature.
 *
 * Endpoints
 * ─────────────────────────────────────────────────────────────────────────────
 * User-facing (protectedProcedure):
 *   referral.getMyCode          — get-or-create the caller's referral code + stats
 *   referral.getMyConversions   — list all conversions earned by the caller
 *   referral.trackClick         — increment click counter (called on landing page)
 *
 * Public (publicProcedure):
 *   referral.validateCode       — validate a ?ref= slug before signup
 *
 * Internal / Webhook (protectedProcedure, called from Stripe webhook handler):
 *   referral.recordConversion   — record a completed Premium purchase conversion
 *
 * Admin (adminProcedure):
 *   referral.adminGetAll        — list all codes + conversions for admin dashboard
 *   referral.adminReverseReward — reverse a reward after a refund
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getOrCreateReferralCode,
  getReferralCodeBySlug,
  getReferralCodeByUserId,
  getConversionsByReferrer,
  createReferralConversion,
  conversionExistsForPurchase,
  markRewardIssued,
  markRewardReversed,
  getAllConversions,
  getAllReferralCodes,
  incrementReferralClick,
  incrementReferralSignup,
} from "../db-referral";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Builds the full shareable URL from a code slug */
function buildReferralUrl(origin: string, code: string): string {
  return `${origin}/signup?ref=${code}`;
}

/** Admin guard — reused across admin procedures */
function assertAdmin(role: string) {
  if (role !== "admin" && role !== "platform_owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const referralRouter = router({
  /**
   * GET /api/trpc/referral.getMyCode
   *
   * Returns the caller's referral code record (creating it on first call) plus
   * the full shareable URL.  This is the primary endpoint for the user's
   * "Refer a Veteran" dashboard widget.
   *
   * Response shape:
   * {
   *   id, code, shareUrl,
   *   totalClicks, totalSignups, totalConversions,
   *   estimatedRewardCents,   // totalConversions × 500
   *   isActive, createdAt
   * }
   */
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    const record = await getOrCreateReferralCode(ctx.user.id);
    const origin =
      ctx.req.headers.origin ||
      `${ctx.req.protocol}://${ctx.req.get("host")}`;

    return {
      id: record.id,
      code: record.code,
      shareUrl: buildReferralUrl(origin, record.code),
      totalClicks: record.totalClicks,
      totalSignups: record.totalSignups,
      totalConversions: record.totalConversions,
      // $5 per conversion — displayed in the dashboard as pending credit
      estimatedRewardCents: record.totalConversions * 500,
      isActive: record.isActive,
      createdAt: record.createdAt,
    };
  }),

  /**
   * GET /api/trpc/referral.getMyConversions
   *
   * Returns a list of all conversions earned by the caller, ordered newest
   * first.  Each row includes the reward status so the UI can show
   * "Pending / Issued / Reversed" badges.
   */
  getMyConversions: protectedProcedure.query(async ({ ctx }) => {
    const conversions = await getConversionsByReferrer(ctx.user.id);
    return conversions.map((c) => ({
      id: c.id,
      refereeId: c.refereeId,
      rewardCents: c.rewardCents,
      rewardStatus: c.rewardStatus,
      rewardIssuedAt: c.rewardIssuedAt,
      createdAt: c.createdAt,
    }));
  }),

  /**
   * MUTATION /api/trpc/referral.trackClick
   *
   * Increments the click counter for a given referral code slug.
   * Called client-side when a visitor lands on /signup?ref=VET-XXXXXX.
   * Intentionally public so unauthenticated visitors can trigger it.
   *
   * Input: { code: string }
   */
  trackClick: publicProcedure
    .input(z.object({ code: z.string().min(1).max(32) }))
    .mutation(async ({ input }) => {
      const record = await getReferralCodeBySlug(input.code);
      if (!record || !record.isActive) {
        // Silently ignore invalid / inactive codes — no error to the client
        return { ok: false };
      }
      await incrementReferralClick(record.id);
      return { ok: true };
    }),

  /**
   * MUTATION /api/trpc/referral.trackSignup
   *
   * Increments the signup counter for a given referral code slug.
   * Called server-side (from the email/OAuth signup handler) when a new user
   * completes registration with a ?ref= code in their session.
   *
   * Input: { code: string }
   */
  trackSignup: publicProcedure
    .input(z.object({ code: z.string().min(1).max(32) }))
    .mutation(async ({ input }) => {
      const record = await getReferralCodeBySlug(input.code);
      if (!record || !record.isActive) return { ok: false };
      await incrementReferralSignup(record.id);
      return { ok: true };
    }),

  /**
   * QUERY /api/trpc/referral.validateCode
   *
   * Validates a ?ref= slug before the signup form is submitted.
   * Returns { valid: boolean, referrerName?: string } so the UI can show
   * "You were referred by [name]" or silently ignore an invalid code.
   *
   * Input: { code: string }
   */
  validateCode: publicProcedure
    .input(z.object({ code: z.string().min(1).max(32) }))
    .query(async ({ input }) => {
      const record = await getReferralCodeBySlug(input.code);
      if (!record || !record.isActive) {
        return { valid: false };
      }
      return { valid: true, referralCodeId: record.id };
    }),

  /**
   * MUTATION /api/trpc/referral.recordConversion
   *
   * Records a completed Premium purchase that was attributed to a referral
   * code.  Called from the Stripe webhook handler after
   * `checkout.session.completed` is verified.
   *
   * Idempotent: silently returns if the purchaseId has already been recorded.
   *
   * Input:
   * {
   *   referralCodeId: number,
   *   referrerId:     number,
   *   refereeId:      number,
   *   purchaseId:     number,
   *   rewardCents?:   number   (default 500)
   * }
   */
  recordConversion: protectedProcedure
    .input(
      z.object({
        referralCodeId: z.number().int().positive(),
        referrerId: z.number().int().positive(),
        refereeId: z.number().int().positive(),
        purchaseId: z.number().int().positive(),
        rewardCents: z.number().int().min(0).default(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only the platform owner or an admin may call this directly.
      // In practice it is called from the webhook handler which runs as the
      // system; the protectedProcedure guard ensures a valid session exists.
      assertAdmin(ctx.user.role);

      // Idempotency guard
      const alreadyRecorded = await conversionExistsForPurchase(input.purchaseId);
      if (alreadyRecorded) {
        return { created: false, reason: "already_recorded" };
      }

      const conversion = await createReferralConversion({
        referralCodeId: input.referralCodeId,
        referrerId: input.referrerId,
        refereeId: input.refereeId,
        purchaseId: input.purchaseId,
        rewardCents: input.rewardCents,
        refereeDiscountBps: 1000, // 10 % discount applied at checkout
        rewardStatus: "pending",
      });

      return { created: true, conversionId: conversion.id };
    }),

  /**
   * MUTATION /api/trpc/referral.issueReward
   *
   * Marks a conversion's reward as issued.
   * Called after the platform owner manually (or automatically) credits the
   * referrer's account.
   *
   * Input: { conversionId: number }
   */
  issueReward: protectedProcedure
    .input(z.object({ conversionId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx.user.role);
      await markRewardIssued(input.conversionId);
      return { ok: true };
    }),

  // ─── Admin endpoints ────────────────────────────────────────────────────────

  /**
   * QUERY /api/trpc/referral.adminGetAll
   *
   * Returns all referral codes (with aggregate stats) and the 100 most recent
   * conversions.  Used by the admin dashboard.
   */
  adminGetAll: protectedProcedure.query(async ({ ctx }) => {
    assertAdmin(ctx.user.role);
    const [codes, conversions] = await Promise.all([
      getAllReferralCodes(),
      getAllConversions(100),
    ]);
    return { codes, conversions };
  }),

  /**
   * MUTATION /api/trpc/referral.adminReverseReward
   *
   * Reverses a previously issued reward (e.g. after a refund).
   *
   * Input: { conversionId: number, notes?: string }
   */
  adminReverseReward: protectedProcedure
    .input(
      z.object({
        conversionId: z.number().int().positive(),
        notes: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx.user.role);
      await markRewardReversed(input.conversionId, input.notes);
      return { ok: true };
    }),
});
