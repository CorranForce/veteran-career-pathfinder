import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { eq, desc } from "drizzle-orm";
import { exitIntentCaptures } from "../../drizzle/schema";
import { getDb } from "../db";
import { sendExitIntentCouponEmail } from "../services/resendEmail";
import crypto from "crypto";

const COUPON_CODE = "5zlB9zup";

/** Hash an IP address so we never store raw IPs */
function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip + "pathfinder-salt").digest("hex").slice(0, 32);
}

export const exitIntentRouter = router({
  /**
   * Submit an email to claim the exit-intent discount coupon.
   * - Validates email format
   * - Prevents duplicate submissions (same email gets the same code, no spam)
   * - Sends coupon code via Resend email
   * - Returns the coupon code to reveal in the popup
   */
  submit: publicProcedure
    .input(
      z.object({
        email: z
          .string()
          .email("Please enter a valid email address")
          .max(255, "Email too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Service temporarily unavailable. Please try again.",
        });
      }

      const normalizedEmail = input.email.toLowerCase().trim();

      // Get IP for abuse prevention (hashed, never stored raw)
      const rawIp =
        (ctx.req as any)?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
        (ctx.req as any)?.socket?.remoteAddress ||
        "unknown";
      const ipHash = hashIp(rawIp);

      // Check if this email already submitted — return the code again (idempotent)
      const [existing] = await db
        .select()
        .from(exitIntentCaptures)
        .where(eq(exitIntentCaptures.email, normalizedEmail))
        .limit(1);

      if (existing) {
        // Already captured — just return the code (don't re-send email to avoid spam)
        return {
          couponCode: existing.couponCode,
          alreadySubmitted: true,
        };
      }

      // Insert new capture record
      await db.insert(exitIntentCaptures).values({
        email: normalizedEmail,
        couponCode: COUPON_CODE,
        emailSent: false,
        ipHash,
      });

      // Fetch the newly inserted row
      const [capture] = await db
        .select()
        .from(exitIntentCaptures)
        .where(eq(exitIntentCaptures.email, normalizedEmail))
        .limit(1);

      // Send coupon email (non-fatal — popup still reveals code even if email fails)
      let emailSent = false;
      try {
        emailSent = await sendExitIntentCouponEmail(normalizedEmail, COUPON_CODE);
        if (emailSent && capture) {
          await db
            .update(exitIntentCaptures)
            .set({ emailSent: true, emailSentAt: new Date() })
            .where(eq(exitIntentCaptures.id, capture.id));
        }
      } catch (err) {
        console.error("[ExitIntent] Failed to send coupon email:", err);
      }

      return {
        couponCode: COUPON_CODE,
        alreadySubmitted: false,
        emailSent,
      };
    }),

  /**
   * Admin: list all exit-intent captures with stats
   */
  adminList: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const captures = await db
      .select()
      .from(exitIntentCaptures)
      .orderBy(desc(exitIntentCaptures.createdAt))
      .limit(500);

    const total = captures.length;
    const emailSentCount = captures.filter((c) => c.emailSent).length;
    const convertedCount = captures.filter((c) => c.convertedAt !== null).length;

    return {
      captures,
      stats: {
        total,
        emailSentCount,
        convertedCount,
        conversionRate: total > 0 ? Math.round((convertedCount / total) * 100) : 0,
      },
    };
  }),
});
