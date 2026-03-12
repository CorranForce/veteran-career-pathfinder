import { describe, it, expect } from "vitest";
import Stripe from "stripe";

/**
 * Validates that STRIPE_PREMIUM_PRICE_ID and STRIPE_PRO_PRICE_ID are
 * correctly formatted price IDs. The live API call is only run when a
 * live-mode secret key is present (sk_live_...), since the price IDs are
 * live-mode prices and cannot be resolved with a test key.
 */
describe("Stripe Price IDs", () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID ?? "";
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID ?? "";
  const isLiveKey = stripeKey.startsWith("sk_live_");

  it("should have price IDs in price_... format", () => {
    expect(premiumPriceId).toMatch(/^price_/);
    expect(proPriceId).toMatch(/^price_/);
  });

  it("should resolve STRIPE_PREMIUM_PRICE_ID to an active Stripe price (live mode only)", async () => {
    if (!isLiveKey) {
      console.warn(
        "Skipping live Stripe price validation — running with test key. " +
        "The live price IDs are validated on the deployed server."
      );
      return;
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-01-27.acacia" });
    const price = await stripe.prices.retrieve(premiumPriceId);
    expect(price.id).toBe(premiumPriceId);
    expect(price.active).toBe(true);
    expect(price.type).toBe("one_time");
  }, 15000);

  it("should resolve STRIPE_PRO_PRICE_ID to an active Stripe price (live mode only)", async () => {
    if (!isLiveKey) {
      console.warn(
        "Skipping live Stripe price validation — running with test key. " +
        "The live price IDs are validated on the deployed server."
      );
      return;
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-01-27.acacia" });
    const price = await stripe.prices.retrieve(proPriceId);
    expect(price.id).toBe(proPriceId);
    expect(price.active).toBe(true);
    expect(price.recurring).not.toBeNull();
    expect(price.recurring?.interval).toBe("month");
  }, 15000);
});
