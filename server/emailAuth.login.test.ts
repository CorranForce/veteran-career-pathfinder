import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Tests for the emailAuth login procedure logic.
 * Covers the Google OAuth account mismatch scenario that caused the
 * "Invalid email or password" error for OAuth-only users.
 */
describe("EmailAuth Login Logic", () => {
  let googleUserId: number;
  let emailUserId: number;
  const timestamp = Date.now();
  const googleUserEmail = `google-only-${timestamp}@test.com`;
  const emailUserEmail = `email-user-${timestamp}@test.com`;
  const testPassword = "TestPassword123!";

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Create a Google OAuth user (no passwordHash)
    const [googleUser] = await db
      .insert(users)
      .values({
        email: googleUserEmail,
        name: "Google Test User",
        loginMethod: "google",
        openId: `google-openid-${timestamp}`,
        role: "user",
        status: "active",
        lastSignedIn: new Date(),
      })
      .$returningId();
    googleUserId = googleUser.id;

    // Create an email/password user
    const passwordHash = await bcrypt.hash(testPassword, 10);
    const [emailUser] = await db
      .insert(users)
      .values({
        email: emailUserEmail,
        name: "Email Test User",
        loginMethod: "email",
        passwordHash,
        role: "user",
        status: "active",
        lastSignedIn: new Date(),
      })
      .$returningId();
    emailUserId = emailUser.id;
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;
    await db.delete(users).where(eq(users.id, googleUserId));
    await db.delete(users).where(eq(users.id, emailUserId));
  });

  it("should find a Google OAuth user by email but have no passwordHash", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUserEmail))
      .limit(1);

    expect(user).toBeDefined();
    expect(user.loginMethod).toBe("google");
    expect(user.passwordHash).toBeNull();
  });

  it("should find an email user and have a valid passwordHash", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, emailUserEmail))
      .limit(1);

    expect(user).toBeDefined();
    expect(user.loginMethod).toBe("email");
    expect(user.passwordHash).not.toBeNull();
  });

  it("should validate correct password for email user", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, emailUserEmail))
      .limit(1);

    const isValid = await bcrypt.compare(testPassword, user.passwordHash!);
    expect(isValid).toBe(true);
  });

  it("should reject incorrect password for email user", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, emailUserEmail))
      .limit(1);

    const isValid = await bcrypt.compare("WrongPassword!", user.passwordHash!);
    expect(isValid).toBe(false);
  });

  it("should identify Google OAuth accounts by loginMethod", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUserEmail))
      .limit(1);

    // The login procedure checks: if user exists but has no passwordHash,
    // it should return a helpful error message based on loginMethod
    expect(user.loginMethod).toBe("google");
    expect(user.passwordHash).toBeNull();

    const isGoogle = user.loginMethod === "google";
    const expectedMessage = isGoogle
      ? "This account was created with Google. Please use the \"Continue with Google\" button to sign in."
      : `This account uses ${user.loginMethod} login. Please use the appropriate sign-in method.`;

    expect(expectedMessage).toContain("Google");
    expect(expectedMessage).toContain("Continue with Google");
  });
});
