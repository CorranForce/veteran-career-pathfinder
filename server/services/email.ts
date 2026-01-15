import sgMail from "@sendgrid/mail";
import { ENV } from "../_core/env";

// Initialize SendGrid with API key
if (ENV.sendgridApiKey) {
  sgMail.setApiKey(ENV.sendgridApiKey);
} else {
  console.warn("[Email Service] SendGrid API key not configured. Email sending will be disabled.");
}

export interface SendWelcomeEmailParams {
  to: string;
  name?: string;
}

/**
 * Send welcome email with Career Transition Checklist to new subscriber
 */
export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailParams): Promise<boolean> {
  if (!ENV.sendgridApiKey) {
    console.warn("[Email Service] Cannot send email: SendGrid not configured");
    return false;
  }

  if (!ENV.sendgridFromEmail) {
    console.warn("[Email Service] Cannot send email: FROM email not configured");
    return false;
  }

  try {
    const firstName = name?.split(" ")[0] || "there";

    const msg = {
      to,
      from: {
        email: ENV.sendgridFromEmail,
        name: "Pathfinder - Veteran Career Transition",
      },
      subject: "Your Career Transition Checklist is Here! 🎯",
      html: getWelcomeEmailTemplate(firstName),
      text: getWelcomeEmailText(firstName),
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: true,
        },
        openTracking: {
          enable: true,
        },
      },
    };

    await sgMail.send(msg);
    console.log(`[Email Service] Welcome email sent successfully to ${to}`);
    return true;
  } catch (error: any) {
    console.error("[Email Service] Failed to send welcome email:", error.response?.body || error.message);
    return false;
  }
}

/**
 * HTML email template for welcome email
 */
function getWelcomeEmailTemplate(firstName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Pathfinder</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
    }
    h1 {
      color: #1e40af;
      font-size: 28px;
      margin-bottom: 20px;
    }
    .checklist {
      background-color: #f0f9ff;
      border-left: 4px solid #1e40af;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .checklist-item {
      margin: 15px 0;
      padding-left: 30px;
      position: relative;
    }
    .checklist-item:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #1e40af;
      font-weight: bold;
      font-size: 20px;
    }
    .cta-button {
      display: inline-block;
      background-color: #1e40af;
      color: #ffffff;
      padding: 14px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🧭 Pathfinder</div>
      <p style="color: #6b7280;">Veteran Career Transition Strategist</p>
    </div>

    <h1>Welcome, ${firstName}! 🎖️</h1>

    <p>Thank you for joining the Pathfinder community. You've taken the first step toward translating your military service into a rewarding civilian career.</p>

    <p>As promised, here's your <strong>Career Transition Checklist</strong> to help you get started:</p>

    <div class="checklist">
      <h3 style="margin-top: 0; color: #1e40af;">Your 30-Day Action Plan</h3>
      
      <div class="checklist-item">
        <strong>Week 1: Recon & Intel</strong><br>
        Research 5-10 job postings for your target career path and identify common keywords and required skills.
      </div>

      <div class="checklist-item">
        <strong>Week 2: Translate Your Story</strong><br>
        Write down your top 5 military achievements and translate each into civilian language that employers understand.
      </div>

      <div class="checklist-item">
        <strong>Week 3: Build Your Profile</strong><br>
        Update your LinkedIn headline and "About" section to align with your target career path using civilian terminology.
      </div>

      <div class="checklist-item">
        <strong>Week 4: Engage & Network</strong><br>
        Apply to 3-5 jobs that match your skills and connect with 3 veterans already working in your target role.
      </div>
    </div>

    <p><strong>Ready to dive deeper?</strong> Use the Pathfinder AI prompt to get personalized career paths, salary insights, and a detailed action plan tailored to your unique military background.</p>

    <center>
      <a href="https://veteran-career-pathfinder.manus.space/#prompt-section" class="cta-button">
        Get Your Personalized Career Plan
      </a>
    </center>

    <p style="margin-top: 30px;">You've served with honor. Now it's time to translate that service into your next mission.</p>

    <p style="font-weight: 600;">Stay mission-focused,<br>The Pathfinder Team</p>

    <div class="footer">
      <p>You're receiving this email because you subscribed to Pathfinder career transition resources.</p>
      <p>Questions? Reply to this email - we're here to help.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Plain text version of welcome email
 */
function getWelcomeEmailText(firstName: string): string {
  return `
Welcome, ${firstName}!

Thank you for joining the Pathfinder community. You've taken the first step toward translating your military service into a rewarding civilian career.

YOUR 30-DAY CAREER TRANSITION CHECKLIST:

Week 1: Recon & Intel
Research 5-10 job postings for your target career path and identify common keywords and required skills.

Week 2: Translate Your Story
Write down your top 5 military achievements and translate each into civilian language that employers understand.

Week 3: Build Your Profile
Update your LinkedIn headline and "About" section to align with your target career path using civilian terminology.

Week 4: Engage & Network
Apply to 3-5 jobs that match your skills and connect with 3 veterans already working in your target role.

Ready to dive deeper? Use the Pathfinder AI prompt to get personalized career paths, salary insights, and a detailed action plan tailored to your unique military background.

Visit: https://veteran-career-pathfinder.manus.space/

You've served with honor. Now it's time to translate that service into your next mission.

Stay mission-focused,
The Pathfinder Team

---
You're receiving this email because you subscribed to Pathfinder career transition resources.
Questions? Reply to this email - we're here to help.
  `.trim();
}


/**
 * Send drip campaign email to subscriber
 */
export async function sendDripEmail(
  to: string,
  name: string,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<boolean> {
  if (!ENV.sendgridApiKey) {
    console.warn("[Email Service] Cannot send email: SendGrid not configured");
    return false;
  }

  if (!ENV.sendgridFromEmail) {
    console.warn("[Email Service] Cannot send email: FROM email not configured");
    return false;
  }

  try {
    const msg = {
      to,
      from: {
        email: ENV.sendgridFromEmail,
        name: "Pathfinder - Veteran Career Transition",
      },
      subject,
      html: htmlContent,
      text: textContent,
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: true,
        },
        openTracking: {
          enable: true,
        },
      },
    };

    await sgMail.send(msg);
    console.log(`[Email Service] Drip email sent successfully to ${to}`);
    return true;
  } catch (error: any) {
    console.error("[Email Service] Failed to send drip email:", error.response?.body || error.message);
    return false;
  }
}
