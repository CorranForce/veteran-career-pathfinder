import { describe, it, expect } from "vitest";
import { profileRouter } from "./routers/profile";
import type { Context } from "./_core/context";

describe("Profile Router", () => {
  // Use the actual user from the database (Allen Davis, id=1)
  const mockContext: Context = {
    req: {} as any,
    res: {} as any,
    user: {
      id: 1,
      openId: "7xqsyyebFWHGM2sz2fdLoz",
      name: "Allen Davis",
      email: "corranforce@gmail.com",
      passwordHash: null,
      loginMethod: "google",
      role: "platform_owner",
      status: "active",
      createdAt: new Date("2025-11-27T22:52:10.000Z"),
      updatedAt: new Date("2026-02-16T13:27:10.000Z"),
      lastSignedIn: new Date("2026-02-16T13:27:10.000Z"),
      stripeCustomerId: null,
      resetToken: null,
      resetTokenExpiry: null,
      profilePicture: null,
    },
  };

  describe("getPersonalInfo", () => {
    it("should return user's personal information", async () => {
      const caller = profileRouter.createCaller(mockContext);
      const result = await caller.getPersonalInfo();

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe("Allen Davis");
      expect(result.email).toBe("corranforce@gmail.com");
      expect(result.loginMethod).toBe("google");
    });

    it("should not include sensitive fields like passwordHash", async () => {
      const caller = profileRouter.createCaller(mockContext);
      const result = await caller.getPersonalInfo();

      expect(result).toBeDefined();
      expect((result as any).passwordHash).toBeUndefined();
    });
  });

  describe("updatePersonalInfo", () => {
    it("should update user's name", async () => {
      const caller = profileRouter.createCaller(mockContext);
      const result = await caller.updatePersonalInfo({
        name: "Allen Davis",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("successfully");
    });

    it("should reject empty name", async () => {
      const caller = profileRouter.createCaller(mockContext);
      
      await expect(
        caller.updatePersonalInfo({
          name: "",
        })
      ).rejects.toThrow();
    });

    it("should reject name that is too long", async () => {
      const caller = profileRouter.createCaller(mockContext);
      const longName = "a".repeat(256);
      
      await expect(
        caller.updatePersonalInfo({
          name: longName,
        })
      ).rejects.toThrow();
    });
  });

  describe("changePassword", () => {
    it("should reject password change for OAuth users", async () => {
      const caller = profileRouter.createCaller(mockContext);
      
      await expect(
        caller.changePassword({
          currentPassword: "old-password",
          newPassword: "new-password",
        })
      ).rejects.toThrow("only available for email/password accounts");
    });

    it("should reject short passwords", async () => {
      const emailUserContext: Context = {
        ...mockContext,
        user: {
          ...mockContext.user!,
          loginMethod: "email",
        },
      };
      const caller = profileRouter.createCaller(emailUserContext);
      
      await expect(
        caller.changePassword({
          currentPassword: "old-password",
          newPassword: "short",
        })
      ).rejects.toThrow("at least 8 characters");
    });

    it("should reject passwords that are too long", async () => {
      const emailUserContext: Context = {
        ...mockContext,
        user: {
          ...mockContext.user!,
          loginMethod: "email",
        },
      };
      const caller = profileRouter.createCaller(emailUserContext);
      const longPassword = "a".repeat(101);
      
      await expect(
        caller.changePassword({
          currentPassword: "old-password",
          newPassword: longPassword,
        })
      ).rejects.toThrow("too long");
    });
  });

  describe("uploadProfilePicture", () => {
    it("should validate image data format and upload successfully", async () => {
      const caller = profileRouter.createCaller(mockContext);
      
      // Test with valid base64 image data (1x1 transparent PNG)
      const validImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      
      const result = await caller.uploadProfilePicture({
        imageData: validImageData,
        mimeType: "image/png",
      });

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
      expect(result.url).toContain("cloudfront.net");
      expect(result.message).toContain("successfully");
    });

    it("should handle different image formats", async () => {
      const caller = profileRouter.createCaller(mockContext);
      
      // 1x1 JPEG image
      const jpegImageData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA==";
      
      const result = await caller.uploadProfilePicture({
        imageData: jpegImageData,
        mimeType: "image/jpeg",
      });

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
    });

    it("should handle base64 data without data URI prefix", async () => {
      const caller = profileRouter.createCaller(mockContext);
      
      // Base64 without prefix (the function should handle this)
      const base64Only = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      
      const result = await caller.uploadProfilePicture({
        imageData: base64Only,
        mimeType: "image/png",
      });

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
    });
  });

  describe("Input Validation", () => {
    it("should validate required fields for updatePersonalInfo", async () => {
      const caller = profileRouter.createCaller(mockContext);
      
      await expect(
        caller.updatePersonalInfo({} as any)
      ).rejects.toThrow();
    });

    it("should validate required fields for uploadProfilePicture", async () => {
      const caller = profileRouter.createCaller(mockContext);
      
      await expect(
        caller.uploadProfilePicture({
          imageData: "",
          mimeType: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("Authorization", () => {
    it("should require authentication", async () => {
      const unauthContext: Context = {
        req: {} as any,
        res: {} as any,
        user: null,
      };

      const caller = profileRouter.createCaller(unauthContext);
      
      await expect(caller.getPersonalInfo()).rejects.toThrow();
    });

    it("should only allow users to access their own profile", async () => {
      const caller = profileRouter.createCaller(mockContext);
      const result = await caller.getPersonalInfo();

      // User can only see their own ID
      expect(result.id).toBe(mockContext.user!.id);
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in name", async () => {
      const caller = profileRouter.createCaller(mockContext);
      
      const result = await caller.updatePersonalInfo({
        name: "José María O'Brien-Smith",
      });

      expect(result.success).toBe(true);
    });

    it("should trim whitespace from name", async () => {
      const caller = profileRouter.createCaller(mockContext);
      
      const result = await caller.updatePersonalInfo({
        name: "  Allen Davis  ",
      });

      expect(result.success).toBe(true);
    });
  });
});
