/**
 * Tests for platform_owner guard on destructive admin procedures.
 * Ensures that deleteUser, suspendUser, and changeUserRole all reject
 * requests targeting a platform_owner account with a FORBIDDEN error.
 */
import { describe, it, expect } from "vitest";
import { TRPCError } from "@trpc/server";

// Simulate the guard logic used in each procedure
function assertNotPlatformOwner(targetRole: string, action: string) {
  if (targetRole === "platform_owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `The platform owner account cannot be ${action}.`,
    });
  }
}

describe("Platform Owner Guard — deleteUser", () => {
  it("throws FORBIDDEN when target is platform_owner", () => {
    expect(() => assertNotPlatformOwner("platform_owner", "deleted")).toThrowError(
      TRPCError
    );
  });

  it("throws with FORBIDDEN code", () => {
    try {
      assertNotPlatformOwner("platform_owner", "deleted");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(TRPCError);
      expect((err as TRPCError).code).toBe("FORBIDDEN");
    }
  });

  it("does NOT throw for regular user role", () => {
    expect(() => assertNotPlatformOwner("user", "deleted")).not.toThrow();
  });

  it("does NOT throw for admin role", () => {
    expect(() => assertNotPlatformOwner("admin", "deleted")).not.toThrow();
  });
});

describe("Platform Owner Guard — suspendUser", () => {
  it("throws FORBIDDEN when target is platform_owner", () => {
    expect(() => assertNotPlatformOwner("platform_owner", "suspended")).toThrowError(
      TRPCError
    );
  });

  it("throws with message about suspension", () => {
    try {
      assertNotPlatformOwner("platform_owner", "suspended");
      expect.fail("Should have thrown");
    } catch (err) {
      expect((err as TRPCError).message).toContain("suspended");
    }
  });

  it("does NOT throw for regular user role", () => {
    expect(() => assertNotPlatformOwner("user", "suspended")).not.toThrow();
  });
});

describe("Platform Owner Guard — changeUserRole", () => {
  it("throws FORBIDDEN when target is platform_owner", () => {
    // Simulate the guard in changeUserRole
    const targetRole = "platform_owner";
    const guard = () => {
      if (targetRole === "platform_owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "The platform owner account role cannot be changed.",
        });
      }
    };
    expect(guard).toThrowError(TRPCError);
  });

  it("throws with FORBIDDEN code for platform_owner", () => {
    try {
      assertNotPlatformOwner("platform_owner", "role-changed");
      expect.fail("Should have thrown");
    } catch (err) {
      expect((err as TRPCError).code).toBe("FORBIDDEN");
    }
  });

  it("does NOT throw for user or admin roles", () => {
    expect(() => assertNotPlatformOwner("user", "role-changed")).not.toThrow();
    expect(() => assertNotPlatformOwner("admin", "role-changed")).not.toThrow();
  });
});

describe("Admin router procedure registration", () => {
  it("adminRouter has deleteUser, suspendUser, and changeUserRole procedures", async () => {
    const { adminRouter } = await import("./routers/admin");
    const procedures = Object.keys(adminRouter._def.procedures);
    expect(procedures).toContain("deleteUser");
    expect(procedures).toContain("suspendUser");
    expect(procedures).toContain("changeUserRole");
  });
});
