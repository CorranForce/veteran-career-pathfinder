import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("User Management System", () => {
  let testUserId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Create a test user for management operations
    const [testUser] = await db
      .insert(users)
      .values({
        email: `test-user-${Date.now()}@example.com`,
        name: "Test User",
        role: "user",
        status: "active",
        loginMethod: "email",
      })
      .$returningId();

    testUserId = testUser.id;
  });

  it("should have status field in users table", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user[0]).toBeDefined();
    expect(user[0].status).toBeDefined();
    expect(user[0].status).toBe("active");
  });

  it("should be able to suspend a user", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db
      .update(users)
      .set({ status: "suspended" })
      .where(eq(users.id, testUserId));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user.status).toBe("suspended");
  });

  it("should be able to reactivate a suspended user", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db
      .update(users)
      .set({ status: "active" })
      .where(eq(users.id, testUserId));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user.status).toBe("active");
  });

  it("should be able to soft delete a user", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db
      .update(users)
      .set({ status: "deleted" })
      .where(eq(users.id, testUserId));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user.status).toBe("deleted");
  });

  it("should be able to change user role", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, testUserId));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user.role).toBe("admin");
  });

  it("should include loginMethod in user data", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, testUserId))
      .limit(1);

    expect(user.loginMethod).toBeDefined();
    expect(user.loginMethod).toBe("email");
  });

  it("should be able to query users by status", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Set user to active
    await db
      .update(users)
      .set({ status: "active" })
      .where(eq(users.id, testUserId));

    const activeUsers = await db
      .select()
      .from(users)
      .where(eq(users.status, "active"));

    expect(activeUsers.length).toBeGreaterThan(0);
    expect(activeUsers.some((u) => u.id === testUserId)).toBe(true);
  });

  it("should be able to query users by role", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"));

    // Should include our test user that we changed to admin
    expect(adminUsers.some((u) => u.id === testUserId)).toBe(true);
  });
});
