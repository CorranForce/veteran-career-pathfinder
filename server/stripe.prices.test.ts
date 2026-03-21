import { describe, it, expect } from "vitest";

describe("Stripe test-mode price IDs", () => {
  it("STRIPE_TEST_PREMIUM_PRICE_ID should be set and well-formed", () => {
    const id = process.env.STRIPE_TEST_PREMIUM_PRICE_ID ?? "";
    expect(id).toBeTruthy();
    expect(id).toMatch(/^price_/);
  });

  it("STRIPE_TEST_PRO_PRICE_ID should be set and well-formed", () => {
    const id = process.env.STRIPE_TEST_PRO_PRICE_ID ?? "";
    expect(id).toBeTruthy();
    expect(id).toMatch(/^price_/);
  });

  it("STRIPE_PREMIUM_PRICE_ID should be set and well-formed", () => {
    const id = process.env.STRIPE_PREMIUM_PRICE_ID ?? "";
    expect(id).toBeTruthy();
    expect(id).toMatch(/^price_/);
  });

  it("STRIPE_PRO_PRICE_ID should be set and well-formed", () => {
    const id = process.env.STRIPE_PRO_PRICE_ID ?? "";
    expect(id).toBeTruthy();
    expect(id).toMatch(/^price_/);
  });

  it("STRIPE_TEST_PREMIUM_PRICE_ID should be retrievable from Stripe test API", async () => {
    const priceId = process.env.STRIPE_TEST_PREMIUM_PRICE_ID ?? "";
    const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
    if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("rk_test_")) {
      // Skip in live mode
      return;
    }
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secretKey, { apiVersion: "2025-11-17.clover" });
    const price = await stripe.prices.retrieve(priceId);
    expect(price.id).toBe(priceId);
    expect(price.active).toBe(true);
    expect(price.unit_amount).toBe(2900); // $29.00
  });

  it("STRIPE_TEST_PRO_PRICE_ID should be retrievable from Stripe test API", async () => {
    const priceId = process.env.STRIPE_TEST_PRO_PRICE_ID ?? "";
    const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
    if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("rk_test_")) {
      return;
    }
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secretKey, { apiVersion: "2025-11-17.clover" });
    const price = await stripe.prices.retrieve(priceId);
    expect(price.id).toBe(priceId);
    expect(price.active).toBe(true);
    expect(price.unit_amount).toBe(999); // $9.99
    expect(price.recurring?.interval).toBe("month");
  });
});
