import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const [rows] = await connection.execute(
  'SELECT id, name, tier, status, stripeProductId, stripePriceId, price FROM products WHERE status = "active" ORDER BY id'
);
console.log('Active products:');
console.table(rows);

await connection.end();
