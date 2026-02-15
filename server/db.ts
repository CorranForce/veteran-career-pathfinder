import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertPurchase, InsertSubscriber, InsertUser, purchases, subscribers, users, userProfiles, careerHighlights, InsertUserProfile, InsertCareerHighlight, resumes, InsertResume } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
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
      values.role = 'admin';
      updateSet.role = 'admin';
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
