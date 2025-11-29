import { describe, it, expect } from "vitest";
import sgMail from "@sendgrid/mail";
import { ENV } from "../_core/env";

describe("SendGrid Email Service", () => {
  it("should have valid SendGrid API credentials configured", async () => {
    // Check that credentials are set
    expect(ENV.sendgridApiKey).toBeTruthy();
    expect(ENV.sendgridFromEmail).toBeTruthy();
    expect(ENV.sendgridFromEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Valid email format

    // Initialize SendGrid
    sgMail.setApiKey(ENV.sendgridApiKey);

    // Test API key validity by attempting to verify it
    // Note: We're not actually sending an email to avoid consuming quota
    // Instead, we validate the API key format and configuration
    expect(ENV.sendgridApiKey.length).toBeGreaterThan(20);
    expect(ENV.sendgridApiKey).toMatch(/^SG\./); // SendGrid API keys start with "SG."
  }, 10000);

  it("should send a test welcome email", async () => {
    const { sendWelcomeEmail } = await import("./email");

    // Send test email to the configured FROM address (so it goes to yourself)
    const result = await sendWelcomeEmail({
      to: ENV.sendgridFromEmail,
      name: "Test User",
    });

    // Email should send successfully
    expect(result).toBe(true);
  }, 15000);
});
