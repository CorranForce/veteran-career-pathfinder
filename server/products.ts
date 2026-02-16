/**
 * Stripe Products and Pricing Configuration
 * Define all products and prices here for centralized management
 */

export const PRODUCTS = {
  PREMIUM_PROMPT: {
    name: "Premium Career Transition Package",
    description: "Complete career transition toolkit with AI prompt, webinars, community access, and ongoing support",
    priceId: "price_premium_prompt", // Will be created in Stripe dashboard
    productId: "price_premium_prompt", // Placeholder until real product created
    amount: 2900, // $29.00 in cents
    currency: "usd",
    type: "one_time" as const,
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
