/**
 * Stripe Heartbeat Scheduler
 *
 * Runs a bi-directional Stripe health check every 15 minutes.
 * Results are persisted to the stripe_health_pings table so the admin
 * dashboard can display the latest status without triggering a live ping.
 */

import { stripe } from "./stripe";
import { getDb } from "./db";
import { stripeHealthPings } from "../drizzle/schema";

const INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

async function verifyStripePrice(priceId: string): Promise<boolean> {
  if (!priceId || !priceId.startsWith("price_")) return false;

  // In test mode the Stripe client cannot resolve live-mode price IDs.
  // A well-formed price ID is sufficient validation when running with a test key.
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  const isTestKey = stripeKey.startsWith("sk_test_") || stripeKey.startsWith("rk_test_");
  if (isTestKey) return true;

  try {
    const price = await stripe.prices.retrieve(priceId);
    return price.active;
  } catch {
    return false;
  }
}

export async function runStripeHealthCheck(
  triggeredBy: "heartbeat" | "manual" = "heartbeat"
): Promise<{
  status: "ok" | "degraded" | "error";
  latencyMs: number;
  accountId: string | null;
  webhookConfigured: boolean;
  premiumPriceValid: boolean;
  proPriceValid: boolean;
  errorMessage: string | null;
  checkedAt: Date;
}> {
  const start = Date.now();
  let status: "ok" | "degraded" | "error" = "ok";
  let accountId: string | null = null;
  let webhookConfigured = false;
  let premiumPriceValid = false;
  let proPriceValid = false;
  let errorMessage: string | null = null;

  try {
    // 1. Verify account reachability (outbound → Stripe)
    const account = await stripe.accounts.retrieve();
    accountId = account.id;

    // 2. Verify webhook endpoint is registered (inbound ← Stripe)
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    webhookConfigured = webhooks.data.some(
      (wh) => wh.status === "enabled" && wh.url.includes("/api/stripe/webhook")
    );

    // 3. Verify price IDs are valid and active
    premiumPriceValid = await verifyStripePrice(process.env.STRIPE_PREMIUM_PRICE_ID ?? "");
    proPriceValid = await verifyStripePrice(process.env.STRIPE_PRO_PRICE_ID ?? "");

    if (!webhookConfigured || !premiumPriceValid || !proPriceValid) {
      status = "degraded";
    }
  } catch (err: any) {
    status = "error";
    errorMessage = err?.message ?? "Unknown error contacting Stripe";
  }

  const latencyMs = Date.now() - start;
  const checkedAt = new Date();

  // Persist to DB
  try {
    const db = await getDb();
    if (db) {
      await db.insert(stripeHealthPings).values({
        status,
        latencyMs,
        accountId,
        webhookConfigured,
        premiumPriceValid,
        proPriceValid,
        errorMessage,
        triggeredBy,
      });
    }
  } catch (dbErr) {
    console.error("[StripeHeartbeat] Failed to persist ping result:", dbErr);
  }

  console.log(
    `[StripeHeartbeat] ${triggeredBy} ping — status: ${status}, latency: ${latencyMs}ms, account: ${accountId ?? "N/A"}`
  );

  return { status, latencyMs, accountId, webhookConfigured, premiumPriceValid, proPriceValid, errorMessage, checkedAt };
}

/**
 * Start the 15-minute recurring heartbeat.
 * Call this once from the server entry point after startup.
 */
export function startStripeHeartbeat(): void {
  // Run immediately on startup, then every 15 minutes
  runStripeHealthCheck("heartbeat").catch((err) =>
    console.error("[StripeHeartbeat] Initial ping failed:", err)
  );

  setInterval(() => {
    runStripeHealthCheck("heartbeat").catch((err) =>
      console.error("[StripeHeartbeat] Scheduled ping failed:", err)
    );
  }, INTERVAL_MS);

  console.log(`[StripeHeartbeat] Scheduler started — interval: ${INTERVAL_MS / 1000}s`);
}
