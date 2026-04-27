import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date, boolean } from "drizzle-orm/mysql-core";

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
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. Nullable for email/password users. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  /** Hashed password for email/password authentication. Null for OAuth users. */
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "platform_owner"]).default("user").notNull(),
  status: mysqlEnum("status", ["active", "suspended", "deleted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  
  // Stripe customer ID for payment processing
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  
  // Password reset tokens
  resetToken: varchar("resetToken", { length: 255 }),
  resetTokenExpiry: timestamp("resetTokenExpiry"),
  
  // Email change tokens
  newEmail: varchar("newEmail", { length: 320 }),
  emailChangeToken: varchar("emailChangeToken", { length: 255 }),
  emailChangeTokenExpiry: timestamp("emailChangeTokenExpiry"),
  
  // Email verification
  emailVerified: boolean("emailVerified").default(false).notNull(),
  emailVerificationToken: varchar("emailVerificationToken", { length: 255 }),
  emailVerificationTokenExpiry: timestamp("emailVerificationTokenExpiry"),
  
  // Profile picture URL (stored in S3)
  profilePicture: varchar("profilePicture", { length: 512 }),

  // Force password change on next login (set for auto-generated passwords, e.g. Google OAuth)
  mustChangePassword: boolean("mustChangePassword").default(false).notNull(),

  // Onboarding: set to true once the user dismisses the first-login welcome modal
  hasSeenWelcome: boolean("hasSeenWelcome").default(false).notNull(),
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
  amount: int("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Purchase status
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
  
  // Digital asset URLs (for post-purchase delivery)
  promptPdfUrl: text("promptPdfUrl"),
  resumeTemplatePdfUrl: text("resumeTemplatePdfUrl"),
  fulfilledAt: timestamp("fulfilledAt"),
  
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

/**
 * User profiles for displaying career highlights and LinkedIn info
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  bio: text("bio"),
  linkedinUrl: varchar("linkedinUrl", { length: 500 }),
  linkedinUsername: varchar("linkedinUsername", { length: 255 }),
  profileImageUrl: text("profileImageUrl"),
  currentRole: varchar("currentRole", { length: 255 }),
  targetRole: varchar("targetRole", { length: 255 }),
  yearsOfExperience: int("yearsOfExperience"),
  militaryBranch: varchar("militaryBranch", { length: 100 }),
  militaryRank: varchar("militaryRank", { length: 100 }),
  profileVisibility: mysqlEnum("profileVisibility", ["public", "private", "members_only"]).default("members_only").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Career highlights for user profiles
 */
export const careerHighlights = mysqlTable("careerHighlights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["achievement", "certification", "promotion", "project", "award", "skill"]).notNull(),
  date: date("date"),
  imageUrl: text("imageUrl"),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CareerHighlight = typeof careerHighlights.$inferSelect;
export type InsertCareerHighlight = typeof careerHighlights.$inferInsert;


/**
 * Resumes table - stores uploaded resumes and AI analysis results
 */
export const resumes = mysqlTable("resumes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // File information
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(), // S3 URL
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key for deletion
  fileSize: int("fileSize").notNull(), // in bytes
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  
  // AI Analysis results
  analysisStatus: mysqlEnum("analysisStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  analysisResult: text("analysisResult"), // JSON string with AI recommendations
  atsScore: int("atsScore"), // 0-100 score
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = typeof resumes.$inferInsert;


/**
 * Resume templates table - ATS-optimized templates for veterans
 */
export const resumeTemplates = mysqlTable("resumeTemplates", {
  id: int("id").autoincrement().primaryKey(),
  
  // Template information
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "IT", "Management", "Technical", "General"
  
  // File information
  fileUrl: text("fileUrl").notNull(), // S3 URL to template file
  fileKey: varchar("fileKey", { length: 500 }).notNull(), // S3 key
  thumbnailUrl: text("thumbnailUrl"), // Preview image
  
  // Metadata
  downloadCount: int("downloadCount").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResumeTemplate = typeof resumeTemplates.$inferSelect;
export type InsertResumeTemplate = typeof resumeTemplates.$inferInsert;


/**
 * Activity logs table - tracks platform activity for admin monitoring
 */
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Activity details
  activityType: mysqlEnum("activityType", ["user_signup", "resume_upload", "purchase", "template_download", "password_reset", "email_verification", "page_view", "prompt_copy", "cta_click", "scroll_depth", "signup", "login", "checkout_start", "checkout_complete"]).notNull(),
  userId: int("userId"),
  userName: varchar("userName", { length: 255 }),
  userEmail: varchar("userEmail", { length: 320 }),
  
  // Activity metadata
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON string with additional details
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;


/**
 * Products table - multi-tier product management with Stripe integration
 * Supports active, disabled, and archived states
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  
  // Product information
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  features: text("features").notNull(), // JSON array of feature strings
  
  // Pricing
  price: int("price").notNull(), // Price in cents
  currency: varchar("currency", { length: 10 }).default("usd").notNull(),
  
  // Tier identifier — links this DB product to the PREMIUM or PRO slot on the pricing page
  tier: mysqlEnum("tier", ["premium", "pro"]),

  // Stripe integration
  stripeProductId: varchar("stripeProductId", { length: 255 }),
  stripePriceId: varchar("stripePriceId", { length: 255 }),
  
  // Product status
  status: mysqlEnum("status", ["active", "disabled", "archived"]).default("active").notNull(),
  
  // Metadata
  displayOrder: int("displayOrder").default(0).notNull(), // For sorting in UI
  isRecurring: boolean("isRecurring").default(false).notNull(), // One-time vs subscription
  billingInterval: varchar("billingInterval", { length: 50 }), // "month", "year", etc. for subscriptions
  yearlyDiscountPercent: int("yearlyDiscountPercent").default(0).notNull(), // Discount % shown when billing interval is "year"
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  archivedAt: timestamp("archivedAt"),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Admin Activity Logs - tracks all admin actions for audit trail
 * Records who did what to whom and when
 */
export const adminActivityLogs = mysqlTable("admin_activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Admin who performed the action
  adminId: int("adminId").notNull(),
  adminName: varchar("adminName", { length: 255 }).notNull(),
  adminEmail: varchar("adminEmail", { length: 320 }).notNull(),
  
  // Target user (if applicable)
  targetUserId: int("targetUserId"),
  targetUserName: varchar("targetUserName", { length: 255 }),
  targetUserEmail: varchar("targetUserEmail", { length: 320 }),
  
  // Action details
  actionType: mysqlEnum("actionType", [
    "suspend_user",
    "reactivate_user",
    "delete_user",
    "change_role",
    "view_purchases",
    "update_product",
    "rate_limit_blocked",
    "login_failed",
    "other"
  ]).notNull(),
  
  description: text("description").notNull(),
  
  // Additional context (JSON string)
  metadata: text("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminActivityLog = typeof adminActivityLogs.$inferSelect;
export type InsertAdminActivityLog = typeof adminActivityLogs.$inferInsert;

/**
 * Announcements - platform-wide announcements for features, bug fixes, and news
 * Managed by platform owner, displayed on landing page
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  
  // Announcement details
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  
  // Type of announcement
  type: mysqlEnum("type", [
    "feature",    // New feature announcement
    "bugfix",     // Bug fix announcement
    "news",       // General news
    "maintenance" // Maintenance notice
  ]).notNull(),
  
  // Status
  status: mysqlEnum("status", [
    "draft",      // Not published yet
    "published",  // Visible to users
    "archived"    // No longer displayed
  ]).default("draft").notNull(),
  
  // Priority (higher number = higher priority, affects display order)
  priority: int("priority").default(0).notNull(),
  
  // Optional link for "Learn More"
  link: varchar("link", { length: 500 }),
  
  // Landing page visibility — when true, announcement banner appears on the public home page
  visibleOnLandingPage: boolean("visibleOnLandingPage").default(false).notNull(),
  // Auto-archive date: set to publishedAt + 14 days when published with visibleOnLandingPage=true
  landingPageExpiresAt: timestamp("landingPageExpiresAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
  archivedAt: timestamp("archivedAt"),
  
  // Created by
  createdBy: int("createdBy").notNull(),
  createdByName: varchar("createdByName", { length: 255 }).notNull(),
});

export type Announcement = typeof announcements.$inferSelect;

/**
 * Stripe Health Pings - persists heartbeat check results for the admin dashboard
 */
export const stripeHealthPings = mysqlTable("stripe_health_pings", {
  id: int("id").autoincrement().primaryKey(),
  status: mysqlEnum("status", ["ok", "degraded", "error"]).notNull(),
  latencyMs: int("latencyMs").notNull(),
  accountId: varchar("accountId", { length: 255 }),
  webhookConfigured: boolean("webhookConfigured").default(false).notNull(),
  premiumPriceValid: boolean("premiumPriceValid").default(false).notNull(),
  proPriceValid: boolean("proPriceValid").default(false).notNull(),
  errorMessage: text("errorMessage"),
  triggeredBy: mysqlEnum("triggeredBy", ["heartbeat", "manual"]).default("heartbeat").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  webhookLastDeliveryAt: timestamp("webhookLastDeliveryAt"),
});

export type StripeHealthPing = typeof stripeHealthPings.$inferSelect;
export type InsertStripeHealthPing = typeof stripeHealthPings.$inferInsert;
export type InsertAnnouncement = typeof announcements.$inferInsert;


/**
 * Blog Subscribers - email subscribers for blog updates, features, and bug fixes
 * Allows visitors to subscribe without creating an account
 */
export const blogSubscribers = mysqlTable("blog_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  
  // Subscriber details
  email: varchar("email", { length: 320 }).notNull().unique(),
  
  // Subscription preferences
  subscribeToNewPosts: boolean("subscribeToNewPosts").default(true).notNull(),
  subscribeToFeatures: boolean("subscribeToFeatures").default(true).notNull(),
  subscribeToBugFixes: boolean("subscribeToBugFixes").default(true).notNull(),
  
  // Status
  status: mysqlEnum("status", [
    "active",      // Receiving emails
    "unsubscribed", // Opted out
    "bounced"      // Email bounced
  ]).default("active").notNull(),
  
  // Verification
  isVerified: boolean("isVerified").default(false).notNull(),
  verificationToken: varchar("verificationToken", { length: 255 }),
  verificationTokenExpiry: timestamp("verificationTokenExpiry"),
  
  // Unsubscribe token
  unsubscribeToken: varchar("unsubscribeToken", { length: 255 }).notNull(),
  
  // Timestamps
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  verifiedAt: timestamp("verifiedAt"),
  unsubscribedAt: timestamp("unsubscribedAt"),
  lastEmailSentAt: timestamp("lastEmailSentAt"),
});

export type BlogSubscriber = typeof blogSubscribers.$inferSelect;
export type InsertBlogSubscriber = typeof blogSubscribers.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// Notification Preferences
// One row per user; all channels default to false (opt-in).
// ─────────────────────────────────────────────────────────────────────────────
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),

  // In-app inbox notifications
  inAppEnabled: boolean("inAppEnabled").notNull().default(false),

  // Email notifications
  emailEnabled: boolean("emailEnabled").notNull().default(false),

  // Browser push notifications
  pushEnabled: boolean("pushEnabled").notNull().default(false),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// User Notifications (in-app inbox)
// ─────────────────────────────────────────────────────────────────────────────
export const userNotifications = mysqlTable("user_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),

  // Optional deep-link within the app
  actionUrl: varchar("actionUrl", { length: 500 }),

  // Category for icon/colour differentiation
  category: mysqlEnum("category", [
    "general",
    "payment",
    "resume",
    "security",
    "announcement",
    "system",
  ]).notNull().default("general"),

  isRead: boolean("isRead").notNull().default(false),
  readAt: timestamp("readAt"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = typeof userNotifications.$inferInsert;

// ─────────────────────────────────────────────────────────────────────────────
// Push Subscriptions (Web Push / VAPID)
// One row per browser/device per user.
// ─────────────────────────────────────────────────────────────────────────────
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),

  // PushSubscription JSON fields
  endpoint: text("endpoint").notNull(),
  p256dhKey: text("p256dhKey").notNull(),
  authKey: text("authKey").notNull(),

  // User-agent hint for display in settings
  userAgent: varchar("userAgent", { length: 500 }),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * Blog Posts - admin-managed blog content for the /blog page
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),

  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(), // Markdown / rich text
  coverImageUrl: text("coverImageUrl"),

  // Status
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),

  // Author info (platform owner)
  authorId: int("authorId").notNull(),
  authorName: varchar("authorName", { length: 255 }).notNull(),

  // SEO
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),

  // Timestamps
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Platform Agent Log — records each daily agent run and actions taken
 */
export const platformAgentLogs = mysqlTable("platform_agent_logs", {
  id: int("id").autoincrement().primaryKey(),

  // What triggered this run
  trigger: mysqlEnum("trigger", ["scheduled", "manual"]).default("scheduled").notNull(),

  // Summary of actions taken (JSON array of strings)
  actions: text("actions").notNull(), // e.g. [{type, description, metadata}]

  // Stripe latency observed during this run
  stripeLatencyMs: int("stripeLatencyMs"),
  stripeStatus: mysqlEnum("stripeStatus", ["ok", "degraded", "error", "skipped"]).default("skipped").notNull(),

  // Counts
  announcementsArchived: int("announcementsArchived").default(0).notNull(),

  // Stripe Mode Drift check results
  driftCount: int("driftCount").default(0).notNull(),   // number of stale product IDs found
  driftMode: varchar("driftMode", { length: 10 }),       // "live" | "test" | null (skipped)
  driftCheckedAt: timestamp("driftCheckedAt"),           // when the drift check ran

  // Errors encountered (JSON array)
  errors: text("errors"),

  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type PlatformAgentLog = typeof platformAgentLogs.$inferSelect;
export type InsertPlatformAgentLog = typeof platformAgentLogs.$inferInsert;

/**
 * MOS Codes — master list of Military Occupational Specialties across all branches
 */
export const mosCodes = mysqlTable("mos_codes", {
  id: int("id").autoincrement().primaryKey(),

  // Identifier
  code: varchar("code", { length: 20 }).notNull().unique(), // e.g. "25U", "11B", "IT", "3D1X2"
  branch: mysqlEnum("branch", ["army", "navy", "air_force", "marine_corps", "coast_guard", "space_force"]).notNull(),

  // Description
  title: varchar("title", { length: 255 }).notNull(), // e.g. "Signal Support Systems Specialist"
  description: text("description").notNull(),

  // Categorization
  category: varchar("category", { length: 100 }).notNull(), // e.g. "Technology", "Healthcare", "Combat", "Logistics"

  // Key transferable skills (JSON array of strings)
  keySkills: text("keySkills").notNull(),

  // Civilian keywords for search
  searchKeywords: text("searchKeywords"), // comma-separated keywords

  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MosCode = typeof mosCodes.$inferSelect;
export type InsertMosCode = typeof mosCodes.$inferInsert;


/**
 * Civilian Career Paths — each MOS maps to multiple civilian career options
 */
export const civilianCareerPaths = mysqlTable("civilian_career_paths", {
  id: int("id").autoincrement().primaryKey(),

  mosId: int("mosId").notNull(), // FK to mosCodes.id

  // Career details
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(), // e.g. "Cybersecurity Analyst"
  industry: varchar("industry", { length: 100 }).notNull(), // e.g. "Technology", "Healthcare"
  description: text("description").notNull(),

  // Salary data (in USD per year)
  salaryMin: int("salaryMin").notNull(), // e.g. 70000
  salaryMax: int("salaryMax").notNull(), // e.g. 140000
  salaryMedian: int("salaryMedian"), // e.g. 105000

  // Difficulty of transition (1=easy, 2=moderate, 3=requires significant retraining)
  transitionDifficulty: mysqlEnum("transitionDifficulty", ["easy", "moderate", "challenging"]).notNull(),

  // Time to first civilian job in this field (months)
  timeToHireMonths: int("timeToHireMonths"),

  // Required certifications (JSON array of strings)
  requiredCerts: text("requiredCerts").notNull(), // e.g. ["CompTIA Security+", "CEH"]

  // Recommended certifications (JSON array)
  recommendedCerts: text("recommendedCerts"),

  // Skills that transfer directly (JSON array)
  transferableSkills: text("transferableSkills").notNull(),

  // Skills gap (what they need to learn, JSON array)
  skillsGap: text("skillsGap"),

  // Example employers
  exampleEmployers: text("exampleEmployers"), // JSON array

  // Is this the top/recommended path for this MOS?
  isTopPath: boolean("isTopPath").default(false).notNull(),

  displayOrder: int("displayOrder").default(0).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CivilianCareerPath = typeof civilianCareerPaths.$inferSelect;
export type InsertCivilianCareerPath = typeof civilianCareerPaths.$inferInsert;


/**
 * MOS Translator Sessions — tracks user searches for analytics
 */
export const mosTranslatorSessions = mysqlTable("mos_translator_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // null for anonymous users
  mosCode: varchar("mosCode", { length: 20 }).notNull(),
  branch: varchar("branch", { length: 50 }),
  ipHash: varchar("ipHash", { length: 64 }), // hashed IP for rate limiting
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MosTranslatorSession = typeof mosTranslatorSessions.$inferSelect;
export type InsertMosTranslatorSession = typeof mosTranslatorSessions.$inferInsert;


// ─────────────────────────────────────────────────────────────────────────────
// Referral System
// Two-table design:
//   referral_codes  — one unique code per user (created lazily on first request)
//   referral_conversions — one row per successful Premium purchase made via a
//                          referral link, recording the referrer, the new buyer,
//                          and the reward credit issued to the referrer.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Referral Codes — one shareable code per registered user.
 * The code is a short random slug (e.g. "VET-A1B2C3") embedded in the
 * referral URL: /signup?ref=VET-A1B2C3
 */
export const referralCodes = mysqlTable("referral_codes", {
  id: int("id").autoincrement().primaryKey(),

  // The user who owns this referral code
  userId: int("userId").notNull().unique(),

  // The shareable code slug (e.g. "VET-A1B2C3")
  code: varchar("code", { length: 32 }).notNull().unique(),

  // Aggregate counters (denormalised for fast dashboard reads)
  totalClicks: int("totalClicks").default(0).notNull(),
  totalSignups: int("totalSignups").default(0).notNull(),   // users who signed up via this code
  totalConversions: int("totalConversions").default(0).notNull(), // signups who then purchased Premium

  // Whether the referrer is eligible to receive rewards
  isActive: boolean("isActive").default(true).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;


/**
 * Referral Conversions — one row per completed Premium purchase that was
 * attributed to a referral code.
 *
 * Reward mechanics (implemented in the webhook handler):
 *   - referrerId receives a $5 account credit (stored as rewardCents)
 *   - refereeId (the new buyer) receives a 10 % discount coupon applied
 *     automatically at checkout (handled in createCheckoutSession)
 *
 * rewardStatus lifecycle:
 *   pending  → reward queued but not yet applied
 *   issued   → credit/coupon applied successfully
 *   failed   → application attempt failed (retryable)
 *   reversed → purchase was refunded; reward clawed back
 */
export const referralConversions = mysqlTable("referral_conversions", {
  id: int("id").autoincrement().primaryKey(),

  // The referral code that was used
  referralCodeId: int("referralCodeId").notNull(),

  // The user who shared the link (reward recipient)
  referrerId: int("referrerId").notNull(),

  // The user who clicked the link and purchased
  refereeId: int("refereeId").notNull(),

  // The purchase that triggered this conversion
  purchaseId: int("purchaseId").notNull(),

  // Reward for the referrer (in cents, e.g. 500 = $5.00)
  rewardCents: int("rewardCents").default(500).notNull(),

  // Discount given to the referee at checkout (basis points, e.g. 1000 = 10 %)
  refereeDiscountBps: int("refereeDiscountBps").default(1000).notNull(),

  // Stripe coupon ID applied to the referee's checkout session
  refereeCouponId: varchar("refereeCouponId", { length: 255 }),

  // Reward lifecycle
  rewardStatus: mysqlEnum("rewardStatus", ["pending", "issued", "failed", "reversed"])
    .default("pending")
    .notNull(),
  rewardIssuedAt: timestamp("rewardIssuedAt"),
  rewardReversedAt: timestamp("rewardReversedAt"),

  // Optional admin note (e.g. reason for reversal)
  notes: text("notes"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralConversion = typeof referralConversions.$inferSelect;
export type InsertReferralConversion = typeof referralConversions.$inferInsert;

// ─── Exit-Intent Email Captures ─────────────────────────────────────────────
// Stores emails captured by the exit-intent popup before revealing the coupon.
export const exitIntentCaptures = mysqlTable("exit_intent_captures", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  // Stripe coupon code shown to this visitor
  couponCode: varchar("couponCode", { length: 100 }).notNull().default("5zlB9zup"),
  // Whether the coupon email was successfully sent
  emailSent: boolean("emailSent").default(false).notNull(),
  emailSentAt: timestamp("emailSentAt"),
  // Whether this lead eventually converted to a paid purchase
  convertedAt: timestamp("convertedAt"),
  // IP hash for basic spam/abuse prevention
  ipHash: varchar("ipHash", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ExitIntentCapture = typeof exitIntentCaptures.$inferSelect;
export type InsertExitIntentCapture = typeof exitIntentCaptures.$inferInsert;
