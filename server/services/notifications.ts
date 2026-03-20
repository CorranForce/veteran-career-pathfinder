/**
 * Notification dispatch service.
 *
 * Three delivery channels:
 *   1. In-app  — writes a row to user_notifications (inbox)
 *   2. Email   — sends via SendGrid (respects emailEnabled preference)
 *   3. Push    — sends Web Push via VAPID (respects pushEnabled preference)
 *
 * Each helper is fire-and-forget safe: errors are logged but never thrown.
 */

import webpush from "web-push";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import {
  notificationPreferences,
  userNotifications,
  pushSubscriptions,
  users,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import sgMail from "@sendgrid/mail";

// Initialise SendGrid once
if (ENV.sendgridApiKey) {
  sgMail.setApiKey(ENV.sendgridApiKey);
}

// Initialise VAPID once at module load
let vapidInitialised = false;
function ensureVapid() {
  if (vapidInitialised) return;
  if (!ENV.vapidPublicKey || !ENV.vapidPrivateKey) return;
  webpush.setVapidDetails(
    "mailto:admin@pathfinder.casa",
    ENV.vapidPublicKey,
    ENV.vapidPrivateKey
  );
  vapidInitialised = true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type NotificationCategory =
  | "general"
  | "payment"
  | "resume"
  | "security"
  | "announcement"
  | "system";

export interface DispatchOptions {
  userId: number;
  title: string;
  body: string;
  /** Optional deep-link within the app */
  actionUrl?: string;
  category?: NotificationCategory;
  /** Override: send even if user has not opted in (e.g. security alerts) */
  forceChannels?: Array<"inApp" | "email" | "push">;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch (or create) notification preferences for a user. */
async function getPrefs(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const [row] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);
  return row ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Channel: In-App
// ─────────────────────────────────────────────────────────────────────────────

export async function sendInApp(opts: DispatchOptions): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const prefs = await getPrefs(opts.userId);
    const forced = opts.forceChannels?.includes("inApp");
    if (!forced && !prefs?.inAppEnabled) return;

    await db.insert(userNotifications).values({
      userId: opts.userId,
      title: opts.title,
      body: opts.body,
      actionUrl: opts.actionUrl ?? null,
      category: opts.category ?? "general",
      isRead: false,
    });
  } catch (err) {
    console.error("[Notifications] sendInApp error:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Channel: Email
// ─────────────────────────────────────────────────────────────────────────────

export async function sendEmailNotification(opts: DispatchOptions): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const prefs = await getPrefs(opts.userId);
    const forced = opts.forceChannels?.includes("email");
    if (!forced && !prefs?.emailEnabled) return;

    // Look up user email
    const [user] = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, opts.userId))
      .limit(1);
    if (!user?.email) return;

    const htmlBody = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a1a2e">${opts.title}</h2>
        <p style="color:#444;line-height:1.6">${opts.body}</p>
        ${
          opts.actionUrl
            ? `<p><a href="${opts.actionUrl}" style="background:#e85d26;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">View Details</a></p>`
            : ""
        }
        <hr style="margin-top:32px;border:none;border-top:1px solid #eee"/>
        <p style="color:#999;font-size:12px">You received this email because you have email notifications enabled. You can manage your preferences in <a href="https://pathfinder.casa/account-settings">Account Settings</a>.</p>
      </div>
    `;

    if (!ENV.sendgridApiKey || !ENV.sendgridFromEmail) return;
    await sgMail.send({
      to: user.email,
      from: { email: ENV.sendgridFromEmail, name: "Pathfinder" },
      subject: opts.title,
      html: htmlBody,
    });
  } catch (err) {
    console.error("[Notifications] sendEmailNotification error:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Channel: Push
// ─────────────────────────────────────────────────────────────────────────────

export async function sendPushNotification(opts: DispatchOptions): Promise<void> {
  try {
    ensureVapid();
    if (!vapidInitialised) return;

    const db = await getDb();
    if (!db) return;

    const prefs = await getPrefs(opts.userId);
    const forced = opts.forceChannels?.includes("push");
    if (!forced && !prefs?.pushEnabled) return;

    // Get all push subscriptions for this user
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, opts.userId));

    if (subs.length === 0) return;

    const payload = JSON.stringify({
      title: opts.title,
      body: opts.body,
      actionUrl: opts.actionUrl,
      category: opts.category ?? "general",
    });

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dhKey, auth: sub.authKey },
            },
            payload
          );
        } catch (err: any) {
          // 410 Gone = subscription expired, remove it
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await db
              .delete(pushSubscriptions)
              .where(eq(pushSubscriptions.id, sub.id));
          } else {
            console.error("[Notifications] Push send error:", err?.message);
          }
        }
      })
    );
  } catch (err) {
    console.error("[Notifications] sendPushNotification error:", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined dispatcher — sends to all opted-in channels
// ─────────────────────────────────────────────────────────────────────────────

export async function dispatchNotification(opts: DispatchOptions): Promise<void> {
  await Promise.allSettled([
    sendInApp(opts),
    sendEmailNotification(opts),
    sendPushNotification(opts),
  ]);
}
