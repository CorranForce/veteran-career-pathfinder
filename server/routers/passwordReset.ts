import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { publicProcedure, router } from "../_core/trpc";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const passwordResetRouter = router({
  /**
   * Request password reset - sends email with reset token
   */
  requestReset: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const { email } = input;

      // Find user by email
      const user = await db.getUserByEmail(email);

      // Always return success to prevent email enumeration
      if (!user) {
        return {
          success: true,
          message: "If an account exists with this email, you will receive a password reset link.",
        };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save token to database
      await db.setPasswordResetToken(user.id, resetToken, resetTokenExpiry);

      // Send password reset email
      try {
        const { sendPasswordResetEmail } = await import("../services/email");
        await sendPasswordResetEmail(email, user.name, resetToken);
      } catch (emailError) {
        console.error("[PasswordReset] Failed to send reset email:", emailError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send password reset email. Please try again later.",
        });
      }

      return {
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      };
    }),

  /**
   * Verify reset token validity
   */
  verifyToken: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { token } = input;

      const user = await db.getUserByResetToken(token);

      if (!user || !user.resetTokenExpiry) {
        return {
          valid: false,
          message: "Invalid or expired reset token",
        };
      }

      // Check if token is expired
      if (new Date() > user.resetTokenExpiry) {
        return {
          valid: false,
          message: "Reset token has expired",
        };
      }

      return {
        valid: true,
        email: user.email,
      };
    }),

  /**
   * Confirm password reset with new password
   */
  confirmReset: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const { token, newPassword } = input;

      // Find user by reset token
      const user = await db.getUserByResetToken(token);

      if (!user || !user.resetTokenExpiry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      // Check if token is expired
      if (new Date() > user.resetTokenExpiry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired",
        });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await db.resetUserPassword(user.id, passwordHash);

      // Log password reset activity
      await db.logActivity({
        activityType: "password_reset",
        userName: user.name || "Unknown",
        userEmail: user.email || "",
        description: `Password reset completed for user: ${user.email}`,
        metadata: JSON.stringify({ userId: user.id }),
      });

      return {
        success: true,
        message: "Password has been reset successfully. You can now log in with your new password.",
      };
    }),
});
