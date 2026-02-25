import { SignJWT, jwtVerify } from "jose";
import { ENV } from "./env";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-change-in-production");
const SESSION_DURATION_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

export interface SessionPayload {
  userId: number;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Create a JWT session token
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_DURATION_MS / 1000)
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
