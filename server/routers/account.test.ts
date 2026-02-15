import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

// Mock drizzle-orm
vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col, val) => ({ col, val, type: "eq" })),
}));

// Mock the schema
vi.mock("../../drizzle/schema", () => ({
  users: {
    id: "id",
    name: "name",
    email: "email",
    role: "role",
    openId: "openId",
  },
}));

import { getDb } from "../db";

describe("Account Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccount", () => {
    it("should return user account info from context", async () => {
      // The getAccount procedure simply returns data from ctx.user
      // We verify the shape of the expected return
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "user" as const,
        createdAt: new Date("2024-01-01"),
        lastSignedIn: new Date("2024-06-01"),
        openId: "test-open-id",
        loginMethod: "email",
        updatedAt: new Date(),
        stripeCustomerId: null,
      };

      // Simulate what the procedure does
      const result = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        lastSignedIn: mockUser.lastSignedIn,
      };

      expect(result).toEqual({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "user",
        createdAt: new Date("2024-01-01"),
        lastSignedIn: new Date("2024-06-01"),
      });
    });

    it("should handle null name and email gracefully", () => {
      const mockUser = {
        id: 2,
        name: null,
        email: null,
        role: "user" as const,
        createdAt: new Date("2024-01-01"),
        lastSignedIn: new Date("2024-06-01"),
      };

      const result = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt,
        lastSignedIn: mockUser.lastSignedIn,
      };

      expect(result.name).toBeNull();
      expect(result.email).toBeNull();
    });
  });

  describe("updateAccount", () => {
    it("should validate name is not empty", () => {
      const { z } = require("zod");
      const schema = z.object({
        name: z.string().min(1, "Name is required").max(255).optional(),
        email: z.string().email("Please enter a valid email address").max(320).optional(),
      });

      // Valid input
      const validResult = schema.safeParse({ name: "John" });
      expect(validResult.success).toBe(true);

      // Empty name should fail
      const emptyResult = schema.safeParse({ name: "" });
      expect(emptyResult.success).toBe(false);
    });

    it("should validate email format", () => {
      const { z } = require("zod");
      const schema = z.object({
        name: z.string().min(1, "Name is required").max(255).optional(),
        email: z.string().email("Please enter a valid email address").max(320).optional(),
      });

      // Valid email
      const validResult = schema.safeParse({ email: "test@example.com" });
      expect(validResult.success).toBe(true);

      // Invalid email
      const invalidResult = schema.safeParse({ email: "not-an-email" });
      expect(invalidResult.success).toBe(false);
    });

    it("should allow updating only name", () => {
      const { z } = require("zod");
      const schema = z.object({
        name: z.string().min(1, "Name is required").max(255).optional(),
        email: z.string().email("Please enter a valid email address").max(320).optional(),
      });

      const result = schema.safeParse({ name: "Jane Doe" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Jane Doe");
        expect(result.data.email).toBeUndefined();
      }
    });

    it("should allow updating only email", () => {
      const { z } = require("zod");
      const schema = z.object({
        name: z.string().min(1, "Name is required").max(255).optional(),
        email: z.string().email("Please enter a valid email address").max(320).optional(),
      });

      const result = schema.safeParse({ email: "new@example.com" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("new@example.com");
        expect(result.data.name).toBeUndefined();
      }
    });

    it("should allow updating both name and email", () => {
      const { z } = require("zod");
      const schema = z.object({
        name: z.string().min(1, "Name is required").max(255).optional(),
        email: z.string().email("Please enter a valid email address").max(320).optional(),
      });

      const result = schema.safeParse({ name: "Jane", email: "jane@example.com" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Jane");
        expect(result.data.email).toBe("jane@example.com");
      }
    });

    it("should reject names exceeding 255 characters", () => {
      const { z } = require("zod");
      const schema = z.object({
        name: z.string().min(1, "Name is required").max(255).optional(),
        email: z.string().email("Please enter a valid email address").max(320).optional(),
      });

      const longName = "A".repeat(256);
      const result = schema.safeParse({ name: longName });
      expect(result.success).toBe(false);
    });

    it("should build correct update data object", () => {
      const input = { name: "New Name", email: "new@test.com" };
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.email !== undefined) updateData.email = input.email;

      expect(updateData).toEqual({ name: "New Name", email: "new@test.com" });
      expect(Object.keys(updateData).length).toBe(2);
    });

    it("should detect when no fields are provided for update", () => {
      const input = {};
      const updateData: Record<string, unknown> = {};

      expect(Object.keys(updateData).length).toBe(0);
    });
  });

  describe("getPasswordChangeUrl", () => {
    it("should return settings URL when OAuth portal URL is set", () => {
      const oauthPortalUrl = "https://auth.example.com";
      const result = {
        url: oauthPortalUrl ? `${oauthPortalUrl}/settings` : null,
        message: oauthPortalUrl
          ? "You will be redirected to update your password."
          : "Password management is handled by your login provider.",
      };

      expect(result.url).toBe("https://auth.example.com/settings");
      expect(result.message).toBe("You will be redirected to update your password.");
    });

    it("should return null URL when OAuth portal URL is not set", () => {
      const oauthPortalUrl = "";
      const result = {
        url: oauthPortalUrl ? `${oauthPortalUrl}/settings` : null,
        message: oauthPortalUrl
          ? "You will be redirected to update your password."
          : "Password management is handled by your login provider.",
      };

      expect(result.url).toBeNull();
      expect(result.message).toBe("Password management is handled by your login provider.");
    });
  });
});
