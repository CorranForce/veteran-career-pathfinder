import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getUserProfile,
  createOrUpdateUserProfile,
  getCareerHighlights,
  addCareerHighlight,
  updateCareerHighlight,
  deleteCareerHighlight,
} from "../db";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import * as schema from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const profileRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return await getUserProfile(ctx.user.id);
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        bio: z.string().max(1000).optional(),
        linkedinUrl: z.string().url().optional(),
        linkedinUsername: z.string().max(255).optional(),
        profileImageUrl: z.string().url().optional(),
        currentRole: z.string().max(255).optional(),
        targetRole: z.string().max(255).optional(),
        yearsOfExperience: z.number().int().min(0).max(100).optional(),
        militaryBranch: z.string().max(100).optional(),
        militaryRank: z.string().max(100).optional(),
        profileVisibility: z.enum(["public", "private", "members_only"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createOrUpdateUserProfile(ctx.user.id, input);
    }),

  getCareerHighlights: protectedProcedure.query(async ({ ctx }) => {
    return await getCareerHighlights(ctx.user.id);
  }),

  addCareerHighlight: protectedProcedure
    .input(
      z.object({
        title: z.string().max(255),
        description: z.string().max(5000).optional(),
        category: z.enum(["achievement", "certification", "promotion", "project", "award", "skill"]),
        date: z.string().optional(),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await addCareerHighlight(ctx.user.id, {
        title: input.title,
        description: input.description,
        category: input.category,
        date: input.date ? new Date(input.date) : null,
        imageUrl: input.imageUrl,
        order: 0,
      });
    }),

  updateCareerHighlight: protectedProcedure
    .input(
      z.object({
        highlightId: z.number(),
        title: z.string().max(255).optional(),
        description: z.string().max(5000).optional(),
        category: z.enum(["achievement", "certification", "promotion", "project", "award", "skill"]).optional(),
        date: z.string().optional(),
        imageUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await updateCareerHighlight(input.highlightId, {
        title: input.title,
        description: input.description,
        category: input.category,
        date: input.date ? new Date(input.date) : undefined,
        imageUrl: input.imageUrl,
      });
    }),

  deleteCareerHighlight: protectedProcedure
    .input(z.object({ highlightId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await deleteCareerHighlight(input.highlightId);
    }),

  /**
   * Get user's personal information (name, email, profile picture)
   */
  getPersonalInfo: protectedProcedure.query(async ({ ctx }) => {
    const dbInstance = await getDb();
    if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    
    const db = dbInstance as any;
    const user = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      profilePicture: users.profilePicture,
      loginMethod: users.loginMethod,
      role: users.role,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1).then((rows: any) => rows[0]);
    
    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  /**
   * Update user's personal information (name)
   */
  updatePersonalInfo: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const db = dbInstance as any;
      await db.update(users).set({ name: input.name }).where(eq(users.id, ctx.user.id));

      return { success: true, message: "Personal information updated successfully" };
    }),

  /**
   * Change password (only for email/password users)
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .max(100, "Password is too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const db = dbInstance as any;
      
      // Only allow password change for email/password authentication
      if (ctx.user.loginMethod !== "email") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Password change is only available for email/password accounts",
        });
      }

      // Get user with password hash
      const user = await db.select({
        id: users.id,
        passwordHash: users.passwordHash,
      }).from(users).where(eq(users.id, ctx.user.id)).limit(1).then((rows: any) => rows[0]);

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found or no password set",
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        input.currentPassword,
        user.passwordHash
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(input.newPassword, 10);

      // Update password
      await db
        .update(users)
        .set({ passwordHash: hashedPassword })
        .where(eq(users.id, ctx.user.id));

      return { success: true, message: "Password changed successfully" };
    }),

  /**
   * Upload profile picture to S3 and update user profile
   */
  uploadProfilePicture: protectedProcedure
    .input(
      z.object({
        imageData: z.string(), // Base64 encoded image
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const db = dbInstance as any;
      const { storagePut } = await import("../storage");

      // Convert base64 to buffer
      const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // Generate unique filename
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const extension = input.mimeType.split("/")[1];
      const fileKey = `profile-pictures/${ctx.user.id}-${timestamp}-${randomSuffix}.${extension}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // Update user profile with new picture URL
      await db
        .update(users)
        .set({ profilePicture: url })
        .where(eq(users.id, ctx.user.id));

      return { success: true, url, message: "Profile picture uploaded successfully" };
    }),

  /**
   * Request email change - generates token and sends verification email
   */
  requestEmailChange: protectedProcedure
    .input(
      z.object({
        newEmail: z.string().email("Invalid email address"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const db = dbInstance as any;
      const crypto = await import("crypto");
      
      // Check if new email is the same as current email
      if (ctx.user.email && input.newEmail.toLowerCase() === ctx.user.email.toLowerCase()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "New email cannot be the same as your current email address",
        });
      }
      
      // Check if new email is already in use
      const existingUser = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.email, input.newEmail))
        .limit(1)
        .then((rows: any) => rows[0]);
      
      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This email address is already in use",
        });
      }
      
      // Generate verification token
      const token = crypto.default.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Save token and new email to database
      await db
        .update(users)
        .set({
          newEmail: input.newEmail,
          emailChangeToken: token,
          emailChangeTokenExpiry: expiry,
        })
        .where(eq(users.id, ctx.user.id));
      
      // Send verification email
      const { sendEmailChangeVerification } = await import("../services/email");
      await sendEmailChangeVerification(
        input.newEmail,
        ctx.user.name || "User",
        token
      );
      
      return {
        success: true,
        message: "Verification email sent to your new email address. Please check your inbox.",
      };
    }),

  /**
   * Verify email change token and update email
   */
  verifyEmailChange: protectedProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const db = dbInstance as any;
      
      // Get user with email change token
      const user = await db.select({
        id: users.id,
        newEmail: users.newEmail,
        emailChangeToken: users.emailChangeToken,
        emailChangeTokenExpiry: users.emailChangeTokenExpiry,
      }).from(users).where(eq(users.id, ctx.user.id)).limit(1).then((rows: any) => rows[0]);
      
      if (!user || !user.emailChangeToken || !user.newEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No email change request found",
        });
      }
      
      // Verify token
      if (user.emailChangeToken !== input.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid verification token",
        });
      }
      
      // Check if token is expired
      if (user.emailChangeTokenExpiry && new Date() > new Date(user.emailChangeTokenExpiry)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification token has expired. Please request a new email change.",
        });
      }
      
      // Update email and clear tokens
      await db
        .update(users)
        .set({
          email: user.newEmail,
          newEmail: null,
          emailChangeToken: null,
          emailChangeTokenExpiry: null,
        })
        .where(eq(users.id, ctx.user.id));
      
      return {
        success: true,
        message: "Email address updated successfully",
      };
    }),

  /**
   * Delete user account with data export
   */
  deleteAccount: protectedProcedure
    .input(
      z.object({
        confirmation: z.string().refine((val) => val === "DELETE", {
          message: "You must type DELETE to confirm",
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dbInstance = await getDb();
      if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const db = dbInstance as any;
      
      // Get user data for export
      const userData = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1).then((rows: any) => rows[0]);
      
      if (!userData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      
      // Prepare data export (remove sensitive fields)
      const dataExport = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        loginMethod: userData.loginMethod,
        role: userData.role,
        createdAt: userData.createdAt,
        lastSignedIn: userData.lastSignedIn,
        profilePicture: userData.profilePicture,
        // Add other non-sensitive fields as needed
      };
      
      // Mark account as deleted (soft delete) instead of hard delete
      await db
        .update(users)
        .set({
          status: "deleted",
          // Anonymize email to prevent conflicts
          email: `deleted_${ctx.user.id}_${Date.now()}@deleted.local`,
        })
        .where(eq(users.id, ctx.user.id));
      
      return {
        success: true,
        message: "Account deleted successfully",
        dataExport, // Return user data for download
      };
    }),
});
