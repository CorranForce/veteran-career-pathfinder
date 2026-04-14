import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const content = readFileSync(join(__dirname, "../blog-post-ai-tools.md"), "utf-8");

// Extract just the main content section (after the frontmatter block)
const contentStart = content.indexOf("## Content\n\n") + "## Content\n\n".length;
const postContent = content.slice(contentStart).trim();

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const now = new Date().toISOString().slice(0, 19).replace('T', ' '); // MySQL datetime string

const [result] = await connection.execute(
  `INSERT INTO blog_posts 
   (title, slug, excerpt, content, coverImageUrl, status, authorId, authorName, metaTitle, metaDescription, publishedAt, createdAt, updatedAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
   ON DUPLICATE KEY UPDATE
     title = VALUES(title),
     excerpt = VALUES(excerpt),
     content = VALUES(content),
     coverImageUrl = VALUES(coverImageUrl),
     status = VALUES(status),
     authorId = VALUES(authorId),
     authorName = VALUES(authorName),
     metaTitle = VALUES(metaTitle),
     metaDescription = VALUES(metaDescription),
     publishedAt = VALUES(publishedAt),
     updatedAt = VALUES(updatedAt)`,
  [
    "AI Tools Every Veteran Should Use for Job Search",
    "ai-tools-veteran-job-search",
    "From translating your MOS into civilian language to building an ATS-optimized resume in minutes, these AI tools give veterans an unfair advantage in the civilian job market.",
    postContent,
    "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&q=80",
    "published",
    1, // Allen Davis - platform owner
    "Allen | Pathfinder",
    "AI Tools Every Veteran Should Use for Job Search | Pathfinder",
    "Discover the best AI tools for veteran job seekers — from resume builders and MOS translators to interview coaches and salary negotiators. Get the civilian edge you deserve.",
    now,
    now,
    now,
  ]
);

console.log("Blog post 2 inserted/updated:", result);
await connection.end();
