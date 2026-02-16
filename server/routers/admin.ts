import { router, platformOwnerProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { getTotalRevenue, getMonthlyRevenue, getTotalPurchaseCount, getRecentPurchases, getRevenueByMonth, getAverageOrderValue, getLTVAnalytics } from "../db-analytics";
import { users, purchases, resumes } from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const adminRouter = router({
  /**
   * Get all users (platform owner only)
   */
  getAllUsers: platformOwnerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
        stripeCustomerId: users.stripeCustomerId,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return allUsers;
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
      
      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return { success: true };
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
    return PRODUCTS.PREMIUM_PROMPT;
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
});
