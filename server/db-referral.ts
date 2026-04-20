/**
 * db-referral.ts
 * Database helper functions for the Refer-a-Veteran feature.
 * All functions accept a `db` instance so they are easy to unit-test
 * with a mock or real test database.
 */

import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  referralCodes,
  referralConversions,
  type ReferralCode,
  type ReferralConversion,
  type InsertReferralCode,
  type InsertReferralConversion,
} from "../drizzle/schema";

// ─── Code generation ─────────────────────────────────────────────────────────

/**
 * Generate a unique referral code slug in the format "VET-XXXXXX"
 * where X is an uppercase alphanumeric character.
 * Uniqueness is enforced by a DB unique constraint; callers should
 * retry on collision (extremely rare with 36^6 ≈ 2.2 billion combinations).
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O or 1/I to avoid confusion
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `VET-${suffix}`;
}

// ─── Referral Code CRUD ───────────────────────────────────────────────────────

/**
 * Get the referral code record for a user, or null if none exists yet.
 */
export async function getReferralCodeByUserId(
  userId: number
): Promise<ReferralCode | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Look up a referral code record by its slug (e.g. "VET-A1B2C3").
 */
export async function getReferralCodeBySlug(
  code: string
): Promise<ReferralCode | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.code, code))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Get-or-create the referral code for a user.
 * Creates a new code with a unique slug on first call; returns the existing
 * record on subsequent calls.
 */
export async function getOrCreateReferralCode(
  userId: number
): Promise<ReferralCode> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  // Return existing code if present
  const existing = await getReferralCodeByUserId(userId);
  if (existing) return existing;

  // Generate a unique slug (retry up to 5 times on collision)
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateReferralCode();
    const collision = await getReferralCodeBySlug(slug);
    if (collision) continue;

    const insert: InsertReferralCode = {
      userId,
      code: slug,
      totalClicks: 0,
      totalSignups: 0,
      totalConversions: 0,
      isActive: true,
    };
    await db.insert(referralCodes).values(insert);
    const created = await getReferralCodeByUserId(userId);
    if (!created) throw new Error("Failed to retrieve newly created referral code");
    return created;
  }
  throw new Error("Failed to generate a unique referral code after 5 attempts");
}

/**
 * Increment the click counter for a referral code.
 * Called when a visitor lands on /signup?ref=VET-XXXXXX.
 */
export async function incrementReferralClick(codeId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(referralCodes)
    .set({ totalClicks: (referralCodes.totalClicks as any) + 1 })
    .where(eq(referralCodes.id, codeId));
}

/**
 * Increment the signup counter for a referral code.
 * Called when a new user completes registration via a referral link.
 */
export async function incrementReferralSignup(codeId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(referralCodes)
    .set({ totalSignups: (referralCodes.totalSignups as any) + 1 })
    .where(eq(referralCodes.id, codeId));
}

/**
 * Increment the conversion counter for a referral code.
 * Called when a referred user completes a Premium purchase.
 */
export async function incrementReferralConversion(codeId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(referralCodes)
    .set({ totalConversions: (referralCodes.totalConversions as any) + 1 })
    .where(eq(referralCodes.id, codeId));
}

// ─── Referral Conversion CRUD ─────────────────────────────────────────────────

/**
 * Record a new referral conversion when a referred user purchases Premium.
 * Also increments the conversion counter on the parent referral code.
 */
export async function createReferralConversion(
  data: InsertReferralConversion
): Promise<ReferralConversion> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.insert(referralConversions).values(data);

  // Increment the conversion counter on the parent code
  await incrementReferralConversion(data.referralCodeId);

  // Retrieve the inserted row
  const rows = await db
    .select()
    .from(referralConversions)
    .where(
      and(
        eq(referralConversions.referralCodeId, data.referralCodeId),
        eq(referralConversions.refereeId, data.refereeId),
        eq(referralConversions.purchaseId, data.purchaseId)
      )
    )
    .orderBy(desc(referralConversions.createdAt))
    .limit(1);

  if (!rows[0]) throw new Error("Failed to retrieve newly created referral conversion");
  return rows[0];
}

/**
 * Get all conversions for a given referrer (for the user's referral dashboard).
 */
export async function getConversionsByReferrer(
  referrerId: number
): Promise<ReferralConversion[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(referralConversions)
    .where(eq(referralConversions.referrerId, referrerId))
    .orderBy(desc(referralConversions.createdAt));
}

/**
 * Check whether a specific purchase has already been attributed to a referral
 * (prevents double-crediting on webhook retries).
 */
export async function conversionExistsForPurchase(
  purchaseId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const rows = await db
    .select()
    .from(referralConversions)
    .where(eq(referralConversions.purchaseId, purchaseId))
    .limit(1);
  return rows.length > 0;
}

/**
 * Mark a conversion's reward as issued.
 */
export async function markRewardIssued(conversionId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(referralConversions)
    .set({ rewardStatus: "issued", rewardIssuedAt: new Date() })
    .where(eq(referralConversions.id, conversionId));
}

/**
 * Mark a conversion's reward as reversed (e.g. after a refund).
 */
export async function markRewardReversed(
  conversionId: number,
  notes?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(referralConversions)
    .set({
      rewardStatus: "reversed",
      rewardReversedAt: new Date(),
      notes: notes ?? null,
    })
    .where(eq(referralConversions.id, conversionId));
}

/**
 * Admin: get all conversions across all users (for the admin dashboard).
 * Returns the 100 most recent conversions.
 */
export async function getAllConversions(limit = 100): Promise<ReferralConversion[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(referralConversions)
    .orderBy(desc(referralConversions.createdAt))
    .limit(limit);
}

/**
 * Admin: get all referral codes with their aggregate stats.
 */
export async function getAllReferralCodes(): Promise<ReferralCode[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(referralCodes)
    .orderBy(desc(referralCodes.totalConversions));
}
