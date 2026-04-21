import { Request, Response } from "express";
import { constructStripeEvent, stripe } from "./stripe";
import {
  createPurchase,
  getUserById,
  updatePurchaseStatus,
  updateUserStripeCustomerId,
  logActivity,
  getPurchaseByPaymentIntent,
  getPurchaseBySubscriptionId,
} from "./db";
import { sendPurchaseConfirmationEmail } from "./services/resendEmail";
import { notifyOwner } from "./_core/notification";
import { notifyOwnerUpgrade } from "./platformAgent";
import {
  getReferralCodeBySlug,
  createReferralConversion,
  conversionExistsForPurchase,
  incrementReferralConversion,
} from "./db-referral";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Try to attribute a completed purchase to a referral code.
 *
 * Called from checkout.session.completed and payment_intent.succeeded.
 * Fully idempotent — silently returns if the purchase has already been
 * attributed (guards against duplicate webhook deliveries).
 *
 * @param purchaseId   Internal DB id of the completed purchase row
 * @param refereeId    Internal DB id of the buyer
 * @param referralCodeId  Numeric referral_codes.id (from Stripe metadata)
 * @param referralCodeSlug  Human-readable slug (for logging only)
 */
async function tryRecordReferralConversion(
  purchaseId: number,
  refereeId: number,
  referralCodeId: number,
  referralCodeSlug: string
): Promise<void> {
  try {
    // Idempotency: skip if already recorded
    const alreadyRecorded = await conversionExistsForPurchase(purchaseId);
    if (alreadyRecorded) {
      console.log(
        `[Referral] Conversion already recorded for purchase ${purchaseId} — skipping`
      );
      return;
    }

    // Load the referral code to get the referrer's user ID
    // (We trust the numeric ID from metadata; slug is for logging only)
    const { getDb } = await import("./db");
    const { referralCodes } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const db = await getDb();
    if (!db) {
      console.warn("[Referral] DB unavailable — skipping conversion recording");
      return;
    }

    const codeRows = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.id, referralCodeId))
      .limit(1);

    const codeRecord = codeRows[0];
    if (!codeRecord) {
      console.warn(
        `[Referral] Referral code id=${referralCodeId} not found — skipping`
      );
      return;
    }

    if (!codeRecord.isActive) {
      console.warn(
        `[Referral] Referral code ${referralCodeSlug} is inactive — skipping`
      );
      return;
    }

    // Prevent self-referral (buyer == referrer)
    if (codeRecord.userId === refereeId) {
      console.warn(
        `[Referral] Self-referral detected for user ${refereeId} — skipping`
      );
      return;
    }

    await createReferralConversion({
      referralCodeId: codeRecord.id,
      referrerId: codeRecord.userId,
      refereeId,
      purchaseId,
      rewardCents: 500, // $5 referrer credit
      refereeDiscountBps: 1000, // 10 % buyer discount (applied at checkout)
      rewardStatus: "pending",
    });

    console.log(
      `[Referral] Conversion recorded — code: ${referralCodeSlug}, ` +
        `referrer: ${codeRecord.userId}, referee: ${refereeId}, purchase: ${purchaseId}`
    );
  } catch (err) {
    // Non-fatal: log and continue so the main webhook response still succeeds
    console.error("[Referral] Failed to record conversion:", err);
  }
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

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
    return res
      .status(400)
      .send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log("[Stripe Webhook] Received event:", event.type, event.id);

  try {
    switch (event.type) {
      // ── checkout.session.completed ─────────────────────────────────────────
      // Fired immediately when the Stripe-hosted checkout page is completed.
      // For one-time payments: payment_intent is set, subscription is null.
      // For subscriptions: subscription is set, payment_intent may be null.
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("[Stripe Webhook] Checkout session completed:", session.id);

        // Extract user information from metadata
        const userId = session.metadata?.user_id;
        const productType = session.metadata?.product_type as
          | "premium_prompt"
          | "pro_subscription";

        if (!userId || !productType) {
          console.error("[Stripe Webhook] Missing required metadata:", {
            userId,
            productType,
          });
          return res.status(400).send("Missing required metadata");
        }

        // Create or update Stripe customer ID
        if (session.customer && typeof session.customer === "string") {
          await updateUserStripeCustomerId(parseInt(userId), session.customer);
        }

        // Create purchase record and capture the insertId
        const insertResult = await createPurchase({
          userId: parseInt(userId),
          productType,
          amount: session.amount_total || 0,
          currency: session.currency || "usd",
          stripePaymentIntentId: session.payment_intent as string,
          stripeSubscriptionId: session.subscription as string | undefined,
          status: "pending",
        });

        // ── Referral conversion attribution ────────────────────────────────
        // Only attribute if the checkout session carried a valid referral code.
        const rawCodeId = session.metadata?.referral_code_id;
        const rawCodeSlug = session.metadata?.referral_code_slug || "";

        if (rawCodeId && rawCodeId !== "") {
          const referralCodeId = parseInt(rawCodeId, 10);
          if (!isNaN(referralCodeId) && referralCodeId > 0) {
            // Retrieve the purchase row we just inserted so we have its DB id.
            // For one-time payments we match on payment_intent; for subscriptions
            // we match on subscription id.
            let purchaseId: number | null = null;

            if (session.payment_intent && typeof session.payment_intent === "string") {
              const purchaseRow = await getPurchaseByPaymentIntent(
                session.payment_intent
              );
              purchaseId = purchaseRow?.id ?? null;
            } else if (
              session.subscription &&
              typeof session.subscription === "string"
            ) {
              const purchaseRow = await getPurchaseBySubscriptionId(
                session.subscription
              );
              purchaseId = purchaseRow?.id ?? null;
            }

            // Fallback: use the insertId from the insert result
            if (!purchaseId && insertResult) {
              const insertId = (insertResult as any)[0]?.insertId;
              if (insertId) purchaseId = insertId;
            }

            if (purchaseId) {
              await tryRecordReferralConversion(
                purchaseId,
                parseInt(userId),
                referralCodeId,
                rawCodeSlug
              );
            } else {
              console.warn(
                "[Referral] Could not determine purchaseId for conversion attribution — session:",
                session.id
              );
            }
          }
        }

        break;
      }

      // ── payment_intent.succeeded ───────────────────────────────────────────
      // Fired when the payment is captured. We update the purchase status to
      // "completed" here and send confirmation emails.
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        console.log("[Stripe Webhook] Payment succeeded:", paymentIntent.id);

        // Update purchase status to completed
        await updatePurchaseStatus(paymentIntent.id, "completed");

        // Log purchase in activity feed with idempotency
        try {
          const userId = paymentIntent.metadata?.user_id;
          const customerEmail =
            paymentIntent.receipt_email ||
            (paymentIntent.metadata?.customer_email as string);
          const customerName =
            (paymentIntent.metadata?.customer_name as string) || "Customer";
          const amount = paymentIntent.amount / 100;

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

          console.log(
            "[Stripe Webhook] Purchase logged to activity feed:",
            paymentIntent.id
          );
        } catch (activityError) {
          console.error(
            "[Stripe Webhook] Failed to log purchase activity:",
            activityError
          );
        }

        // Send purchase confirmation email
        try {
          const customerEmail =
            paymentIntent.receipt_email ||
            (paymentIntent.metadata?.customer_email as string);
          const customerName =
            (paymentIntent.metadata?.customer_name as string) || "Customer";
          const amount = paymentIntent.amount / 100;

          if (customerEmail) {
            await sendPurchaseConfirmationEmail(
              customerEmail,
              customerName,
              "Premium Career Transition Package",
              amount
            );
          }
        } catch (emailError) {
          console.error(
            "[Stripe Webhook] Failed to send purchase confirmation email:",
            emailError
          );
        }

        // Notify owner of completed payment
        try {
          const customerEmail =
            paymentIntent.receipt_email ||
            (paymentIntent.metadata?.customer_email as string);
          const customerName =
            (paymentIntent.metadata?.customer_name as string) || "Customer";
          const amount = (paymentIntent.amount / 100).toFixed(2);
          await notifyOwner({
            title: "Payment Received",
            content: `**${customerName}** (${customerEmail || "unknown"}) completed a payment of **$${amount} ${(paymentIntent.currency || "usd").toUpperCase()}** — Payment Intent: ${paymentIntent.id}`,
          });
        } catch (err) {
          console.error(
            "[Stripe Webhook] Failed to send owner payment notification:",
            err
          );
        }

        // Platform Agent: email owner about upgrade
        try {
          const customerEmail =
            paymentIntent.receipt_email ||
            (paymentIntent.metadata?.customer_email as string);
          const customerName =
            (paymentIntent.metadata?.customer_name as string) || "Customer";
          const productType = paymentIntent.metadata?.product_type as
            | string
            | undefined;
          const tier = productType === "pro_subscription" ? "pro" : "premium";
          if (customerEmail) {
            await notifyOwnerUpgrade({
              name: customerName,
              email: customerEmail,
              tier,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency || "usd",
              purchasedAt: new Date(),
            });
          }
        } catch (err) {
          console.error(
            "[Stripe Webhook] Failed to send upgrade owner email:",
            err
          );
        }

        break;
      }

      // ── payment_intent.payment_failed ──────────────────────────────────────
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        console.log("[Stripe Webhook] Payment failed:", paymentIntent.id);
        await updatePurchaseStatus(paymentIntent.id, "failed");
        break;
      }

      // ── Subscription events ────────────────────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log(
          "[Stripe Webhook] Subscription event:",
          event.type,
          subscription.id
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("[Stripe Webhook] Subscription cancelled:", subscription.id);
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
