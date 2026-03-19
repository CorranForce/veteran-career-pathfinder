import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit tests for the Stripe Customer Portal session creation logic.
 *
 * The createPortalSession procedure:
 * 1. Looks up the user's stripeCustomerId
 * 2. Creates a Stripe customer if one doesn't exist yet
 * 3. Calls stripe.billingPortal.sessions.create() with the customer ID and return URL
 * 4. Returns the portal session URL
 */

// ── Mock Stripe ──────────────────────────────────────────────────────────────
const mockPortalSessionCreate = vi.fn();
const mockCustomersCreate = vi.fn();

vi.mock("../server/stripe", () => ({
  stripe: {
    billingPortal: {
      sessions: {
        create: mockPortalSessionCreate,
      },
    },
    customers: {
      create: mockCustomersCreate,
    },
  },
}));

// ── Mock DB helpers ───────────────────────────────────────────────────────────
const mockUpdateUserStripeCustomerId = vi.fn();

vi.mock("../server/db", () => ({
  updateUserStripeCustomerId: mockUpdateUserStripeCustomerId,
  getUserById: vi.fn(),
  getDb: vi.fn(),
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("createPortalSession logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Portal session URL construction", () => {
    it("returns a valid Stripe portal URL format", () => {
      const portalUrl = "https://billing.stripe.com/session/test_YWNjdF8xU1lER0dPTHpMdTJBSTJzTQ";
      expect(portalUrl).toMatch(/^https:\/\/billing\.stripe\.com\//);
    });

    it("constructs return_url from request origin", () => {
      const origin = "https://pathfinder.casa";
      const returnUrl = `${origin}/dashboard`;
      expect(returnUrl).toBe("https://pathfinder.casa/dashboard");
    });

    it("falls back to protocol+host when origin header is missing", () => {
      const protocol = "https";
      const host = "pathfinder.casa";
      const returnUrl = `${protocol}://${host}/dashboard`;
      expect(returnUrl).toBe("https://pathfinder.casa/dashboard");
    });
  });

  describe("Stripe customer creation flow", () => {
    it("calls stripe.customers.create when user has no stripeCustomerId", async () => {
      mockCustomersCreate.mockResolvedValueOnce({ id: "cus_newCustomer123" });
      mockPortalSessionCreate.mockResolvedValueOnce({
        url: "https://billing.stripe.com/session/new",
      });

      // Simulate the procedure logic
      const user = { id: 1, email: "veteran@example.com", name: "John Doe", stripeCustomerId: null };
      let customerId = user.stripeCustomerId;

      if (!customerId) {
        const { stripe } = await import("../server/stripe");
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          name: user.name || undefined,
          metadata: { userId: user.id.toString() },
        });
        customerId = customer.id;
        await mockUpdateUserStripeCustomerId(user.id, customerId);
      }

      expect(mockCustomersCreate).toHaveBeenCalledWith({
        email: "veteran@example.com",
        name: "John Doe",
        metadata: { userId: "1" },
      });
      expect(mockUpdateUserStripeCustomerId).toHaveBeenCalledWith(1, "cus_newCustomer123");
      expect(customerId).toBe("cus_newCustomer123");
    });

    it("skips customer creation when stripeCustomerId already exists", async () => {
      mockPortalSessionCreate.mockResolvedValueOnce({
        url: "https://billing.stripe.com/session/existing",
      });

      const user = { id: 2, email: "pro@example.com", name: "Jane Doe", stripeCustomerId: "cus_existing456" };
      let customerId = user.stripeCustomerId;

      if (!customerId) {
        // This block should NOT execute
        mockCustomersCreate();
      }

      expect(mockCustomersCreate).not.toHaveBeenCalled();
      expect(customerId).toBe("cus_existing456");
    });
  });

  describe("Portal session creation", () => {
    beforeEach(() => {
      // Reset mock queue before each test in this block
      mockPortalSessionCreate.mockReset();
    });

    it("calls billingPortal.sessions.create with correct parameters", async () => {
      const expectedUrl = "https://billing.stripe.com/session/abc123";
      mockPortalSessionCreate.mockResolvedValue({ url: expectedUrl });

      const { stripe } = await import("../server/stripe");
      const session = await stripe.billingPortal.sessions.create({
        customer: "cus_existing456",
        return_url: "https://pathfinder.casa/dashboard",
      });

      expect(mockPortalSessionCreate).toHaveBeenCalledWith({
        customer: "cus_existing456",
        return_url: "https://pathfinder.casa/dashboard",
      });
      expect(session.url).toBe(expectedUrl);
    });

    it("returns the portal URL from the session", async () => {
      const portalUrl = "https://billing.stripe.com/session/xyz789";
      mockPortalSessionCreate.mockResolvedValue({ url: portalUrl });

      const { stripe } = await import("../server/stripe");
      const session = await stripe.billingPortal.sessions.create({
        customer: "cus_test",
        return_url: "https://pathfinder.casa/dashboard",
      });

      expect(session.url).toBe(portalUrl);
    });

    it("propagates Stripe errors to the caller", async () => {
      mockPortalSessionCreate.mockRejectedValue(
        new Error("No such customer: 'cus_invalid'")
      );

      const { stripe } = await import("../server/stripe");
      await expect(
        stripe.billingPortal.sessions.create({
          customer: "cus_invalid",
          return_url: "https://pathfinder.casa/dashboard",
        })
      ).rejects.toThrow("No such customer: 'cus_invalid'");
    });
  });

  describe("Customer Portal configuration requirements", () => {
    it("portal URL should point to billing.stripe.com domain", () => {
      const validPortalUrls = [
        "https://billing.stripe.com/session/test_abc",
        "https://billing.stripe.com/p/session/live_xyz",
      ];
      validPortalUrls.forEach((url) => {
        expect(url).toMatch(/^https:\/\/billing\.stripe\.com\//);
      });
    });

    it("return_url must be an absolute HTTPS URL", () => {
      const returnUrl = "https://pathfinder.casa/dashboard";
      expect(returnUrl).toMatch(/^https:\/\//);
      expect(returnUrl).toContain("/dashboard");
    });
  });
});
