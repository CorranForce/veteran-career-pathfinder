/**
 * Stripe Products and Pricing Configuration (server-side)
 * Re-exports shared products but overrides stripePriceId fields with env vars,
 * since process.env is only available server-side.
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

// Build server-side PRODUCTS with env-based Stripe price IDs injected
export const PRODUCTS = {
  ...BASE_PRODUCTS,
  PREMIUM: {
    ...BASE_PRODUCTS.PREMIUM,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "",
  },
  PRO: {
    ...BASE_PRODUCTS.PRO,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || "",
  },
} as const;
