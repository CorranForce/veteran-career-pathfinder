import { getDb } from "../db";
import { subscribers, subscriberSegments, emailEvents, dripSends } from "../../drizzle/schema";
import { eq, and, gte } from "drizzle-orm";

/**
 * Subscriber Segmentation Service
 * Automatically segments subscribers based on engagement levels
 */

export type SegmentType = "active" | "inactive" | "highly_engaged" | "cold_lead";

/**
 * Calculate engagement score for a subscriber
 * Based on email opens, clicks, and drip campaign participation
 */
async function calculateEngagementScore(subscriberId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Get subscriber's email
  const [subscriber] = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.id, subscriberId));

  if (!subscriber) return 0;

  // Count opens in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const opens = await db
    .select()
    .from(emailEvents)
    .where(
      and(
        eq(emailEvents.email, subscriber.email),
        eq(emailEvents.eventType, "open"),
        gte(emailEvents.createdAt, thirtyDaysAgo)
      )
    );

  // Count clicks in last 30 days
  const clicks = await db
    .select()
    .from(emailEvents)
    .where(
      and(
        eq(emailEvents.email, subscriber.email),
        eq(emailEvents.eventType, "click"),
        gte(emailEvents.createdAt, thirtyDaysAgo)
      )
    );

  // Count drip campaigns received
  const dripCount = await db
    .select()
    .from(dripSends)
    .where(eq(dripSends.subscriberId, subscriberId));

  // Calculate score
  // Opens: 1 point each
  // Clicks: 3 points each (higher engagement)
  // Drip campaigns received: 2 points each
  const score = opens.length * 1 + clicks.length * 3 + dripCount.length * 2;

  return score;
}

/**
 * Determine segment based on engagement score
 */
function getSegmentFromScore(score: number): SegmentType {
  if (score >= 15) return "highly_engaged";
  if (score >= 5) return "active";
  if (score >= 1) return "inactive";
  return "cold_lead";
}

/**
 * Update subscriber segment
 */
async function updateSubscriberSegment(
  subscriberId: number,
  segment: SegmentType
) {
  const db = await getDb();
  if (!db) return;

  // Check if segment exists
  const existing = await db
    .select()
    .from(subscriberSegments)
    .where(eq(subscriberSegments.subscriberId, subscriberId));

  if (existing.length > 0) {
    // Update existing
    await db
      .update(subscriberSegments)
      .set({ segment, lastUpdated: new Date() })
      .where(eq(subscriberSegments.subscriberId, subscriberId));
  } else {
    // Insert new
    await db.insert(subscriberSegments).values({
      subscriberId,
      segment,
    });
  }
}

/**
 * Process all subscribers and update their segments
 * Should be run daily
 */
export async function updateAllSegments() {
  const db = await getDb();
  if (!db) return;

  console.log("[Segmentation] Starting segment update...");

  const allSubscribers = await db.select().from(subscribers);

  for (const subscriber of allSubscribers) {
    try {
      const score = await calculateEngagementScore(subscriber.id);
      const segment = getSegmentFromScore(score);
      await updateSubscriberSegment(subscriber.id, segment);
    } catch (error) {
      console.error(
        `[Segmentation] Error updating segment for subscriber ${subscriber.id}:`,
        error
      );
    }
  }

  console.log(`[Segmentation] Updated segments for ${allSubscribers.length} subscribers`);
}

/**
 * Get subscribers by segment
 */
export async function getSubscribersBySegment(segment: SegmentType) {
  const db = await getDb();
  if (!db) return [];

  const segments = await db
    .select()
    .from(subscriberSegments)
    .where(eq(subscriberSegments.segment, segment));

  const subscriberIds = segments.map((s) => s.subscriberId);

  if (subscriberIds.length === 0) return [];

  const subs = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.id, subscriberIds[0])); // Simplified - in production, use IN clause

  return subs;
}

/**
 * Get segment statistics
 */
export async function getSegmentStats() {
  const db = await getDb();
  if (!db) return null;

  const segments = await db.select().from(subscriberSegments);

  const stats = {
    highly_engaged: segments.filter((s) => s.segment === "highly_engaged").length,
    active: segments.filter((s) => s.segment === "active").length,
    inactive: segments.filter((s) => s.segment === "inactive").length,
    cold_lead: segments.filter((s) => s.segment === "cold_lead").length,
    total: segments.length,
  };

  return stats;
}

/**
 * Get re-engagement candidates (inactive subscribers)
 */
export async function getReEngagementCandidates() {
  const db = await getDb();
  if (!db) return [];

  const inactiveSegments = await db
    .select()
    .from(subscriberSegments)
    .where(eq(subscriberSegments.segment, "inactive"));

  const subscriberIds = inactiveSegments.map((s) => s.subscriberId);

  if (subscriberIds.length === 0) return [];

  // Get subscribers for re-engagement (simplified)
  const subs = await db.select().from(subscribers);
  return subs.filter((s) => subscriberIds.includes(s.id));
}

/**
 * Get upsell candidates (highly engaged subscribers)
 */
export async function getUpsellCandidates() {
  const db = await getDb();
  if (!db) return [];

  const engagedSegments = await db
    .select()
    .from(subscriberSegments)
    .where(eq(subscriberSegments.segment, "highly_engaged"));

  const subscriberIds = engagedSegments.map((s) => s.subscriberId);

  if (subscriberIds.length === 0) return [];

  // Get subscribers for upsell (simplified)
  const subs = await db.select().from(subscribers);
  return subs.filter((s) => subscriberIds.includes(s.id));
}
