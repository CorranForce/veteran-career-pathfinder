import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

/**
 * Rate limiting middleware for authentication endpoints.
 *
 * Strategy:
 * - Login:           5 attempts per 15 minutes per IP  (brute-force protection)
 * - Signup:         10 attempts per hour per IP        (spam/bot protection)
 * - Password reset:  5 attempts per hour per IP        (enumeration protection)
 *
 * Every 429 response is logged to the admin activity log (admin_activity_logs)
 * with the client IP, targeted endpoint, and User-Agent for audit purposes.
 *
 * In production the app sits behind a reverse proxy, so we trust the first
 * X-Forwarded-For header.  In development we fall back to req.ip directly.
 */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Resolve the real client IP, honouring X-Forwarded-For in production.
 */
function getClientIp(req: Request): string {
  if (isProduction) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      return (Array.isArray(forwarded) ? forwarded[0] : forwarded)
        .split(",")[0]
        .trim();
    }
  }
  return req.ip ?? req.socket?.remoteAddress ?? "unknown";
}

function buildLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: "draft-7", // Return RateLimit-* headers (RFC 9110)
    legacyHeaders: false,
    // Skip rate limiting in test environment so integration tests are unaffected
    skip: () => process.env.NODE_ENV === "test",
    handler: async (req: Request, res: Response) => {
      const ip = getClientIp(req);
      const endpoint = req.path;
      const userAgent = req.headers["user-agent"];
      const retryAfterMinutes = Math.ceil(options.windowMs / 60_000);

      // Log the event asynchronously — never block the response
      import("../db")
        .then(({ logRateLimitEvent }) =>
          logRateLimitEvent({ ip, endpoint, userAgent })
        )
        .catch((err) =>
          console.error("[RateLimit] Failed to import db for logging:", err)
        );

      console.warn(
        `[RateLimit] 429 blocked — endpoint: ${endpoint}, ip: ${ip}, ua: ${userAgent ?? "unknown"}`
      );

      res.status(429).json({
        error: options.message,
        retryAfter: retryAfterMinutes,
      });
    },
  });
}

/**
 * Login rate limiter: 5 attempts per 15 minutes per IP.
 * Applied to POST /api/trpc/emailAuth.login
 */
export const loginRateLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message:
    "Too many login attempts from this IP. Please wait 15 minutes before trying again.",
});

/**
 * Signup rate limiter: 10 accounts per hour per IP.
 * Applied to POST /api/trpc/emailAuth.signup
 */
export const signupRateLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message:
    "Too many accounts created from this IP. Please wait 1 hour before trying again.",
});

/**
 * Password-reset rate limiter: 5 requests per hour per IP.
 * Applied to POST /api/trpc/emailAuth.requestPasswordReset and emailAuth.resetPassword
 */
export const passwordResetRateLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message:
    "Too many password reset requests from this IP. Please wait 1 hour before trying again.",
});
