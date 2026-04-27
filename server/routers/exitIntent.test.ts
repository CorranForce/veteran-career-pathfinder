/**
 * Tests for the exitIntent tRPC router.
 *
 * Strategy: vi.mock factories must not reference any top-level variables
 * (Vitest hoists them before variable declarations).
 * We use vi.fn() stubs only in factories, then re-configure them in beforeEach.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

// ── Mocks (factory bodies must be self-contained) ─────────────────────────

vi.mock("../db", () => ({
  getDb: vi.fn(),
}));

vi.mock("../services/resendEmail", () => ({
  sendExitIntentCouponEmail: vi.fn(),
}));

// ── Import after mocks ─────────────────────────────────────────────────────
import { exitIntentRouter } from "./exitIntent";
import { sendExitIntentCouponEmail } from "../services/resendEmail";
import { getDb } from "../db";

// ── Helpers ────────────────────────────────────────────────────────────────

type CaptureRow = {
  id: number;
  email: string;
  couponCode: string;
  emailSent: boolean;
  convertedAt: null;
};

/** Build a fresh in-memory DB stub around the given store. */
function makeDbStub(store: Record<string, CaptureRow>) {
  return {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(() =>
            Promise.resolve(Object.values(store))
          ),
        }),
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(() =>
            Promise.resolve(Object.values(store))
          ),
        }),
      }),
    })),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockImplementation((row: any) => {
        store[row.email] = {
          id: Object.keys(store).length + 1,
          email: row.email,
          couponCode: row.couponCode ?? "5zlB9zup",
          emailSent: false,
          convertedAt: null,
        };
        return Promise.resolve(undefined);
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  };
}

function makeSubmitCaller() {
  return exitIntentRouter.createCaller({
    req: { headers: {}, socket: { remoteAddress: "127.0.0.1" } } as any,
    res: {} as any,
    user: null,
  });
}

function makeAdminCaller() {
  return exitIntentRouter.createCaller({
    req: {} as any,
    res: {} as any,
    user: { id: 1, role: "admin" } as any,
  });
}

function makeUserCaller() {
  return exitIntentRouter.createCaller({
    req: {} as any,
    res: {} as any,
    user: { id: 2, role: "user" } as any,
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("exitIntent.submit", () => {
  let store: Record<string, CaptureRow>;

  beforeEach(() => {
    store = {};
    vi.mocked(getDb).mockResolvedValue(makeDbStub(store) as any);
    vi.mocked(sendExitIntentCouponEmail).mockResolvedValue(true);
  });

  it("returns coupon code for a new email", async () => {
    const result = await makeSubmitCaller().submit({ email: "veteran@example.com" });
    expect(result.couponCode).toBe("5zlB9zup");
    expect(result.alreadySubmitted).toBe(false);
  });

  it("sends the coupon email on first submission", async () => {
    await makeSubmitCaller().submit({ email: "veteran@example.com" });
    expect(sendExitIntentCouponEmail).toHaveBeenCalledWith(
      "veteran@example.com",
      "5zlB9zup"
    );
  });

  it("normalises email to lowercase", async () => {
    await makeSubmitCaller().submit({ email: "Veteran@EXAMPLE.COM" });
    expect(store["veteran@example.com"]).toBeDefined();
  });

  it("returns alreadySubmitted=true for duplicate email", async () => {
    // Pre-populate store so the select mock returns an existing row
    store["dup@example.com"] = {
      id: 1,
      email: "dup@example.com",
      couponCode: "5zlB9zup",
      emailSent: true,
      convertedAt: null,
    };
    // Reset call count so previous tests don't bleed through
    vi.mocked(sendExitIntentCouponEmail).mockClear();
    const result = await makeSubmitCaller().submit({ email: "dup@example.com" });
    expect(result.alreadySubmitted).toBe(true);
    expect(sendExitIntentCouponEmail).not.toHaveBeenCalled();
  });

  it("still returns coupon code even when email send fails", async () => {
    vi.mocked(sendExitIntentCouponEmail).mockResolvedValueOnce(false);
    const result = await makeSubmitCaller().submit({ email: "fail@example.com" });
    expect(result.couponCode).toBe("5zlB9zup");
    expect(result.emailSent).toBe(false);
  });

  it("rejects invalid email addresses", async () => {
    await expect(
      makeSubmitCaller().submit({ email: "not-an-email" })
    ).rejects.toThrow();
  });

  it("rejects empty email", async () => {
    await expect(
      makeSubmitCaller().submit({ email: "" })
    ).rejects.toThrow();
  });
});

describe("exitIntent.adminList", () => {
  let store: Record<string, CaptureRow>;

  beforeEach(() => {
    store = {
      "a@example.com": { id: 1, email: "a@example.com", couponCode: "5zlB9zup", emailSent: true, convertedAt: null },
      "b@example.com": { id: 2, email: "b@example.com", couponCode: "5zlB9zup", emailSent: false, convertedAt: null },
    };
    vi.mocked(getDb).mockResolvedValue(makeDbStub(store) as any);
  });

  it("returns captures and stats", async () => {
    const result = await makeAdminCaller().adminList();
    expect(result.captures).toHaveLength(2);
    expect(result.stats.total).toBe(2);
    expect(result.stats.emailSentCount).toBe(1);
    expect(result.stats.convertedCount).toBe(0);
    expect(result.stats.conversionRate).toBe(0);
  });

  it("throws FORBIDDEN for non-admin users", async () => {
    await expect(makeUserCaller().adminList()).rejects.toThrow(TRPCError);
  });
});
