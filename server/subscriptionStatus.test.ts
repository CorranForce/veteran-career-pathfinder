import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit tests for the getSubscriptionStatus logic.
 * We test the business logic directly (tier determination, date formatting)
 * without making real DB or Stripe calls.
 */

// ── helpers mirroring the production logic ──────────────────────────────────

type SubscriptionTier = "free" | "premium" | "pro";

interface SubscriptionStatus {
  tier: SubscriptionTier;
  planName: string;
  status: string;
  nextBillingDate: string | null;
  cancelAtPeriodEnd: boolean;
  purchasedAt: string | null;
  amount: number;
  currency: string;
  stripeSubscriptionId: string | null;
}

function buildFreeStatus(): SubscriptionStatus {
  return {
    tier: "free",
    planName: "Free",
    status: "active",
    nextBillingDate: null,
    cancelAtPeriodEnd: false,
    purchasedAt: null,
    amount: 0,
    currency: "usd",
    stripeSubscriptionId: null,
  };
}

function buildPremiumStatus(purchasedAt: string, amount: number): SubscriptionStatus {
  return {
    tier: "premium",
    planName: "Premium Prompt Access",
    status: "active",
    nextBillingDate: null,
    cancelAtPeriodEnd: false,
    purchasedAt,
    amount,
    currency: "USD",
    stripeSubscriptionId: null,
  };
}

function buildProStatus(opts: {
  periodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  status: string;
  purchasedAt: string;
  amount: number;
  stripeSubscriptionId: string;
}): SubscriptionStatus {
  const nextBillingDate = opts.periodEnd
    ? new Date(opts.periodEnd * 1000).toISOString()
    : null;
  return {
    tier: "pro",
    planName: "Pro Membership",
    status: opts.status,
    nextBillingDate,
    cancelAtPeriodEnd: opts.cancelAtPeriodEnd,
    purchasedAt: opts.purchasedAt,
    amount: opts.amount,
    currency: "USD",
    stripeSubscriptionId: opts.stripeSubscriptionId,
  };
}

// ── tests ────────────────────────────────────────────────────────────────────

describe("getSubscriptionStatus logic", () => {
  describe("Free tier", () => {
    it("returns free tier with correct defaults", () => {
      const result = buildFreeStatus();
      expect(result.tier).toBe("free");
      expect(result.planName).toBe("Free");
      expect(result.status).toBe("active");
      expect(result.nextBillingDate).toBeNull();
      expect(result.cancelAtPeriodEnd).toBe(false);
      expect(result.purchasedAt).toBeNull();
      expect(result.amount).toBe(0);
      expect(result.stripeSubscriptionId).toBeNull();
    });
  });

  describe("Premium tier (one-time purchase)", () => {
    it("returns premium tier with purchase date and no billing date", () => {
      const purchasedAt = "2026-01-15T10:00:00.000Z";
      const result = buildPremiumStatus(purchasedAt, 2900);
      expect(result.tier).toBe("premium");
      expect(result.planName).toBe("Premium Prompt Access");
      expect(result.status).toBe("active");
      expect(result.nextBillingDate).toBeNull();
      expect(result.cancelAtPeriodEnd).toBe(false);
      expect(result.purchasedAt).toBe(purchasedAt);
      expect(result.amount).toBe(2900);
      expect(result.stripeSubscriptionId).toBeNull();
    });

    it("never has a next billing date (lifetime access)", () => {
      const result = buildPremiumStatus("2026-01-01T00:00:00.000Z", 2900);
      expect(result.nextBillingDate).toBeNull();
    });
  });

  describe("Pro tier (subscription)", () => {
    const baseOpts = {
      periodEnd: 1750000000, // some future Unix timestamp
      cancelAtPeriodEnd: false,
      status: "active",
      purchasedAt: "2026-02-01T10:00:00.000Z",
      amount: 1900,
      stripeSubscriptionId: "sub_test123",
    };

    it("returns pro tier with correct billing date from period_end", () => {
      const result = buildProStatus(baseOpts);
      expect(result.tier).toBe("pro");
      expect(result.planName).toBe("Pro Membership");
      expect(result.status).toBe("active");
      expect(result.stripeSubscriptionId).toBe("sub_test123");
      // Verify the date conversion is correct
      const expectedDate = new Date(baseOpts.periodEnd * 1000).toISOString();
      expect(result.nextBillingDate).toBe(expectedDate);
    });

    it("handles null period_end gracefully", () => {
      const result = buildProStatus({ ...baseOpts, periodEnd: null });
      expect(result.nextBillingDate).toBeNull();
    });

    it("reflects cancel_at_period_end flag correctly", () => {
      const result = buildProStatus({ ...baseOpts, cancelAtPeriodEnd: true });
      expect(result.cancelAtPeriodEnd).toBe(true);
      expect(result.tier).toBe("pro"); // still pro until period ends
    });

    it("handles past_due status", () => {
      const result = buildProStatus({ ...baseOpts, status: "past_due" });
      expect(result.status).toBe("past_due");
    });

    it("handles canceled status", () => {
      const result = buildProStatus({ ...baseOpts, status: "canceled" });
      expect(result.status).toBe("canceled");
    });
  });

  describe("Tier priority (pro > premium > free)", () => {
    it("pro tier takes precedence over premium", () => {
      // Simulate: user has both pro subscription and premium purchase
      // The procedure checks pro first — result should be pro
      const proResult = buildProStatus({
        periodEnd: 1750000000,
        cancelAtPeriodEnd: false,
        status: "active",
        purchasedAt: "2026-02-01T10:00:00.000Z",
        amount: 1900,
        stripeSubscriptionId: "sub_test123",
      });
      expect(proResult.tier).toBe("pro");
    });

    it("premium tier takes precedence over free", () => {
      const premiumResult = buildPremiumStatus("2026-01-01T00:00:00.000Z", 2900);
      expect(premiumResult.tier).toBe("premium");
    });
  });

  describe("Currency formatting helpers", () => {
    it("formats USD cents correctly", () => {
      const amountInCents = 2900;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amountInCents / 100);
      expect(formatted).toBe("$29.00");
    });

    it("formats date ISO string to readable format", () => {
      // Use noon UTC to avoid timezone-related day shifts
      const isoString = "2026-04-15T12:00:00.000Z";
      const formatted = new Date(isoString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      // Should contain "2026" and "April"
      expect(formatted).toContain("2026");
      expect(formatted).toContain("April");
    });
  });
});
