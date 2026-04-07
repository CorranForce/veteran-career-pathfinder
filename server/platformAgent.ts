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
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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

  // ── Task 2: Stripe latency check ─────────────────────────────────────────
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
