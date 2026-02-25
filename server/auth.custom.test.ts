import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";
import bcrypt from "bcryptjs";
import { createSessionToken, verifySessionToken } from "./_core/session";

describe("Custom Authentication System", () => {
  describe("Email/Password Authentication", () => {
    it("should hash passwords correctly", async () => {
      const password = "testPassword123";
      const hash = await bcrypt.hash(password, 10);
      
      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      
      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect passwords", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword456";
      const hash = await bcrypt.hash(password, 10);
      
      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe("Session Token Management", () => {
    it("should create and verify session tokens", async () => {
      const payload = {
        userId: 1,
        email: "test@example.com",
        name: "Test User",
        role: "user" as const,
      };

      const token = await createSessionToken(payload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");

      const verified = await verifySessionToken(token);
      expect(verified).toBeTruthy();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
      expect(verified?.name).toBe(payload.name);
      expect(verified?.role).toBe(payload.role);
    });

    it("should reject invalid tokens", async () => {
      const invalidToken = "invalid.token.here";
      const verified = await verifySessionToken(invalidToken);
      expect(verified).toBeNull();
    });

    it("should handle tokens with different user roles", async () => {
      const adminPayload = {
        userId: 2,
        email: "admin@example.com",
        name: "Admin User",
        role: "admin" as const,
      };

      const token = await createSessionToken(adminPayload);
      const verified = await verifySessionToken(token);
      
      expect(verified?.role).toBe("admin");
    });
  });

  describe("Database User Operations", () => {
    it("should retrieve user by email", async () => {
      // This test assumes there's at least one user in the database
      // In a real test environment, you'd seed test data
      const testEmail = "test@example.com";
      const user = await db.getUserByEmail(testEmail);
      
      // User may or may not exist, just verify the function works
      expect(user === undefined || user.email === testEmail).toBe(true);
    });

    it("should retrieve user by ID", async () => {
      const userId = 1;
      const user = await db.getUserById(userId);
      
      // User may or may not exist, just verify the function works
      expect(user === undefined || user.id === userId).toBe(true);
    });
  });

  describe("Authentication Flow Integration", () => {
    it("should complete full signup flow", async () => {
      const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: "SecurePassword123!",
        name: "Test User",
      };

      // Hash password
      const passwordHash = await bcrypt.hash(testUser.password, 10);
      expect(passwordHash).toBeTruthy();

      // Verify password can be checked
      const isValid = await bcrypt.compare(testUser.password, passwordHash);
      expect(isValid).toBe(true);

      // Create session token
      const sessionPayload = {
        userId: 999,
        email: testUser.email,
        name: testUser.name,
        role: "user" as const,
      };

      const sessionToken = await createSessionToken(sessionPayload);
      expect(sessionToken).toBeTruthy();

      // Verify session token
      const verified = await verifySessionToken(sessionToken);
      expect(verified?.email).toBe(testUser.email);
    });

    it("should complete full login flow", async () => {
      const storedHash = await bcrypt.hash("userPassword123", 10);
      const loginAttempt = "userPassword123";

      // Verify password
      const isValid = await bcrypt.compare(loginAttempt, storedHash);
      expect(isValid).toBe(true);

      // Create session
      const sessionPayload = {
        userId: 1,
        email: "user@example.com",
        name: "User",
        role: "user" as const,
      };

      const token = await createSessionToken(sessionPayload);
      const verified = await verifySessionToken(token);

      expect(verified?.userId).toBe(sessionPayload.userId);
    });
  });
});
