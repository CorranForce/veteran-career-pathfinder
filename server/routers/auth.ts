import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import * as db from "../db";
import { publicProcedure, router } from "../_core/trpc";
import { createSessionToken } from "../_core/session";

export const authRouter = router({
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
    .mutation(async ({ input }) => {
      const { email, password, name } = input;

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already registered",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const userId = await db.createEmailUser({
        email,
        passwordHash,
        name,
      });

      // Log signup activity
      await db.logActivity({
        activityType: "user_signup",
        userName: name,
        userEmail: email,
        description: `New user signed up: ${name}`,
        metadata: JSON.stringify({ loginMethod: "email" }),
      });

      // Get the created user
      const user = await db.getUserById(userId);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve user after creation",
        });
      }

      // Create session token
      const sessionToken = await createSessionToken({
        userId: user.id,
        email: user.email!,
        name: user.name,
        role: user.role,
      });

      return {
        success: true,
        userId,
        sessionToken,
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
    .mutation(async ({ input }) => {
      const { email, password } = input;

      // Find user by email
      const user = await db.getUserByEmail(email);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Check if user has a password (not OAuth user)
      if (!user.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This account uses OAuth login. Please use the Google sign-in button.",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Check if user is suspended or deleted
      if (user.status === "suspended") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your account has been suspended. Please contact support.",
        });
      }

      if (user.status === "deleted") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your account has been deleted.",
        });
      }

      // Update last signed in
      await db.updateUserLastSignIn(user.id);

      // Create session token
      const sessionToken = await createSessionToken({
        userId: user.id,
        email: user.email!,
        name: user.name,
        role: user.role,
      });

      return {
        success: true,
        userId: user.id,
        sessionToken,
      };
    }),
});
