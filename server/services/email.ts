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

export interface SendSignupWelcomeEmailParams {
  to: string;
  name: string;
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
 * Send welcome email to new signup users (email/password registration)
 */
export async function sendSignupWelcomeEmail({ to, name }: SendSignupWelcomeEmailParams): Promise<boolean> {
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
      subject: "Welcome to Pathfinder - Your Career Transition Starts Now",
      html: getSignupWelcomeEmailTemplate(name),
      text: getSignupWelcomeEmailText(name),
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
    console.log(`[Email Service] Signup welcome email sent successfully to ${to}`);
    return true;
  } catch (error: any) {
    console.error("[Email Service] Failed to send signup welcome email:", error.response?.body || error.message);
    return false;
  }
}

function getSignupWelcomeEmailTemplate(name: string): string {
  const baseUrl = process.env.FRONTEND_URL || "https://vetcarepath-tzppwpga.manus.space";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Pathfinder!</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 18px; margin-bottom: 20px;">Hi ${name},</p>
    
    <p>Thank you for joining 2,847+ veterans who've already started their career transition journey. You've taken the first step toward translating your military service into a successful civilian career.</p>
    
    <h2 style="color: #667eea; margin-top: 30px;">🎯 Your Next Steps:</h2>
    
    <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #333;">1. Browse Resume Templates</h3>
      <p>Check out our ATS-optimized resume templates designed specifically for veterans.</p>
      <a href="${baseUrl}/templates" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Templates</a>
    </div>
    
    <div style="background: white; padding: 20px; border-left: 4px solid #764ba2; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #333;">2. Upload Your Resume</h3>
      <p>Get instant feedback on your resume with our AI-powered analyzer.</p>
      <a href="${baseUrl}/tools" style="display: inline-block; background: #764ba2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Analyze Resume</a>
    </div>
    
    <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #333;">3. Explore Premium Features</h3>
      <p>Unlock the full AI career strategist prompt and get personalized career paths for just $29.</p>
      <a href="${baseUrl}/pricing" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Pricing</a>
    </div>
    
    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 30px 0;">
      <p style="margin: 0; font-weight: bold; color: #856404;">💡 Pro Tip:</p>
      <p style="margin: 5px 0 0 0; color: #856404;">Start with our free resume templates and analyzer to get immediate value, then upgrade to Premium when you're ready for personalized career paths and action plans.</p>
    </div>
    
    <p style="margin-top: 30px;">Questions? Just reply to this email - I read every message personally.</p>
    
    <p style="margin-top: 20px;">Here to support your mission,<br><strong>The Pathfinder Team</strong></p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>You're receiving this email because you signed up at Pathfinder.</p>
    <p>Pathfinder - Veteran Career Transition Strategist</p>
  </div>
</body>
</html>
  `;
}

function getSignupWelcomeEmailText(name: string): string {
  const baseUrl = process.env.FRONTEND_URL || "https://vetcarepath-tzppwpga.manus.space";
  return `
Welcome to Pathfinder, ${name}!

Thank you for joining 2,847+ veterans who've already started their career transition journey. You've taken the first step toward translating your military service into a successful civilian career.

Your Next Steps:

1. Browse Resume Templates
Check out our ATS-optimized resume templates designed specifically for veterans.
Visit: ${baseUrl}/templates

2. Upload Your Resume
Get instant feedback on your resume with our AI-powered analyzer.
Visit: ${baseUrl}/tools

3. Explore Premium Features
Unlock the full AI career strategist prompt and get personalized career paths for just $29.
Visit: ${baseUrl}/pricing

Pro Tip: Start with our free resume templates and analyzer to get immediate value, then upgrade to Premium when you're ready for personalized career paths and action plans.

Questions? Just reply to this email - I read every message personally.

Here to support your mission,
The Pathfinder Team

---
You're receiving this email because you signed up at Pathfinder.
Pathfinder - Veteran Career Transition Strategist
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


export interface SendPurchaseConfirmationEmailParams {
  email: string;
  name: string;
  productType: string;
  promptPdfUrl: string | null;
  resumeTemplatePdfUrl: string | null;
}

/**
 * Send purchase confirmation email with download links for digital assets
 */
export async function sendPurchaseConfirmationEmail({
  email,
  name,
  productType,
  promptPdfUrl,
  resumeTemplatePdfUrl,
}: SendPurchaseConfirmationEmailParams): Promise<boolean> {
  if (!ENV.sendgridApiKey) {
    console.warn("[Email Service] Cannot send email: SendGrid not configured");
    return false;
  }

  if (!ENV.sendgridFromEmail) {
    console.warn("[Email Service] Cannot send email: FROM email not configured");
    return false;
  }

  try {
    const firstName = name?.split(" ")[0] || "Veteran";

    const msg = {
      to: email,
      from: {
        email: ENV.sendgridFromEmail,
        name: "Pathfinder - Veteran Career Transition",
      },
      subject: "🎖️ Your Pathfinder Resources Are Ready!",
      html: getPurchaseConfirmationTemplate(firstName, productType, promptPdfUrl, resumeTemplatePdfUrl),
      text: getPurchaseConfirmationText(firstName, productType, promptPdfUrl, resumeTemplatePdfUrl),
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
    console.log(`[Email Service] Purchase confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("[Email Service] Failed to send purchase confirmation email:", error);
    return false;
  }
}

function getPurchaseConfirmationTemplate(
  firstName: string,
  productType: string,
  promptPdfUrl: string | null,
  resumeTemplatePdfUrl: string | null
): string {
  const isPro = productType === "pro_subscription";

  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #002a4d; border-bottom: 3px solid #d4a574; padding-bottom: 10px;">
            Welcome to Pathfinder, ${firstName}! 🎖️
          </h1>

          <p>Your purchase is confirmed and your resources are ready to download.</p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #002a4d; margin-top: 0;">Your Downloads</h2>

            ${
              promptPdfUrl
                ? `
              <div style="margin-bottom: 15px;">
                <a href="${promptPdfUrl}" style="display: inline-block; background-color: #002a4d; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">
                  📄 Download Optimized Prompt PDF
                </a>
                <p style="margin-top: 8px; font-size: 14px; color: #666;">
                  The complete AI prompt optimized for your military-to-civilian career transition
                </p>
              </div>
            `
                : ""
            }

            ${
              resumeTemplatePdfUrl
                ? `
              <div style="margin-bottom: 15px;">
                <a href="${resumeTemplatePdfUrl}" style="display: inline-block; background-color: #d4a574; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold;">
                  📋 Download Resume Translation Template
                </a>
                <p style="margin-top: 8px; font-size: 14px; color: #666;">
                  Translate your military experience into civilian language
                </p>
              </div>
            `
                : ""
            }
          </div>

          <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #002a4d;">
            <h3 style="color: #002a4d; margin-top: 0;">Next Steps</h3>
            <ol style="color: #333;">
              <li>Download your resources above</li>
              <li>Use the prompt with your favorite AI tool (ChatGPT, Claude, Gemini, etc.)</li>
              <li>Follow the 30-day action plan for your career transition</li>
              ${isPro ? "<li>Join our private veteran community for ongoing support</li>" : ""}
            </ol>
          </div>

          <p style="color: #666; font-size: 14px;">
            Questions? Reply to this email or visit our support page at pathfinder.manus.space
          </p>

          <p style="color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 40px;">
            Pathfinder - Empowering Veterans to Translate Their Service Into Successful Civilian Careers
          </p>
        </div>
      </body>
    </html>
  `;
}

function getPurchaseConfirmationText(
  firstName: string,
  productType: string,
  promptPdfUrl: string | null,
  resumeTemplatePdfUrl: string | null
): string {
  const isPro = productType === "pro_subscription";

  let text = `Welcome to Pathfinder, ${firstName}!\n\n`;
  text += `Your purchase is confirmed and your resources are ready to download.\n\n`;
  text += `YOUR DOWNLOADS:\n`;

  if (promptPdfUrl) {
    text += `- Optimized Prompt PDF: ${promptPdfUrl}\n`;
  }

  if (resumeTemplatePdfUrl) {
    text += `- Resume Translation Template: ${resumeTemplatePdfUrl}\n`;
  }

  text += `\nNEXT STEPS:\n`;
  text += `1. Download your resources\n`;
  text += `2. Use the prompt with your favorite AI tool\n`;
  text += `3. Follow the 30-day action plan\n`;

  if (isPro) {
    text += `4. Join our private veteran community\n`;
  }

  text += `\nQuestions? Reply to this email or visit pathfinder.manus.space\n`;

  return text;
}
