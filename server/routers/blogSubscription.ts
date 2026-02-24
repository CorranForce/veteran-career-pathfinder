import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../_core/trpc";
import { eq, and, desc } from "drizzle-orm";
import { blogSubscribers, type BlogSubscriber } from "../../drizzle/schema";
import { getDb } from "../db";
import { sendBlogSubscriptionVerification, sendBlogUpdateNotification } from "../services/email";
import crypto from "crypto";

// Helper to generate random token
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const blogSubscriptionRouter = router({
  /**
   * Subscribe to blog updates (public)
   * Sends verification email to confirm subscription
   */
  subscribe: publicProcedure
    .input(z.object({
      email: z.string().email("Invalid email address"),
      subscribeToNewPosts: z.boolean().optional().default(true),
      subscribeToFeatures: z.boolean().optional().default(true),
      subscribeToBugFixes: z.boolean().optional().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Check if email already exists
      const [existing] = await db.select().from(blogSubscribers).where(eq(blogSubscribers.email, input.email)).limit(1);

      if (existing) {
        if (existing.status === "active") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This email is already subscribed",
          });
        }
        
        // Reactivate if previously unsubscribed
        if (existing.status === "unsubscribed") {
          const verificationToken = generateToken();
          const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          await db.update(blogSubscribers)
            .set({
              status: "active",
              isVerified: false,
              verificationToken,
              verificationTokenExpiry,
              subscribeToNewPosts: input.subscribeToNewPosts,
              subscribeToFeatures: input.subscribeToFeatures,
              subscribeToBugFixes: input.subscribeToBugFixes,
              unsubscribedAt: null,
            })
            .where(eq(blogSubscribers.id, existing.id));

          // Send verification email
          await sendBlogSubscriptionVerification(input.email, verificationToken);

          return {
            success: true,
            message: "Verification email sent. Please check your inbox.",
          };
        }
      }

      // Create new subscription
      const verificationToken = generateToken();
      const unsubscribeToken = generateToken();
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await db.insert(blogSubscribers).values({
        email: input.email,
        subscribeToNewPosts: input.subscribeToNewPosts,
        subscribeToFeatures: input.subscribeToFeatures,
        subscribeToBugFixes: input.subscribeToBugFixes,
        verificationToken,
        verificationTokenExpiry,
        unsubscribeToken,
        status: "active",
        isVerified: false,
      });

      // Send verification email
      await sendBlogSubscriptionVerification(input.email, verificationToken);

      return {
        success: true,
        message: "Verification email sent. Please check your inbox to confirm your subscription.",
      };
    }),

  /**
   * Verify email subscription
   */
  verifyEmail: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [subscriber] = await db.select().from(blogSubscribers).where(eq(blogSubscribers.verificationToken, input.token)).limit(1);

      if (!subscriber) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification token",
        });
      }

      if (subscriber.isVerified) {
        return {
          success: true,
          message: "Email already verified",
        };
      }

      if (subscriber.verificationTokenExpiry && new Date() > subscriber.verificationTokenExpiry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification token has expired. Please subscribe again.",
        });
      }

      await db.update(blogSubscribers)
        .set({
          isVerified: true,
          verifiedAt: new Date(),
          verificationToken: null,
          verificationTokenExpiry: null,
        })
        .where(eq(blogSubscribers.id, subscriber.id));

      return {
        success: true,
        message: "Email verified successfully! You're now subscribed to blog updates.",
      };
    }),

  /**
   * Unsubscribe from blog updates
   */
  unsubscribe: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [subscriber] = await db.select().from(blogSubscribers).where(eq(blogSubscribers.unsubscribeToken, input.token)).limit(1);

      if (!subscriber) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid unsubscribe token",
        });
      }

      await db.update(blogSubscribers)
        .set({
          status: "unsubscribed",
          unsubscribedAt: new Date(),
        })
        .where(eq(blogSubscribers.id, subscriber.id));

      return {
        success: true,
        message: "You've been unsubscribed from blog updates.",
      };
    }),

  /**
   * Update subscription preferences
   */
  updatePreferences: publicProcedure
    .input(z.object({
      email: z.string().email(),
      subscribeToNewPosts: z.boolean(),
      subscribeToFeatures: z.boolean(),
      subscribeToBugFixes: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [subscriber] = await db.select().from(blogSubscribers).where(eq(blogSubscribers.email, input.email)).limit(1);

      if (!subscriber) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription not found",
        });
      }

      if (subscriber.status !== "active") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Subscription is not active",
        });
      }

      await db.update(blogSubscribers)
        .set({
          subscribeToNewPosts: input.subscribeToNewPosts,
          subscribeToFeatures: input.subscribeToFeatures,
          subscribeToBugFixes: input.subscribeToBugFixes,
        })
        .where(eq(blogSubscribers.id, subscriber.id));

      return {
        success: true,
        message: "Subscription preferences updated successfully",
      };
    }),

  /**
   * Get all subscribers (admin only)
   */
  getAllSubscribers: adminProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const subscribers = await db.select().from(blogSubscribers).orderBy(desc(blogSubscribers.subscribedAt));

      return subscribers;
    }),

  /**
   * Get subscriber statistics (admin only)
   */
  getSubscriberStats: adminProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const allSubscribers = await db.select().from(blogSubscribers);

      const stats = {
        total: allSubscribers.length,
        active: allSubscribers.filter((s: BlogSubscriber) => s.status === "active" && s.isVerified).length,
        pending: allSubscribers.filter((s: BlogSubscriber) => s.status === "active" && !s.isVerified).length,
        unsubscribed: allSubscribers.filter((s: BlogSubscriber) => s.status === "unsubscribed").length,
        bounced: allSubscribers.filter((s: BlogSubscriber) => s.status === "bounced").length,
      };

      return stats;
    }),

  /**
   * Send blog update notification to all subscribers (admin only)
   * Used when publishing new blog posts, features, or bug fixes
   */
  sendBlogUpdate: adminProcedure
    .input(z.object({
      type: z.enum(["newPost", "feature", "bugfix"]),
      title: z.string(),
      excerpt: z.string(),
      link: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Get all active verified subscribers based on type
      let subscribers = await db.select().from(blogSubscribers).where(
        and(
          eq(blogSubscribers.status, "active"),
          eq(blogSubscribers.isVerified, true)
        )
      );

      // Filter based on subscription preferences
      if (input.type === "newPost") {
        subscribers = subscribers.filter((s: BlogSubscriber) => s.subscribeToNewPosts);
      } else if (input.type === "feature") {
        subscribers = subscribers.filter((s: BlogSubscriber) => s.subscribeToFeatures);
      } else if (input.type === "bugfix") {
        subscribers = subscribers.filter((s: BlogSubscriber) => s.subscribeToBugFixes);
      }

      // Send emails to all subscribers
      const emailPromises = subscribers.map((subscriber: BlogSubscriber) =>
        sendBlogUpdateNotification(
          subscriber.email,
          input.title,
          input.excerpt,
          input.link,
          subscriber.unsubscribeToken
        )
      );

      await Promise.all(emailPromises);

      // Update lastEmailSentAt for all subscribers
      const updatePromises = subscribers.map((subscriber: BlogSubscriber) =>
        db.update(blogSubscribers)
          .set({ lastEmailSentAt: new Date() })
          .where(eq(blogSubscribers.id, subscriber.id))
      );

      await Promise.all(updatePromises);

      return {
        success: true,
        message: `Blog update sent to ${subscribers.length} subscribers`,
        count: subscribers.length,
      };
    }),
});
