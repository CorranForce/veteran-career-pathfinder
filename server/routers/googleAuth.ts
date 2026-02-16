import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import * as db from "../db";
import { OAuth2Client } from "google-auth-library";
import { ENV } from "../_core/env";
import { sdk } from "../_core/sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

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
          // Create new user
          const userId = await db.createGoogleUser({
            email,
            name: name || email.split("@")[0],
            googleId,
            profilePicture: picture,
          });

          // Log signup activity
          await db.logActivity({
            activityType: "user_signup",
            userName: name || email.split("@")[0],
            userEmail: email,
            description: `New user signed up via Google: ${name || email}`,
            metadata: JSON.stringify({ loginMethod: "google", googleId }),
          });

          // Send welcome email
          try {
            const { sendSignupWelcomeEmail } = await import("../services/email");
            await sendSignupWelcomeEmail({
              to: email,
              name: name || email.split("@")[0],
            });
          } catch (emailError) {
            console.error("[GoogleAuth] Failed to send welcome email:", emailError);
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

        // Create session token
        const sessionToken = await sdk.createSessionToken(`google:${user.id}`, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });

        // Set cookie
        if (ctx.res) {
          const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "lax" as const,
            maxAge: ONE_YEAR_MS,
          };
          ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
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
