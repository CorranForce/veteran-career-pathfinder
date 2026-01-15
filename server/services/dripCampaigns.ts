import { getDb } from "../db";
import { dripCampaigns, dripSends, subscribers, emailEvents } from "../../drizzle/schema";
import { eq, and, gte, lt, isNull } from "drizzle-orm";
import { sendDripEmail } from "./email";

/**
 * Drip Campaign Service
 * Handles scheduling and sending of automated email sequences
 */

/**
 * Initialize default drip campaigns if they don't exist
 */
export async function initializeDripCampaigns() {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(dripCampaigns);
  if (existing.length > 0) return; // Already initialized

  const defaultCampaigns = [
    {
      name: "Day 7: Career Exploration Tips",
      subject: "Your Next Step: 7 Career Paths for Veterans 🚀",
      dayOffset: 7,
      htmlContent: `
        <h2>Your Next Step: 7 Career Paths for Veterans</h2>
        <p>Hi there,</p>
        <p>A week ago, you signed up for Pathfinder. Now it's time to explore your options!</p>
        <p>Here are 7 proven career paths that veterans like you have successfully transitioned into:</p>
        <ul>
          <li><strong>IT & Cybersecurity:</strong> Your discipline and attention to detail translate perfectly. Average salary: $85k-$120k</li>
          <li><strong>Project Management:</strong> You already manage teams and timelines. Average salary: $90k-$130k</li>
          <li><strong>Sales & Business Development:</strong> Your leadership skills are gold here. Average salary: $80k-$150k+</li>
          <li><strong>Government Contracting:</strong> Leverage your security clearance. Average salary: $95k-$140k</li>
          <li><strong>Logistics & Supply Chain:</strong> Your operational experience is directly applicable. Average salary: $70k-$110k</li>
          <li><strong>Training & Development:</strong> Share your expertise with others. Average salary: $65k-$100k</li>
          <li><strong>Entrepreneurship:</strong> Start your own venture with veteran resources. Unlimited potential</li>
        </ul>
        <p>Which path resonates with you? Reply to this email or visit our site to explore further.</p>
        <p>Best,<br>The Pathfinder Team</p>
      `,
      textContent: `Your Next Step: 7 Career Paths for Veterans\n\nHi there,\n\nA week ago, you signed up for Pathfinder. Now it's time to explore your options!\n\nHere are 7 proven career paths that veterans like you have successfully transitioned into:\n\n1. IT & Cybersecurity: Your discipline and attention to detail translate perfectly. Average salary: $85k-$120k\n2. Project Management: You already manage teams and timelines. Average salary: $90k-$130k\n3. Sales & Business Development: Your leadership skills are gold here. Average salary: $80k-$150k+\n4. Government Contracting: Leverage your security clearance. Average salary: $95k-$140k\n5. Logistics & Supply Chain: Your operational experience is directly applicable. Average salary: $70k-$110k\n6. Training & Development: Share your expertise with others. Average salary: $65k-$100k\n7. Entrepreneurship: Start your own venture with veteran resources. Unlimited potential\n\nWhich path resonates with you? Reply to this email or visit our site to explore further.\n\nBest,\nThe Pathfinder Team`,
    },
    {
      name: "Day 14: Premium Prompt Offer",
      subject: "Unlock Your Full Potential: The Complete Pathfinder Prompt 💎",
      dayOffset: 14,
      htmlContent: `
        <h2>Unlock Your Full Potential: The Complete Pathfinder Prompt</h2>
        <p>Hi there,</p>
        <p>Two weeks in, and you're making progress. Now it's time to accelerate.</p>
        <p>The <strong>Pathfinder Premium Prompt</strong> gives you:</p>
        <ul>
          <li>✓ Complete military-to-civilian skills translation framework</li>
          <li>✓ Personalized 30-day action plan</li>
          <li>✓ Resume optimization strategies</li>
          <li>✓ Interview preparation guide</li>
          <li>✓ Salary negotiation tactics</li>
          <li>✓ Bonus: 5 veteran success stories</li>
        </ul>
        <p><strong>Just $29 one-time</strong> — less than a single job interview outfit.</p>
        <p>Use this prompt with ChatGPT, Claude, or any AI assistant to get personalized career guidance that understands your military background.</p>
        <p><a href="https://yoursite.com/pricing">Get the Premium Prompt →</a></p>
        <p>Still exploring? That's fine. We'll be here when you're ready.</p>
        <p>Best,<br>The Pathfinder Team</p>
      `,
      textContent: `Unlock Your Full Potential: The Complete Pathfinder Prompt\n\nHi there,\n\nTwo weeks in, and you're making progress. Now it's time to accelerate.\n\nThe Pathfinder Premium Prompt gives you:\n\n✓ Complete military-to-civilian skills translation framework\n✓ Personalized 30-day action plan\n✓ Resume optimization strategies\n✓ Interview preparation guide\n✓ Salary negotiation tactics\n✓ Bonus: 5 veteran success stories\n\nJust $29 one-time — less than a single job interview outfit.\n\nUse this prompt with ChatGPT, Claude, or any AI assistant to get personalized career guidance that understands your military background.\n\nGet the Premium Prompt: https://yoursite.com/pricing\n\nStill exploring? That's fine. We'll be here when you're ready.\n\nBest,\nThe Pathfinder Team`,
    },
    {
      name: "Day 30: Pro Subscription Offer",
      subject: "Join the Pathfinder Pro Community: Ongoing Support & Updates 🎖️",
      dayOffset: 30,
      htmlContent: `
        <h2>Join the Pathfinder Pro Community</h2>
        <p>Hi there,</p>
        <p>A month in, and you've been exploring your options. Ready to go deeper?</p>
        <p><strong>Pathfinder Pro</strong> ($9.99/month) includes:</p>
        <ul>
          <li>✓ Monthly webinars with career transition experts</li>
          <li>✓ Exclusive community access with other veterans</li>
          <li>✓ Weekly career tips and industry insights</li>
          <li>✓ Job board with veteran-friendly opportunities</li>
          <li>✓ Resume review from professionals</li>
          <li>✓ Interview coaching sessions</li>
        </ul>
        <p>Cancel anytime. No commitment. Just support.</p>
        <p><a href="https://yoursite.com/pricing#pro">Explore Pro Membership →</a></p>
        <p>Your transition matters. Let's make it count.</p>
        <p>Best,<br>The Pathfinder Team</p>
      `,
      textContent: `Join the Pathfinder Pro Community\n\nHi there,\n\nA month in, and you've been exploring your options. Ready to go deeper?\n\nPathfinder Pro ($9.99/month) includes:\n\n✓ Monthly webinars with career transition experts\n✓ Exclusive community access with other veterans\n✓ Weekly career tips and industry insights\n✓ Job board with veteran-friendly opportunities\n✓ Resume review from professionals\n✓ Interview coaching sessions\n\nCancel anytime. No commitment. Just support.\n\nExplore Pro Membership: https://yoursite.com/pricing#pro\n\nYour transition matters. Let's make it count.\n\nBest,\nThe Pathfinder Team`,
    },
  ];

  for (const campaign of defaultCampaigns) {
    await db.insert(dripCampaigns).values({
      ...campaign,
      isActive: "true",
    });
  }

  console.log("[Drip Campaigns] Initialized 3 default campaigns");
}

/**
 * Process due drip campaigns
 * Sends emails to subscribers who are due for their next campaign
 */
export async function processDueDripCampaigns() {
  const db = await getDb();
  if (!db) return;

  console.log("[Drip Campaigns] Processing due campaigns...");

  // Get all active campaigns
  const campaigns = await db
    .select()
    .from(dripCampaigns)
    .where(eq(dripCampaigns.isActive, "true"));

  for (const campaign of campaigns) {
    // Calculate the cutoff date (today - dayOffset)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - campaign.dayOffset);

    // Find subscribers who:
    // 1. Signed up before the cutoff date
    // 2. Haven't received this campaign yet
    const dueSubs = await db
      .select({ id: subscribers.id, email: subscribers.email, name: subscribers.name })
      .from(subscribers)
      .where(
        and(
          lt(subscribers.createdAt, cutoffDate),
          eq(subscribers.status, "active")
        )
      );

    for (const sub of dueSubs) {
      // Check if already sent
      const alreadySent = await db
        .select()
        .from(dripSends)
        .where(
          and(
            eq(dripSends.subscriberId, sub.id),
            eq(dripSends.campaignId, campaign.id)
          )
        )
        .limit(1);

      if (alreadySent.length > 0) continue; // Already sent

      // Send the email
      try {
        const success = await sendDripEmail(
          sub.email,
          sub.name || "there",
          campaign.subject,
          campaign.htmlContent,
          campaign.textContent
        );

        if (success) {
          // Record the send
          await db.insert(dripSends).values({
            subscriberId: sub.id,
            campaignId: campaign.id,
            sentAt: new Date(),
          });

          console.log(
            `[Drip Campaigns] Sent "${campaign.name}" to ${sub.email}`
          );
        }
      } catch (error) {
        console.error(
          `[Drip Campaigns] Failed to send "${campaign.name}" to ${sub.email}:`,
          error
        );
      }
    }
  }

  console.log("[Drip Campaigns] Processing complete");
}

/**
 * Get drip campaign statistics
 */
export async function getDripStats() {
  const db = await getDb();
  if (!db) return null;

  const campaigns = await db.select().from(dripCampaigns);
  const sends = await db.select().from(dripSends);

  const stats = await Promise.all(
    campaigns.map(async (campaign) => {
      const campaignSends = sends.filter((s) => s.campaignId === campaign.id);
      const sentCount = campaignSends.length;

      // Calculate open rate for this campaign
      const events = await db
        .select()
        .from(emailEvents)
        .where(eq(emailEvents.eventType, "open"));

      const openCount = events.length; // Simplified - in production, link to subscriber

      return {
        id: campaign.id,
        name: campaign.name,
        dayOffset: campaign.dayOffset,
        sent: sentCount,
        openRate: sentCount > 0 ? Math.round((openCount / sentCount) * 100) : 0,
      };
    })
  );

  return stats;
}
