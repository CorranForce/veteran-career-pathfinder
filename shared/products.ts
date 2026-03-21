/**
 * Stripe Products and Pricing Configuration
 * Define all products and prices here for centralized management
 */

export const PRODUCTS = {
  FREE: {
    id: "free",
    name: "Free Tier",
    description: "Preview the prompt with limited content",
    price: 0,
    currency: "usd",
    features: [
      "Preview of career transition prompt",
      "Basic MOS translation",
      "Limited career path suggestions",
      "Access to free resources",
    ],
  },
  PREMIUM: {
    id: "premium",
    name: "Premium Prompt Access",
    description: "One-time payment for full prompt and bonus resources",
    price: 19700, // $29.00 in cents
    currency: "usd",
    type: "one_time" as const,
    features: [
      "Full AI career transition prompt",
      "Comprehensive MOS translation guide",
      "Detailed career path analysis",
      "Resume translation templates",
      "Interview preparation guide",
      "Networking strategies document",
      "Salary negotiation tips",
      "Lifetime access to purchased content",
    ],
    stripePriceId: "", // Set at runtime on the server via ENV
  },
  PRO: {
    id: "pro",
    name: "Pro Membership",
    description: "Monthly subscription with ongoing support and community",
    price: 2999, // $9.99 in cents
    currency: "usd",
    type: "subscription" as const,
    interval: "month" as const,
    features: [
      "Everything in Premium",
      "Monthly live webinars with career experts",
      "Private community access (Discord/Slack)",
      "Weekly job market updates",
      "Resume review service (1x per month)",
      "Priority email support",
      "Exclusive networking events",
      "Early access to new tools and resources",
    ],
    stripePriceId: "", // Set at runtime on the server via ENV
  },
} as const;

export type ProductId = keyof typeof PRODUCTS;
export type Product = typeof PRODUCTS[ProductId];

/**
 * Get product by ID
 */
export function getProduct(id: ProductId): Product {
  return PRODUCTS[id];
}

/**
 * Get all paid products (excludes FREE)
 */
export function getPaidProducts(): Product[] {
  return [PRODUCTS.PREMIUM, PRODUCTS.PRO];
}

/**
 * Check if a product is a subscription
 */
export function isSubscription(productId: ProductId): boolean {
  const product = PRODUCTS[productId];
  return "type" in product && product.type === "subscription";
}

/**
 * Format price for display
 */
export function formatPrice(priceInCents: number, currency: string = "usd"): string {
  const amount = priceInCents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}
