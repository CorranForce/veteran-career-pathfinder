import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  
  // Stripe customer ID for payment processing
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Purchases table - tracks one-time payments and subscriptions
 * Stores only essential Stripe IDs, not duplicate data
 */
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Stripe resource IDs
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  
  // Product information
  productType: mysqlEnum("productType", ["premium_prompt", "pro_subscription"]).notNull(),
  
  // Purchase status
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

/**
 * Email subscribers table - tracks email list for marketing
 */
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  source: varchar("source", { length: 100 }).default("homepage"),
  status: mysqlEnum("status", ["active", "unsubscribed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

/**
 * Email events table - tracks SendGrid webhook events (opens, clicks, bounces)
 */
export const emailEvents = mysqlTable("email_events", {
  id: int("id").autoincrement().primaryKey(),
  subscriberId: int("subscriberId"),
  email: varchar("email", { length: 320 }).notNull(),
  eventType: varchar("eventType", { length: 50 }).notNull(), // open, click, bounce, delivered, etc.
  timestamp: timestamp("timestamp").notNull(),
  url: text("url"), // For click events
  userAgent: text("userAgent"),
  ip: varchar("ip", { length: 45 }),
  sgEventId: varchar("sgEventId", { length: 255 }), // SendGrid event ID
  sgMessageId: varchar("sgMessageId", { length: 255 }), // SendGrid message ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailEvent = typeof emailEvents.$inferSelect;
export type InsertEmailEvent = typeof emailEvents.$inferInsert;

/**
 * Drip campaigns table - defines email sequences sent after signup
 */
export const dripCampaigns = mysqlTable("drip_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Day 7 Career Tips"
  subject: text("subject").notNull(),
  htmlContent: text("htmlContent").notNull(),
  textContent: text("textContent").notNull(),
  dayOffset: int("dayOffset").notNull(), // Days after signup to send (7, 14, 30)
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DripCampaign = typeof dripCampaigns.$inferSelect;
export type InsertDripCampaign = typeof dripCampaigns.$inferInsert;

/**
 * Drip campaign sends - tracks which subscribers have received which drip emails
 */
export const dripSends = mysqlTable("drip_sends", {
  id: int("id").autoincrement().primaryKey(),
  subscriberId: int("subscriberId").notNull(),
  campaignId: int("campaignId").notNull(),
  sentAt: timestamp("sentAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DripSend = typeof dripSends.$inferSelect;
export type InsertDripSend = typeof dripSends.$inferInsert;

/**
 * A/B test variants table - stores different subject line variants
 */
export const abTestVariants = mysqlTable("ab_test_variants", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  variantName: varchar("variantName", { length: 100 }).notNull(), // e.g., "Variant A", "Variant B"
  subject: text("subject").notNull(),
  weight: int("weight").default(50).notNull(), // Percentage of traffic (0-100)
  isWinner: mysqlEnum("isWinner", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ABTestVariant = typeof abTestVariants.$inferSelect;
export type InsertABTestVariant = typeof abTestVariants.$inferInsert;

/**
 * Subscriber segments table - tags for segmentation (active, inactive, highly engaged)
 */
export const subscriberSegments = mysqlTable("subscriber_segments", {
  id: int("id").autoincrement().primaryKey(),
  subscriberId: int("subscriberId").notNull(),
  segment: mysqlEnum("segment", ["active", "inactive", "highly_engaged", "cold_lead"]).notNull(),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type SubscriberSegment = typeof subscriberSegments.$inferSelect;
export type InsertSubscriberSegment = typeof subscriberSegments.$inferInsert;