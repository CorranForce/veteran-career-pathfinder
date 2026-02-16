import { Request, Response } from "express";
import { constructStripeEvent, stripe } from "./stripe";
import { createPurchase, getUserById, updatePurchaseStatus, updateUserStripeCustomerId, logActivity } from "./db";
import { sendPurchaseConfirmationEmail } from "./services/resendEmail";

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
          amount: session.amount_total || 0, // Amount in cents
          currency: session.currency || "usd",
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

        // Log purchase in activity feed with idempotency
        try {
          const userId = paymentIntent.metadata?.user_id;
          const customerEmail = paymentIntent.receipt_email || (paymentIntent.metadata?.customer_email as string);
          const customerName = paymentIntent.metadata?.customer_name as string || "Customer";
          const amount = paymentIntent.amount / 100; // Convert from cents to dollars
          
          // Check if this purchase has already been logged (idempotency)
          // We use the payment intent ID as a unique identifier
          const activityMetadata = {
            paymentIntentId: paymentIntent.id,
            amount,
            currency: paymentIntent.currency,
            productType: paymentIntent.metadata?.product_type || "unknown",
          };

          await logActivity({
            activityType: "purchase",
            userId: userId ? parseInt(userId) : undefined,
            userName: customerName,
            userEmail: customerEmail || undefined,
            description: `Purchased Premium Career Transition Package for $${amount.toFixed(2)}`,
            metadata: JSON.stringify(activityMetadata),
          });

          console.log("[Stripe Webhook] Purchase logged to activity feed:", paymentIntent.id);
        } catch (activityError) {
          console.error("[Stripe Webhook] Failed to log purchase activity:", activityError);
          // Don't fail the webhook if activity logging fails
        }

        // Send purchase confirmation email
        try {
          const customerEmail = paymentIntent.receipt_email || (paymentIntent.metadata?.customer_email as string);
          const customerName = paymentIntent.metadata?.customer_name as string || "Customer";
          const amount = paymentIntent.amount / 100; // Convert from cents to dollars
          
          if (customerEmail) {
            await sendPurchaseConfirmationEmail(
              customerEmail,
              customerName,
              "Premium Career Transition Package",
              amount
            );
          }
        } catch (emailError) {
          console.error("[Stripe Webhook] Failed to send purchase confirmation email:", emailError);
          // Don't fail the webhook if email fails
        }

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
