import { z } from "zod";
import { router, platformOwnerProcedure, protectedProcedure } from "../_core/trpc";
import { getAnalytics, getDb } from "../db";
import { activityLogs, users, purchases } from "../../drizzle/schema";
import { sql, and, gte, lte, count, sum, desc } from "drizzle-orm";

export const analyticsRouter = router({
  // Get site-wide analytics (platform owner only)
  getSiteAnalytics: platformOwnerProcedure.query(async () => {
    const analytics = await getAnalytics();
    
    if (!analytics) {
      return {
        totalUsers: 0,
        totalResumes: 0,
        completedAnalyses: 0,
        avgAtsScore: 0,
        recentUsers: 0,
        recentResumes: 0,
        scoreDistribution: [],
      };
    }

    return analytics;
  }),

  /**
   * Track user event (client-side tracking)
   */
  trackEvent: protectedProcedure
    .input(
      z.object({
        eventType: z.enum([
          "page_view",
          "prompt_copy",
          "cta_click",
          "scroll_depth",
          "signup",
          "login",
          "checkout_start",
          "checkout_complete",
        ]),
        eventData: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Log activity
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.insert(activityLogs).values({
        userId: ctx.user.id,
        userName: ctx.user.name || null,
        userEmail: ctx.user.email || null,
        activityType: input.eventType,
        description: input.eventData ? JSON.stringify(input.eventData) : input.eventType,
        metadata: input.eventData ? JSON.stringify(input.eventData) : null,
        createdAt: new Date(),
      });

      return { success: true };
    }),

  /**
   * Get dashboard analytics (admin only)
   */
  getDashboardStats: platformOwnerProcedure
    .input(
      z
        .object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const startDate = input?.startDate ? new Date(input.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input?.endDate ? new Date(input.endDate) : new Date();

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Total users
      const totalUsersResult = await db.select({ count: count() }).from(users);
      const totalUsers = totalUsersResult[0]?.count || 0;

      // New users in period
      const newUsersResult = await db
        .select({ count: count() })
        .from(users)
        .where(and(gte(users.createdAt, startDate), lte(users.createdAt, endDate)));
      const newUsers = newUsersResult[0]?.count || 0;

      // Total revenue
      const revenueResult = await db
        .select({ total: sum(purchases.amount) })
        .from(purchases)
        .where(sql`${purchases.status} = 'completed'`);
      const totalRevenue = Number(revenueResult[0]?.total || 0);

      // Revenue in period
      const periodRevenueResult = await db
        .select({ total: sum(purchases.amount) })
        .from(purchases)
        .where(
          and(
            sql`${purchases.status} = 'completed'`,
            gte(purchases.createdAt, startDate),
            lte(purchases.createdAt, endDate)
          )
        );
      const periodRevenue = Number(periodRevenueResult[0]?.total || 0);

      // Total purchases
      const totalPurchasesResult = await db
        .select({ count: count() })
        .from(purchases)
        .where(sql`${purchases.status} = 'completed'`);
      const totalPurchases = totalPurchasesResult[0]?.count || 0;

      // Purchases in period
      const periodPurchasesResult = await db
        .select({ count: count() })
        .from(purchases)
        .where(
          and(
            sql`${purchases.status} = 'completed'`,
            gte(purchases.createdAt, startDate),
            lte(purchases.createdAt, endDate)
          )
        );
      const periodPurchases = periodPurchasesResult[0]?.count || 0;

      // Conversion rate (purchases / users)
      const conversionRate = totalUsers > 0 ? (totalPurchases / totalUsers) * 100 : 0;

      // Average order value
      const avgOrderValue = totalPurchases > 0 ? totalRevenue / totalPurchases : 0;

      return {
        totalUsers,
        newUsers,
        totalRevenue,
        periodRevenue,
        totalPurchases,
        periodPurchases,
        conversionRate,
        avgOrderValue,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };
    }),

  /**
   * Get recent activity logs (admin only)
   */
  getRecentActivity: platformOwnerProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const logs = await db
        .select({
          id: activityLogs.id,
          userId: activityLogs.userId,
          activityType: activityLogs.activityType,
          createdAt: activityLogs.createdAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(activityLogs)
        .leftJoin(users, sql`${activityLogs.userId} = ${users.id}`)
        .orderBy(desc(activityLogs.createdAt))
        .limit(input.limit);

      return logs;
    }),

  /**
   * Get event counts by type (admin only)
   */
  getEventCounts: platformOwnerProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const startDate = input.startDate ? new Date(input.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate ? new Date(input.endDate) : new Date();

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const eventCounts = await db
        .select({
          eventType: activityLogs.activityType,
          count: count(),
        })
        .from(activityLogs)
        .where(and(gte(activityLogs.createdAt, startDate), lte(activityLogs.createdAt, endDate)))
        .groupBy(activityLogs.activityType);

      return eventCounts;
    }),
});
