/**
 * Platform AI Agent
 *
 * Runs a daily check that:
 *  1. Auto-archives announcements whose 14-day landing-page window has expired.
 *  2. Monitors Stripe latency — if > 1000 ms, runs a second ping and emails the
 *     owner with before/after latency.
 *  3. Emails the owner when a new free-account user signs up.
 *  4. Emails the owner when a user upgrades to Premium or Pro.
 *
 * Signup / upgrade hooks are called directly from the relevant routers.
 * The daily scheduler handles announcement archiving and Stripe latency checks.
 */

import sgMail from "@sendgrid/mail";
import { ENV } from "./_core/env";
import {
  autoArchiveExpiredAnnouncements,
  createAgentLog,
  completeAgentLog,
  getDb,
} from "./db";
import { runStripeHealthCheck } from "./stripeHeartbeat";
import { users, products } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { stripe, getStripeMode } from "./stripe";

// ── SendGrid init ─────────────────────────────────────────────────────────────
if (ENV.sendgridApiKey) {
  sgMail.setApiKey(ENV.sendgridApiKey);
}

const DAILY_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LATENCY_THRESHOLD_MS = 1000;

// ── Helper: send email to owner ───────────────────────────────────────────────

async function getOwnerEmail(): Promise<string | null> {
  if (!ENV.ownerOpenId) return null;
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.openId, ENV.ownerOpenId))
    .limit(1);
  return rows[0]?.email ?? null;
}

async function sendOwnerEmail(subject: string, html: string): Promise<void> {
  if (!ENV.sendgridApiKey || !ENV.sendgridFromEmail) {
    console.warn("[PlatformAgent] SendGrid not configured — skipping owner email");
    return;
  }
  const ownerEmail = await getOwnerEmail();
  if (!ownerEmail) {
    console.warn("[PlatformAgent] Owner email not found — skipping owner email");
    return;
  }
  try {
    await sgMail.send({
      to: ownerEmail,
      from: { email: ENV.sendgridFromEmail, name: "Pathfinder Platform Agent" },
      subject,
      html,
    });
    console.log(`[PlatformAgent] Owner email sent: ${subject}`);
  } catch (err: any) {
    console.error("[PlatformAgent] Failed to send owner email:", err?.response?.body ?? err?.message);
  }
}

// ── Stripe Mode Drift Detector ───────────────────────────────────────────────

/**
 * Validates that every active DB product's stripeProductId exists in the
 * currently active Stripe mode (test vs. live). If any are stale (wrong mode),
 * emails the owner with a summary and marks those products as archived locally
 * so the tier-warning banner fires in the admin dashboard.
 */
async function checkStripeDrift(): Promise<{
  staleCount: number;
  mode: string;
  staleProducts: Array<{ id: number; name: string; stripeProductId: string }>;
}> {
  const db = await getDb();
  if (!db) return { staleCount: 0, mode: "unknown", staleProducts: [] };

  const mode = getStripeMode();

  // Only run the drift check in live mode.
  // In test/dev mode the DB may intentionally hold live-mode product IDs
  // (the production site uses sk_live_, the sandbox uses sk_test_).
  // Flagging those as "stale" would incorrectly archive valid production products.
  if (mode !== "live") {
    console.log("[PlatformAgent] Stripe drift check skipped — running in test mode");
    return { staleCount: 0, mode, staleProducts: [] };
  }
  const activeProducts = await db
    .select({
      id: products.id,
      name: products.name,
      stripeProductId: products.stripeProductId,
      stripePriceId: products.stripePriceId,
    })
    .from(products)
    .where(and(eq(products.status, "active")));

  const staleProducts: Array<{ id: number; name: string; stripeProductId: string }> = [];

  for (const product of activeProducts) {
    if (!product.stripeProductId) continue;
    try {
      await stripe.products.retrieve(product.stripeProductId);
      // Product exists in current mode — valid
    } catch (err: any) {
      if (err?.code === "resource_missing" || err?.statusCode === 404) {
        staleProducts.push({
          id: product.id,
          name: product.name,
          stripeProductId: product.stripeProductId,
        });
      }
    }
  }

  if (staleProducts.length > 0) {
    // Auto-repair: create new Stripe products/prices in the current mode and update DB.
    // This prevents the archive→reactivate→archive loop when switching between test/live keys.
    const repaired: Array<{ name: string; newProductId: string; newPriceId: string }> = [];
    const failedRepair: Array<{ name: string; error: string }> = [];

    for (const sp of staleProducts) {
      // Fetch full product row for price/billing details
      const [fullProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, sp.id))
        .limit(1);
      if (!fullProduct) continue;

      try {
        // Create new Stripe product in current mode
        const newStripeProduct = await stripe.products.create({
          name: fullProduct.name,
          description: fullProduct.description ?? undefined,
          metadata: { source: "pathfinder_drift_repair", db_product_id: String(fullProduct.id) },
        });

        // Create new Stripe price under the new product
        const priceData: Parameters<typeof stripe.prices.create>[0] = {
          product: newStripeProduct.id,
          unit_amount: fullProduct.price,
          currency: fullProduct.currency,
        };
        if (fullProduct.isRecurring && fullProduct.billingInterval) {
          priceData.recurring = { interval: fullProduct.billingInterval as "month" | "year" };
        }
        const newPrice = await stripe.prices.create(priceData);

        // Update DB with new IDs and ensure product stays active
        await db
          .update(products)
          .set({
            stripeProductId: newStripeProduct.id,
            stripePriceId: newPrice.id,
            status: "active",
            archivedAt: null,
          })
          .where(eq(products.id, sp.id));

        repaired.push({ name: fullProduct.name, newProductId: newStripeProduct.id, newPriceId: newPrice.id });
        console.log(`[PlatformAgent] Drift repair: ${fullProduct.name} → ${newStripeProduct.id} / ${newPrice.id}`);
      } catch (err: any) {
        failedRepair.push({ name: fullProduct.name, error: err?.message ?? "unknown" });
        // Fall back to archiving only if repair fails
        await db
          .update(products)
          .set({ status: "archived", archivedAt: new Date() })
          .where(eq(products.id, sp.id));
        console.warn(`[PlatformAgent] Drift repair failed for ${fullProduct.name}: ${err?.message}`);
      }
    }

    // Email owner with repair summary
    const repairedRows = repaired
      .map(
        (r) =>
          `<tr>
            <td style="padding:8px;border:1px solid #ddd">${r.name}</td>
            <td style="padding:8px;border:1px solid #ddd;font-family:monospace">${r.newProductId}</td>
            <td style="padding:8px;border:1px solid #ddd;color:#27ae60">Auto-repaired ✓</td>
          </tr>`
      )
      .join("");
    const failedRows = failedRepair
      .map(
        (f) =>
          `<tr>
            <td style="padding:8px;border:1px solid #ddd">${f.name}</td>
            <td style="padding:8px;border:1px solid #ddd;font-family:monospace">—</td>
            <td style="padding:8px;border:1px solid #ddd;color:#c0392b">Repair failed: ${f.error}</td>
          </tr>`
      )
      .join("");

    const subject =
      failedRepair.length > 0
        ? `⚠️ Stripe Drift: ${repaired.length} repaired, ${failedRepair.length} failed — action required`
        : `✅ Stripe Drift Auto-Repaired — ${repaired.length} product(s) updated to ${mode} mode`;

    const html = `
      <h2>Stripe Mode Drift — Auto-Repair Report</h2>
      <p>The Platform AI Agent detected <strong>${staleProducts.length}</strong> product(s) with Stripe IDs
      that did not exist in the current <strong>${mode}</strong> mode.
      The agent automatically created replacement products and prices in ${mode} mode.</p>
      <table style="border-collapse:collapse;width:100%;margin-top:12px">
        <tr style="background:#f5f5f5">
          <th style="text-align:left;padding:8px;border:1px solid #ddd">Product Name</th>
          <th style="text-align:left;padding:8px;border:1px solid #ddd">New Stripe ID</th>
          <th style="text-align:left;padding:8px;border:1px solid #ddd">Status</th>
        </tr>
        ${repairedRows}${failedRows}
      </table>
      ${failedRepair.length > 0 ? `<p style="color:#c0392b;margin-top:12px">Failed products have been archived. Please recreate them manually from the <a href="${process.env.FRONTEND_URL ?? ""}/admin/products">Product Management page</a>.</p>` : ""}
      <p style="margin-top:16px;color:#666;font-size:12px">
        Detected and repaired at ${new Date().toUTCString()} · Active Stripe mode: ${mode}
      </p>
    `;
    await sendOwnerEmail(subject, html);
    console.warn(
      `[PlatformAgent] Stripe mode drift: ${repaired.length} repaired, ${failedRepair.length} failed in ${mode} mode`
    );
  } else {
    console.log(`[PlatformAgent] Stripe mode drift check: all products valid in ${mode} mode`);
  }

  return { staleCount: staleProducts.length, mode, staleProducts };
}

// ── Stripe latency check ──────────────────────────────────────────────────────

async function checkStripeLatency(): Promise<{
  status: "ok" | "degraded" | "error" | "skipped";
  latencyMs: number;
}> {
  try {
    const first = await runStripeHealthCheck("heartbeat");

    if (first.latencyMs <= LATENCY_THRESHOLD_MS) {
      return { status: first.status === "error" ? "error" : "ok", latencyMs: first.latencyMs };
    }

    // Latency exceeded threshold — run a second ping
    console.warn(
      `[PlatformAgent] Stripe latency high (${first.latencyMs}ms) — running follow-up ping`
    );
    const second = await runStripeHealthCheck("heartbeat");

    // Email owner with before/after
    const subject = `⚠️ Stripe Latency Alert — ${first.latencyMs}ms detected`;
    const html = `
      <h2>Stripe Latency Alert</h2>
      <p>The Platform AI Agent detected elevated Stripe API latency during its daily check.</p>
      <table style="border-collapse:collapse;width:100%">
        <tr>
          <th style="text-align:left;padding:8px;border:1px solid #ddd">Ping</th>
          <th style="text-align:left;padding:8px;border:1px solid #ddd">Latency</th>
          <th style="text-align:left;padding:8px;border:1px solid #ddd">Status</th>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #ddd">Initial</td>
          <td style="padding:8px;border:1px solid #ddd"><strong>${first.latencyMs}ms</strong></td>
          <td style="padding:8px;border:1px solid #ddd">${first.status}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #ddd">Follow-up</td>
          <td style="padding:8px;border:1px solid #ddd"><strong>${second.latencyMs}ms</strong></td>
          <td style="padding:8px;border:1px solid #ddd">${second.status}</td>
        </tr>
      </table>
      <p style="margin-top:16px;color:#666;font-size:12px">
        Checked at ${new Date().toUTCString()} · Threshold: ${LATENCY_THRESHOLD_MS}ms
      </p>
    `;
    await sendOwnerEmail(subject, html);

    return {
      status: second.status === "error" ? "error" : "degraded",
      latencyMs: second.latencyMs,
    };
  } catch (err: any) {
    console.error("[PlatformAgent] Stripe latency check failed:", err?.message);
    return { status: "error", latencyMs: 0 };
  }
}

// ── Daily agent run ───────────────────────────────────────────────────────────

export async function runPlatformAgent(trigger: "scheduled" | "manual" = "scheduled"): Promise<void> {
  console.log(`[PlatformAgent] Starting daily run (trigger: ${trigger})`);
  const actions: Array<{ type: string; description: string }> = [];
  const errors: string[] = [];

  const logId = await createAgentLog({
    trigger,
    actions: "[]",
    stripeStatus: "skipped",
    announcementsArchived: 0,
    errors: null,
  });

  // ── Task 1: Auto-archive expired landing-page announcements ──────────────
  let announcementsArchived = 0;
  try {
    announcementsArchived = await autoArchiveExpiredAnnouncements();
    if (announcementsArchived > 0) {
      actions.push({
        type: "announcement_archive",
        description: `Auto-archived ${announcementsArchived} expired landing-page announcement(s)`,
      });
      console.log(`[PlatformAgent] Archived ${announcementsArchived} expired announcement(s)`);
    }
  } catch (err: any) {
    const msg = `Announcement archiving failed: ${err?.message}`;
    errors.push(msg);
    console.error(`[PlatformAgent] ${msg}`);
  }

  // ── Task 2: Stripe Mode Drift Detector ────────────────────────────────────
  let driftCount = 0;
  let driftMode: string | null = null;
  let driftCheckedAt: Date | null = null;
  try {
    const drift = await checkStripeDrift();
    driftCount = drift.staleCount;
    driftMode = drift.mode;
    driftCheckedAt = new Date();
    if (driftCount > 0) {
      actions.push({
        type: "stripe_drift",
        description: `Stripe mode drift: ${driftCount} stale product(s) auto-archived (mode: ${drift.mode})`,
      });
    } else {
      actions.push({
        type: "stripe_drift",
        description: `Stripe mode drift check: all products valid in ${drift.mode} mode`,
      });
    }
  } catch (err: any) {
    const msg = `Stripe drift check failed: ${err?.message}`;
    errors.push(msg);
    console.error(`[PlatformAgent] ${msg}`);
  }

  // ── Task 3 (continued): Stripe latency check ────────────────────────────
  let stripeStatus: "ok" | "degraded" | "error" | "skipped" = "skipped";
  let stripeLatencyMs = 0;
  try {
    const result = await checkStripeLatency();
    stripeStatus = result.status;
    stripeLatencyMs = result.latencyMs;
    actions.push({
      type: "stripe_check",
      description: `Stripe health check: ${stripeStatus} (${stripeLatencyMs}ms)`,
    });
  } catch (err: any) {
    const msg = `Stripe check failed: ${err?.message}`;
    errors.push(msg);
    stripeStatus = "error";
    console.error(`[PlatformAgent] ${msg}`);
  }

  // ── Finalize log ─────────────────────────────────────────────────────────
  await completeAgentLog(logId, {
    actions: JSON.stringify(actions),
    stripeStatus,
    stripeLatencyMs,
    announcementsArchived,
    driftCount,
    driftMode: driftMode ?? undefined,
    driftCheckedAt: driftCheckedAt ?? undefined,
    errors: errors.length > 0 ? JSON.stringify(errors) : null,
  });

  console.log(
    `[PlatformAgent] Daily run complete — archived: ${announcementsArchived}, stripe: ${stripeStatus} (${stripeLatencyMs}ms)`
  );
}

// ── Owner notification helpers (called from routers) ─────────────────────────

/**
 * Call this from the signup flow to notify the owner of a new free-account user.
 */
export async function notifyOwnerNewSignup(params: {
  name: string;
  email: string;
  loginMethod: string;
  signedUpAt: Date;
}): Promise<void> {
  const subject = `🆕 New User Signup — ${params.name || params.email}`;
  const html = `
    <h2>New Free Account Signup</h2>
    <p>A new user just created a free account on Pathfinder.</p>
    <table style="border-collapse:collapse;width:100%">
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td>
        <td style="padding:8px;border:1px solid #ddd">${params.name || "—"}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td>
        <td style="padding:8px;border:1px solid #ddd">${params.email}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold">Login Method</td>
        <td style="padding:8px;border:1px solid #ddd">${params.loginMethod}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold">Signed Up At</td>
        <td style="padding:8px;border:1px solid #ddd">${params.signedUpAt.toUTCString()}</td>
      </tr>
    </table>
  `;
  await sendOwnerEmail(subject, html);
}

/**
 * Call this from the Stripe webhook / payment success flow to notify the owner of an upgrade.
 */
export async function notifyOwnerUpgrade(params: {
  name: string;
  email: string;
  tier: "premium" | "pro";
  amount: number; // cents
  currency: string;
  purchasedAt: Date;
}): Promise<void> {
  const tierLabel = params.tier === "premium" ? "Premium (one-time)" : "Pro (subscription)";
  const amountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: params.currency.toUpperCase(),
  }).format(params.amount / 100);

  const subject = `💰 User Upgraded to ${tierLabel} — ${params.name || params.email}`;
  const html = `
    <h2>User Upgrade Notification</h2>
    <p>A user just upgraded their Pathfinder account.</p>
    <table style="border-collapse:collapse;width:100%">
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td>
        <td style="padding:8px;border:1px solid #ddd">${params.name || "—"}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td>
        <td style="padding:8px;border:1px solid #ddd">${params.email}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold">Tier</td>
        <td style="padding:8px;border:1px solid #ddd"><strong>${tierLabel}</strong></td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold">Amount</td>
        <td style="padding:8px;border:1px solid #ddd">${amountFormatted}</td>
      </tr>
      <tr>
        <td style="padding:8px;border:1px solid #ddd;font-weight:bold">Purchased At</td>
        <td style="padding:8px;border:1px solid #ddd">${params.purchasedAt.toUTCString()}</td>
      </tr>
    </table>
  `;
  await sendOwnerEmail(subject, html);
}

// ── Scheduler ─────────────────────────────────────────────────────────────────

export function startPlatformAgent(): void {
  // Run once on startup (with a short delay to let DB pool warm up)
  setTimeout(() => {
    runPlatformAgent("scheduled").catch((err) =>
      console.error("[PlatformAgent] Initial run failed:", err)
    );
  }, 30_000); // 30-second startup delay

  setInterval(() => {
    runPlatformAgent("scheduled").catch((err) =>
      console.error("[PlatformAgent] Scheduled run failed:", err)
    );
  }, DAILY_INTERVAL_MS);

  console.log("[PlatformAgent] Scheduler started — interval: 24h");
}
