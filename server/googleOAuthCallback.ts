/**
 * Server-side Google OAuth callback handler.
 *
 * Google redirects the browser to /auth/google/callback?code=... after the
 * user approves access. This Express route handles the exchange server-side
 * and sets the session cookie in the HTTP response of a first-party navigation,
 * which avoids the SameSite / Cloudflare cookie-stripping issues that occur
 * when the cookie is set inside a client-side tRPC fetch response.
 */
import type { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as db from "./db";
import { createSessionToken } from "./_core/session";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

function getGoogleOAuthClient() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials not configured");
  }
  const redirectUri = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/google/callback`;
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

export async function handleGoogleOAuthCallback(req: Request, res: Response) {
  const { code, error: oauthError } = req.query as Record<string, string>;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  if (oauthError) {
    console.error("[GoogleOAuth] Error from Google:", oauthError);
    return res.redirect(`${frontendUrl}/login?error=oauth_cancelled`);
  }

  if (!code) {
    console.error("[GoogleOAuth] No authorization code in callback");
    return res.redirect(`${frontendUrl}/login?error=no_code`);
  }

  try {
    const client = getGoogleOAuthClient();

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Verify the ID token and extract user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.redirect(`${frontendUrl}/login?error=no_user_info`);
    }

    const { email, name, sub: googleId, picture } = payload;

    // Find or create user
    let user = await db.getUserByEmail(email);

    if (!user) {
      const temporaryPassword = crypto.randomBytes(8).toString("base64url").slice(0, 12);
      const passwordHash = await bcrypt.hash(temporaryPassword, 10);

      await db.createGoogleUser({
        email,
        name: name || email.split("@")[0],
        googleId,
        profilePicture: picture,
        passwordHash,
        mustChangePassword: true,
      });

      // Log signup activity
      await db.logActivity({
        activityType: "user_signup",
        userName: name || email.split("@")[0],
        userEmail: email,
        description: `New user signed up via Google: ${name || email}`,
        metadata: JSON.stringify({ loginMethod: "google", googleId }),
      });

      // Send welcome email (non-blocking)
      import("./services/email").then(({ sendSignupWelcomeEmail }) =>
        sendSignupWelcomeEmail({ to: email, name: name || email.split("@")[0], temporaryPassword })
      ).catch(err => console.error("[GoogleOAuth] Welcome email failed:", err));

      // Notify owner (non-blocking)
      import("./_core/notification").then(({ notifyOwner }) =>
        notifyOwner({ title: "New User Signup (Google)", content: `**${name || email}** (${email}) just signed up via Google OAuth.` })
      ).catch(err => console.error("[GoogleOAuth] Owner notification failed:", err));

      user = await db.getUserByEmail(email);
    } else {
      await db.updateUserLastSignIn(user.id);
    }

    if (!user) {
      return res.redirect(`${frontendUrl}/login?error=user_creation_failed`);
    }

    // Create session token
    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email!,
      name: user.name,
      role: user.role,
    });

    // Set the session cookie in this first-party navigation response
    res.cookie(COOKIE_NAME, sessionToken, {
      ...getSessionCookieOptions(req),
      maxAge: ONE_YEAR_MS,
    });

    // Redirect to the intended destination
    // The client stores the intended path in sessionStorage under 'loginNext'.
    // For server-side Google OAuth we can't read sessionStorage, but we can
    // pass the next path via the OAuth state param (set by the client when
    // initiating the flow). For now, default to /tools — the client-side
    // Login page handles the ?next= redirect for email/password logins.
    const nextPath = "/tools";
    return res.redirect(`${frontendUrl}${nextPath}`);
  } catch (err: any) {
    console.error("[GoogleOAuth] Callback error:", err);
    return res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
}
