import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { stripe } from "../stripe";
import { PRODUCTS } from "../products";
import { createPurchase, getUserPurchases, hasUserPurchased, updateUserStripeCustomerId } from "../db";
import { getUserDownloads } from "../services/purchaseFulfillment";

export const paymentRouter = router({
  /**
   * Create a Stripe checkout session for one-time or subscription payment
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        productKey: z.enum(["PREMIUM_PROMPT"]),
        couponCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = PRODUCTS[input.productKey];
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
      const productType = "premium_prompt";

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
          product.priceId && product.priceId !== "price_premium_prompt"
            ? {
                price: product.priceId,
                quantity: 1,
              }
            : {
                price_data: {
                  currency: product.currency,
                  product_data: {
                    name: product.name,
                    description: product.description,
                  },
                  unit_amount: product.amount,
                },
                quantity: 1,
              },
        ],
        mode: "payment",
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
});
