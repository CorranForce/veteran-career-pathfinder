import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { stripe } from "../stripe";
import { PRODUCTS } from "../products";
import { createPurchase, getUserPurchases, hasUserPurchased, updateUserStripeCustomerId, getUserById } from "../db";
import { getUserDownloads } from "../services/purchaseFulfillment";
import { and, eq, desc } from "drizzle-orm";
import { getDb } from "../db";
import { purchases } from "../../drizzle/schema";

export const paymentRouter = router({
  /**
   * Create a Stripe checkout session for one-time or subscription payment
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        productId: z.enum(["PREMIUM", "PRO"]),
        couponCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = PRODUCTS[input.productId];
      const origin = ctx.req.headers.origin || `${ctx.req.protocol}://${ctx.req.get("host")}`;

      // Create or retrieve Stripe customer
      let customerId = ctx.user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email || undefined,
          name: ctx.user.name || undefined,
          metadata: {
            userId: ctx.user.id.toString(),
          },
        });
        customerId = customer.id;
        await updateUserStripeCustomerId(ctx.user.id, customerId);
      }

      // Determine product type for metadata
      const productType = input.productId.toLowerCase();

      // Create checkout session with optional coupon
      const sessionConfig: any = {
        customer: customerId,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || "",
          customer_name: ctx.user.name || "",
          product_type: productType,
        },
        line_items: [
          // Use Stripe Price ID if available, otherwise use price_data
          "stripePriceId" in product && product.stripePriceId
            ? {
                price: product.stripePriceId,
                quantity: 1,
              }
            : {
                price_data: {
                  currency: product.currency,
                  product_data: {
                    name: product.name,
                    description: product.description,
                  },
                  unit_amount: product.price,
                  ...("type" in product && product.type === "subscription"
                    ? { recurring: { interval: product.interval } }
                    : {}),
                },
                quantity: 1,
              },
        ],
        mode: "type" in product && product.type === "subscription" ? "subscription" : "payment",
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        allow_promotion_codes: true,
      };

      // Apply coupon if provided
      if (input.couponCode) {
        sessionConfig.discounts = [{ coupon: input.couponCode }];
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  /**
   * Get user's purchase history
   */
  getPurchases: protectedProcedure.query(async ({ ctx }) => {
    return await getUserPurchases(ctx.user.id);
  }),

  /**
   * Check if user has purchased a specific product
   */
  hasPurchased: protectedProcedure
    .input(
      z.object({
        productType: z.enum(["premium_prompt", "pro_subscription"]),
      })
    )
    .query(async ({ ctx, input }) => {
      return await hasUserPurchased(ctx.user.id, input.productType);
    }),

  /**
   * Returns the user's highest access level: 'pro' | 'premium' | 'free'
   * Used to gate content on the prompt/content pages.
   */
  getAccessLevel: protectedProcedure.query(async ({ ctx }) => {
    const [hasPro, hasPremium] = await Promise.all([
      hasUserPurchased(ctx.user.id, "pro_subscription"),
      hasUserPurchased(ctx.user.id, "premium_prompt"),
    ]);
    if (hasPro) return { level: "pro" as const };
    if (hasPremium) return { level: "premium" as const };
    return { level: "free" as const };
  }),

  /**
   * Get the user's current subscription/plan status.
   * - For Pro (subscription): fetches live data from Stripe for billing period and cancellation info.
   * - For Premium (one-time): returns purchase date and lifetime access.
   * - For Free: returns free tier info.
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    // Check for Pro subscription first (highest tier)
    const db = await getDb();
    if (!db) return { tier: "free" as const, planName: "Free", status: "active" as const };

    // Find the most recent completed pro subscription purchase
    const proRows = await db
      .select()
      .from(purchases)
      .where(
        and(
          eq(purchases.userId, ctx.user.id),
          eq(purchases.productType, "pro_subscription"),
          eq(purchases.status, "completed")
        )
      )
      .orderBy(desc(purchases.createdAt))
      .limit(1);

    if (proRows.length > 0 && proRows[0].stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(proRows[0].stripeSubscriptionId);
        // current_period_end is on SubscriptionItem in this Stripe SDK version
        const firstItem = sub.items?.data?.[0];
        const periodEnd: number | null = firstItem?.current_period_end ?? null;
        const nextBillingDate = periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : null;
        const cancelAtPeriodEnd = sub.cancel_at_period_end ?? false;
        const subStatus = sub.status; // active, past_due, canceled, etc.

        return {
          tier: "pro" as const,
          planName: "Pro Membership",
          status: subStatus as string,
          nextBillingDate,
          cancelAtPeriodEnd,
          purchasedAt: proRows[0].createdAt.toISOString(),
          amount: proRows[0].amount,
          currency: proRows[0].currency,
          stripeSubscriptionId: proRows[0].stripeSubscriptionId,
        };
      } catch (err) {
        // Stripe lookup failed — fall back to DB data
        console.warn("[getSubscriptionStatus] Stripe subscription lookup failed:", err);
        return {
          tier: "pro" as const,
          planName: "Pro Membership",
          status: "active" as string,
          nextBillingDate: null,
          cancelAtPeriodEnd: false,
          purchasedAt: proRows[0].createdAt.toISOString(),
          amount: proRows[0].amount,
          currency: proRows[0].currency,
          stripeSubscriptionId: proRows[0].stripeSubscriptionId,
        };
      }
    }

    // Check for Premium one-time purchase
    const premiumRows = await db
      .select()
      .from(purchases)
      .where(
        and(
          eq(purchases.userId, ctx.user.id),
          eq(purchases.productType, "premium_prompt"),
          eq(purchases.status, "completed")
        )
      )
      .orderBy(desc(purchases.createdAt))
      .limit(1);

    if (premiumRows.length > 0) {
      return {
        tier: "premium" as const,
        planName: "Premium Prompt Access",
        status: "active" as string,
        nextBillingDate: null,
        cancelAtPeriodEnd: false,
        purchasedAt: premiumRows[0].createdAt.toISOString(),
        amount: premiumRows[0].amount,
        currency: premiumRows[0].currency,
        stripeSubscriptionId: null,
      };
    }

    // Free tier
    return {
      tier: "free" as const,
      planName: "Free",
      status: "active" as string,
      nextBillingDate: null,
      cancelAtPeriodEnd: false,
      purchasedAt: null,
      amount: 0,
      currency: "usd",
      stripeSubscriptionId: null,
    };
  }),

  /**
   * Create a Stripe Customer Portal session so the user can manage their billing.
   * Returns a URL to redirect the user to the Stripe-hosted portal.
   */
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    // Ensure the user has a Stripe customer ID
    let customerId = ctx.user.stripeCustomerId;

    if (!customerId) {
      // Create a Stripe customer record if one doesn't exist yet
      const customer = await stripe.customers.create({
        email: ctx.user.email || undefined,
        name: ctx.user.name || undefined,
        metadata: { userId: ctx.user.id.toString() },
      });
      customerId = customer.id;
      await updateUserStripeCustomerId(ctx.user.id, customerId);
    }

    const origin = ctx.req.headers.origin || `${ctx.req.protocol}://${ctx.req.get("host")}`;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    return { url: session.url };
  }),

  /**
   * Get user's downloadable digital assets from purchases
   */
  getUserDownloads: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.id !== input.userId) {
        throw new Error("Unauthorized");
      }
      return await getUserDownloads(ctx.user.id);
    }),

  /**
   * Get live prices for all paid tiers directly from Stripe.
   * This is a public procedure so the Pricing page can show up-to-date prices
   * without requiring authentication.
   */
  getLivePrices: publicProcedure.query(async () => {
    const premiumPriceId = PRODUCTS.PREMIUM.stripePriceId;
    const proPriceId = PRODUCTS.PRO.stripePriceId;

    // Fetch Stripe prices and local DB products in parallel
    const db = await getDb();
    const { products: productsTable } = await import("../../drizzle/schema");
    const [premiumPrice, proPrice, dbProducts] = await Promise.all([
      premiumPriceId
        ? stripe.prices.retrieve(premiumPriceId).catch(() => null)
        : null,
      proPriceId
        ? stripe.prices.retrieve(proPriceId).catch(() => null)
        : null,
      db
        ? db.select().from(productsTable).where(eq(productsTable.status, "active")).catch(() => [])
        : Promise.resolve([]),
    ]);

    // Find DB records by matching the active Stripe price ID
    const dbPremium = dbProducts.find((p) => p.stripePriceId === premiumPriceId);
    const dbPro = dbProducts.find((p) => p.stripePriceId === proPriceId);

    return {
      premium: {
        amountCents: premiumPrice?.unit_amount ?? PRODUCTS.PREMIUM.price,
        active: premiumPrice?.active ?? false,
        currency: premiumPrice?.currency ?? PRODUCTS.PREMIUM.currency,
        yearlyDiscountPercent: dbPremium?.yearlyDiscountPercent ?? 0,
        billingInterval: dbPremium?.billingInterval ?? null,
        isRecurring: dbPremium?.isRecurring ?? false,
      },
      pro: {
        amountCents: proPrice?.unit_amount ?? PRODUCTS.PRO.price,
        active: proPrice?.active ?? false,
        currency: proPrice?.currency ?? PRODUCTS.PRO.currency,
        yearlyDiscountPercent: dbPro?.yearlyDiscountPercent ?? 0,
        billingInterval: dbPro?.billingInterval ?? null,
        isRecurring: dbPro?.isRecurring ?? false,
      },
    };
  }),
});
