import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { createSubscriber, getAllSubscribers } from "../db";

export const emailRouter = router({
  /**
   * Subscribe to email list (public endpoint)
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        name: z.string().optional(),
        source: z.string().default("homepage"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await createSubscriber({
          email: input.email.toLowerCase().trim(),
          name: input.name?.trim() || null,
          source: input.source,
          status: "active",
        });

        return {
          success: true,
          message: "Successfully subscribed to the mailing list!",
        };
      } catch (error: any) {
        if (error.message === "Email already subscribed") {
          return {
            success: false,
            message: "This email is already subscribed.",
          };
        }
        throw error;
      }
    }),

  /**
   * Get all subscribers (protected - admin only in future)
   */
  getAll: publicProcedure.query(async () => {
    return await getAllSubscribers();
  }),
});
