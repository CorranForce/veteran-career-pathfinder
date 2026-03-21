import { ENV } from "./_core/env";
import Stripe from "stripe";

if (!ENV.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
});

/**
 * Detect whether the active Stripe key is test or live mode.
 * Returns "test" when STRIPE_SECRET_KEY starts with sk_test_ or rk_test_,
 * and "live" otherwise (sk_live_ / rk_live_).
 */
export function getStripeMode(): "test" | "live" {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return key.startsWith("sk_test_") || key.startsWith("rk_test_") ? "test" : "live";
}

/**
 * Returns the correct Stripe price ID for the given tier based on the
 * currently active Stripe mode (test or live).
 *
 * Priority order for each mode:
 *  1. Mode-specific env var  (STRIPE_TEST_PREMIUM_PRICE_ID / STRIPE_LIVE_PREMIUM_PRICE_ID)
 *  2. Generic env var        (STRIPE_PREMIUM_PRICE_ID) — kept for backward compatibility
 *  3. Empty string           — health check will flag as invalid
 */
export function getActivePriceId(tier: "PREMIUM" | "PRO"): string {
  const mode = getStripeMode();
  const modePrefix = mode === "test" ? "STRIPE_TEST_" : "STRIPE_LIVE_";
  const genericPrefix = "STRIPE_";
  const suffix = tier === "PREMIUM" ? "PREMIUM_PRICE_ID" : "PRO_PRICE_ID";

  return (
    process.env[`${modePrefix}${suffix}`] ||
    process.env[`${genericPrefix}${suffix}`] ||
    ""
  );
}

/**
 * Construct Stripe event from webhook payload
 * Used in webhook endpoint to verify signature
 */
export function constructStripeEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!ENV.stripeWebhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is required");
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    ENV.stripeWebhookSecret
  );
}
