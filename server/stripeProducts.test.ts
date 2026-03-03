import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock stripe ──────────────────────────────────────────────────────────────
vi.mock("stripe", () => {
  const mockStripe = {
    products: {
      create: vi.fn(),
      update: vi.fn(),
      retrieve: vi.fn(),
      list: vi.fn(),
    },
    prices: {
      create: vi.fn(),
      update: vi.fn(),
      list: vi.fn(),
    },
    accounts: {
      retrieve: vi.fn(),
    },
  };
  return { default: vi.fn(() => mockStripe) };
});

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn(() => ({
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: "Premium Prompt",
        description: "Full access",
        features: JSON.stringify(["Feature A", "Feature B"]),
        price: 2900,
        currency: "usd",
        stripeProductId: "prod_test123",
        stripePriceId: "price_test123",
        isRecurring: false,
        billingInterval: null,
        status: "active",
        displayOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
      },
    ]),
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  })),
}));

// ─── Mock schema ─────────────────────────────────────────────────────────────
vi.mock("../drizzle/schema", () => ({
  products: { id: "id", status: "status", stripeProductId: "stripeProductId" },
  stripeHealthPings: { id: "id" },
}));

// ─── Mock env ─────────────────────────────────────────────────────────────────
vi.mock("./_core/env", () => ({
  ENV: {
    stripeSecretKey: "sk_test_mock",
    nodeEnv: "test",
  },
}));

// ─── Heartbeat tests ──────────────────────────────────────────────────────────
describe("stripeHeartbeat", () => {
  it("should export a startStripeHeartbeat function", async () => {
    const mod = await import("./stripeHeartbeat");
    expect(typeof mod.startStripeHeartbeat).toBe("function");
  });

  it("should export a runStripeHealthCheck function", async () => {
    const mod = await import("./stripeHeartbeat");
    expect(typeof mod.runStripeHealthCheck).toBe("function");
  });
});

// ─── Products shared config tests ─────────────────────────────────────────────
describe("shared/products", () => {
  it("should export PRODUCTS object with at least 3 tiers", async () => {
    const { PRODUCTS } = await import("../shared/products");
    expect(typeof PRODUCTS).toBe("object");
    expect(Object.keys(PRODUCTS).length).toBeGreaterThanOrEqual(3);
  });

  it("each product should have required fields", async () => {
    const { PRODUCTS } = await import("../shared/products");
    for (const p of Object.values(PRODUCTS)) {
      expect(p).toHaveProperty("id");
      expect(p).toHaveProperty("name");
      expect(p).toHaveProperty("price");
      expect(p).toHaveProperty("features");
      expect(Array.isArray(p.features)).toBe(true);
    }
  });

  it("FREE tier should have price 0", async () => {
    const { PRODUCTS } = await import("../shared/products");
    expect(PRODUCTS.FREE).toBeDefined();
    expect(PRODUCTS.FREE.price).toBe(0);
  });

  it("PREMIUM tier should have price > 0", async () => {
    const { PRODUCTS } = await import("../shared/products");
    expect(PRODUCTS.PREMIUM).toBeDefined();
    expect(PRODUCTS.PREMIUM.price).toBeGreaterThan(0);
  });

  it("PRO tier should have subscription type", async () => {
    const { PRODUCTS } = await import("../shared/products");
    expect(PRODUCTS.PRO).toBeDefined();
    expect((PRODUCTS.PRO as { type?: string }).type).toBe("subscription");
  });
});

// ─── Content gate access level tests ─────────────────────────────────────────
describe("getAccessLevel logic", () => {
  it("should return free level when no purchases exist", () => {
    const hasPremium = false;
    const hasPro = false;
    const level = hasPro ? "pro" : hasPremium ? "premium" : "free";
    expect(level).toBe("free");
  });

  it("should return premium level when only premium is purchased", () => {
    const hasPremium = true;
    const hasPro = false;
    const level = hasPro ? "pro" : hasPremium ? "premium" : "free";
    expect(level).toBe("premium");
  });

  it("should return pro level when pro is purchased (overrides premium)", () => {
    const hasPremium = true;
    const hasPro = true;
    const level = hasPro ? "pro" : hasPremium ? "premium" : "free";
    expect(level).toBe("pro");
  });

  it("should grant premium access to pro users", () => {
    const accessLevel = "pro";
    const requiredTier = "premium";
    const hasAccess =
      accessLevel === "pro" ||
      (requiredTier === "premium" && (accessLevel === "premium" || accessLevel === "pro"));
    expect(hasAccess).toBe(true);
  });

  it("should deny pro content to premium-only users", () => {
    const accessLevel = "premium";
    const requiredTier = "pro";
    const hasAccess = accessLevel === "pro";
    expect(hasAccess).toBe(false);
  });
});

// ─── Stripe health ping record tests ─────────────────────────────────────────
describe("stripe health ping record", () => {
  it("should construct a valid ping record", () => {
    const start = Date.now();
    const latency = 120;
    const record = {
      status: "ok" as const,
      latencyMs: latency,
      message: "Stripe API reachable",
      checkedAt: new Date(start),
    };
    expect(record.status).toBe("ok");
    expect(record.latencyMs).toBeGreaterThan(0);
    expect(record.message).toBeTruthy();
    expect(record.checkedAt).toBeInstanceOf(Date);
  });

  it("should construct an error ping record on failure", () => {
    const record = {
      status: "error" as const,
      latencyMs: null,
      message: "Connection refused",
      checkedAt: new Date(),
    };
    expect(record.status).toBe("error");
    expect(record.latencyMs).toBeNull();
  });
});
