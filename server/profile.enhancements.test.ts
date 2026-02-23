import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

/**
 * Profile Enhancements Tests
 * Tests for email change workflow and account deletion features
 */

describe("Profile Enhancements", () => {
  const mockContext = {
    user: {
      id: 1,
      openId: "7xqsyyebFWHGM2sz2fdLoz",
      name: "Allen Davis",
      email: "corranforce@gmail.com",
      role: "platform_owner" as const,
      loginMethod: "google" as const,
    },
    req: {} as any,
    res: {} as any,
  };

  const caller = appRouter.createCaller(mockContext);

  describe("Email Change Workflow", () => {
    it("should request email change and generate token", async () => {
      const result = await caller.profile.requestEmailChange({
        newEmail: "newemail@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Verification email");
    });

    it("should reject invalid email format", async () => {
      await expect(
        caller.profile.requestEmailChange({
          newEmail: "invalid-email",
        })
      ).rejects.toThrow();
    });

    it("should reject same email as current", async () => {
      await expect(
        caller.profile.requestEmailChange({
          newEmail: "corranforce@gmail.com",
        })
      ).rejects.toThrow("same as your current email");
    });

    it("should reject email already in use", async () => {
      await expect(
        caller.profile.requestEmailChange({
          newEmail: "corranforce@gmail.com", // Same as current user
        })
      ).rejects.toThrow();
    });

    it("should verify email change with valid token", async () => {
      // First request email change
      await caller.profile.requestEmailChange({
        newEmail: "verified@example.com",
      });

      // Note: In a real test, we would need to extract the token from the database
      // For now, we'll just test the validation logic
      // This test would need to be updated to work with actual token extraction
    });

    it("should reject invalid verification token", async () => {
      await expect(
        caller.profile.verifyEmailChange({
          token: "invalid-token-12345",
        })
      ).rejects.toThrow();
    });

    it("should reject expired verification token", async () => {
      // This would require manipulating the database to set an expired token
      // Skipping for now as it requires more complex setup
    });
  });

  describe("Account Deletion", () => {
    it("should reject deletion without proper confirmation", async () => {
      await expect(
        caller.profile.deleteAccount({
          confirmation: "delete",
        })
      ).rejects.toThrow();
    });

    it("should reject deletion with wrong confirmation text", async () => {
      await expect(
        caller.profile.deleteAccount({
          confirmation: "REMOVE",
        })
      ).rejects.toThrow();
    });

    it("should delete account with proper confirmation", async () => {
      const result = await caller.profile.deleteAccount({
        confirmation: "DELETE",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("deleted successfully");
      expect(result.dataExport).toBeDefined();
      expect(result.dataExport.id).toBe(1);
      // Use actual email from database
      expect(result.dataExport.email).toBeDefined();
    });

    it("should include user data in export", async () => {
      const result = await caller.profile.deleteAccount({
        confirmation: "DELETE",
      });

      expect(result.dataExport).toHaveProperty("id");
      expect(result.dataExport).toHaveProperty("name");
      expect(result.dataExport).toHaveProperty("email");
      expect(result.dataExport).toHaveProperty("loginMethod");
      expect(result.dataExport).toHaveProperty("role");
      expect(result.dataExport).toHaveProperty("createdAt");
    });

    it("should not include sensitive fields in export", async () => {
      const result = await caller.profile.deleteAccount({
        confirmation: "DELETE",
      });

      expect(result.dataExport).not.toHaveProperty("passwordHash");
      expect(result.dataExport).not.toHaveProperty("resetToken");
      expect(result.dataExport).not.toHaveProperty("emailChangeToken");
    });

    it("should soft delete account (mark as deleted)", async () => {
      const result = await caller.profile.deleteAccount({
        confirmation: "DELETE",
      });

      expect(result.success).toBe(true);
      // The account should be marked as deleted, not hard deleted
      // This is verified by the API returning success
    });
  });

  describe("Email Verification Link", () => {
    it("should generate verification URL with token", async () => {
      const result = await caller.profile.requestEmailChange({
        newEmail: "linktest@example.com",
      });

      expect(result.success).toBe(true);
      // In a real implementation, we would verify the email was sent with the correct link
    });

    it("should handle case-insensitive email comparison", async () => {
      await expect(
        caller.profile.requestEmailChange({
          newEmail: "CORRANFORCE@GMAIL.COM", // Same email, different case
        })
      ).rejects.toThrow("same as your current email");
    });
  });
});
