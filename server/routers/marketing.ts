import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { dripCampaigns, abTestVariants, subscriberSegments } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getDripStats } from "../services/dripCampaigns";
import { getVariantPerformance, determineWinner, createVariants } from "../services/abTesting";
import { getSegmentStats, getReEngagementCandidates, getUpsellCandidates } from "../services/segmentation";

/**
 * Marketing Router
 * Procedures for managing drip campaigns, A/B tests, and segments
 */

export const marketingRouter = router({
  /**
   * Get drip campaign statistics
   */
  getDripStats: protectedProcedure.query(async () => {
    const stats = await getDripStats();
    return stats || [];
  }),

  /**
   * Get all drip campaigns
   */
  getDripCampaigns: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const campaigns = await db.select().from(dripCampaigns);
    return campaigns;
  }),

  /**
   * Update drip campaign
   */
  updateDripCampaign: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        subject: z.string().optional(),
        htmlContent: z.string().optional(),
        textContent: z.string().optional(),
        isActive: z.enum(["true", "false"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.subject) updateData.subject = input.subject;
      if (input.htmlContent) updateData.htmlContent = input.htmlContent;
      if (input.textContent) updateData.textContent = input.textContent;
      if (input.isActive) updateData.isActive = input.isActive;

      await db
        .update(dripCampaigns)
        .set(updateData)
        .where(eq(dripCampaigns.id, input.id));

      return { success: true };
    }),

  /**
   * Get A/B test variants for a campaign
   */
  getVariants: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      const performance = await getVariantPerformance(input.campaignId);
      return performance || [];
    }),

  /**
   * Create A/B test variants
   */
  createVariants: protectedProcedure
    .input(
      z.object({
        campaignId: z.number(),
        variants: z.array(
          z.object({
            variantName: z.string(),
            subject: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      await createVariants(input.campaignId, input.variants);
      return { success: true };
    }),

  /**
   * Determine A/B test winner
   */
  determineWinner: protectedProcedure
    .input(z.object({ campaignId: z.number() }))
    .mutation(async ({ input }) => {
      const winner = await determineWinner(input.campaignId);
      return winner || null;
    }),

  /**
   * Get segment statistics
   */
  getSegmentStats: protectedProcedure.query(async () => {
    const stats = await getSegmentStats();
    return stats || { highly_engaged: 0, active: 0, inactive: 0, cold_lead: 0, total: 0 };
  }),

  /**
   * Get re-engagement candidates
   */
  getReEngagementCandidates: protectedProcedure.query(async () => {
    const candidates = await getReEngagementCandidates();
    return candidates;
  }),

  /**
   * Get upsell candidates
   */
  getUpsellCandidates: protectedProcedure.query(async () => {
    const candidates = await getUpsellCandidates();
    return candidates;
  }),
});
