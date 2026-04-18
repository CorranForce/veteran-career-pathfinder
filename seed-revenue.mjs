/**
 * Seed script: inserts 12 months of realistic test purchase data
 * into the purchases table so the Revenue Trend chart has data to display.
 * Run once: node seed-revenue.mjs
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);

// Find the first real user to attach purchases to (or use userId=1)
const [rows] = await conn.execute("SELECT id FROM users ORDER BY id ASC LIMIT 1");
const userId = rows[0]?.id ?? 1;
console.log(`Attaching test purchases to userId=${userId}`);

// Generate 12 months of data ending this month
const now = new Date();
const records = [];

for (let i = 11; i >= 0; i--) {
  const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

  // Vary the number of sales per month (ramp up over time for a growth story)
  const premiumCount = 1 + Math.floor((12 - i) * 0.4 + Math.random() * 2);
  const proCount = Math.floor((12 - i) * 0.3 + Math.random() * 1.5);

  for (let p = 0; p < premiumCount; p++) {
    const dayOffset = Math.floor(Math.random() * 28);
    const purchaseDate = new Date(date.getFullYear(), date.getMonth(), 1 + dayOffset);
    records.push({
      userId,
      productType: "premium_prompt",
      amount: 2900, // $29.00
      currency: "USD",
      status: "completed",
      stripePaymentIntentId: `pi_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: purchaseDate,
    });
  }

  for (let p = 0; p < proCount; p++) {
    const dayOffset = Math.floor(Math.random() * 28);
    const purchaseDate = new Date(date.getFullYear(), date.getMonth(), 1 + dayOffset);
    records.push({
      userId,
      productType: "pro_subscription",
      amount: 999, // $9.99
      currency: "USD",
      status: "completed",
      stripeSubscriptionId: `sub_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: purchaseDate,
    });
  }
}

console.log(`Inserting ${records.length} test purchase records...`);

for (const r of records) {
  await conn.execute(
    `INSERT INTO purchases (userId, productType, amount, currency, status, stripePaymentIntentId, stripeSubscriptionId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      r.userId,
      r.productType,
      r.amount,
      r.currency,
      r.status,
      r.stripePaymentIntentId ?? null,
      r.stripeSubscriptionId ?? null,
      r.createdAt,
      r.createdAt,
    ]
  );
}

await conn.end();
console.log("Done! Revenue chart should now show 12 months of data.");
