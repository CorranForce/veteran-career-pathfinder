import { describe, it, expect, beforeAll } from "vitest";
import { getDb, logAdminActivity, getAdminActivityLogs } from "./db";

describe("Admin Activity Logging & Pagination", () => {
  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available for testing");
    }
  });

  it("should log admin activity", async () => {
    await logAdminActivity({
      adminId: 1,
      adminName: "Test Admin",
      adminEmail: "admin@test.com",
      targetUserId: 2,
      targetUserName: "Test User",
      targetUserEmail: "user@test.com",
      actionType: "suspend_user",
      description: "Test suspension",
      metadata: JSON.stringify({ reason: "testing" }),
    });

    const logs = await getAdminActivityLogs(10);
    expect(logs).toBeDefined();
    expect(logs.length).toBeGreaterThan(0);
    
    // Find the log we just created
    const suspendLog = logs.find(log => log.actionType === "suspend_user" && log.description === "Test suspension");
    expect(suspendLog).toBeDefined();
    expect(suspendLog?.actionType).toBe("suspend_user");
  }, 10000);

  it("should retrieve admin activity logs with limit", async () => {
    const logs = await getAdminActivityLogs(5);
    expect(logs).toBeDefined();
    expect(logs.length).toBeLessThanOrEqual(5);
  });

  it("should log role change action", async () => {
    const testDescription = `Changed role from user to admin - test ${Date.now()}`;
    await logAdminActivity({
      adminId: 1,
      adminName: "Test Admin",
      adminEmail: "admin@test.com",
      targetUserId: 2,
      targetUserName: "Test User",
      targetUserEmail: "user@test.com",
      actionType: "change_role",
      description: testDescription,
      metadata: JSON.stringify({ oldRole: "user", newRole: "admin" }),
    });

    const logs = await getAdminActivityLogs(10);
    expect(logs).toBeDefined();
    
    // Find the specific log we just created
    const roleChangeLog = logs.find(log => log.description === testDescription);
    expect(roleChangeLog).toBeDefined();
    expect(roleChangeLog?.actionType).toBe("change_role");
    
    const metadata = JSON.parse(roleChangeLog!.metadata!);
    expect(metadata.oldRole).toBe("user");
    expect(metadata.newRole).toBe("admin");
  });

  it("should log delete user action", async () => {
    const testDescription = `Deleted user test ${Date.now()}`;
    await logAdminActivity({
      adminId: 1,
      adminName: "Test Admin",
      adminEmail: "admin@test.com",
      targetUserId: 3,
      targetUserName: "Deleted User",
      targetUserEmail: "deleted@test.com",
      actionType: "delete_user",
      description: testDescription,
    });

    const logs = await getAdminActivityLogs(10);
    expect(logs).toBeDefined();
    
    // Find the specific log we just created
    const deleteLog = logs.find(log => log.description === testDescription);
    expect(deleteLog).toBeDefined();
    expect(deleteLog?.actionType).toBe("delete_user");
  });

  it("should log reactivate user action", async () => {
    const testDescription = `Reactivated user test ${Date.now()}`;
    await logAdminActivity({
      adminId: 1,
      adminName: "Test Admin",
      adminEmail: "admin@test.com",
      targetUserId: 2,
      targetUserName: "Test User",
      targetUserEmail: "user@test.com",
      actionType: "reactivate_user",
      description: testDescription,
    });

    const logs = await getAdminActivityLogs(10);
    expect(logs).toBeDefined();
    
    // Find the specific log we just created
    const reactivateLog = logs.find(log => log.description === testDescription);
    expect(reactivateLog).toBeDefined();
    expect(reactivateLog?.actionType).toBe("reactivate_user");
  });
});
