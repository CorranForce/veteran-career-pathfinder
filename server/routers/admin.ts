import { router, platformOwnerProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, logAdminActivity, getAdminActivityLogs, getAdminActivityLogsForUser } from "../db";
import { getTotalRevenue, getMonthlyRevenue, getTotalPurchaseCount, getRecentPurchases, getRevenueByMonth, getAverageOrderValue, getLTVAnalytics } from "../db-analytics";
import { users, purchases, resumes } from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const adminRouter = router({
  /**
   * Get all users (platform owner only)
   */
  getAllUsers: platformOwnerProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(5).max(100).default(5),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const page = input?.page || 1;
      const pageSize = input?.pageSize || 5;
      const offset = (page - 1) * pageSize;
      
      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);
      const totalUsers = countResult?.count || 0;
      
      // Get paginated users
      const allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          status: users.status,
          loginMethod: users.loginMethod,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
          stripeCustomerId: users.stripeCustomerId,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(pageSize)
        .offset(offset);

      return {
        users: allUsers,
        pagination: {
          page,
          pageSize,
          totalUsers,
          totalPages: Math.ceil(totalUsers / pageSize),
        },
      };
    }),

  /**
   * Change user role (platform owner only)
   */
  changeUserRole: platformOwnerProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "platform_owner"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent changing own role
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot change your own role",
        });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Get target user info for logging
      const [targetUser] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      // Guard: platform_owner accounts cannot have their role changed
      if (targetUser.role === "platform_owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "The platform owner account role cannot be changed.",
        });
      }
      
      const oldRole = targetUser.role;
      
      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      // Log the admin action
      await logAdminActivity({
        adminId: ctx.user.id,
        adminName: ctx.user.name || "Unknown",
        adminEmail: ctx.user.email || "Unknown",
        targetUserId: input.userId,
        targetUserName: targetUser.name || "Unknown",
        targetUserEmail: targetUser.email || "Unknown",
        actionType: "change_role",
        description: `Changed user role from ${oldRole} to ${input.role}`,
        metadata: JSON.stringify({ oldRole, newRole: input.role }),
      });

      return { success: true };
    }),

  /**
   * Suspend user (platform owner only)
   */
  suspendUser: platformOwnerProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot suspend yourself" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Get target user info for logging
      const [targetUser] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      // Guard: platform_owner accounts cannot be suspended
      if (targetUser.role === "platform_owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "The platform owner account cannot be suspended.",
        });
      }
      
      await db.update(users).set({ status: "suspended" }).where(eq(users.id, input.userId));
      
      // Log the admin action
      await logAdminActivity({
        adminId: ctx.user.id,
        adminName: ctx.user.name || "Unknown",
        adminEmail: ctx.user.email || "Unknown",
        targetUserId: input.userId,
        targetUserName: targetUser.name || "Unknown",
        targetUserEmail: targetUser.email || "Unknown",
        actionType: "suspend_user",
        description: `Suspended user ${targetUser.name || targetUser.email}`,
      });
      
      return { success: true };
    }),

  /**
   * Reactivate user (platform owner only)
   */
  reactivateUser: platformOwnerProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Get target user info for logging
      const [targetUser] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      
      await db.update(users).set({ status: "active" }).where(eq(users.id, input.userId));
      
      // Log the admin action
      await logAdminActivity({
        adminId: ctx.user.id,
        adminName: ctx.user.name || "Unknown",
        adminEmail: ctx.user.email || "Unknown",
        targetUserId: input.userId,
        targetUserName: targetUser.name || "Unknown",
        targetUserEmail: targetUser.email || "Unknown",
        actionType: "reactivate_user",
        description: `Reactivated user ${targetUser.name || targetUser.email}`,
      });
      
      return { success: true };
    }),

  /**
   * Delete user (soft delete - platform owner only)
   */
  deleteUser: platformOwnerProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot delete yourself" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Get target user info for logging
      const [targetUser] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!targetUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      // Guard: platform_owner accounts cannot be deleted or anonymized
      if (targetUser.role === "platform_owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "The platform owner account cannot be deleted.",
        });
      }
      
      await db.update(users).set({ status: "deleted" }).where(eq(users.id, input.userId));
      
      // Log the admin action
      await logAdminActivity({
        adminId: ctx.user.id,
        adminName: ctx.user.name || "Unknown",
        adminEmail: ctx.user.email || "Unknown",
        targetUserId: input.userId,
        targetUserName: targetUser.name || "Unknown",
        targetUserEmail: targetUser.email || "Unknown",
        actionType: "delete_user",
        description: `Deleted user ${targetUser.name || targetUser.email}`,
      });
      
      return { success: true };
    }),

  /**
   * Get user purchase history (platform owner only)
   */
  getUserPurchases: platformOwnerProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const userPurchases = await db
        .select()
        .from(purchases)
        .where(eq(purchases.userId, input.userId))
        .orderBy(desc(purchases.createdAt));
      
      return userPurchases;
    }),

  /**
   * Get site-wide analytics (platform owner only)
   */
  getSiteAnalytics: platformOwnerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    
    // Total users
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // New users this month
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${thirtyDaysAgo}`);
    const newUsersThisMonth = newUsersResult[0]?.count || 0;

    // Total revenue from completed purchases
    const totalRevenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(purchases)
      .where(eq(purchases.status, "completed"));
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Revenue this month
    const revenueThisMonthResult = await db
      .select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(purchases)
      .where(sql`${purchases.status} = 'completed' AND ${purchases.createdAt} >= ${thirtyDaysAgo}`);
    const revenueThisMonth = revenueThisMonthResult[0]?.total || 0;

    // Total resumes
    const totalResumesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(resumes);
    const totalResumes = totalResumesResult[0]?.count || 0;

    // Resumes this month
    const resumesThisMonthResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(resumes)
      .where(sql`${resumes.createdAt} >= ${thirtyDaysAgo}`);
    const resumesThisMonth = resumesThisMonthResult[0]?.count || 0;

    // Average ATS score
    const avgAtsScoreResult = await db
      .select({ avg: sql<number>`COALESCE(AVG(${resumes.atsScore}), 0)` })
      .from(resumes)
      .where(sql`${resumes.atsScore} IS NOT NULL`);
    const averageAtsScore = avgAtsScoreResult[0]?.avg || 0;

    return {
      totalUsers,
      newUsersThisMonth,
      totalRevenue,
      revenueThisMonth,
      totalResumes,
      resumesThisMonth,
      averageAtsScore,
    };
  }),

  /**
   * Get recent activity logs (platform owner only)
   */
  getRecentActivity: platformOwnerProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const { activityLogs } = await import("../../drizzle/schema");
      
      const activities = await db
        .select()
        .from(activityLogs)
        .orderBy(desc(activityLogs.createdAt))
        .limit(input?.limit || 50);

      return activities;
    }),

  /**
   * Get revenue analytics (platform owner only)
   */
  getRevenueAnalytics: platformOwnerProcedure.query(async () => {
    const [totalRevenue, monthlyRevenue, totalPurchases, recentPurchases, revenueByMonth, avgOrderValue] = await Promise.all([
      getTotalRevenue(),
      getMonthlyRevenue(),
      getTotalPurchaseCount(),
      getRecentPurchases(),
      getRevenueByMonth(),
      getAverageOrderValue(),
    ]);

    return {
      totalRevenue,
      monthlyRevenue,
      totalPurchases,
      avgOrderValue,
      recentPurchases,
      revenueByMonth,
    };
  }),

  /**
   * Get customer lifetime value analytics (platform owner only)
   */
  getLTVAnalytics: platformOwnerProcedure.query(async () => {
    const ltvData = await getLTVAnalytics();
    
    // Fetch user details for top customers
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    
    const topCustomersWithDetails = await Promise.all(
      ltvData.topCustomers.map(async (customer) => {
        const userDetails = await db
          .select({
            name: users.name,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, customer.userId))
          .limit(1);
        
        return {
          ...customer,
          name: userDetails[0]?.name || "Unknown",
          email: userDetails[0]?.email || "Unknown",
        };
      })
    );
    
    return {
      ...ltvData,
      topCustomers: topCustomersWithDetails,
    };
  }),

  /**
   * Get current product configuration
   */
  getProductConfig: platformOwnerProcedure.query(async () => {
    const { PRODUCTS } = await import("../products");
    return PRODUCTS.PREMIUM;
  }),

  /**
   * Update product configuration
   */
  updateProduct: platformOwnerProcedure
    .input(
      z.object({
        name: z.string().min(1),
        amount: z.number().min(50), // Stripe minimum $0.50
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const fs = await import("fs/promises");
      const path = await import("path");
      const { stripe } = await import("../stripe");
      
      // Read current products.ts
      const productsPath = path.join(process.cwd(), "server", "products.ts");
      const currentContent = await fs.readFile(productsPath, "utf-8");
      
      // Extract current Stripe IDs if they exist
      const priceIdMatch = currentContent.match(/priceId:\s*["']([^"']+)["']/);
      const productIdMatch = currentContent.match(/productId:\s*["']([^"']+)["']/);
      
      let stripeProductId = productIdMatch ? productIdMatch[1] : null;
      let stripePriceId = priceIdMatch ? priceIdMatch[1] : null;
      
      // Create or update Stripe product
      if (!stripeProductId || stripeProductId === "price_premium_prompt") {
        // Create new product in Stripe
        const product = await stripe.products.create({
          name: input.name,
          description: input.description,
        });
        stripeProductId = product.id;
        
        // Create price for the product
        const price = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: input.amount,
          currency: "usd",
        });
        stripePriceId = price.id;
      } else {
        // Update existing product
        await stripe.products.update(stripeProductId, {
          name: input.name,
          description: input.description,
        });
        
        // Create new price (Stripe doesn't allow updating prices)
        const price = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: input.amount,
          currency: "usd",
        });
        stripePriceId = price.id;
      }
      
      // Update products.ts file
      const newContent = `/**
 * Stripe Products and Pricing Configuration
 * Define all products and prices here for centralized management
 */

export const PRODUCTS = {
  PREMIUM_PROMPT: {
    name: "${input.name.replace(/"/g, '\\"')}",
    description: "${input.description.replace(/"/g, '\\"')}",
    priceId: "${stripePriceId}",
    productId: "${stripeProductId}",
    amount: ${input.amount},
    currency: "usd",
    type: "one_time" as const,
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
`;
      
      await fs.writeFile(productsPath, newContent, "utf-8");
      
      return {
        success: true,
        stripeProductId,
        stripePriceId,
      };
    }),

  /**
   * Get admin activity logs (platform owner only)
   */
  getAdminActivityLogs: platformOwnerProcedure
    .input(z.object({ limit: z.number().optional().default(100) }))
    .query(async ({ input }) => {
      const logs = await getAdminActivityLogs(input.limit);
      return logs;
    }),

  /**
   * Get admin activity logs for a specific user (platform owner only)
   */
  getAdminActivityLogsForUser: platformOwnerProcedure
    .input(z.object({ userId: z.number(), limit: z.number().optional().default(50) }))
    .query(async ({ input }) => {
      const logs = await getAdminActivityLogsForUser(input.userId, input.limit);
      return logs;
    }),

  /**
   * Get rate-limit block events for the security log (platform owner only)
   */
  getRateLimitEvents: platformOwnerProcedure
    .input(z.object({ limit: z.number().optional().default(100) }))
    .query(async ({ input }) => {
      const { getRateLimitEvents } = await import("../db");
      return getRateLimitEvents(input.limit);
    }),

  /**
   * Get failed login events for the security log (platform owner only)
   */
  getFailedLoginEvents: platformOwnerProcedure
    .input(z.object({ limit: z.number().optional().default(100) }))
    .query(async ({ input }) => {
      const { getFailedLoginEvents } = await import("../db");
      return getFailedLoginEvents(input.limit);
    }),

  /**
   * Get recent Platform Agent run logs (platform owner only)
   */
  getAgentLogs: platformOwnerProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      const { getRecentAgentLogs } = await import("../db");
      return getRecentAgentLogs(input.limit);
    }),

  /**
   * Manually trigger a Platform Agent run (platform owner only)
   */
  runPlatformAgent: platformOwnerProcedure
    .mutation(async () => {
      const { runPlatformAgent } = await import("../platformAgent");
      // Run in background — don't await so the response returns immediately
      runPlatformAgent("manual").catch((err) =>
        console.error("[Admin] Manual agent run failed:", err)
      );
      return { triggered: true };
    }),
});
