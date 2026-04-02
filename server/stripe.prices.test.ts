import { describe, it, expect } from "vitest";

/**
 * These tests validate that the Stripe price IDs stored in the DB products table
 * are valid and retrievable from Stripe. The env-var price IDs are secondary
 * (used as fallback) and may differ from the DB price IDs after admin updates.
 */
describe("Stripe test-mode price IDs (env vars — format only)", () => {
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
});

describe("Stripe DB product price IDs (live Stripe validation)", () => {
  it("DB Premium product price ID should be active and retrievable from Stripe", async () => {
    const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
    if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("rk_test_")) {
      // Skip in live mode — live prices are validated separately
      return;
    }
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secretKey, { apiVersion: "2025-11-17.clover" });

    // Use the DB product's price ID (source of truth for /pricing and checkout)
    const { createPool } = await import("mysql2/promise");
    const pool = await createPool(process.env.DATABASE_URL!);
    const [rows] = await pool.query<any[]>(
      "SELECT stripePriceId FROM products WHERE tier = 'premium' AND status = 'active' LIMIT 1"
    );
    await pool.end();

    const priceId = rows[0]?.stripePriceId;
    expect(priceId).toBeTruthy();
    expect(priceId).toMatch(/^price_/);

    const price = await stripe.prices.retrieve(priceId);
    expect(price.id).toBe(priceId);
    expect(price.active).toBe(true);
  });

  it("DB Pro product price ID should be active and retrievable from Stripe", async () => {
    const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
    if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("rk_test_")) {
      return;
    }
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secretKey, { apiVersion: "2025-11-17.clover" });

    const { createPool } = await import("mysql2/promise");
    const pool = await createPool(process.env.DATABASE_URL!);
    const [rows] = await pool.query<any[]>(
      "SELECT stripePriceId FROM products WHERE tier = 'pro' AND status = 'active' LIMIT 1"
    );
    await pool.end();

    const priceId = rows[0]?.stripePriceId;
    expect(priceId).toBeTruthy();
    expect(priceId).toMatch(/^price_/);

    const price = await stripe.prices.retrieve(priceId);
    expect(price.id).toBe(priceId);
    expect(price.active).toBe(true);
    expect(price.recurring?.interval).toBe("month");
  });
});
