import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { createSessionToken } from "../_core/session";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS, ONE_DAY_MS } from "@shared/const";
import crypto from "crypto";

export const emailAuthRouter = router({
  /**
   * Sign up with email and password
   */
  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().min(1, "Name is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user already exists
      const existingUser = await db.getUserByEmail(input.email);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create user with email/password
      const userId = await db.createEmailUser({
        email: input.email,
        passwordHash,
        name: input.name,
      });

      // Log signup activity
      await db.logActivity({
        activityType: "user_signup",
        userName: input.name,
        userEmail: input.email,
        description: `New user signed up: ${input.name}`,
        metadata: JSON.stringify({ loginMethod: "email" }),
      });

      // Create session token using custom session helper
      const sessionToken = await createSessionToken({
        userId,
        email: input.email,
        name: input.name,
        role: "user",
      });

      // Set cookie
      if (ctx.res) {
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: ONE_YEAR_MS,
        });
      }

      // Send welcome email
      try {
        const { sendSignupWelcomeEmail } = await import("../services/email");
        await sendSignupWelcomeEmail({
          to: input.email,
          name: input.name,
        });
      } catch (emailError) {
        console.error("[EmailAuth] Failed to send welcome email:", emailError);
        // Don't fail signup if email fails
      }

      // Notify owner of new signup
      try {
        const { notifyOwner } = await import("../_core/notification");
        await notifyOwner({
          title: "New User Signup",
          content: `**${input.name}** (${input.email}) just created an account via email/password.`,
        });
      } catch (err) {
        console.error("[EmailAuth] Failed to send owner notification:", err);
      }

      return {
        success: true,
        user: {
          id: userId,
          email: input.email,
          name: input.name,
        },
      };
    }),

  /**
   * Login with email and password
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
        /** When false, session expires after 24 hours instead of 1 year */
        rememberMe: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const ip = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || ctx.req.socket?.remoteAddress || "unknown";
      const userAgent = ctx.req.headers["user-agent"] || "unknown";

      // Find user by email
      const user = await db.getUserByEmail(input.email);

      if (!user) {
        // Log failed attempt: email not found
        db.logFailedLogin({ ip, email: input.email, reason: "email_not_found", userAgent }).catch(() => {});
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // User exists but has no password — they signed up via Google OAuth
      if (!user.passwordHash) {
        const loginMethod = user.loginMethod || "a social account";
        const isGoogle = loginMethod === "google";
        // Log failed attempt: no password set
        db.logFailedLogin({ ip, email: input.email, reason: "no_password_set", userAgent }).catch(() => {});
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: isGoogle
            ? "This account was created with Google. Please use the \"Continue with Google\" button to sign in."
            : `This account uses ${loginMethod} login. Please use the appropriate sign-in method.`,
        });
      }

      // Check account status before verifying password
      if (user.status === "suspended") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your account has been suspended. Please contact support.",
        });
      }
      if (user.status === "deleted") {
        // Treat deleted accounts the same as not found to avoid leaking info
        db.logFailedLogin({ ip, email: input.email, reason: "email_not_found", userAgent }).catch(() => {});
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

      if (!isValidPassword) {
        // Log failed attempt: wrong password
        db.logFailedLogin({ ip, email: input.email, reason: "wrong_password", userAgent }).catch(() => {});
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Update last signed in
      await db.updateUserLastSignIn(user.id);

      // Session duration: 1 year if rememberMe, 24 hours otherwise
      const sessionDuration = input.rememberMe ? ONE_YEAR_MS : ONE_DAY_MS;

      // Create session token using custom session helper
      const sessionToken = await createSessionToken(
        {
          userId: user.id,
          email: user.email!,
          name: user.name,
          role: user.role,
        },
        sessionDuration
      );

      // Set cookie
      if (ctx.res) {
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: sessionDuration,
        });
      }

      return {
        success: true,
        mustChangePassword: user.mustChangePassword ?? false,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    }),

  /**
   * Request password reset email
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        // Don't reveal if user exists for security
        return { success: true };
      }

      // Generate reset token (32 random bytes)
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save token to database
      await db.setPasswordResetToken(user.id, resetToken, resetTokenExpiry);

      // Send reset email
      const resetUrl = `${ctx.req.headers.origin}/reset-password?token=${resetToken}`;
      try {
        const { sendPasswordResetEmail } = await import("../services/email");
        await sendPasswordResetEmail(user.email!, user.name, resetUrl);
      } catch (emailError) {
        console.error("[EmailAuth] Failed to send password reset email:", emailError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send reset email",
        });
      }

      return { success: true };
    }),

  /**
   * Reset password using token
   */
  resetPassword: publicProcedure
    .input(z.object({ token: z.string(), newPassword: z.string().min(8) }))
    .mutation(async ({ input }) => {
      // Find user by reset token
      const user = await db.getUserByResetToken(input.token);

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
      const passwordHash = await bcrypt.hash(input.newPassword, 10);

      // Update password and clear reset token
      await db.resetUserPassword(user.id, passwordHash);

      return { success: true };
    }),
});
