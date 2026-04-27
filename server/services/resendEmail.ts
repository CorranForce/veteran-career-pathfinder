import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { data, error } = await resend.emails.send({
      from: 'Pathfinder <orders@resend.dev>', // Use your verified domain
      to: [to],
      subject: `Purchase Confirmation - ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Thank You for Your Purchase!</h1>
          
          <p>Hi ${name},</p>
          
          <p>Your payment of $${amount.toFixed(2)} for <strong>${productName}</strong> has been processed successfully.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>You can now access all premium features in your dashboard.</p>
          
          <a href="${process.env.VITE_FRONTEND_FORGE_API_URL || 'https://pathfinder.manus.space'}/dashboard" 
             style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Access Your Content
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions about your purchase, please reply to this email.
          </p>
        </div>
      `,
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
    const pricingUrl = `${process.env.FRONTEND_URL || "https://pathfinder.casa"}/pricing`;

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
            You received this because you requested a discount on pathfinder.casa.
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
