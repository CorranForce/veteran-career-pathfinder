import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { createSubscriber, getAllSubscribers } from "../db";

export const emailRouter = router({
  /**
   * Subscribe to email list (public endpoint)
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        name: z.string().optional(),
        source: z.string().default("homepage"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await createSubscriber({
          email: input.email.toLowerCase().trim(),
          name: input.name?.trim() || null,
          source: input.source,
          status: "active",
        });

        // Send welcome email with checklist
        try {
          const { sendWelcomeEmail } = await import("../services/email");
          await sendWelcomeEmail({ 
            to: input.email.toLowerCase().trim(), 
            name: input.name?.trim() 
          });
        } catch (emailError) {
          // Log email error but don't fail the subscription
          console.error("[Email] Failed to send welcome email:", emailError);
        }

        return {
          success: true,
          message: "Successfully subscribed to the mailing list!",
        };
      } catch (error: any) {
        if (error.message === "Email already subscribed") {
          return {
            success: false,
            message: "This email is already subscribed.",
          };
        }
        throw error;
      }
    }),

  /**
   * Get all subscribers (protected - admin only in future)
   */
  getAll: publicProcedure.query(async () => {
    return await getAllSubscribers();
  }),

  /**
   * Get subscriber analytics
   */
  getAnalytics: publicProcedure.query(async () => {
    const db = await import("../db").then((m) => m.getDb());
    if (!db) return null;

    const { subscribers } = await import("../../drizzle/schema");
    const { sql, eq } = await import("drizzle-orm");

    // Get total subscribers
    const allSubs = await db.select().from(subscribers).where(eq(subscribers.status, "active"));
    const total = allSubs.length;

    // Get subscribers by date for chart
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const last30Days = allSubs.filter((s) => new Date(s.createdAt) >= thirtyDaysAgo).length;
    const last7Days = allSubs.filter((s) => new Date(s.createdAt) >= sevenDaysAgo).length;
    const last24Hours = allSubs.filter((s) => new Date(s.createdAt) >= oneDayAgo).length;

    // Group by source
    const bySource = allSubs.reduce((acc, sub) => {
      const source = sub.source || "unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      last24Hours,
      last7Days,
      last30Days,
      bySource,
    };
  }),
});
