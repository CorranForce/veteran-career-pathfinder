import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Test purchase data
const testPurchases = [
  {
    userId: 1, // Your user ID
    stripePaymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    amount: 29.00,
    currency: 'usd',
    status: 'completed',
    productType: 'premium_prompt',
    createdAt: new Date('2025-10-15'),
  },
  {
    userId: 1,
    stripePaymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    amount: 29.00,
    currency: 'usd',
    status: 'completed',
    productType: 'premium_prompt',
    createdAt: new Date('2025-11-03'),
  },
  {
    userId: 1,
    stripePaymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    amount: 29.00,
    currency: 'usd',
    status: 'completed',
    productType: 'premium_prompt',
    createdAt: new Date('2025-11-18'),
  },
  {
    userId: 1,
    stripePaymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    amount: 29.00,
    currency: 'usd',
    status: 'completed',
    productType: 'premium_prompt',
    createdAt: new Date('2025-12-05'),
  },
  {
    userId: 1,
    stripePaymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    amount: 29.00,
    currency: 'usd',
    status: 'completed',
    productType: 'premium_prompt',
    createdAt: new Date('2025-12-22'),
  },
  {
    userId: 1,
    stripePaymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    amount: 29.00,
    currency: 'usd',
    status: 'completed',
    productType: 'premium_prompt',
    createdAt: new Date('2026-01-10'),
  },
  {
    userId: 1,
    stripePaymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    amount: 29.00,
    currency: 'usd',
    status: 'completed',
    productType: 'premium_prompt',
    createdAt: new Date('2026-01-25'),
  },
  {
    userId: 1,
    stripePaymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    amount: 29.00,
    currency: 'usd',
    status: 'completed',
    productType: 'premium_prompt',
    createdAt: new Date('2026-02-08'),
  },
  {
    userId: 1,
    stripePaymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    amount: 29.00,
    currency: 'usd',
    status: 'completed',
    productType: 'premium_prompt',
    createdAt: new Date('2026-02-14'),
  },
  {
    userId: 1,
    stripePaymentIntentId: 'pi_test_' + Math.random().toString(36).substr(2, 9),
    amount: 29.00,
    currency: 'usd',
    status: 'completed',
    productType: 'premium_prompt',
    createdAt: new Date('2026-02-15'),
  },
];

console.log('Inserting test purchase data...');

for (const purchase of testPurchases) {
  await connection.execute(
    'INSERT INTO purchases (userId, stripePaymentIntentId, amount, currency, status, productType, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      purchase.userId,
      purchase.stripePaymentIntentId,
      purchase.amount,
      purchase.currency,
      purchase.status,
      purchase.productType,
      purchase.createdAt,
      new Date(),
    ]
  );
  console.log(`✓ Added purchase: $${purchase.amount} on ${purchase.createdAt.toISOString().split('T')[0]}`);
}

console.log('\n✅ Test data seeded successfully!');
console.log(`Total purchases added: ${testPurchases.length}`);
console.log(`Total revenue: $${testPurchases.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}`);

await connection.end();
