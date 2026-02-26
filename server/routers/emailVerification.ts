import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { publicProcedure, router } from "../_core/trpc";

export const emailVerificationRouter = router({
  /**
   * Verify email with token
   */
  verifyEmail: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { token } = input;

      // Find user by verification token
      const user = await db.getUserByEmailVerificationToken(token);

      if (!user || !user.emailVerificationTokenExpiry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification token",
        });
      }

      // Check if token is expired
      if (new Date() > user.emailVerificationTokenExpiry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification token has expired",
        });
      }

      // Check if email is already verified
      if (user.emailVerified) {
        return {
          success: true,
          message: "Email is already verified",
          alreadyVerified: true,
        };
      }

      // Mark email as verified
      await db.markEmailAsVerified(user.id);

      // Log email verification activity
      await db.logActivity({
        activityType: "email_verification",
        userName: user.name || "Unknown",
        userEmail: user.email || "",
        description: `Email verified for user: ${user.email}`,
        metadata: JSON.stringify({ userId: user.id }),
      });

      return {
        success: true,
        message: "Email verified successfully",
        alreadyVerified: false,
      };
    }),

  /**
   * Resend verification email
   */
  resendVerification: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const { email } = input;

      // Find user by email
      const user = await db.getUserByEmail(email);

      if (!user) {
        // Don't reveal if email exists
        return {
          success: true,
          message: "If an account exists with this email, a verification email has been sent.",
        };
      }

      // Check if already verified
      if (user.emailVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email is already verified",
        });
      }

      // Generate new verification token
      const crypto = await import("crypto");
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpiry = new Date(Date.now() + 86400000); // 24 hours from now

      // Save new token to database
      await db.updateUserEmailVerificationToken(user.id, verificationToken, verificationTokenExpiry);

      // Send verification email
      try {
        const { sendEmailVerificationEmail } = await import("../services/email");
        await sendEmailVerificationEmail(email, user.name || "User", verificationToken);
      } catch (emailError) {
        console.error("[EmailVerification] Failed to send verification email:", emailError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send verification email. Please try again later.",
        });
      }

      return {
        success: true,
        message: "Verification email has been sent.",
      };
    }),
});
