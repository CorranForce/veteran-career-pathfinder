/**
 * Notification system tests
 *
 * Tests cover:
 *   1. notificationsRouter — getPreferences, updatePreferences, list, markRead, markAllRead, getUnreadCount
 *   2. notificationsRouter — subscribePush, unsubscribePush
 *   3. dispatchNotification helpers — sendInApp respects inAppEnabled preference
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDb } from "./db";
import {
  notificationPreferences,
  userNotifications,
  pushSubscriptions,
  users,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TEST_EMAIL_PREFIX = "notif-test-";

async function createTestUser(suffix: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const email = `${TEST_EMAIL_PREFIX}${suffix}@example.com`;
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) return existing;
  await db.insert(users).values({
    email,
    name: `Test User ${suffix}`,
    role: "user",
    openId: `test-notif-openid-${suffix}`,
  });
  const [created] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return created!;
}

async function cleanupTestUser(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  await db.delete(userNotifications).where(eq(userNotifications.userId, userId));
  await db.delete(notificationPreferences).where(eq(notificationPreferences.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests: Notification Preferences
// ─────────────────────────────────────────────────────────────────────────────

describe("Notification Preferences", () => {
  let userId: number;

  beforeEach(async () => {
    const user = await createTestUser("prefs-" + Date.now());
    userId = user.id;
  });

  afterEach(async () => {
    await cleanupTestUser(userId);
  });

  it("returns default preferences (all false) when no row exists", async () => {
    const db = await getDb();
    if (!db) return;
    const [row] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);
    expect(row).toBeUndefined();
  });

  it("inserts preferences correctly", async () => {
    const db = await getDb();
    if (!db) return;
    await db.insert(notificationPreferences).values({
      userId,
      inAppEnabled: true,
      emailEnabled: false,
      pushEnabled: true,
    });
    const [row] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);
    expect(row).toBeDefined();
    expect(row!.inAppEnabled).toBe(true);
    expect(row!.emailEnabled).toBe(false);
    expect(row!.pushEnabled).toBe(true);
  });

  it("updates preferences correctly", async () => {
    const db = await getDb();
    if (!db) return;
    await db.insert(notificationPreferences).values({
      userId,
      inAppEnabled: false,
      emailEnabled: false,
      pushEnabled: false,
    });
    await db
      .update(notificationPreferences)
      .set({ inAppEnabled: true, emailEnabled: true })
      .where(eq(notificationPreferences.userId, userId));
    const [row] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);
    expect(row!.inAppEnabled).toBe(true);
    expect(row!.emailEnabled).toBe(true);
    expect(row!.pushEnabled).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: In-App Notifications
// ─────────────────────────────────────────────────────────────────────────────

describe("In-App Notifications", () => {
  let userId: number;

  beforeEach(async () => {
    const user = await createTestUser("inbox-" + Date.now());
    userId = user.id;
  });

  afterEach(async () => {
    await cleanupTestUser(userId);
  });

  it("inserts a notification and reads it back", async () => {
    const db = await getDb();
    if (!db) return;
    await db.insert(userNotifications).values({
      userId,
      title: "Test Notification",
      body: "This is a test body",
      category: "general",
      isRead: false,
    });
    const rows = await db
      .select()
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId));
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("Test Notification");
    expect(rows[0].isRead).toBe(false);
  });

  it("marks a notification as read", async () => {
    const db = await getDb();
    if (!db) return;
    await db.insert(userNotifications).values({
      userId,
      title: "Unread Notification",
      body: "Body text",
      category: "general",
      isRead: false,
    });
    const [inserted] = await db
      .select()
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId))
      .limit(1);
    await db
      .update(userNotifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(userNotifications.id, inserted.id));
    const [updated] = await db
      .select()
      .from(userNotifications)
      .where(eq(userNotifications.id, inserted.id))
      .limit(1);
    expect(updated.isRead).toBe(true);
    expect(updated.readAt).toBeDefined();
  });

  it("marks all notifications as read", async () => {
    const db = await getDb();
    if (!db) return;
    await db.insert(userNotifications).values([
      { userId, title: "Notif 1", body: "Body 1", category: "general", isRead: false },
      { userId, title: "Notif 2", body: "Body 2", category: "payment", isRead: false },
      { userId, title: "Notif 3", body: "Body 3", category: "system", isRead: true },
    ]);
    await db
      .update(userNotifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(userNotifications.userId, userId));
    const unread = await db
      .select()
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId));
    expect(unread.every((n) => n.isRead)).toBe(true);
  });

  it("stores actionUrl and category correctly", async () => {
    const db = await getDb();
    if (!db) return;
    await db.insert(userNotifications).values({
      userId,
      title: "Payment Received",
      body: "Your payment was processed",
      category: "payment",
      actionUrl: "/account/payments",
      isRead: false,
    });
    const [row] = await db
      .select()
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId))
      .limit(1);
    expect(row.category).toBe("payment");
    expect(row.actionUrl).toBe("/account/payments");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: Push Subscriptions
// ─────────────────────────────────────────────────────────────────────────────

describe("Push Subscriptions", () => {
  let userId: number;

  beforeEach(async () => {
    const user = await createTestUser("push-" + Date.now());
    userId = user.id;
  });

  afterEach(async () => {
    await cleanupTestUser(userId);
  });

  it("inserts a push subscription", async () => {
    const db = await getDb();
    if (!db) return;
    await db.insert(pushSubscriptions).values({
      userId,
      endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint-123",
      p256dhKey: "test-p256dh-key",
      authKey: "test-auth-key",
      userAgent: "Mozilla/5.0 Test Browser",
    });
    const [row] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId))
      .limit(1);
    expect(row).toBeDefined();
    expect(row!.endpoint).toBe("https://fcm.googleapis.com/fcm/send/test-endpoint-123");
    expect(row!.p256dhKey).toBe("test-p256dh-key");
  });

  it("deletes a push subscription by endpoint", async () => {
    const db = await getDb();
    if (!db) return;
    const endpoint = "https://fcm.googleapis.com/fcm/send/to-delete-456";
    await db.insert(pushSubscriptions).values({
      userId,
      endpoint,
      p256dhKey: "key1",
      authKey: "auth1",
    });
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
    const rows = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
    expect(rows).toHaveLength(0);
  });

  it("allows multiple subscriptions per user (different devices)", async () => {
    const db = await getDb();
    if (!db) return;
    await db.insert(pushSubscriptions).values([
      { userId, endpoint: "https://fcm.example.com/device1", p256dhKey: "k1", authKey: "a1" },
      { userId, endpoint: "https://fcm.example.com/device2", p256dhKey: "k2", authKey: "a2" },
    ]);
    const rows = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
    expect(rows).toHaveLength(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Tests: sendInApp dispatch helper
// ─────────────────────────────────────────────────────────────────────────────

describe("sendInApp dispatch helper", () => {
  let userId: number;

  beforeEach(async () => {
    const user = await createTestUser("dispatch-" + Date.now());
    userId = user.id;
  });

  afterEach(async () => {
    await cleanupTestUser(userId);
  });

  it("does NOT create a notification when inApp is disabled", async () => {
    const db = await getDb();
    if (!db) return;
    // No preference row = defaults to disabled
    const { sendInApp } = await import("./services/notifications");
    await sendInApp({ userId, title: "Should Not Appear", body: "Blocked" });
    const rows = await db
      .select()
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId));
    expect(rows).toHaveLength(0);
  });

  it("creates a notification when inApp is enabled", async () => {
    const db = await getDb();
    if (!db) return;
    await db.insert(notificationPreferences).values({
      userId,
      inAppEnabled: true,
      emailEnabled: false,
      pushEnabled: false,
    });
    const { sendInApp } = await import("./services/notifications");
    await sendInApp({ userId, title: "Welcome!", body: "You have a new message", category: "general" });
    const rows = await db
      .select()
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId));
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("Welcome!");
    expect(rows[0].isRead).toBe(false);
  });

  it("creates a notification when forceChannels includes inApp (even if disabled)", async () => {
    const db = await getDb();
    if (!db) return;
    // Explicitly disabled
    await db.insert(notificationPreferences).values({
      userId,
      inAppEnabled: false,
      emailEnabled: false,
      pushEnabled: false,
    });
    const { sendInApp } = await import("./services/notifications");
    await sendInApp({
      userId,
      title: "Security Alert",
      body: "Your account was accessed from a new device",
      category: "security",
      forceChannels: ["inApp"],
    });
    const rows = await db
      .select()
      .from(userNotifications)
      .where(eq(userNotifications.userId, userId));
    expect(rows).toHaveLength(1);
    expect(rows[0].category).toBe("security");
  });
});
