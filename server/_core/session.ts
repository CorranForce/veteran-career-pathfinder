import { SignJWT, jwtVerify } from "jose";
import { ONE_YEAR_MS, ONE_DAY_MS } from "@shared/const";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-change-in-production");

export interface SessionPayload {
  userId: number;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Create a JWT session token.
 * @param payload - The session data to encode.
 * @param expiresInMs - Optional TTL in milliseconds. Defaults to ONE_YEAR_MS (1 year).
 *                      Pass ONE_DAY_MS for short-lived "no remember me" sessions.
 */
export async function createSessionToken(
  payload: SessionPayload,
  expiresInMs: number = ONE_YEAR_MS
): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + Math.floor(expiresInMs / 1000))
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    console.error("[Session] Token verification failed:", error);
    return null;
  }
}
