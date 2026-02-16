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
