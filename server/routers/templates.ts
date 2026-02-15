import { router, publicProcedure, platformOwnerProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getAllResumeTemplates,
  getResumeTemplateById,
  incrementTemplateDownloadCount,
  createResumeTemplate,
  deleteResumeTemplate,
} from "../db";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

// Helper to generate random suffix for file keys
function randomSuffix() {
  return Math.random().toString(36).substring(2, 10);
}

export const templatesRouter = router({
  // Get all active templates (public)
  getAllTemplates: publicProcedure.query(async () => {
    const templates = await getAllResumeTemplates();
    return templates;
  }),

  // Get template by ID (public)
  getTemplate: publicProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      const template = await getResumeTemplateById(input.templateId);
      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }
      return template;
    }),

  // Track template download
  trackDownload: publicProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ input }) => {
      const success = await incrementTemplateDownloadCount(input.templateId);
      return { success };
    }),

  // Create new template (platform owner only)
  createTemplate: platformOwnerProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        category: z.string(),
        fileData: z.string(), // base64
        fileName: z.string(),
        mimeType: z.string(),
        thumbnailData: z.string().optional(), // base64
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Upload template file to S3
        const fileBuffer = Buffer.from(input.fileData, "base64");
        const fileKey = `templates/${input.category}-${randomSuffix()}-${input.fileName}`;
        
        const { url: fileUrl } = await storagePut(
          fileKey,
          fileBuffer,
          input.mimeType
        );

        // Upload thumbnail if provided
        let thumbnailUrl: string | undefined;
        if (input.thumbnailData) {
          const thumbnailBuffer = Buffer.from(input.thumbnailData, "base64");
          const thumbnailKey = `templates/thumbnails/${input.category}-${randomSuffix()}.png`;
          const thumbnailResult = await storagePut(
            thumbnailKey,
            thumbnailBuffer,
            "image/png"
          );
          thumbnailUrl = thumbnailResult.url;
        }

        // Create database record
        const template = await createResumeTemplate({
          name: input.name,
          description: input.description,
          category: input.category,
          fileUrl,
          fileKey,
          thumbnailUrl,
        });

        if (!template) {
          throw new Error("Failed to create template record");
        }

        return template;
      } catch (error) {
        console.error("[Templates] Failed to create template:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create template",
        });
      }
    }),

  // Delete template (platform owner only)
  deleteTemplate: platformOwnerProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ input }) => {
      const success = await deleteResumeTemplate(input.templateId);
      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete template",
        });
      }
      return { success: true };
    }),
});
