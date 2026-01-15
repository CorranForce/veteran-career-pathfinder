import { getDb } from "../db";
import { abTestVariants, dripSends, emailEvents } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * A/B Testing Service
 * Manages subject line variants and tracks performance
 */

/**
 * Get a subject line variant for a campaign
 * Uses weighted random selection based on variant weights
 */
export async function getVariantForCampaign(campaignId: number): Promise<{
  variantId: number;
  subject: string;
} | null> {
  const db = await getDb();
  if (!db) return null;

  // Get all variants for this campaign
  const variants = await db
    .select()
    .from(abTestVariants)
    .where(eq(abTestVariants.campaignId, campaignId));

  if (variants.length === 0) return null;

  // Weighted random selection
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;

  for (const variant of variants) {
    random -= variant.weight;
    if (random <= 0) {
      return {
        variantId: variant.id,
        subject: variant.subject,
      };
    }
  }

  // Fallback to first variant
  return {
    variantId: variants[0].id,
    subject: variants[0].subject,
  };
}

/**
 * Calculate performance metrics for all variants of a campaign
 */
export async function getVariantPerformance(campaignId: number) {
  const db = await getDb();
  if (!db) return null;

  const variants = await db
    .select()
    .from(abTestVariants)
    .where(eq(abTestVariants.campaignId, campaignId));

  if (variants.length === 0) return null;

  const performance = await Promise.all(
    variants.map(async (variant) => {
      // Get sends for this variant
      const sends = await db
        .select()
        .from(dripSends)
        .where(eq(dripSends.campaignId, campaignId));

      // Count opens for this variant (simplified - in production, link variant to send)
      const opens = await db
        .select()
        .from(emailEvents)
        .where(eq(emailEvents.eventType, "open"));

      const openRate =
        sends.length > 0 ? Math.round((opens.length / sends.length) * 100) : 0;

      return {
        id: variant.id,
        variantName: variant.variantName,
        subject: variant.subject,
        weight: variant.weight,
        isWinner: variant.isWinner,
        sends: sends.length,
        opens: opens.length,
        openRate,
      };
    })
  );

  return performance;
}

/**
 * Determine winner based on open rates
 * Updates the winning variant and adjusts weights
 */
export async function determineWinner(campaignId: number) {
  const db = await getDb();
  if (!db) return null;

  const performance = await getVariantPerformance(campaignId);
  if (!performance || performance.length < 2) return null;

  // Find variant with highest open rate
  const winner = performance.reduce((best, current) =>
    current.openRate > best.openRate ? current : best
  );

  // Update winner status
  await db
    .update(abTestVariants)
    .set({ isWinner: "true" })
    .where(eq(abTestVariants.id, winner.id));

  // Update weights - give winner 70%, split rest among others
  const otherVariants = performance.filter((v) => v.id !== winner.id);
  const otherWeight = Math.floor(30 / otherVariants.length);

  for (const variant of otherVariants) {
    await db
      .update(abTestVariants)
      .set({ weight: otherWeight })
      .where(eq(abTestVariants.id, variant.id));
  }

  console.log(
    `[A/B Testing] Winner determined for campaign ${campaignId}: ${winner.variantName} (${winner.openRate}% open rate)`
  );

  return winner;
}

/**
 * Create A/B test variants for a campaign
 */
export async function createVariants(
  campaignId: number,
  variants: Array<{ variantName: string; subject: string }>
) {
  const db = await getDb();
  if (!db) return;

  const weight = Math.floor(100 / variants.length);

  for (const variant of variants) {
    await db.insert(abTestVariants).values({
      campaignId,
      variantName: variant.variantName,
      subject: variant.subject,
      weight,
      isWinner: "false",
    });
  }

  console.log(`[A/B Testing] Created ${variants.length} variants for campaign ${campaignId}`);
}

/**
 * Get recommended subject lines for new campaigns
 * Based on winning variants from past campaigns
 */
export async function getRecommendedSubjectLines(): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  const winners = await db
    .select()
    .from(abTestVariants)
    .where(eq(abTestVariants.isWinner, "true"));

  return winners.map((w) => w.subject);
}
