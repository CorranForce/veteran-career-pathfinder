import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Check current state — use DESCRIBE to find actual column names first
const [cols] = await connection.execute('DESCRIBE products');
console.log('Columns:', cols.map(c => c.Field).join(', '));

// Check current state
const [rows] = await connection.execute('SELECT id, name, tier, status FROM products ORDER BY id');
console.log('\nCurrent products:');
console.table(rows);

// Fix: reactivate archived products that have valid tiers
const [result] = await connection.execute(
  `UPDATE products SET status = 'active', archivedAt = NULL WHERE tier IN ('pro', 'premium') AND status = 'archived'`
);
console.log(`\nFixed ${result.affectedRows} products (set status=active)`);

// Verify
const [after] = await connection.execute('SELECT id, name, tier, status FROM products ORDER BY id');
console.log('\nAfter fix:');
console.table(after);

await connection.end();
