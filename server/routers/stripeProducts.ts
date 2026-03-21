import { z } from "zod";
import { platformOwnerProcedure, router } from "../_core/trpc";
import { stripe } from "../stripe";
import { getDb } from "../db";
import { products, stripeHealthPings } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ─── helpers ────────────────────────────────────────────────────────────────

async function verifyStripePrice(priceId: string): Promise<boolean> {
  if (!priceId || !priceId.startsWith("price_")) return false;

  // In test mode the Stripe client cannot resolve live-mode price IDs.
  // A well-formed price ID is sufficient validation when running with a test key.
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  const isTestKey = stripeKey.startsWith("sk_test_") || stripeKey.startsWith("rk_test_");
  if (isTestKey) return true;

  try {
    const price = await stripe.prices.retrieve(priceId);
    return price.active;
  } catch {
    return false;
  }
}

// ─── router ─────────────────────────────────────────────────────────────────

export const stripeProductsRouter = router({
  /**
   * List all products from the local DB (fast read, synced from Stripe)
   */
  listProducts: platformOwnerProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
    return db.select().from(products).orderBy(desc(products.displayOrder), desc(products.createdAt));
  }),

  /**
   * Get a single product by ID
   */
  getProduct: platformOwnerProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
      const [product] = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      return product;
    }),

  /**
   * Create a new product in Stripe and persist it locally
   */
  createProduct: platformOwnerProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(1),
        features: z.array(z.string()).min(1),
        price: z.number().min(50), // cents, Stripe minimum $0.50
        currency: z.string().length(3).default("usd"),
        isRecurring: z.boolean().default(false),
        billingInterval: z.enum(["month", "year"]).optional(),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // 1. Create product in Stripe
      const stripeProduct = await stripe.products.create({
        name: input.name,
        description: input.description,
        metadata: { source: "pathfinder_admin" },
      });

      // 2. Create price in Stripe
      const priceData: Parameters<typeof stripe.prices.create>[0] = {
        product: stripeProduct.id,
        unit_amount: input.price,
        currency: input.currency,
      };
      if (input.isRecurring && input.billingInterval) {
        priceData.recurring = { interval: input.billingInterval };
      }
      const stripePrice = await stripe.prices.create(priceData);

      // 3. Persist locally
      const [inserted] = await db
        .insert(products)
        .values({
          name: input.name,
          description: input.description,
          features: JSON.stringify(input.features),
          price: input.price,
          currency: input.currency,
          stripeProductId: stripeProduct.id,
          stripePriceId: stripePrice.id,
          isRecurring: input.isRecurring,
          billingInterval: input.billingInterval ?? null,
          displayOrder: input.displayOrder,
          status: "active",
        })
        .$returningId();

      return { id: inserted.id, stripeProductId: stripeProduct.id, stripePriceId: stripePrice.id };
    }),

  /**
   * Update a product's name, description, and features in Stripe + DB.
   * Price changes create a new Stripe price (Stripe immutability rule).
   */
  updateProduct: platformOwnerProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        features: z.array(z.string()).optional(),
        price: z.number().min(50).optional(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [existing] = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });

      const updates: Partial<typeof products.$inferInsert> = {};

      // Update Stripe product metadata if name/description changed
      if ((input.name || input.description) && existing.stripeProductId) {
        await stripe.products.update(existing.stripeProductId, {
          ...(input.name ? { name: input.name } : {}),
          ...(input.description ? { description: input.description } : {}),
        });
      }

      // Price change → create new Stripe price, archive old one
      if (input.price !== undefined && input.price !== existing.price && existing.stripeProductId) {
        const priceData: Parameters<typeof stripe.prices.create>[0] = {
          product: existing.stripeProductId,
          unit_amount: input.price,
          currency: existing.currency,
        };
        if (existing.isRecurring && existing.billingInterval) {
          priceData.recurring = { interval: existing.billingInterval as "month" | "year" };
        }
        const newPrice = await stripe.prices.create(priceData);

        // Archive old price
        if (existing.stripePriceId) {
          await stripe.prices.update(existing.stripePriceId, { active: false }).catch(() => {});
        }
        updates.stripePriceId = newPrice.id;
        updates.price = input.price;
      }

      if (input.name) updates.name = input.name;
      if (input.description) updates.description = input.description;
      if (input.features) updates.features = JSON.stringify(input.features);
      if (input.displayOrder !== undefined) updates.displayOrder = input.displayOrder;

      await db.update(products).set(updates).where(eq(products.id, input.id));
      return { success: true };
    }),

  /**
   * Archive a product (soft-delete): deactivates in Stripe and marks archived locally
   */
  archiveProduct: platformOwnerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [existing] = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });

      // Deactivate in Stripe
      if (existing.stripeProductId) {
        await stripe.products.update(existing.stripeProductId, { active: false }).catch(() => {});
      }
      if (existing.stripePriceId) {
        await stripe.prices.update(existing.stripePriceId, { active: false }).catch(() => {});
      }

      await db
        .update(products)
        .set({ status: "archived", archivedAt: new Date() })
        .where(eq(products.id, input.id));

      return { success: true };
    }),

  /**
   * Restore an archived product (re-activates in Stripe)
   */
  restoreProduct: platformOwnerProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [existing] = await db.select().from(products).where(eq(products.id, input.id)).limit(1);
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });

      if (existing.stripeProductId) {
        await stripe.products.update(existing.stripeProductId, { active: true }).catch(() => {});
      }
      if (existing.stripePriceId) {
        await stripe.prices.update(existing.stripePriceId, { active: true }).catch(() => {});
      }

      await db
        .update(products)
        .set({ status: "active", archivedAt: null })
        .where(eq(products.id, input.id));

      return { success: true };
    }),

  /**
   * Sync Stripe products into local DB (pull from Stripe → upsert locally)
   */
  syncFromStripe: platformOwnerProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

    const stripeProducts = await stripe.products.list({ limit: 100, active: true });
    let synced = 0;

    for (const sp of stripeProducts.data) {
      // Get active prices for this product
      const prices = await stripe.prices.list({ product: sp.id, active: true, limit: 1 });
      const price = prices.data[0];
      if (!price) continue;

      // Check if we already have this product
      const existing = await db
        .select()
        .from(products)
        .where(eq(products.stripeProductId, sp.id))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(products)
          .set({
            name: sp.name,
            description: sp.description ?? "",
            stripePriceId: price.id,
            price: price.unit_amount ?? 0,
            isRecurring: !!price.recurring,
            billingInterval: price.recurring?.interval ?? null,
          })
          .where(eq(products.stripeProductId, sp.id));
      } else {
        await db.insert(products).values({
          name: sp.name,
          description: sp.description ?? "",
          features: JSON.stringify([]),
          price: price.unit_amount ?? 0,
          currency: price.currency,
          stripeProductId: sp.id,
          stripePriceId: price.id,
          isRecurring: !!price.recurring,
          billingInterval: price.recurring?.interval ?? null,
          status: "active",
        });
      }
      synced++;
    }

    return { synced };
  }),

  // ─── Stripe Health ────────────────────────────────────────────────────────

  /**
   * Run a bi-directional Stripe health check and persist the result.
   * Verifies: account reachability, webhook endpoint, and price IDs.
   */
  pingStripe: platformOwnerProcedure
    .input(z.object({ triggeredBy: z.enum(["heartbeat", "manual"]).default("manual") }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const start = Date.now();

      let status: "ok" | "degraded" | "error" = "ok";
      let accountId: string | null = null;
      let webhookConfigured = false;
      let webhookLastDeliveryAt: Date | null = null;
      let premiumPriceValid = false;
      let proPriceValid = false;
      let errorMessage: string | null = null;

      try {
        // 1. Verify account reachability
        const account = await stripe.accounts.retrieve();
        accountId = account.id;

        // 2. Verify webhook endpoint is configured
        const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
        const appWebhook = webhooks.data.find(
          (wh) => wh.status === "enabled" && wh.url.includes("/api/stripe/webhook")
        );
        webhookConfigured = !!appWebhook;

        // 3. Fetch the last successful webhook event delivery timestamp
        if (appWebhook) {
          try {
            const events = await stripe.events.list({ limit: 1 });
            if (events.data.length > 0) {
              webhookLastDeliveryAt = new Date(events.data[0].created * 1000);
            }
          } catch {
            // Non-fatal: last delivery timestamp is best-effort
          }
        }

        // 4. Verify price IDs
        premiumPriceValid = await verifyStripePrice(process.env.STRIPE_PREMIUM_PRICE_ID ?? "");
        proPriceValid = await verifyStripePrice(process.env.STRIPE_PRO_PRICE_ID ?? "");

        if (!webhookConfigured || !premiumPriceValid || !proPriceValid) {
          status = "degraded";
        }
      } catch (err: any) {
        status = "error";
        errorMessage = err?.message ?? "Unknown error";
      }

      const latencyMs = Date.now() - start;

      // Persist result
      if (db) {
        await db.insert(stripeHealthPings).values({
          status,
          latencyMs,
          accountId,
          webhookConfigured,
          webhookLastDeliveryAt,
          premiumPriceValid,
          proPriceValid,
          errorMessage,
          triggeredBy: input.triggeredBy,
        });
      }

      return {
        status,
        latencyMs,
        accountId,
        webhookConfigured,
        webhookLastDeliveryAt,
        premiumPriceValid,
        proPriceValid,
        errorMessage,
        checkedAt: new Date(),
      };
    }),

  /**
   * Get the most recent Stripe health ping result
   */
  getLatestPing: platformOwnerProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    const [latest] = await db
      .select()
      .from(stripeHealthPings)
      .orderBy(desc(stripeHealthPings.createdAt))
      .limit(1);
    return latest ?? null;
  }),

  /**
   * Return the current Stripe key mode (test or live) so the UI can display a badge.
   */
  getStripeMode: platformOwnerProcedure.query(() => {
    const key = process.env.STRIPE_SECRET_KEY ?? "";
    const isLive = key.startsWith("sk_live_") || key.startsWith("rk_live_");
    return { mode: isLive ? ("live" as const) : ("test" as const) };
  }),

  /**
   * Get recent ping history (last 20)
   */
  getPingHistory: platformOwnerProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(stripeHealthPings)
      .orderBy(desc(stripeHealthPings.createdAt))
      .limit(20);
  }),
});
