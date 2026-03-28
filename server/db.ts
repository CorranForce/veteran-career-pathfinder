import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2";
import { InsertPurchase, InsertSubscriber, InsertUser, purchases, subscribers, users, userProfiles, careerHighlights, InsertUserProfile, InsertCareerHighlight, resumes, InsertResume, resumeTemplates, activityLogs, InsertActivityLog, adminActivityLogs, InsertAdminActivityLog, announcements, InsertAnnouncement, Announcement } from "../drizzle/schema";
import { ENV } from './_core/env';
import { desc } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

// Lazily create a mysql2 connection pool and drizzle instance.
// Using a pool (instead of a single connection) ensures that ECONNRESET errors
// are automatically recovered by acquiring a fresh connection from the pool.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = createPool({
        uri: process.env.DATABASE_URL,
        // Keep a small pool — enough for concurrent requests without exhausting
        // the TiDB serverless connection limit.
        connectionLimit: 5,
        // Automatically re-establish stale connections.
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        // Discard connections that have been idle for 5 minutes.
        idleTimeout: 300000,
        // Wait up to 10 s for a free connection before throwing.
        waitForConnections: true,
        queueLimit: 0,
      });
      _db = drizzle(_pool);
      console.log("[Database] Connection pool created");
    } catch (error) {
      console.warn("[Database] Failed to create pool:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "stripeCustomerId"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'platform_owner';
      updateSet.role = 'platform_owner';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createEmailUser(data: { email: string; passwordHash: string; name: string }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    throw new Error("Database not available");
  }

  const result = await db.insert(users).values({
    email: data.email,
    passwordHash: data.passwordHash,
    name: data.name,
    loginMethod: "email",
    role: "user",
    lastSignedIn: new Date(),
  });

  return result[0].insertId;
}

export async function createGoogleUser(data: {
  email: string;
  name: string;
  googleId: string;
  profilePicture?: string;
  passwordHash?: string;
  mustChangePassword?: boolean;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    throw new Error("Database not available");
  }

  const result = await db.insert(users).values({
    email: data.email,
    name: data.name,
    openId: data.googleId,
    loginMethod: "google",
    role: "user",
    lastSignedIn: new Date(),
    ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
    ...(data.mustChangePassword !== undefined ? { mustChangePassword: data.mustChangePassword } : {}),
  });

  return result[0].insertId;
}

/**
 * Clear the mustChangePassword flag after a user successfully sets a new password.
 */
export async function clearMustChangePassword(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users)
    .set({ mustChangePassword: false })
    .where(eq(users.id, userId));
}

export async function updateUserLastSignIn(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

export async function updateUserStripeCustomerId(userId: number, stripeCustomerId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  await db.update(users)
    .set({ stripeCustomerId })
    .where(eq(users.id, userId));
}

export async function createPurchase(purchase: InsertPurchase) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create purchase: database not available");
    return;
  }

  const result = await db.insert(purchases).values(purchase);
  return result;
}

export async function updatePurchaseStatus(
  paymentIntentId: string,
  status: "completed" | "failed" | "cancelled"
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update purchase: database not available");
    return;
  }

  await db.update(purchases)
    .set({ status, updatedAt: new Date() })
    .where(eq(purchases.stripePaymentIntentId, paymentIntentId));
}

export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get purchases: database not available");
    return [];
  }

  return await db.select().from(purchases).where(eq(purchases.userId, userId));
}

export async function hasUserPurchased(userId: number, productType: "premium_prompt" | "pro_subscription") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check purchase: database not available");
    return false;
  }

  const result = await db.select()
    .from(purchases)
    .where(and(
      eq(purchases.userId, userId),
      eq(purchases.productType, productType),
      eq(purchases.status, "completed")
    ))
    .limit(1);

  return result.length > 0;
}

export async function createSubscriber(subscriber: InsertSubscriber) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create subscriber: database not available");
    return;
  }

  try {
    const result = await db.insert(subscribers).values(subscriber);
    return result;
  } catch (error: any) {
    // Handle duplicate email error
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error("Email already subscribed");
    }
    throw error;
  }
}

export async function getAllSubscribers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get subscribers: database not available");
    return [];
  }

  return await db.select().from(subscribers).where(eq(subscribers.status, "active"));
}

export async function getSubscriberByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get subscriber: database not available");
    return undefined;
  }

  const result = await db.select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Profile operations
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user profile:", error);
    return null;
  }
}

export async function createOrUpdateUserProfile(userId: number, profile: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) return null;

  try {
    const existing = await getUserProfile(userId);

    if (existing) {
      await db
        .update(userProfiles)
        .set({
          ...profile,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, userId));
    } else {
      await db.insert(userProfiles).values({
        userId,
        ...profile,
      });
    }

    return await getUserProfile(userId);
  } catch (error) {
    console.error("[Database] Failed to create/update user profile:", error);
    return null;
  }
}

export async function getCareerHighlights(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(careerHighlights)
      .where(eq(careerHighlights.userId, userId))
      .orderBy(careerHighlights.order);
  } catch (error) {
    console.error("[Database] Failed to get career highlights:", error);
    return [];
  }
}

export async function addCareerHighlight(userId: number, highlight: Omit<InsertCareerHighlight, "userId">) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(careerHighlights).values({
      userId,
      ...highlight,
    });

    return result;
  } catch (error) {
    console.error("[Database] Failed to add career highlight:", error);
    return null;
  }
}

export async function updateCareerHighlight(highlightId: number, highlight: Partial<InsertCareerHighlight>) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db
      .update(careerHighlights)
      .set({
        ...highlight,
        updatedAt: new Date(),
      })
      .where(eq(careerHighlights.id, highlightId));

    return await db.select().from(careerHighlights).where(eq(careerHighlights.id, highlightId)).limit(1);
  } catch (error) {
    console.error("[Database] Failed to update career highlight:", error);
    return null;
  }
}

export async function deleteCareerHighlight(highlightId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(careerHighlights).where(eq(careerHighlights.id, highlightId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete career highlight:", error);
    return false;
  }
}


// Resume operations
export async function createResume(resume: InsertResume) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create resume: database not available");
    return null;
  }

  try {
    const result = await db.insert(resumes).values(resume);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create resume:", error);
    return null;
  }
}

export async function getUserResumes(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get resumes: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(resumes.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get user resumes:", error);
    return [];
  }
}

export async function getResumeById(resumeId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get resume: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(resumes)
      .where(eq(resumes.id, resumeId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get resume:", error);
    return null;
  }
}

export async function updateResumeAnalysis(
  resumeId: number,
  analysis: {
    analysisStatus: "completed" | "failed";
    analysisResult?: string;
    atsScore?: number;
  }
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update resume analysis: database not available");
    return null;
  }

  try {
    await db
      .update(resumes)
      .set({
        ...analysis,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, resumeId));

    return await getResumeById(resumeId);
  } catch (error) {
    console.error("[Database] Failed to update resume analysis:", error);
    return null;
  }
}

export async function deleteResume(resumeId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete resume: database not available");
    return false;
  }

  try {
    await db.delete(resumes).where(eq(resumes.id, resumeId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete resume:", error);
    return false;
  }
}


// Analytics operations
export async function getAnalytics() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get analytics: database not available");
    return null;
  }

  try {
    // Total users
    const totalUsersResult = await db.execute("SELECT COUNT(*) as count FROM users");
    const totalUsers = Array.isArray(totalUsersResult[0]) ? totalUsersResult[0][0]?.count : 0;

    // Total resumes analyzed
    const totalResumesResult = await db.execute("SELECT COUNT(*) as count FROM resumes");
    const totalResumes = Array.isArray(totalResumesResult[0]) ? totalResumesResult[0][0]?.count : 0;

    // Completed analyses
    const completedAnalysesResult = await db.execute(
      "SELECT COUNT(*) as count FROM resumes WHERE analysisStatus = 'completed'"
    );
    const completedAnalyses = Array.isArray(completedAnalysesResult[0]) ? completedAnalysesResult[0][0]?.count : 0;

    // Average ATS score
    const avgScoreResult = await db.execute(
      "SELECT AVG(atsScore) as avgScore FROM resumes WHERE atsScore IS NOT NULL"
    );
    const avgAtsScore = Array.isArray(avgScoreResult[0]) ? avgScoreResult[0][0]?.avgScore : 0;

    // Recent activity (last 7 days)
    const recentUsersResult = await db.execute(
      "SELECT COUNT(*) as count FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    const recentUsers = Array.isArray(recentUsersResult[0]) ? recentUsersResult[0][0]?.count : 0;

    const recentResumesResult = await db.execute(
      "SELECT COUNT(*) as count FROM resumes WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );
    const recentResumes = Array.isArray(recentResumesResult[0]) ? recentResumesResult[0][0]?.count : 0;

    // Score distribution
    const scoreDistributionResult = await db.execute(`
      SELECT 
        CASE 
          WHEN atsScore >= 80 THEN 'Excellent (80-100)'
          WHEN atsScore >= 60 THEN 'Good (60-79)'
          WHEN atsScore >= 40 THEN 'Fair (40-59)'
          ELSE 'Needs Work (0-39)'
        END as scoreRange,
        COUNT(*) as count
      FROM resumes
      WHERE atsScore IS NOT NULL
      GROUP BY scoreRange
      ORDER BY MIN(atsScore) DESC
    `);
    const scoreDistribution = Array.isArray(scoreDistributionResult[0]) ? scoreDistributionResult[0] : [];

    return {
      totalUsers: Number(totalUsers),
      totalResumes: Number(totalResumes),
      completedAnalyses: Number(completedAnalyses),
      avgAtsScore: Math.round(Number(avgAtsScore)),
      recentUsers: Number(recentUsers),
      recentResumes: Number(recentResumes),
      scoreDistribution,
    };
  } catch (error) {
    console.error("[Database] Failed to get analytics:", error);
    return null;
  }
}


// Resume template operations
export async function createResumeTemplate(template: {
  name: string;
  description: string;
  category: string;
  fileUrl: string;
  fileKey: string;
  thumbnailUrl?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create resume template: database not available");
    return null;
  }

  try {
    const [result] = await db.insert(resumeTemplates).values({
      name: template.name,
      description: template.description,
      category: template.category,
      fileUrl: template.fileUrl,
      fileKey: template.fileKey,
      thumbnailUrl: template.thumbnailUrl || null,
    });
    
    const insertId = result.insertId;
    return await getResumeTemplateById(insertId);
  } catch (error) {
    console.error("[Database] Failed to create resume template:", error);
    return null;
  }
}

export async function getAllResumeTemplates() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get resume templates: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(resumeTemplates)
      .where(eq(resumeTemplates.isActive, true));
  } catch (error) {
    console.error("[Database] Failed to get resume templates:", error);
    return [];
  }
}

export async function getResumeTemplateById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get resume template: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(resumeTemplates)
      .where(eq(resumeTemplates.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get resume template:", error);
    return null;
  }
}

export async function incrementTemplateDownloadCount(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment download count: database not available");
    return false;
  }

  try {
    await db
      .update(resumeTemplates)
      .set({ downloadCount: sql`${resumeTemplates.downloadCount} + 1` })
      .where(eq(resumeTemplates.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to increment download count:", error);
    return false;
  }
}

export async function deleteResumeTemplate(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete resume template: database not available");
    return false;
  }

  try {
    await db
      .update(resumeTemplates)
      .set({ isActive: false })
      .where(eq(resumeTemplates.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete resume template:", error);
    return false;
  }
}


/**
 * Activity Log helpers
 */
export async function logActivity(activity: InsertActivityLog): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log activity: database not available");
    return;
  }

  try {
    await db.insert(activityLogs).values(activity);
  } catch (error) {
    console.error("[Database] Failed to log activity:", error);
  }
}

export async function getRecentActivity(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}


/**
 * Set password reset token for a user
 */
export async function setPasswordResetToken(userId: number, resetToken: string, resetTokenExpiry: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot set password reset token: database not available");
    return;
  }

  await db
    .update(users)
    .set({ resetToken, resetTokenExpiry })
    .where(eq(users.id, userId));
}

/**
 * Get user by reset token
 */
export async function getUserByResetToken(resetToken: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by reset token: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.resetToken, resetToken))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Reset user password and clear reset token
 */
export async function resetUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot reset password: database not available");
    return;
  }

  await db
    .update(users)
    .set({ 
      passwordHash, 
      resetToken: null, 
      resetTokenExpiry: null 
    })
    .where(eq(users.id, userId));
}

/**
 * Log an admin action for audit trail
 */
export async function logAdminActivity(activity: InsertAdminActivityLog): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log admin activity: database not available");
    return;
  }

  await db.insert(adminActivityLogs).values(activity);
}

/**
 * Get recent admin activity logs
 */
export async function getAdminActivityLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admin activity logs: database not available");
    return [];
  }

  return await db
    .select()
    .from(adminActivityLogs)
    .orderBy(desc(adminActivityLogs.createdAt))
    .limit(limit);
}

/**
 * Get admin activity logs for a specific user
 */
export async function getAdminActivityLogsForUser(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admin activity logs: database not available");
    return [];
  }

  return await db
    .select()
    .from(adminActivityLogs)
    .where(eq(adminActivityLogs.targetUserId, userId))
    .orderBy(desc(adminActivityLogs.createdAt))
    .limit(limit);
}


/**
 * Create a new announcement
 */
export async function createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create announcement: database not available");
    return null;
  }

  const result = await db.insert(announcements).values(announcement);
  
  // Fetch and return the created announcement
  const created = await db
    .select()
    .from(announcements)
    .where(eq(announcements.id, Number(result[0].insertId)))
    .limit(1);
  
  return created.length > 0 ? created[0] : null;
}

/**
 * Update an existing announcement
 */
export async function updateAnnouncement(id: number, updates: Partial<InsertAnnouncement>): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update announcement: database not available");
    return;
  }

  await db
    .update(announcements)
    .set(updates)
    .where(eq(announcements.id, id));
}

/**
 * Delete an announcement
 */
export async function deleteAnnouncement(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete announcement: database not available");
    return;
  }

  await db.delete(announcements).where(eq(announcements.id, id));
}

/**
 * Get all announcements (for admin)
 */
export async function getAllAnnouncements(): Promise<Announcement[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get announcements: database not available");
    return [];
  }

  return await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.priority), desc(announcements.createdAt));
}

/**
 * Get published announcements (for public display)
 */
export async function getPublishedAnnouncements(limit: number = 10): Promise<Announcement[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get published announcements: database not available");
    return [];
  }

  return await db
    .select()
    .from(announcements)
    .where(eq(announcements.status, "published"))
    .orderBy(desc(announcements.priority), desc(announcements.publishedAt))
    .limit(limit);
}

/**
 * Get announcements by type
 */
export async function getAnnouncementsByType(type: "feature" | "bugfix" | "news" | "maintenance"): Promise<Announcement[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get announcements by type: database not available");
    return [];
  }

  return await db
    .select()
    .from(announcements)
    .where(and(
      eq(announcements.type, type),
      eq(announcements.status, "published")
    ))
    .orderBy(desc(announcements.priority), desc(announcements.publishedAt));
}

/**
 * Publish an announcement
 */
export async function publishAnnouncement(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot publish announcement: database not available");
    return;
  }

  await db
    .update(announcements)
    .set({ 
      status: "published",
      publishedAt: new Date()
    })
    .where(eq(announcements.id, id));
}

/**
 * Archive an announcement
 */
export async function archiveAnnouncement(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot archive announcement: database not available");
    return;
  }

  await db
    .update(announcements)
    .set({ 
      status: "archived",
      archivedAt: new Date()
    })
    .where(eq(announcements.id, id));
}

/**
 * Restore an archived announcement back to draft
 */
export async function restoreAnnouncement(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot restore announcement: database not available");
    return;
  }

  await db
    .update(announcements)
    .set({ 
      status: "draft",
      archivedAt: null
    })
    .where(eq(announcements.id, id));
}

/**
 * Get archived announcements (admin only)
 */
export async function getArchivedAnnouncements(): Promise<Announcement[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get archived announcements: database not available");
    return [];
  }

  return await db
    .select()
    .from(announcements)
    .where(eq(announcements.status, "archived"))
    .orderBy(desc(announcements.archivedAt), desc(announcements.createdAt));
}


export async function updateUserEmailVerificationToken(userId: number, emailVerificationToken: string, emailVerificationTokenExpiry: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update email verification token: database not available");
    return;
  }

  await db.update(users)
    .set({ emailVerificationToken, emailVerificationTokenExpiry })
    .where(eq(users.id, userId));
}

export async function getUserByEmailVerificationToken(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.emailVerificationToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function markEmailAsVerified(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark email as verified: database not available");
    return;
  }

  await db.update(users)
    .set({ 
      emailVerified: true, 
      emailVerificationToken: null, 
      emailVerificationTokenExpiry: null 
    })
    .where(eq(users.id, userId));
}

/**
 * Log a rate-limit block event to the admin activity log.
 * Uses adminId = 0 / adminName = "System" to indicate an automated security event.
 */
export async function logRateLimitEvent(params: {
  ip: string;
  endpoint: string;
  userAgent?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log rate-limit event: database not available");
    return;
  }
  try {
    await db.insert(adminActivityLogs).values({
      adminId: 0,
      adminName: "System",
      adminEmail: "system@pathfinder",
      actionType: "rate_limit_blocked",
      description: `Rate limit exceeded on ${params.endpoint} from IP ${params.ip}`,
      metadata: JSON.stringify({
        ip: params.ip,
        endpoint: params.endpoint,
        userAgent: params.userAgent ?? "unknown",
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    // Never let logging failures break the request
    console.error("[RateLimit] Failed to log event:", err);
  }
}

/**
 * Get recent rate-limit block events from the admin activity log.
 */
export async function getRateLimitEvents(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(adminActivityLogs)
    .where(eq(adminActivityLogs.actionType, "rate_limit_blocked"))
    .orderBy(desc(adminActivityLogs.createdAt))
    .limit(limit);
}

/**
 * Log a failed login attempt (wrong password or email not found) to admin_activity_logs.
 * Used to detect credential-stuffing attacks that stay under the rate-limit threshold.
 */
export async function logFailedLogin(params: {
  ip: string;
  email: string;
  reason: "email_not_found" | "wrong_password" | "no_password_set";
  userAgent?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot log failed login: database not available");
    return;
  }
  try {
    await db.insert(adminActivityLogs).values({
      adminId: 0,
      adminName: "System",
      adminEmail: "system@pathfinder",
      actionType: "login_failed",
      description: `Failed login attempt for ${params.email} from IP ${params.ip} (${params.reason})`,
      metadata: JSON.stringify({
        ip: params.ip,
        email: params.email,
        reason: params.reason,
        userAgent: params.userAgent ?? "unknown",
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    // Never let logging failures break the request
    console.error("[Auth] Failed to log failed login:", err);
  }
}

/**
 * Get recent failed login events from the admin activity log.
 */
export async function getFailedLoginEvents(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(adminActivityLogs)
    .where(eq(adminActivityLogs.actionType, "login_failed"))
    .orderBy(desc(adminActivityLogs.createdAt))
    .limit(limit);
}
