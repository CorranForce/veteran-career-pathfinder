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
});
