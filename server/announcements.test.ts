import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

// Mock context for platform owner (admin)
const mockAdminContext: Context = {
  user: {
    id: 1,
    openId: "test-admin-openid",
    name: "Test Admin",
    email: "admin@test.com",
    passwordHash: null,
    loginMethod: "google",
    role: "platform_owner",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    stripeCustomerId: null,
    resetToken: null,
    resetTokenExpiry: null,
  },
  req: {} as any,
  res: {} as any,
};

// Mock context for regular user
const mockUserContext: Context = {
  user: {
    id: 2,
    openId: "test-user-openid",
    name: "Test User",
    email: "user@test.com",
    passwordHash: null,
    loginMethod: "google",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    stripeCustomerId: null,
    resetToken: null,
    resetTokenExpiry: null,
  },
  req: {} as any,
  res: {} as any,
};

// Mock context for unauthenticated user
const mockUnauthContext: Context = {
  user: undefined,
  req: {} as any,
  res: {} as any,
};

describe("Announcements System", () => {
  let createdAnnouncementId: number;

  describe("Admin Operations", () => {
    it("should allow admin to create announcement", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.announcements.create({
        title: "Test Feature Announcement",
        content: "This is a test feature announcement for vitest",
        type: "feature",
        priority: 5,
        link: "https://example.com/feature",
      });

      expect(result).toBeDefined();
      expect(result?.title).toBe("Test Feature Announcement");
      expect(result?.type).toBe("feature");
      expect(result?.status).toBe("draft");
      expect(result?.priority).toBe(5);

      if (result) {
        createdAnnouncementId = result.id;
      }
    });

    it("should allow admin to get all announcements", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const announcements = await caller.announcements.getAll();

      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
      expect(announcements.length).toBeGreaterThan(0);
    });

    it("should allow admin to update announcement", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.announcements.update({
        id: createdAnnouncementId,
        title: "Updated Test Feature",
        content: "Updated content",
        priority: 10,
      });

      expect(result.success).toBe(true);
    });

    it("should allow admin to publish announcement", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.announcements.publish({
        id: createdAnnouncementId,
      });

      expect(result.success).toBe(true);
    });

    it("should allow admin to archive announcement", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.announcements.archive({
        id: createdAnnouncementId,
      });

      expect(result.success).toBe(true);
    });

    it("should allow admin to delete announcement", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.announcements.delete({
        id: createdAnnouncementId,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Public Operations", () => {
    let testAnnouncementId: number;

    beforeAll(async () => {
      // Create and publish an announcement for public testing
      const caller = appRouter.createCaller(mockAdminContext);

      const created = await caller.announcements.create({
        title: "Public Test Announcement",
        content: "This announcement should be visible to public",
        type: "news",
        priority: 1,
      });

      if (created) {
        testAnnouncementId = created.id;
        await caller.announcements.publish({ id: testAnnouncementId });
      }
    });

    it("should allow unauthenticated users to get published announcements", async () => {
      const caller = appRouter.createCaller(mockUnauthContext);

      const announcements = await caller.announcements.getPublished({ limit: 10 });

      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
      // Should only return published announcements
      announcements.forEach((announcement) => {
        expect(announcement.status).toBe("published");
      });
    });

    it("should allow users to get announcements by type", async () => {
      const caller = appRouter.createCaller(mockUnauthContext);

      const announcements = await caller.announcements.getByType({ type: "news" });

      expect(announcements).toBeDefined();
      expect(Array.isArray(announcements)).toBe(true);
      // Should only return news type announcements
      announcements.forEach((announcement) => {
        expect(announcement.type).toBe("news");
        expect(announcement.status).toBe("published");
      });
    });
  });

  describe("Authorization", () => {
    it("should prevent regular users from creating announcements", async () => {
      const caller = appRouter.createCaller(mockUserContext);

      await expect(
        caller.announcements.create({
          title: "Unauthorized Announcement",
          content: "This should fail",
          type: "feature",
        })
      ).rejects.toThrow();
    });

    it("should prevent unauthenticated users from creating announcements", async () => {
      const caller = appRouter.createCaller(mockUnauthContext);

      await expect(
        caller.announcements.create({
          title: "Unauthorized Announcement",
          content: "This should fail",
          type: "feature",
        })
      ).rejects.toThrow();
    });

    it("should prevent regular users from accessing admin endpoints", async () => {
      const caller = appRouter.createCaller(mockUserContext);

      await expect(caller.announcements.getAll()).rejects.toThrow();
    });
  });

  describe("Validation", () => {
    it("should reject announcement with empty title", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      await expect(
        caller.announcements.create({
          title: "",
          content: "Valid content",
          type: "feature",
        })
      ).rejects.toThrow();
    });

    it("should reject announcement with empty content", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      await expect(
        caller.announcements.create({
          title: "Valid Title",
          content: "",
          type: "feature",
        })
      ).rejects.toThrow();
    });

    it("should reject announcement with invalid type", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      await expect(
        caller.announcements.create({
          title: "Valid Title",
          content: "Valid content",
          type: "invalid_type" as any,
        })
      ).rejects.toThrow();
    });

    it("should accept announcement with valid URL link", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.announcements.create({
        title: "Announcement with Link",
        content: "Content with link",
        type: "feature",
        link: "https://example.com/valid-link",
      });

      expect(result).toBeDefined();
      expect(result?.link).toBe("https://example.com/valid-link");

      // Cleanup
      if (result) {
        await caller.announcements.delete({ id: result.id });
      }
    });
  });
});
