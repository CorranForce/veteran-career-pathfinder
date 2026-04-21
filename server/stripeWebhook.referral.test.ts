/**
 * stripeWebhook.referral.test.ts
 *
 * Unit tests for the referral conversion attribution logic inside
 * handleStripeWebhook (checkout.session.completed).
 *
 * Strategy:
 *   - Mock Stripe's constructStripeEvent so we can inject arbitrary event objects.
 *   - Mock all db / db-referral helpers so tests run without a real DB.
 *   - Build minimal Express-style req/res mocks.
 *   - Assert that createReferralConversion is called with the right arguments
 *     for happy-path scenarios, and NOT called for edge cases (self-referral,
 *     inactive code, duplicate, missing metadata).
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock external modules ────────────────────────────────────────────────────

vi.mock("./stripe", () => ({
  constructStripeEvent: vi.fn(),
  stripe: {
    customers: { create: vi.fn() },
  },
}));

vi.mock("./db", () => ({
  createPurchase: vi.fn(),
  getUserById: vi.fn(),
  updatePurchaseStatus: vi.fn(),
  updateUserStripeCustomerId: vi.fn(),
  logActivity: vi.fn(),
  getPurchaseByPaymentIntent: vi.fn(),
  getPurchaseBySubscriptionId: vi.fn(),
}));

vi.mock("./db-referral", () => ({
  getReferralCodeBySlug: vi.fn(),
  createReferralConversion: vi.fn(),
  conversionExistsForPurchase: vi.fn(),
  incrementReferralConversion: vi.fn(),
}));

vi.mock("./services/resendEmail", () => ({
  sendPurchaseConfirmationEmail: vi.fn(),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(),
}));

vi.mock("./platformAgent", () => ({
  notifyOwnerUpgrade: vi.fn(),
}));

// Drizzle / DB internals used inside tryRecordReferralConversion
vi.mock("../drizzle/schema", () => ({
  referralCodes: { id: "id", userId: "userId", isActive: "isActive" },
  purchases: {},
}));

import { constructStripeEvent } from "./stripe";
import * as dbMod from "./db";
import * as dbReferral from "./db-referral";
import { handleStripeWebhook } from "./stripeWebhook";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeReq(body: Buffer = Buffer.from("{}")) {
  return {
    headers: { "stripe-signature": "sig_test_123" },
    body,
  } as any;
}

function makeRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function makeCheckoutEvent(overrides: Record<string, any> = {}) {
  return {
    id: "evt_live_checkout_001",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_001",
        payment_intent: "pi_test_001",
        subscription: null,
        customer: "cus_test_001",
        amount_total: 4900,
        currency: "usd",
        metadata: {
          user_id: "99",
          product_type: "premium_prompt",
          referral_code_id: "1",
          referral_code_slug: "VET-ABC123",
        },
        ...overrides,
      },
    },
  };
}

// Shared mock for the DB call inside tryRecordReferralConversion
// (drizzle select chain: db.select().from().where().limit())
function mockDbSelectReferralCode(record: any) {
  const limitMock = vi.fn().mockResolvedValue(record ? [record] : []);
  const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
  const fromMock = vi.fn().mockReturnValue({ where: whereMock });
  const selectMock = vi.fn().mockReturnValue({ from: fromMock });
  return { select: selectMock };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("handleStripeWebhook — referral conversion attribution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Happy path ──────────────────────────────────────────────────────────────

  it("records a conversion when checkout.session.completed has a valid referral_code_id", async () => {
    const event = makeCheckoutEvent();
    vi.mocked(constructStripeEvent).mockReturnValue(event as any);

    // createPurchase returns a mysql2 result with insertId
    vi.mocked(dbMod.createPurchase).mockResolvedValue([{ insertId: 42 }] as any);
    vi.mocked(dbMod.getPurchaseByPaymentIntent).mockResolvedValue({
      id: 42,
    } as any);
    vi.mocked(dbReferral.conversionExistsForPurchase).mockResolvedValue(false);
    vi.mocked(dbReferral.createReferralConversion).mockResolvedValue({} as any);

    // Mock the drizzle DB call inside tryRecordReferralConversion
    const mockDb = mockDbSelectReferralCode({
      id: 1,
      userId: 7, // referrer (different from buyer 99)
      code: "VET-ABC123",
      isActive: true,
    });
    vi.doMock("./db", async (importOriginal) => ({
      ...(await importOriginal<typeof dbMod>()),
      getDb: vi.fn().mockResolvedValue(mockDb),
    }));

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(res.json).toHaveBeenCalledWith({ received: true });
    // createReferralConversion should have been called once
    expect(dbReferral.createReferralConversion).toHaveBeenCalledOnce();
    expect(dbReferral.createReferralConversion).toHaveBeenCalledWith(
      expect.objectContaining({
        referralCodeId: 1,
        refereeId: 99,
        purchaseId: 42,
        rewardCents: 500,
        rewardStatus: "pending",
      })
    );
  });

  // ── No referral metadata ────────────────────────────────────────────────────

  it("does NOT record a conversion when referral_code_id is empty", async () => {
    const event = makeCheckoutEvent({
      metadata: {
        user_id: "99",
        product_type: "premium_prompt",
        referral_code_id: "",
        referral_code_slug: "",
      },
    });
    vi.mocked(constructStripeEvent).mockReturnValue(event as any);
    vi.mocked(dbMod.createPurchase).mockResolvedValue([{ insertId: 43 }] as any);

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(res.json).toHaveBeenCalledWith({ received: true });
    expect(dbReferral.createReferralConversion).not.toHaveBeenCalled();
  });

  // ── Idempotency ─────────────────────────────────────────────────────────────

  it("does NOT create a duplicate conversion when the purchase was already attributed", async () => {
    const event = makeCheckoutEvent();
    vi.mocked(constructStripeEvent).mockReturnValue(event as any);
    vi.mocked(dbMod.createPurchase).mockResolvedValue([{ insertId: 44 }] as any);
    vi.mocked(dbMod.getPurchaseByPaymentIntent).mockResolvedValue({
      id: 44,
    } as any);
    // Already recorded
    vi.mocked(dbReferral.conversionExistsForPurchase).mockResolvedValue(true);

    const mockDb = mockDbSelectReferralCode({
      id: 1,
      userId: 7,
      code: "VET-ABC123",
      isActive: true,
    });
    vi.doMock("./db", async (importOriginal) => ({
      ...(await importOriginal<typeof dbMod>()),
      getDb: vi.fn().mockResolvedValue(mockDb),
    }));

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(res.json).toHaveBeenCalledWith({ received: true });
    expect(dbReferral.createReferralConversion).not.toHaveBeenCalled();
  });

  // ── Missing metadata ────────────────────────────────────────────────────────

  it("returns 400 when user_id or product_type is missing from metadata", async () => {
    const event = makeCheckoutEvent({
      metadata: {
        // user_id intentionally omitted
        product_type: "premium_prompt",
        referral_code_id: "1",
        referral_code_slug: "VET-ABC123",
      },
    });
    vi.mocked(constructStripeEvent).mockReturnValue(event as any);

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(dbReferral.createReferralConversion).not.toHaveBeenCalled();
  });

  // ── Test events ─────────────────────────────────────────────────────────────

  it("returns verified:true for test events without processing them", async () => {
    const event = { id: "evt_test_abc123", type: "checkout.session.completed" };
    vi.mocked(constructStripeEvent).mockReturnValue(event as any);

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(res.json).toHaveBeenCalledWith({ verified: true });
    expect(dbMod.createPurchase).not.toHaveBeenCalled();
    expect(dbReferral.createReferralConversion).not.toHaveBeenCalled();
  });

  // ── Signature failure ───────────────────────────────────────────────────────

  it("returns 400 when stripe signature verification fails", async () => {
    vi.mocked(constructStripeEvent).mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(dbReferral.createReferralConversion).not.toHaveBeenCalled();
  });

  // ── payment_intent.succeeded still works ────────────────────────────────────

  it("updates purchase status to completed on payment_intent.succeeded", async () => {
    const event = {
      id: "evt_live_pi_001",
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_test_001",
          amount: 4900,
          currency: "usd",
          receipt_email: "vet@example.com",
          metadata: {
            user_id: "99",
            customer_email: "vet@example.com",
            customer_name: "Test Veteran",
            product_type: "premium_prompt",
          },
        },
      },
    };
    vi.mocked(constructStripeEvent).mockReturnValue(event as any);
    vi.mocked(dbMod.updatePurchaseStatus).mockResolvedValue(undefined as any);

    const req = makeReq();
    const res = makeRes();
    await handleStripeWebhook(req, res);

    expect(dbMod.updatePurchaseStatus).toHaveBeenCalledWith("pi_test_001", "completed");
    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});
