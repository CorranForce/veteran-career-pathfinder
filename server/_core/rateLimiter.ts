import rateLimit from "express-rate-limit";

/**
 * Rate limiting middleware for authentication endpoints.
 *
 * Strategy:
 * - Login:           5 attempts per 15 minutes per IP  (brute-force protection)
 * - Signup:         10 attempts per hour per IP        (spam/bot protection)
 * - Password reset:  5 attempts per hour per IP        (enumeration protection)
 *
 * In production the app sits behind a reverse proxy, so we trust the first
 * X-Forwarded-For header.  In development we fall back to req.ip directly.
 */

const isProduction = process.env.NODE_ENV === "production";

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
    // Trust the reverse proxy in production so the real client IP is used
    ...(isProduction ? { trustProxy: 1 } : {}),
    message: {
      error: options.message,
      retryAfter: Math.ceil(options.windowMs / 60_000), // minutes
    },
    // Skip rate limiting in test environment
    skip: () => process.env.NODE_ENV === "test",
    handler: (req, res) => {
      const retryAfterMinutes = Math.ceil(options.windowMs / 60_000);
      res.status(429).json({
        error: options.message,
        retryAfter: retryAfterMinutes,
      });
    },
  });
}

/**
 * Login rate limiter: 5 failed attempts per 15 minutes per IP.
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
 * Applied to POST /api/trpc/emailAuth.requestPasswordReset
 */
export const passwordResetRateLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message:
    "Too many password reset requests from this IP. Please wait 1 hour before trying again.",
});
