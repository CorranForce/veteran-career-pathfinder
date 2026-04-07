import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { OAuth2Client } from "google-auth-library";
import { ENV } from "../_core/env";
import { createSessionToken } from "../_core/session";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Initialize Google OAuth client
const getGoogleOAuthClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials not configured");
  }

  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/google/callback`
  );
};

export const googleAuthRouter = router({
  /**
   * Get Google OAuth authorization URL
   */
  getAuthUrl: publicProcedure.query(() => {
    const client = getGoogleOAuthClient();
    
    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
      prompt: "consent",
    });

    return { authUrl };
  }),

  /**
   * Handle Google OAuth callback
   */
  handleCallback: publicProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const client = getGoogleOAuthClient();

      try {
        // Exchange authorization code for tokens
        const { tokens } = await client.getToken(input.code);
        client.setCredentials(tokens);

        // Get user info from Google
        const ticket = await client.verifyIdToken({
          idToken: tokens.id_token!,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Failed to get user information from Google",
          });
        }

        const { email, name, sub: googleId, picture } = payload;

        // Check if user exists
        let user = await db.getUserByEmail(email);

        if (!user) {
          // Generate a random temporary password so the user can also sign in with email/password
          // The plain-text password is sent in the welcome email; only the hash is stored.
          const temporaryPassword = crypto.randomBytes(8).toString("base64url").slice(0, 12);
          const passwordHash = await bcrypt.hash(temporaryPassword, 10);

          // Create new user with hashed temporary password and mustChangePassword flag
          const userId = await db.createGoogleUser({
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

          // Send welcome email with the temporary password
          try {
            const { sendSignupWelcomeEmail } = await import("../services/email");
            await sendSignupWelcomeEmail({
              to: email,
              name: name || email.split("@")[0],
              temporaryPassword,
            });
          } catch (emailError) {
            console.error("[GoogleAuth] Failed to send welcome email:", emailError);
          }

          // Notify owner of new Google signup
          try {
            const { notifyOwner } = await import("../_core/notification");
            await notifyOwner({
              title: "New User Signup (Google)",
              content: `**${name || email.split("@")[0]}** (${email}) just created an account via Google OAuth.`,
            });
          } catch (err) {
            console.error("[GoogleAuth] Failed to send owner notification:", err);
          }

          // Platform Agent: email owner about new free signup
          try {
            const { notifyOwnerNewSignup } = await import("../platformAgent");
            await notifyOwnerNewSignup({
              name: name || email.split("@")[0],
              email,
              loginMethod: "google",
              signedUpAt: new Date(),
            });
          } catch (err) {
            console.error("[GoogleAuth] Failed to send platform agent signup email:", err);
          }

          user = await db.getUserByEmail(email);
        } else {
          // Update last signed in
          await db.updateUserLastSignIn(user.id);
        }

        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create or retrieve user",
          });
        }

        // Create session token and set it as an httpOnly cookie server-side
        const sessionToken = await createSessionToken({
          userId: user.id,
          email: user.email!,
          name: user.name,
          role: user.role,
        });

        if (ctx.res) {
          ctx.res.cookie(COOKIE_NAME, sessionToken, {
            ...getSessionCookieOptions(ctx.req),
            maxAge: ONE_YEAR_MS,
          });
        }

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      } catch (error: any) {
        console.error("[GoogleAuth] OAuth callback error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to authenticate with Google",
        });
      }
    }),
});
