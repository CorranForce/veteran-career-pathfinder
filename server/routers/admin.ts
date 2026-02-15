import { router, platformOwnerProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
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

    return {
      totalUsers,
      newUsersThisMonth,
      totalRevenue: 0, // TODO: Calculate from purchases table
      revenueThisMonth: 0, // TODO: Calculate from purchases table
      totalResumes: 0, // TODO: Calculate from resumes table
      resumesThisMonth: 0, // TODO: Calculate from resumes table
      averageAtsScore: 0, // TODO: Calculate from resumes table
    };
  }),
});
