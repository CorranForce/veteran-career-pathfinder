import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  getPublishedAnnouncements,
  getAnnouncementsByType,
  publishAnnouncement,
  archiveAnnouncement,
  restoreAnnouncement,
  getArchivedAnnouncements,
  getActiveLandingAnnouncements,
} from "../db";

export const announcementsRouter = router({
  /**
   * Get all announcements (admin only)
   */
  getAll: adminProcedure.query(async () => {
    return await getAllAnnouncements();
  }),

  /**
   * Get published announcements (public)
   */
  getPublished: publicProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      return await getPublishedAnnouncements(input.limit);
    }),

  /**
   * Get announcements by type (public)
   */
  getByType: publicProcedure
    .input(z.object({ 
      type: z.enum(["feature", "bugfix", "news", "maintenance"]) 
    }))
    .query(async ({ input }) => {
      return await getAnnouncementsByType(input.type);
    }),

  /**
   * Get landing page announcements (public) — published, visibleOnLandingPage=true, not expired
   */
  getLandingAnnouncements: publicProcedure.query(async () => {
    return await getActiveLandingAnnouncements();
  }),

  /**
   * Create announcement (admin only)
   */
  create: adminProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      content: z.string().min(1),
      type: z.enum(["feature", "bugfix", "news", "maintenance"]),
      priority: z.number().optional().default(0),
      link: z.string().url().optional().or(z.literal("")),
      visibleOnLandingPage: z.boolean().optional().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const announcement = await createAnnouncement({
        title: input.title,
        content: input.content,
        type: input.type,
        status: "draft",
        priority: input.priority,
        link: input.link || null,
        visibleOnLandingPage: input.visibleOnLandingPage,
        createdBy: ctx.user.id,
        createdByName: ctx.user.name || "Unknown",
      });

      return announcement;
    }),

  /**
   * Update announcement (admin only)
   */
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(255).optional(),
      content: z.string().min(1).optional(),
      type: z.enum(["feature", "bugfix", "news", "maintenance"]).optional(),
      priority: z.number().optional(),
      link: z.string().url().optional().or(z.literal("")),
      visibleOnLandingPage: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      
      // Convert empty string link to null
      if (updates.link === "") {
        (updates as any).link = null;
      }
      
      await updateAnnouncement(id, updates);
      
      return { success: true };
    }),

  /**
   * Delete announcement (admin only)
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteAnnouncement(input.id);
      return { success: true };
    }),

  /**
   * Publish announcement (admin only)
   */
  publish: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await publishAnnouncement(input.id);
      return { success: true };
    }),

  /**
   * Archive announcement (admin only)
   */
  archive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await archiveAnnouncement(input.id);
      return { success: true };
    }),

  /**
   * Restore an archived announcement back to draft (admin only)
   */
  restore: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await restoreAnnouncement(input.id);
      return { success: true };
    }),

  /**
   * Get archived announcements (admin only)
   */
  getArchived: adminProcedure.query(async () => {
    return await getArchivedAnnouncements();
  }),
});
