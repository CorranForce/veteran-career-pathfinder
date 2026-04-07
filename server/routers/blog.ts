import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getAllBlogPosts,
  getPublishedBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  archiveBlogPost,
  deleteBlogPost,
} from "../db";

export const blogRouter = router({
  /**
   * Get all blog posts — admin only (includes drafts and archived)
   */
  getAll: adminProcedure.query(async () => {
    return await getAllBlogPosts();
  }),

  /**
   * Get published posts — public
   */
  getPublished: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).optional().default(20) }))
    .query(async ({ input }) => {
      return await getPublishedBlogPosts(input.limit);
    }),

  /**
   * Get a single post by slug — public
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      return await getBlogPostBySlug(input.slug);
    }),

  /**
   * Get a single post by id — admin only
   */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getBlogPostById(input.id);
    }),

  /**
   * Create a new blog post (draft) — admin only
   */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        excerpt: z.string().min(1),
        content: z.string().min(1),
        coverImageUrl: z.string().url().optional().or(z.literal("")).transform(v => v || null),
        metaTitle: z.string().max(255).optional().transform(v => v || null),
        metaDescription: z.string().optional().transform(v => v || null),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const post = await createBlogPost({
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        coverImageUrl: input.coverImageUrl ?? null,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        authorId: ctx.user.id,
        authorName: ctx.user.name || "Admin",
      });
      return post;
    }),

  /**
   * Update an existing blog post — admin only
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        excerpt: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        coverImageUrl: z.string().url().optional().or(z.literal("")).transform(v => v === "" ? null : v ?? null),
        metaTitle: z.string().max(255).optional().transform(v => v === "" ? null : v ?? null),
        metaDescription: z.string().optional().transform(v => v === "" ? null : v ?? null),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateBlogPost(id, updates);
      return { success: true };
    }),

  /**
   * Publish a post — admin only
   */
  publish: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await publishBlogPost(input.id);
      return { success: true };
    }),

  /**
   * Unpublish (revert to draft) — admin only
   */
  unpublish: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await unpublishBlogPost(input.id);
      return { success: true };
    }),

  /**
   * Archive a post — admin only
   */
  archive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await archiveBlogPost(input.id);
      return { success: true };
    }),

  /**
   * Permanently delete a post — admin only
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteBlogPost(input.id);
      return { success: true };
    }),
});
