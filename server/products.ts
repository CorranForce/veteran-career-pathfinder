/**
 * Stripe Products and Pricing Configuration (server-side)
 * Re-exports shared products but overrides stripePriceId fields with env vars,
 * since process.env is only available server-side.
 *
 * Price IDs are selected based on the active Stripe mode (test vs. live):
 *   - STRIPE_TEST_PREMIUM_PRICE_ID / STRIPE_LIVE_PREMIUM_PRICE_ID (mode-specific)
 *   - STRIPE_PREMIUM_PRICE_ID (generic fallback for backward compatibility)
 */

export {
  type ProductId,
  type Product,
  getProduct,
  getPaidProducts,
  isSubscription,
  formatPrice,
} from "../shared/products";

import { PRODUCTS as BASE_PRODUCTS } from "../shared/products";
import { getActivePriceId } from "./stripe";

// Build server-side PRODUCTS with mode-aware Stripe price IDs injected.
// NOTE: This object is evaluated at import time. If the Stripe key changes
// at runtime (e.g., via Settings → Payment), call getActivePriceId() directly
// instead of relying on this cached snapshot.
export const PRODUCTS = {
  ...BASE_PRODUCTS,
  PREMIUM: {
    ...BASE_PRODUCTS.PREMIUM,
    get stripePriceId() {
      return getActivePriceId("PREMIUM");
    },
  },
  PRO: {
    ...BASE_PRODUCTS.PRO,
    get stripePriceId() {
      return getActivePriceId("PRO");
    },
  },
} as const;
