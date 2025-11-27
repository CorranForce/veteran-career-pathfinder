/**
 * Stripe Products and Pricing Configuration
 * Define all products and prices here for centralized management
 */

export const PRODUCTS = {
  PREMIUM_PROMPT: {
    name: "Premium Prompt Access",
    description: "Full optimized AI career transition prompt with bonus resources",
    priceId: "price_premium_prompt", // Will be created in Stripe dashboard
    amount: 2900, // $29.00 in cents
    currency: "usd",
    type: "one_time" as const,
  },
  PRO_SUBSCRIPTION: {
    name: "Pro Membership",
    description: "Full prompt + monthly webinars + private community access",
    priceId: "price_pro_subscription", // Will be created in Stripe dashboard
    amount: 999, // $9.99 in cents
    currency: "usd",
    type: "recurring" as const,
    interval: "month" as const,
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
