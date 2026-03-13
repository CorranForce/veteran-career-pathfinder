import { describe, it, expect } from "vitest";
import { OAuth2Client } from "google-auth-library";

/**
 * Validates that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are present
 * and that the OAuth2Client can be initialized without errors.
 * 
 * Note: Full end-to-end Google OAuth requires a real browser flow and
 * cannot be automated in vitest. This test validates the credentials
 * are properly formatted and the client initializes correctly.
 */
describe("Google OAuth Credentials", () => {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

  it("should have GOOGLE_CLIENT_ID set", () => {
    expect(clientId).toBeTruthy();
    expect(clientId.length).toBeGreaterThan(10);
  });

  it("should have GOOGLE_CLIENT_SECRET set", () => {
    expect(clientSecret).toBeTruthy();
    expect(clientSecret.length).toBeGreaterThan(5);
  });

  it("should initialize OAuth2Client without errors", () => {
    const redirectUri = `${frontendUrl}/auth/google/callback`;
    expect(() => {
      const client = new OAuth2Client(clientId, clientSecret, redirectUri);
      expect(client).toBeDefined();
    }).not.toThrow();
  });

  it("should generate a valid Google auth URL", () => {
    const redirectUri = `${frontendUrl}/auth/google/callback`;
    const client = new OAuth2Client(clientId, clientSecret, redirectUri);
    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    });
    expect(authUrl).toContain("accounts.google.com");
    expect(authUrl).toContain(encodeURIComponent(clientId));
    console.log("Generated auth URL client_id:", clientId.substring(0, 20) + "...");
  });
});
