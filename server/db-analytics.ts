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

  // Use raw SQL to avoid Drizzle ORM issues with DATE_FORMAT in GROUP BY
  const result = await db.execute(sql`
    SELECT 
      DATE_FORMAT(createdAt, '%Y-%m') as month,
      SUM(amount) as revenue,
      COUNT(*) as count
    FROM purchases
    WHERE status = 'completed'
    GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
    ORDER BY DATE_FORMAT(createdAt, '%Y-%m') DESC
    LIMIT 12
  `);

  // Convert result to expected format
  const rows = Array.isArray(result) ? result : (result as any).rows || [];
  return rows.reverse(); // Show oldest to newest
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

/**
 * Get customer lifetime value analytics
 */
export async function getLTVAnalytics() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get LTV analytics: database not available");
    return {
      avgRevenuePerUser: 0,
      totalPayingCustomers: 0,
      repeatPurchaseRate: 0,
      topCustomers: [],
    };
  }

  // Get average revenue per paying user
  const avgRevenueResult = await db
    .select({
      avgRevenue: sql<number>`AVG(total_spent)`,
    })
    .from(
      sql`(
        SELECT ${purchases.userId}, SUM(${purchases.amount}) as total_spent
        FROM ${purchases}
        WHERE ${purchases.status} = 'completed'
        GROUP BY ${purchases.userId}
      ) as user_totals`
    );

  const avgRevenuePerUser = avgRevenueResult[0]?.avgRevenue || 0;

  // Get total number of paying customers
  const payingCustomersResult = await db
    .select({
      count: sql<number>`COUNT(DISTINCT ${purchases.userId})`,
    })
    .from(purchases)
    .where(eq(purchases.status, "completed"));

  const totalPayingCustomers = payingCustomersResult[0]?.count || 0;

  // Get repeat purchase rate (customers with 2+ purchases / total customers)
  const repeatCustomersResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(
      sql`(
        SELECT ${purchases.userId}, COUNT(*) as purchase_count
        FROM ${purchases}
        WHERE ${purchases.status} = 'completed'
        GROUP BY ${purchases.userId}
        HAVING purchase_count >= 2
      ) as repeat_customers`
    );

  const repeatCustomers = repeatCustomersResult[0]?.count || 0;
  const repeatPurchaseRate = totalPayingCustomers > 0 
    ? (repeatCustomers / totalPayingCustomers) * 100 
    : 0;

  // Get top 10 customers by total spend
  const topCustomersResult = await db
    .select({
      userId: purchases.userId,
      totalSpent: sql<number>`SUM(${purchases.amount})`.as('totalSpent'),
      purchaseCount: sql<number>`COUNT(*)`.as('purchaseCount'),
      firstPurchase: sql<Date>`MIN(${purchases.createdAt})`.as('firstPurchase'),
      lastPurchase: sql<Date>`MAX(${purchases.createdAt})`.as('lastPurchase'),
    })
    .from(purchases)
    .where(eq(purchases.status, "completed"))
    .groupBy(purchases.userId)
    .orderBy(desc(sql`SUM(${purchases.amount})`))
    .limit(10);

  return {
    avgRevenuePerUser,
    totalPayingCustomers,
    repeatPurchaseRate,
    topCustomers: topCustomersResult,
  };
}
