import { z } from "zod";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "../_core/sdk";
import { ENV } from "../_core/env";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

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

      // Create session token using SDK (same as OAuth flow)
      const sessionToken = await sdk.createSessionToken(`email:${userId}`, {
        name: input.name,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      if (ctx.res) {
        const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: ONE_YEAR_MS };
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
      }

      // Send welcome email
      try {
        const { sendSignupWelcomeEmail } = await import("../services/email");
        await sendSignupWelcomeEmail({ 
          to: input.email, 
          name: input.name 
        });
      } catch (emailError) {
        console.error("[EmailAuth] Failed to send welcome email:", emailError);
        // Don't fail signup if email fails
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Find user by email
      const user = await db.getUserByEmail(input.email);

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Update last signed in
      await db.updateUserLastSignIn(user.id);

      // Create session token using SDK
      const sessionToken = await sdk.createSessionToken(`email:${user.id}`, {
        name: user.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      if (ctx.res) {
        const cookieOptions = { httpOnly: true, secure: true, sameSite: "lax" as const, maxAge: ONE_YEAR_MS };
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    }),
});
