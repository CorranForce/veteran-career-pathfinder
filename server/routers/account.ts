import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const accountRouter = router({
  /**
   * Get current user's account info (name, email, role, dates)
   */
  getAccount: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      role: ctx.user.role,
      createdAt: ctx.user.createdAt,
      lastSignedIn: ctx.user.lastSignedIn,
    };
  }),

  /**
   * Update name and/or email
   */
  updateAccount: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(255).optional(),
        email: z
          .string()
          .email("Please enter a valid email address")
          .max(320)
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update",
        });
      }

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id));

      // Return updated user data
      const updated = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      return {
        success: true,
        user: updated[0]
          ? {
              id: updated[0].id,
              name: updated[0].name,
              email: updated[0].email,
              role: updated[0].role,
            }
          : null,
      };
    }),

  /**
   * Change password - since we use OAuth, this redirects to the OAuth provider's
   * password change flow. We provide the URL for the frontend to redirect to.
   */
  getPasswordChangeUrl: protectedProcedure.query(async () => {
    const oauthPortalUrl = process.env.VITE_OAUTH_PORTAL_URL ?? "";
    // The OAuth portal typically has a settings/password page
    return {
      url: oauthPortalUrl ? `${oauthPortalUrl}/settings` : null,
      message: oauthPortalUrl
        ? "You will be redirected to update your password."
        : "Password management is handled by your login provider.",
    };
  }),
});
