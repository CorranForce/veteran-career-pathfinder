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
      
      // Check if user uses email/password authentication
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
});
