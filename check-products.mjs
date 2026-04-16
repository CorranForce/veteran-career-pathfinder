import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute("SELECT id, name, tier, status, price, stripePriceId, isRecurring, billingInterval FROM products");
console.log(JSON.stringify(rows, null, 2));
await conn.end();
