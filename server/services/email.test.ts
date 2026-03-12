import { describe, it, expect, vi, beforeEach } from "vitest";
import { ENV } from "../_core/env";

// Mock @sendgrid/mail so no real emails are sent in tests
vi.mock("@sendgrid/mail", () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{ statusCode: 202 }, {}]),
  },
}));

describe("SendGrid Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have SendGrid credentials configured in ENV", () => {
    expect(ENV.sendgridApiKey).toBeTruthy();
    expect(ENV.sendgridFromEmail).toBeTruthy();
    expect(ENV.sendgridFromEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(ENV.sendgridApiKey.length).toBeGreaterThan(20);
    expect(ENV.sendgridApiKey).toMatch(/^SG\./);
  });

  it("should call sendWelcomeEmail without throwing", async () => {
    const { sendWelcomeEmail } = await import("./email");

    // With the mocked SendGrid, this should succeed
    const result = await sendWelcomeEmail({
      to: "test@example.com",
      name: "Test User",
    });

    // The function should return true on success
    expect(result).toBe(true);
  }, 10000);

  it("should call sendPasswordResetEmail without throwing", async () => {
    const { sendPasswordResetEmail } = await import("./email");

    const result = await sendPasswordResetEmail({
      to: "test@example.com",
      name: "Test User",
      resetUrl: "https://example.com/reset?token=abc123",
    });

    expect(result).toBe(true);
  }, 10000);
});
