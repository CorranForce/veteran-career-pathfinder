/**
 * referral.test.ts
 * Unit tests for the Refer-a-Veteran tRPC router.
 *
 * Strategy: mock all db-referral helpers so tests run without a real DB.
 * Each test group covers one procedure and asserts the expected return shape,
 * side-effect calls, and error paths.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

// ─── Mock the db-referral module ──────────────────────────────────────────────

vi.mock("../db-referral", () => ({
  getOrCreateReferralCode: vi.fn(),
  getReferralCodeBySlug: vi.fn(),
  getReferralCodeByUserId: vi.fn(),
  getConversionsByReferrer: vi.fn(),
  createReferralConversion: vi.fn(),
  conversionExistsForPurchase: vi.fn(),
  markRewardIssued: vi.fn(),
  markRewardReversed: vi.fn(),
  getAllConversions: vi.fn(),
  getAllReferralCodes: vi.fn(),
  incrementReferralClick: vi.fn(),
  incrementReferralSignup: vi.fn(),
  generateReferralCode: vi.fn(),
}));

import * as dbReferral from "../db-referral";

// ─── Context factories ────────────────────────────────────────────────────────

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeUser(overrides: Partial<AuthenticatedUser> = {}): AuthenticatedUser {
  return {
    id: 42,
    openId: "test-open-id",
    email: "veteran@example.com",
    name: "Test Veteran",
    loginMethod: "email",
    role: "user",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    lastSignedIn: new Date("2025-01-01"),
    ...overrides,
  };
}

function makeCtx(user: AuthenticatedUser | null = makeUser()): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: { origin: "https://pathfinder.casa" },
      get: (header: string) => (header === "host" ? "pathfinder.casa" : ""),
    } as unknown as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

// ─── Shared test data ─────────────────────────────────────────────────────────

const MOCK_CODE = {
  id: 1,
  userId: 42,
  code: "VET-ABC123",
  totalClicks: 5,
  totalSignups: 3,
  totalConversions: 2,
  isActive: true,
  createdAt: new Date("2025-06-01"),
  updatedAt: new Date("2025-06-01"),
};

const MOCK_CONVERSION = {
  id: 10,
  referralCodeId: 1,
  referrerId: 42,
  refereeId: 99,
  purchaseId: 200,
  rewardCents: 500,
  refereeDiscountBps: 1000,
  refereeCouponId: null,
  rewardStatus: "pending" as const,
  rewardIssuedAt: null,
  rewardReversedAt: null,
  notes: null,
  createdAt: new Date("2025-07-01"),
  updatedAt: new Date("2025-07-01"),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("referral.getMyCode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the referral code with share URL and stats", async () => {
    vi.mocked(dbReferral.getOrCreateReferralCode).mockResolvedValue(MOCK_CODE);

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.referral.getMyCode();

    expect(result.code).toBe("VET-ABC123");
    expect(result.shareUrl).toBe("https://pathfinder.casa/signup?ref=VET-ABC123");
    expect(result.totalClicks).toBe(5);
    expect(result.totalSignups).toBe(3);
    expect(result.totalConversions).toBe(2);
    expect(result.estimatedRewardCents).toBe(1000); // 2 × $5
    expect(result.isActive).toBe(true);
  });

  it("calls getOrCreateReferralCode with the caller's user ID", async () => {
    vi.mocked(dbReferral.getOrCreateReferralCode).mockResolvedValue(MOCK_CODE);

    const caller = appRouter.createCaller(makeCtx(makeUser({ id: 42 })));
    await caller.referral.getMyCode();

    expect(dbReferral.getOrCreateReferralCode).toHaveBeenCalledWith(42);
  });

  it("throws UNAUTHORIZED when called without a session", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(caller.referral.getMyCode()).rejects.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("referral.getMyConversions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a list of conversions for the caller", async () => {
    vi.mocked(dbReferral.getConversionsByReferrer).mockResolvedValue([MOCK_CONVERSION]);

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.referral.getMyConversions();

    expect(result).toHaveLength(1);
    expect(result[0]?.rewardCents).toBe(500);
    expect(result[0]?.rewardStatus).toBe("pending");
  });

  it("returns an empty array when the user has no conversions", async () => {
    vi.mocked(dbReferral.getConversionsByReferrer).mockResolvedValue([]);

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.referral.getMyConversions();

    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("referral.trackClick", () => {
  beforeEach(() => vi.clearAllMocks());

  it("increments the click counter for a valid active code", async () => {
    vi.mocked(dbReferral.getReferralCodeBySlug).mockResolvedValue(MOCK_CODE);
    vi.mocked(dbReferral.incrementReferralClick).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(makeCtx(null)); // public — no auth needed
    const result = await caller.referral.trackClick({ code: "VET-ABC123" });

    expect(result).toEqual({ ok: true });
    expect(dbReferral.incrementReferralClick).toHaveBeenCalledWith(1);
  });

  it("returns ok:false for an unknown code without throwing", async () => {
    vi.mocked(dbReferral.getReferralCodeBySlug).mockResolvedValue(null);

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.referral.trackClick({ code: "VET-INVALID" });

    expect(result).toEqual({ ok: false });
    expect(dbReferral.incrementReferralClick).not.toHaveBeenCalled();
  });

  it("returns ok:false for an inactive code", async () => {
    vi.mocked(dbReferral.getReferralCodeBySlug).mockResolvedValue({
      ...MOCK_CODE,
      isActive: false,
    });

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.referral.trackClick({ code: "VET-ABC123" });

    expect(result).toEqual({ ok: false });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("referral.validateCode", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns valid:true and referralCodeId for a valid active code", async () => {
    vi.mocked(dbReferral.getReferralCodeBySlug).mockResolvedValue(MOCK_CODE);

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.referral.validateCode({ code: "VET-ABC123" });

    expect(result).toEqual({ valid: true, referralCodeId: 1 });
  });

  it("returns valid:false for an unknown code", async () => {
    vi.mocked(dbReferral.getReferralCodeBySlug).mockResolvedValue(null);

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.referral.validateCode({ code: "VET-NOPE00" });

    expect(result).toEqual({ valid: false });
  });

  it("returns valid:false for an inactive code", async () => {
    vi.mocked(dbReferral.getReferralCodeBySlug).mockResolvedValue({
      ...MOCK_CODE,
      isActive: false,
    });

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.referral.validateCode({ code: "VET-ABC123" });

    expect(result).toEqual({ valid: false });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("referral.recordConversion", () => {
  beforeEach(() => vi.clearAllMocks());

  const adminCtx = makeCtx(makeUser({ id: 1, role: "admin" }));

  it("creates a conversion record and returns created:true", async () => {
    vi.mocked(dbReferral.conversionExistsForPurchase).mockResolvedValue(false);
    vi.mocked(dbReferral.createReferralConversion).mockResolvedValue({
      ...MOCK_CONVERSION,
      id: 55,
    });

    const caller = appRouter.createCaller(adminCtx);
    const result = await caller.referral.recordConversion({
      referralCodeId: 1,
      referrerId: 42,
      refereeId: 99,
      purchaseId: 200,
      rewardCents: 500,
    });

    expect(result).toEqual({ created: true, conversionId: 55 });
    expect(dbReferral.createReferralConversion).toHaveBeenCalledOnce();
  });

  it("returns created:false when the purchase was already recorded (idempotent)", async () => {
    vi.mocked(dbReferral.conversionExistsForPurchase).mockResolvedValue(true);

    const caller = appRouter.createCaller(adminCtx);
    const result = await caller.referral.recordConversion({
      referralCodeId: 1,
      referrerId: 42,
      refereeId: 99,
      purchaseId: 200,
      rewardCents: 500,
    });

    expect(result).toEqual({ created: false, reason: "already_recorded" });
    expect(dbReferral.createReferralConversion).not.toHaveBeenCalled();
  });

  it("throws FORBIDDEN when called by a regular user", async () => {
    const userCtx = makeCtx(makeUser({ role: "user" }));
    const caller = appRouter.createCaller(userCtx);

    await expect(
      caller.referral.recordConversion({
        referralCodeId: 1,
        referrerId: 42,
        refereeId: 99,
        purchaseId: 200,
        rewardCents: 500,
      })
    ).rejects.toThrow(TRPCError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("referral.issueReward", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marks the reward as issued and returns ok:true", async () => {
    vi.mocked(dbReferral.markRewardIssued).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(
      makeCtx(makeUser({ role: "platform_owner" }))
    );
    const result = await caller.referral.issueReward({ conversionId: 10 });

    expect(result).toEqual({ ok: true });
    expect(dbReferral.markRewardIssued).toHaveBeenCalledWith(10);
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "user" })));
    await expect(caller.referral.issueReward({ conversionId: 10 })).rejects.toThrow(
      TRPCError
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("referral.adminGetAll", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns codes and conversions for admin users", async () => {
    vi.mocked(dbReferral.getAllReferralCodes).mockResolvedValue([MOCK_CODE]);
    vi.mocked(dbReferral.getAllConversions).mockResolvedValue([MOCK_CONVERSION]);

    const caller = appRouter.createCaller(
      makeCtx(makeUser({ role: "admin" }))
    );
    const result = await caller.referral.adminGetAll();

    expect(result.codes).toHaveLength(1);
    expect(result.conversions).toHaveLength(1);
    expect(result.codes[0]?.code).toBe("VET-ABC123");
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "user" })));
    await expect(caller.referral.adminGetAll()).rejects.toThrow(TRPCError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("referral.adminReverseReward", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reverses the reward and returns ok:true", async () => {
    vi.mocked(dbReferral.markRewardReversed).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(
      makeCtx(makeUser({ role: "admin" }))
    );
    const result = await caller.referral.adminReverseReward({
      conversionId: 10,
      notes: "Refund requested",
    });

    expect(result).toEqual({ ok: true });
    expect(dbReferral.markRewardReversed).toHaveBeenCalledWith(10, "Refund requested");
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeCtx(makeUser({ role: "user" })));
    await expect(
      caller.referral.adminReverseReward({ conversionId: 10 })
    ).rejects.toThrow(TRPCError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("referral.trackSignup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("increments the signup counter for a valid active code", async () => {
    vi.mocked(dbReferral.getReferralCodeBySlug).mockResolvedValue(MOCK_CODE);
    vi.mocked(dbReferral.incrementReferralSignup).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.referral.trackSignup({ code: "VET-ABC123" });

    expect(result).toEqual({ ok: true });
    expect(dbReferral.incrementReferralSignup).toHaveBeenCalledWith(1);
  });

  it("returns ok:false for an unknown code", async () => {
    vi.mocked(dbReferral.getReferralCodeBySlug).mockResolvedValue(null);

    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.referral.trackSignup({ code: "VET-NOPE00" });

    expect(result).toEqual({ ok: false });
  });
});
