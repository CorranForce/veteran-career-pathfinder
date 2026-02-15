import { getDb } from "./db";
import { purchases } from "../drizzle/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";

/**
 * Get total revenue from all completed purchases
 */
export async function getTotalRevenue() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get total revenue: database not available");
    return 0;
  }

  const result = await db
    .select({ total: sql<number>`SUM(${purchases.amount})` })
    .from(purchases)
    .where(eq(purchases.status, "completed"));

  return result[0]?.total || 0;
}

/**
 * Get revenue for the current month
 */
export async function getMonthlyRevenue() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get monthly revenue: database not available");
    return 0;
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const result = await db
    .select({ total: sql<number>`SUM(${purchases.amount})` })
    .from(purchases)
    .where(
      and(
        eq(purchases.status, "completed"),
        gte(purchases.createdAt, startOfMonth)
      )
    );

  return result[0]?.total || 0;
}

/**
 * Get total number of completed purchases
 */
export async function getTotalPurchaseCount() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get purchase count: database not available");
    return 0;
  }

  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(purchases)
    .where(eq(purchases.status, "completed"));

  return result[0]?.count || 0;
}

/**
 * Get recent purchases (last 10)
 */
export async function getRecentPurchases() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get recent purchases: database not available");
    return [];
  }

  return await db
    .select()
    .from(purchases)
    .where(eq(purchases.status, "completed"))
    .orderBy(desc(purchases.createdAt))
    .limit(10);
}

/**
 * Get revenue by month for the last 12 months
 */
export async function getRevenueByMonth() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get revenue by month: database not available");
    return [];
  }

  const result = await db
    .select({
      month: sql<string>`DATE_FORMAT(${purchases.createdAt}, '%Y-%m')`,
      revenue: sql<number>`SUM(${purchases.amount})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(purchases)
    .where(eq(purchases.status, "completed"))
    .groupBy(sql`DATE_FORMAT(${purchases.createdAt}, '%Y-%m')`)
    .orderBy(sql`DATE_FORMAT(${purchases.createdAt}, '%Y-%m') DESC`)
    .limit(12);

  return result.reverse(); // Show oldest to newest
}

/**
 * Get average order value
 */
export async function getAverageOrderValue() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get average order value: database not available");
    return 0;
  }

  const result = await db
    .select({ avg: sql<number>`AVG(${purchases.amount})` })
    .from(purchases)
    .where(eq(purchases.status, "completed"));

  return result[0]?.avg || 0;
}
