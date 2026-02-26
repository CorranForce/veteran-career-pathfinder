import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import * as db from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const accountSettingsRouter = router({
  /**
   * Get account settings
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.getUserById(ctx.user.id);
    
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return {
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      loginMethod: user.loginMethod,
      hasPassword: !!user.passwordHash,
    };
  }),

  /**
   * Change password
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { currentPassword, newPassword } = input;

      // Get user
      const user = await db.getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Check if user has a password (not OAuth-only user)
      if (!user.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change password for OAuth-only accounts",
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await db.resetUserPassword(user.id, newPasswordHash);

      // Log password change activity
      await db.logActivity({
        activityType: "password_reset",
        userName: user.name || "Unknown",
        userEmail: user.email || "",
        description: `Password changed by user: ${user.email}`,
        metadata: JSON.stringify({ userId: user.id, method: "settings" }),
      });

      return {
        success: true,
        message: "Password changed successfully",
      };
    }),

  /**
   * Update account name
   */
  updateName: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      // Update user name
      const db_instance = await db.getDb();
      if (!db_instance) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const { users } = await import("../../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      await db_instance
        .update(users)
        .set({ name })
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
        message: "Name updated successfully",
      };
    }),

  /**
   * Get connected OAuth accounts
   */
  getConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.getUserById(ctx.user.id);
    
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const accounts = [];

    // Check if user has email/password login
    if (user.passwordHash) {
      accounts.push({
        provider: "email",
        email: user.email,
        connected: true,
      });
    }

    // Check if user has Google OAuth
    if (user.loginMethod === "google" || user.openId) {
      accounts.push({
        provider: "google",
        email: user.email,
        connected: true,
      });
    }

    return accounts;
  }),
});
