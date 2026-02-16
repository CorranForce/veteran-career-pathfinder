import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { products } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { ENV } from "../_core/env";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
});

/**
 * Admin-only procedure - requires platform_owner role
 */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "platform_owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const productManagementRouter = router({
  /**
   * List all products (including archived for admin view)
   */
  list: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const allProducts = await db.select().from(products);
    return allProducts;
  }),

  /**
   * Get active products only (for public display)
   */
  listActive: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const activeProducts = await db
      .select()
      .from(products)
      .where(eq(products.status, "active"));
    return activeProducts;
  }),

  /**
   * Get single product by ID
   */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.id));
      
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }
      
      return product;
    }),

  /**
   * Create new product tier
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        features: z.array(z.string()),
        price: z.number().min(50), // Minimum $0.50
        currency: z.string().default("usd"),
        isRecurring: z.boolean().default(false),
        billingInterval: z.string().optional(),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      // Create Stripe product
      const stripeProduct = await stripe.products.create({
        name: input.name,
        description: input.description,
        metadata: {
          features: JSON.stringify(input.features),
        },
      });

      // Create Stripe price
      const stripePriceData: Stripe.PriceCreateParams = {
        product: stripeProduct.id,
        unit_amount: input.price,
        currency: input.currency,
      };

      if (input.isRecurring && input.billingInterval) {
        stripePriceData.recurring = {
          interval: input.billingInterval as Stripe.PriceCreateParams.Recurring.Interval,
        };
      }

      const stripePrice = await stripe.prices.create(stripePriceData);

      // Insert into database
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [newProduct] = await db.insert(products).values({
        name: input.name,
        description: input.description,
        features: JSON.stringify(input.features),
        price: input.price,
        currency: input.currency,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
        status: "active",
        isRecurring: input.isRecurring,
        billingInterval: input.billingInterval,
        displayOrder: input.displayOrder,
      });

      return newProduct;
    }),

  /**
   * Update existing product tier
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        features: z.array(z.string()).optional(),
        price: z.number().min(50).optional(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

      // Get current product
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [currentProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));

      if (!currentProduct) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      // If price changed, create new Stripe price (prices are immutable)
      let newStripePriceId = currentProduct.stripePriceId;
      if (updates.price && updates.price !== currentProduct.price) {
        const stripePriceData: Stripe.PriceCreateParams = {
          product: currentProduct.stripeProductId!,
          unit_amount: updates.price,
          currency: currentProduct.currency,
        };

        if (currentProduct.isRecurring && currentProduct.billingInterval) {
          stripePriceData.recurring = {
            interval: currentProduct.billingInterval as Stripe.PriceCreateParams.Recurring.Interval,
          };
        }

        const newStripePrice = await stripe.prices.create(stripePriceData);
        newStripePriceId = newStripePrice.id;

        // Archive old price
        if (currentProduct.stripePriceId) {
          await stripe.prices.update(currentProduct.stripePriceId, {
            active: false,
          });
        }
      }

      // Update Stripe product metadata if name/description/features changed
      if (updates.name || updates.description || updates.features) {
        await stripe.products.update(currentProduct.stripeProductId!, {
          name: updates.name || currentProduct.name,
          description: updates.description || currentProduct.description,
          metadata: {
            features: JSON.stringify(updates.features || JSON.parse(currentProduct.features)),
          },
        });
      }

      // Update database
      const updateData: any = {
        ...updates,
        stripePriceId: newStripePriceId,
        updatedAt: new Date(),
      };

      if (updates.features) {
        updateData.features = JSON.stringify(updates.features);
      }

      await db.update(products).set(updateData).where(eq(products.id, id));

      // Return updated product
      const [updatedProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));

      return updatedProduct;
    }),

  /**
   * Disable product (prevent new purchases, keep visible)
   */
  disable: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db
        .update(products)
        .set({ status: "disabled", updatedAt: new Date() })
        .where(eq(products.id, input.id));

      return { success: true };
    }),

  /**
   * Enable disabled product
   */
  enable: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db
        .update(products)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(products.id, input.id));

      return { success: true };
    }),

  /**
   * Archive product (soft delete - hide from UI)
   */
  archive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db
        .update(products)
        .set({
          status: "archived",
          archivedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.id));

      return { success: true };
    }),

  /**
   * Unarchive product
   */
  unarchive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db
        .update(products)
        .set({
          status: "disabled", // Unarchive to disabled state for safety
          archivedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.id));

      return { success: true };
    }),
});
