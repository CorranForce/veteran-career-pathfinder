/**
 * Notifications router
 *
 * Procedures:
 *   notifications.getPreferences     — get user's notification opt-in settings
 *   notifications.updatePreferences  — toggle inApp / email / push
 *   notifications.list               — list in-app inbox notifications
 *   notifications.markRead           — mark a single notification as read
 *   notifications.markAllRead        — mark all notifications as read
 *   notifications.getUnreadCount     — quick badge count
 *   notifications.subscribePush      — register a push subscription
 *   notifications.unsubscribePush    — remove a push subscription
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  notificationPreferences,
  userNotifications,
  pushSubscriptions,
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = router({
  // ── Preferences ────────────────────────────────────────────────────────────

  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [prefs] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, ctx.user.id))
      .limit(1);

    // Return defaults if no row yet
    return prefs ?? {
      id: null,
      userId: ctx.user.id,
      inAppEnabled: false,
      emailEnabled: false,
      pushEnabled: false,
    };
  }),

  updatePreferences: protectedProcedure
    .input(
      z.object({
        inAppEnabled: z.boolean().optional(),
        emailEnabled: z.boolean().optional(),
        pushEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [existing] = await db
        .select({ id: notificationPreferences.id })
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, ctx.user.id))
        .limit(1);

      if (existing) {
        await db
          .update(notificationPreferences)
          .set({
            ...(input.inAppEnabled !== undefined && { inAppEnabled: input.inAppEnabled }),
            ...(input.emailEnabled !== undefined && { emailEnabled: input.emailEnabled }),
            ...(input.pushEnabled !== undefined && { pushEnabled: input.pushEnabled }),
            updatedAt: new Date(),
          })
          .where(eq(notificationPreferences.userId, ctx.user.id));
      } else {
        await db.insert(notificationPreferences).values({
          userId: ctx.user.id,
          inAppEnabled: input.inAppEnabled ?? false,
          emailEnabled: input.emailEnabled ?? false,
          pushEnabled: input.pushEnabled ?? false,
        });
      }

      return { success: true };
    }),

  // ── In-App Inbox ───────────────────────────────────────────────────────────

  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return db
        .select()
        .from(userNotifications)
        .where(eq(userNotifications.userId, ctx.user.id))
        .orderBy(desc(userNotifications.createdAt))
        .limit(input.limit);
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { count: 0 };

    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userNotifications)
      .where(
        and(
          eq(userNotifications.userId, ctx.user.id),
          eq(userNotifications.isRead, false)
        )
      );

    return { count: Number(result?.count ?? 0) };
  }),

  markRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(userNotifications)
        .set({ isRead: true, readAt: new Date() })
        .where(
          and(
            eq(userNotifications.id, input.id),
            eq(userNotifications.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    await db
      .update(userNotifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(userNotifications.userId, ctx.user.id),
          eq(userNotifications.isRead, false)
        )
      );

    return { success: true };
  }),

  // ── Push Subscriptions ─────────────────────────────────────────────────────

  subscribePush: protectedProcedure
    .input(
      z.object({
        endpoint: z.string().url(),
        p256dhKey: z.string().min(1),
        authKey: z.string().min(1),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Upsert: if endpoint already exists for this user, update keys
      const [existing] = await db
        .select({ id: pushSubscriptions.id })
        .from(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.userId, ctx.user.id),
            eq(pushSubscriptions.endpoint, input.endpoint)
          )
        )
        .limit(1);

      if (existing) {
        await db
          .update(pushSubscriptions)
          .set({ p256dhKey: input.p256dhKey, authKey: input.authKey })
          .where(eq(pushSubscriptions.id, existing.id));
      } else {
        await db.insert(pushSubscriptions).values({
          userId: ctx.user.id,
          endpoint: input.endpoint,
          p256dhKey: input.p256dhKey,
          authKey: input.authKey,
          userAgent: input.userAgent ?? null,
        });
      }

      return { success: true };
    }),

  unsubscribePush: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .delete(pushSubscriptions)
        .where(
          and(
            eq(pushSubscriptions.userId, ctx.user.id),
            eq(pushSubscriptions.endpoint, input.endpoint)
          )
        );

      return { success: true };
    }),
});
