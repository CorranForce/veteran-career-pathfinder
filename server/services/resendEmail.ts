import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_APP_URL = "https://transition-pathfinder.manus.space";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildPurchaseConfirmationEmail(
  name: string,
  productName: string,
  amount: number,
  appUrl = process.env.FRONTEND_URL || DEFAULT_APP_URL
) {
  const baseUrl = appUrl.replace(/\/$/, "");
  const safeName = escapeHtml(name);
  const safeProductName = escapeHtml(productName);
  const formattedAmount = amount.toFixed(2);

  return {
    subject: `Your Pathfinder access is ready — ${productName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;color:#1f2937;">
        <div style="background:#ffffff;border-radius:12px;padding:32px;box-shadow:0 2px 8px rgba(15,23,42,0.08);">
          <h1 style="color:#12365a;font-size:26px;margin:0 0 12px;">Your Pathfinder access is ready</h1>
          <p style="font-size:16px;line-height:1.6;margin:0 0 18px;">Hi ${safeName}, thank you for investing in your civilian career transition. Your <strong>${safeProductName}</strong> purchase is confirmed, and your Premium resources are now available.</p>

          <div style="background:#eff6ff;border-radius:8px;padding:16px 20px;margin:22px 0;">
            <p style="margin:0 0 8px;font-weight:bold;color:#12365a;">Order confirmation</p>
            <p style="margin:4px 0;"><strong>Package:</strong> ${safeProductName}</p>
            <p style="margin:4px 0;"><strong>Amount paid:</strong> $${formattedAmount}</p>
            <p style="margin:4px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <h2 style="font-size:19px;color:#12365a;margin:26px 0 12px;">Your next steps</h2>
          <ol style="padding-left:22px;line-height:1.75;margin:0 0 22px;">
            <li><strong>Open your Pathfinder tools.</strong> Start with your personalized career transition workspace.</li>
            <li><strong>Download your Premium resources.</strong> Access the full prompt and veteran-focused templates whenever you need them.</li>
            <li><strong>Translate your experience.</strong> Use the MOS Translator to identify civilian paths, skill gaps, and salary ranges.</li>
          </ol>

          <a href="${baseUrl}/tools" style="display:block;background:#12365a;color:#ffffff;text-align:center;padding:14px 24px;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;margin:20px 0 12px;">Open My Pathfinder Tools</a>
          <p style="font-size:14px;line-height:1.6;margin:0;text-align:center;">
            <a href="${baseUrl}/downloads" style="color:#0f4c81;">View Premium downloads</a>
            &nbsp;·&nbsp;
            <a href="${baseUrl}/mos-translator" style="color:#0f4c81;">Use the MOS Translator</a>
          </p>

          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:28px 0 0;">If you have questions about your purchase or first steps, reply to this email and we will be glad to help.</p>
        </div>
      </div>
    `,
  };
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Pathfinder <onboarding@resend.dev>', // Use your verified domain
      to: [to],
      subject: 'Welcome to Pathfinder - Your Career Transition Starts Now',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Welcome to Pathfinder, ${name}!</h1>
          
          <p>Thank you for joining our community of veterans transitioning to civilian careers.</p>
          
          <p>You now have access to:</p>
          <ul>
            <li>AI-powered career transition prompt</li>
            <li>Resume templates tailored for veterans</li>
            <li>MOS translation guides</li>
            <li>Exclusive webinars and Q&A sessions</li>
          </ul>
          
          <p>Get started by visiting your dashboard and exploring the resources available to you.</p>
          
          <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://pathfinder.manus.space'}/dashboard" 
             style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Go to Dashboard
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions, feel free to reply to this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend] Failed to send welcome email:', error);
      return false;
    }

    console.log('[Resend] Welcome email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('[Resend] Error sending welcome email:', error);
    return false;
  }
}

/**
 * Send purchase confirmation email
 */
export async function sendPurchaseConfirmationEmail(
  to: string,
  name: string,
  productName: string,
  amount: number
): Promise<boolean> {
  try {
    const email = buildPurchaseConfirmationEmail(name, productName, amount);
    const { data, error } = await resend.emails.send({
      from: 'Pathfinder <orders@resend.dev>', // Use your verified domain
      to: [to],
      subject: email.subject,
      html: email.html,
    });

    if (error) {
      console.error('[Resend] Failed to send purchase confirmation:', error);
      return false;
    }

    console.log('[Resend] Purchase confirmation sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('[Resend] Error sending purchase confirmation:', error);
    return false;
  }
}

/**
 * Test Resend configuration
 */
export async function testResendConnection(): Promise<boolean> {
  try {
    // Send a test email to verify API key is valid
    const { error } = await resend.emails.send({
      from: 'Pathfinder <test@resend.dev>',
      to: ['delivered@resend.dev'], // Resend's test email
      subject: 'Test Email - Resend Integration',
      html: '<p>This is a test email to verify Resend integration.</p>',
    });

    if (error) {
      console.error('[Resend] Test email failed:', error);
      return false;
    }

    console.log('[Resend] Test email sent successfully');
    return true;
  } catch (error) {
    console.error('[Resend] Connection test failed:', error);
    return false;
  }
}

/**
 * Send exit-intent coupon email
 * Delivers the 20% discount code to a visitor who entered their email in the exit popup.
 */
export async function sendExitIntentCouponEmail(
  to: string,
  couponCode: string
): Promise<boolean> {
  try {
    const discountPercent = 20;
    const pricingUrl = `${process.env.FRONTEND_URL || "https://transition-pathfinder.manus.space"}/pricing`;

    const { error, data } = await resend.emails.send({
      from: "Pathfinder <orders@resend.dev>",
      to: [to],
      subject: `Your 20% Veteran Discount Code — ${couponCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
          <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
            <h1 style="color: #1e3a5f; font-size: 24px; margin-bottom: 8px;">Your Exclusive Discount Is Ready</h1>
            <p style="color: #4b5563; font-size: 16px; margin-bottom: 24px;">
              Thank you for your interest in Pathfinder. Here is your <strong>${discountPercent}% veteran discount</strong> — 
              use it at checkout to save on the Premium Package.
            </p>

            <!-- Coupon code box -->
            <div style="background-color: #fff7ed; border: 2px dashed #f97316; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <p style="color: #9a3412; font-size: 13px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Your Coupon Code</p>
              <p style="color: #ea580c; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0;">${couponCode}</p>
              <p style="color: #9a3412; font-size: 13px; margin: 8px 0 0 0;">${discountPercent}% off the Premium Package</p>
            </div>

            <!-- What you get -->
            <div style="background-color: #f0f9ff; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #1e3a5f; font-weight: bold; margin: 0 0 12px 0;">What's included in Premium:</p>
              <ul style="color: #374151; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Complete AI Career Transition Strategist prompt</li>
                <li>3–4 detailed civilian career paths with salary data</li>
                <li>Skills gap analysis &amp; certification roadmap</li>
                <li>30-day action plan with weekly milestones</li>
                <li>Resume templates optimized for ATS systems</li>
                <li>Lifetime access &amp; future updates</li>
              </ul>
            </div>

            <a href="${pricingUrl}"
               style="display: block; background-color: #1e3a5f; color: #ffffff; text-align: center; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; margin-bottom: 16px;">
              Claim My ${discountPercent}% Discount →
            </a>

            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              This code is for single use only. If you have questions, reply to this email.
            </p>
          </div>

          <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 16px;">
            Pathfinder — AI-Powered Veteran Career Transition Strategist<br/>
            You received this because you requested a discount from Pathfinder.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend] Failed to send exit-intent coupon email:", error);
      return false;
    }

    console.log("[Resend] Exit-intent coupon email sent:", data?.id);
    return true;
  } catch (err) {
    console.error("[Resend] Error sending exit-intent coupon email:", err);
    return false;
  }
}
