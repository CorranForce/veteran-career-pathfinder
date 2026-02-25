import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { verifySessionToken } from "./session";
import * as db from "../db";
import { COOKIE_NAME } from "@shared/const";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Get session token from cookie
    const cookies = opts.req.headers.cookie;
    if (cookies) {
      const cookieMatch = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      if (cookieMatch) {
        const sessionToken = cookieMatch[1];
        const payload = await verifySessionToken(sessionToken);
        
        if (payload) {
          // Get user from database
          const foundUser = await db.getUserById(payload.userId);
          user = foundUser || null;
        }
      }
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
