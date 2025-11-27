import { Request, Response } from "express";
import { constructStripeEvent, stripe } from "./stripe";
import { createPurchase, getUserById, updatePurchaseStatus, updateUserStripeCustomerId } from "./db";

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return res.status(400).send("Missing stripe-signature header");
  }

  let event;
  try {
    const sig = Array.isArray(signature) ? signature[0] : signature;
    event = constructStripeEvent(req.body, sig);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log("[Stripe Webhook] Received event:", event.type, event.id);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("[Stripe Webhook] Checkout session completed:", session.id);

        // Extract user information from metadata
        const userId = session.metadata?.user_id;
        const productType = session.metadata?.product_type as "premium_prompt" | "pro_subscription";

        if (!userId || !productType) {
          console.error("[Stripe Webhook] Missing required metadata:", { userId, productType });
          return res.status(400).send("Missing required metadata");
        }

        // Create or update Stripe customer ID
        if (session.customer && typeof session.customer === "string") {
          await updateUserStripeCustomerId(parseInt(userId), session.customer);
        }

        // Create purchase record
        await createPurchase({
          userId: parseInt(userId),
          productType,
          stripePaymentIntentId: session.payment_intent as string,
          stripeSubscriptionId: session.subscription as string | undefined,
          status: "pending",
        });

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("[Stripe Webhook] Payment succeeded:", paymentIntent.id);

        // Update purchase status to completed
        await updatePurchaseStatus(paymentIntent.id, "completed");

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("[Stripe Webhook] Payment failed:", paymentIntent.id);

        // Update purchase status to failed
        await updatePurchaseStatus(paymentIntent.id, "failed");

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log("[Stripe Webhook] Subscription event:", event.type, subscription.id);
        
        // Subscription handling - can be extended later for subscription management
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("[Stripe Webhook] Subscription cancelled:", subscription.id);
        
        // Handle subscription cancellation
        break;
      }

      default:
        console.log("[Stripe Webhook] Unhandled event type:", event.type);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    res.status(500).send("Webhook processing error");
  }
}
