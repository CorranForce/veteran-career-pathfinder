/**
 * Blog Subscription API Tests
 *
 * Tests the blogSubscription tRPC router procedures:
 *   - subscribe: new email, duplicate active, reactivate unsubscribed
 *   - verifyEmail: valid token, invalid token, expired token, already verified
 *   - unsubscribe: valid token, invalid token
 *   - updatePreferences: active subscriber, not found, inactive subscriber
 *
 * Strategy: vi.mock factories are hoisted before any imports, so they cannot
 * reference variables defined in the module scope. Instead, we expose a
 * mutable `__store` on the mock module so tests can manipulate it directly.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "../_core/context";

// ---------------------------------------------------------------------------
// Mocks — factories must be self-contained (no outer variable references)
// ---------------------------------------------------------------------------

vi.mock("../services/email", () => ({
  sendBlogSubscriptionVerification: vi.fn().mockResolvedValue(undefined),
  sendBlogUpdateNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../db", () => {
  // In-memory subscriber store shared across tests via module-level state
  type Sub = {
    id: number;
    email: string;
    subscribeToNewPosts: boolean;
    subscribeToFeatures: boolean;
    subscribeToBugFixes: boolean;
    status: "active" | "unsubscribed" | "bounced";
    isVerified: boolean;
    verificationToken: string | null;
    verificationTokenExpiry: Date | null;
    unsubscribeToken: string;
    subscribedAt: Date;
    verifiedAt: Date | null;
    unsubscribedAt: Date | null;
    lastEmailSentAt: Date | null;
  };

  const store: Sub[] = [];
  let idSeq = 1;

  function findByField(field: keyof Sub, value: unknown): Sub | undefined {
    return store.find((s) => s[field] === value);
  }

  const db = {
    // Expose store so tests can seed / inspect it
    __store: store,
    __reset() {
      store.length = 0;
      idSeq = 1;
    },
    __add(partial: Partial<Sub> & { email: string; unsubscribeToken: string }): Sub {
      const sub: Sub = {
        id: idSeq++,
        subscribeToNewPosts: true,
        subscribeToFeatures: true,
        subscribeToBugFixes: true,
        status: "active",
        isVerified: false,
        verificationToken: null,
        verificationTokenExpiry: null,
        subscribedAt: new Date(),
        verifiedAt: null,
        unsubscribedAt: null,
        lastEmailSentAt: null,
        ...partial,
      };
      store.push(sub);
      return sub;
    },

    select() {
      return {
        from(_table: unknown) {
          return {
            where(cond: unknown) {
              return {
                limit(_n: number) {
                  // cond is a Drizzle SQL object — we can't evaluate it directly.
                  // The router always queries by a single field (verificationToken,
                  // unsubscribeToken, or email). We intercept via __lastQuery set
                  // by the test helpers below.
                  const result = db.__pendingSelectResult ?? [];
                  db.__pendingSelectResult = undefined;
                  return Promise.resolve(result);
                },
              };
            },
            orderBy(_col: unknown) {
              return Promise.resolve([...store]);
            },
          };
        },
      };
    },

    insert(_table: unknown) {
      return {
        values(values: Partial<Sub>) {
          const sub: Sub = {
            id: idSeq++,
            email: values.email!,
            subscribeToNewPosts: values.subscribeToNewPosts ?? true,
            subscribeToFeatures: values.subscribeToFeatures ?? true,
            subscribeToBugFixes: values.subscribeToBugFixes ?? true,
            status: values.status ?? "active",
            isVerified: values.isVerified ?? false,
            verificationToken: values.verificationToken ?? null,
            verificationTokenExpiry: values.verificationTokenExpiry ?? null,
            unsubscribeToken: values.unsubscribeToken!,
            subscribedAt: new Date(),
            verifiedAt: null,
            unsubscribedAt: null,
            lastEmailSentAt: null,
          };
          store.push(sub);
          return Promise.resolve();
        },
      };
    },

    update(_table: unknown) {
      return {
        set(values: Partial<Sub>) {
          return {
            where(_cond: unknown) {
              // Apply update to the pending target set by test helpers
              if (db.__pendingUpdateTarget) {
                Object.assign(db.__pendingUpdateTarget, values);
                db.__pendingUpdateTarget = undefined;
              }
              return Promise.resolve();
            },
          };
        },
      };
    },

    // Internal helpers for test coordination
    __pendingSelectResult: undefined as Sub[] | undefined,
    __pendingUpdateTarget: undefined as Sub | undefined,

    // Convenience: configure what the next select().where().limit() returns
    __mockSelect(result: Sub[]) {
      db.__pendingSelectResult = result;
    },
    // Convenience: configure which subscriber the next update().set().where() targets
    __mockUpdateTarget(sub: Sub) {
      db.__pendingUpdateTarget = sub;
    },
  };

  return {
    getDb: vi.fn().mockResolvedValue(db),
    __db: db,
  };
});

// ---------------------------------------------------------------------------
// Import router and mocks AFTER vi.mock declarations
// ---------------------------------------------------------------------------
import { blogSubscriptionRouter } from "./blogSubscription";
import { sendBlogSubscriptionVerification } from "../services/email";
import { getDb } from "../db";

// Access the shared in-memory db instance
const dbModule = await import("../db") as unknown as { __db: ReturnType<typeof buildDbType> };
type DbType = {
  __store: unknown[];
  __reset(): void;
  __add(p: { email: string; unsubscribeToken: string; [k: string]: unknown }): unknown;
  __mockSelect(result: unknown[]): void;
  __mockUpdateTarget(sub: unknown): void;
};
function buildDbType() { return {} as DbType; }
const db = (dbModule as unknown as { __db: DbType }).__db;

// ---------------------------------------------------------------------------
// Helper: create tRPC contexts
// ---------------------------------------------------------------------------
function publicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function caller() {
  return blogSubscriptionRouter.createCaller(publicCtx());
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("blogSubscription.subscribe", () => {
  beforeEach(() => {
    db.__reset();
    vi.clearAllMocks();
  });

  it("creates a new subscriber with pending status and sends verification email", async () => {
    // No pre-existing subscriber — first select returns empty
    db.__mockSelect([]);

    const result = await caller().subscribe({
      email: "newuser@example.com",
      subscribeToNewPosts: true,
      subscribeToFeatures: true,
      subscribeToBugFixes: true,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Verification email sent");
    expect(db.__store).toHaveLength(1);
    expect((db.__store[0] as { email: string }).email).toBe("newuser@example.com");
    expect((db.__store[0] as { isVerified: boolean }).isVerified).toBe(false);
    expect(sendBlogSubscriptionVerification).toHaveBeenCalledOnce();
    expect(sendBlogSubscriptionVerification).toHaveBeenCalledWith(
      "newuser@example.com",
      expect.any(String)
    );
  });

  it("throws BAD_REQUEST when email is already actively subscribed", async () => {
    const existing = db.__add({
      email: "existing@example.com",
      unsubscribeToken: "tok-unsub",
      status: "active",
      isVerified: true,
    });
    db.__mockSelect([existing]);

    await expect(
      caller().subscribe({ email: "existing@example.com" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("reactivates a previously unsubscribed email and sends verification email", async () => {
    const existing = db.__add({
      email: "returning@example.com",
      unsubscribeToken: "old-unsub-token",
      status: "unsubscribed",
      isVerified: true,
      unsubscribedAt: new Date(),
    });
    db.__mockSelect([existing]);
    db.__mockUpdateTarget(existing);

    const result = await caller().subscribe({ email: "returning@example.com" });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Verification email sent");
    expect((existing as { status: string }).status).toBe("active");
    expect(sendBlogSubscriptionVerification).toHaveBeenCalledOnce();
  });
});

describe("blogSubscription.verifyEmail", () => {
  beforeEach(() => {
    db.__reset();
    vi.clearAllMocks();
  });

  it("verifies a subscriber with a valid non-expired token", async () => {
    const sub = db.__add({
      email: "verify@example.com",
      unsubscribeToken: "unsub-tok",
      verificationToken: "valid-token-123",
      verificationTokenExpiry: new Date(Date.now() + 60_000),
      isVerified: false,
    });
    db.__mockSelect([sub]);
    db.__mockUpdateTarget(sub);

    const result = await caller().verifyEmail({ token: "valid-token-123" });

    expect(result.success).toBe(true);
    expect(result.message).toContain("verified");
    expect((sub as { isVerified: boolean }).isVerified).toBe(true);
  });

  it("returns success without re-verifying an already-verified subscriber", async () => {
    const sub = db.__add({
      email: "alreadyverified@example.com",
      unsubscribeToken: "unsub-tok",
      verificationToken: "valid-token-456",
      verificationTokenExpiry: new Date(Date.now() + 60_000),
      isVerified: true,
    });
    db.__mockSelect([sub]);

    const result = await caller().verifyEmail({ token: "valid-token-456" });

    expect(result.success).toBe(true);
    expect(result.message).toContain("already verified");
  });

  it("throws BAD_REQUEST for an invalid (non-existent) verification token", async () => {
    db.__mockSelect([]); // token not found

    await expect(
      caller().verifyEmail({ token: "does-not-exist" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws BAD_REQUEST for an expired verification token", async () => {
    const sub = db.__add({
      email: "expired@example.com",
      unsubscribeToken: "unsub-tok",
      verificationToken: "expired-token",
      verificationTokenExpiry: new Date(Date.now() - 60_000), // 1 min in the past
      isVerified: false,
    });
    db.__mockSelect([sub]);

    await expect(
      caller().verifyEmail({ token: "expired-token" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("blogSubscription.unsubscribe", () => {
  beforeEach(() => {
    db.__reset();
    vi.clearAllMocks();
  });

  it("marks a subscriber as unsubscribed with a valid token", async () => {
    const sub = db.__add({
      email: "unsub@example.com",
      unsubscribeToken: "real-unsub-token",
      status: "active",
      isVerified: true,
    });
    db.__mockSelect([sub]);
    db.__mockUpdateTarget(sub);

    const result = await caller().unsubscribe({ token: "real-unsub-token" });

    expect(result.success).toBe(true);
    expect(result.message).toContain("unsubscribed");
    expect((sub as { status: string }).status).toBe("unsubscribed");
  });

  it("throws BAD_REQUEST for an invalid unsubscribe token", async () => {
    db.__add({
      email: "valid@example.com",
      unsubscribeToken: "correct-token",
      status: "active",
    });
    db.__mockSelect([]); // token not found

    await expect(
      caller().unsubscribe({ token: "wrong-token" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("blogSubscription.updatePreferences", () => {
  beforeEach(() => {
    db.__reset();
    vi.clearAllMocks();
  });

  it("updates subscription preferences for an active subscriber", async () => {
    const sub = db.__add({
      email: "prefs@example.com",
      unsubscribeToken: "tok",
      status: "active",
      subscribeToNewPosts: true,
      subscribeToFeatures: true,
      subscribeToBugFixes: true,
    });
    db.__mockSelect([sub]);
    db.__mockUpdateTarget(sub);

    const result = await caller().updatePreferences({
      email: "prefs@example.com",
      subscribeToNewPosts: false,
      subscribeToFeatures: true,
      subscribeToBugFixes: false,
    });

    expect(result.success).toBe(true);
    expect((sub as { subscribeToNewPosts: boolean }).subscribeToNewPosts).toBe(false);
    expect((sub as { subscribeToFeatures: boolean }).subscribeToFeatures).toBe(true);
    expect((sub as { subscribeToBugFixes: boolean }).subscribeToBugFixes).toBe(false);
  });

  it("throws NOT_FOUND when email does not exist", async () => {
    db.__mockSelect([]); // no subscriber found

    await expect(
      caller().updatePreferences({
        email: "ghost@example.com",
        subscribeToNewPosts: true,
        subscribeToFeatures: true,
        subscribeToBugFixes: true,
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("throws BAD_REQUEST when subscriber is not active", async () => {
    const sub = db.__add({
      email: "inactive@example.com",
      unsubscribeToken: "tok",
      status: "unsubscribed",
    });
    db.__mockSelect([sub]);

    await expect(
      caller().updatePreferences({
        email: "inactive@example.com",
        subscribeToNewPosts: true,
        subscribeToFeatures: true,
        subscribeToBugFixes: true,
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
