import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for rate-limit event logging.
 *
 * We mock the database layer to isolate the logging logic from a live DB.
 */

// ── Mock the drizzle DB so tests run without a real database ──────────────────
const mockInsert = vi.fn().mockResolvedValue(undefined);
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn().mockResolvedValue([]);

vi.mock("../drizzle/schema", () => ({
  adminActivityLogs: { actionType: "actionType" },
  users: {},
  purchases: {},
  subscribers: {},
  userProfiles: {},
  careerHighlights: {},
  resumes: {},
  resumeTemplates: {},
  activityLogs: {},
  announcements: {},
}));

vi.mock("drizzle-orm/mysql2", () => ({
  drizzle: vi.fn(() => ({
    insert: () => ({ values: mockInsert }),
    select: () => ({ from: mockFrom }),
  })),
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: vi.fn((col, val) => ({ col, val })),
    desc: vi.fn((col) => col),
  };
});

// Provide a fake DATABASE_URL so getDb() creates a drizzle instance
process.env.DATABASE_URL = "mysql://fake:fake@localhost:3306/fakedb";

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("logRateLimitEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-chain the select mock
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
  });

  it("should call db.insert with correct fields", async () => {
    const { logRateLimitEvent } = await import("./db");

    await logRateLimitEvent({
      ip: "192.168.1.1",
      endpoint: "/api/trpc/emailAuth.login",
      userAgent: "Mozilla/5.0",
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        adminId: 0,
        adminName: "System",
        adminEmail: "system@pathfinder",
        actionType: "rate_limit_blocked",
        description: expect.stringContaining("192.168.1.1"),
      })
    );
  });

  it("description should contain the endpoint", async () => {
    const { logRateLimitEvent } = await import("./db");

    await logRateLimitEvent({
      ip: "10.0.0.1",
      endpoint: "/api/trpc/emailAuth.signup",
    });

    const callArg = mockInsert.mock.calls[0]?.[0];
    expect(callArg?.description).toContain("/api/trpc/emailAuth.signup");
  });

  it("metadata should include ip, endpoint, userAgent, and timestamp", async () => {
    const { logRateLimitEvent } = await import("./db");

    await logRateLimitEvent({
      ip: "1.2.3.4",
      endpoint: "/api/trpc/emailAuth.requestPasswordReset",
      userAgent: "curl/7.68.0",
    });

    const callArg = mockInsert.mock.calls[0]?.[0];
    const meta = JSON.parse(callArg?.metadata ?? "{}");
    expect(meta.ip).toBe("1.2.3.4");
    expect(meta.endpoint).toBe("/api/trpc/emailAuth.requestPasswordReset");
    expect(meta.userAgent).toBe("curl/7.68.0");
    expect(meta.timestamp).toBeDefined();
  });

  it("should default userAgent to 'unknown' when not provided", async () => {
    const { logRateLimitEvent } = await import("./db");

    await logRateLimitEvent({ ip: "5.6.7.8", endpoint: "/api/trpc/emailAuth.login" });

    const callArg = mockInsert.mock.calls[0]?.[0];
    const meta = JSON.parse(callArg?.metadata ?? "{}");
    expect(meta.userAgent).toBe("unknown");
  });

  it("should not throw when db insert fails", async () => {
    mockInsert.mockRejectedValueOnce(new Error("DB connection lost"));
    const { logRateLimitEvent } = await import("./db");

    // Should resolve without throwing
    await expect(
      logRateLimitEvent({ ip: "9.9.9.9", endpoint: "/api/trpc/emailAuth.login" })
    ).resolves.toBeUndefined();
  });
});

describe("getRateLimitEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
  });

  it("should return an empty array when no events exist", async () => {
    mockLimit.mockResolvedValueOnce([]);
    const { getRateLimitEvents } = await import("./db");
    const result = await getRateLimitEvents(10);
    expect(result).toEqual([]);
  });

  it("should return events from the database", async () => {
    const fakeEvent = {
      id: 1,
      adminId: 0,
      adminName: "System",
      adminEmail: "system@pathfinder",
      actionType: "rate_limit_blocked",
      description: "Rate limit exceeded on /api/trpc/emailAuth.login from IP 1.2.3.4",
      metadata: JSON.stringify({ ip: "1.2.3.4", endpoint: "/api/trpc/emailAuth.login" }),
      createdAt: new Date(),
    };
    mockLimit.mockResolvedValueOnce([fakeEvent]);

    const { getRateLimitEvents } = await import("./db");
    const result = await getRateLimitEvents(10);
    expect(result).toHaveLength(1);
    expect(result[0].actionType).toBe("rate_limit_blocked");
  });
});

describe("Rate limit event metadata structure", () => {
  it("metadata JSON should have all required fields", () => {
    const ip = "192.0.2.1";
    const endpoint = "/api/trpc/emailAuth.login";
    const userAgent = "TestAgent/1.0";
    const timestamp = new Date().toISOString();

    const metadata = JSON.stringify({ ip, endpoint, userAgent, timestamp });
    const parsed = JSON.parse(metadata);

    expect(parsed).toHaveProperty("ip", ip);
    expect(parsed).toHaveProperty("endpoint", endpoint);
    expect(parsed).toHaveProperty("userAgent", userAgent);
    expect(parsed).toHaveProperty("timestamp");
    expect(new Date(parsed.timestamp).toISOString()).toBe(timestamp);
  });
});
