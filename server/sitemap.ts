/**
 * sitemap.ts — generates sitemap.xml for Pathfinder
 *
 * Includes:
 *   • Static pages (home, blog listing, pricing, about)
 *   • All published blog posts (fetched from DB at request time)
 *
 * Register the route in server/_core/index.ts BEFORE the tRPC middleware.
 */
import { Request, Response } from "express";
import { getDb } from "./db";
import { blogPosts } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const SITE_URL = (process.env.FRONTEND_URL || "https://pathfinder.casa").replace(/\/$/, "");

/** Static pages with their change frequency and priority */
const STATIC_PAGES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
];

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toW3CDate(date: Date | null | undefined): string {
  if (!date) return new Date().toISOString().split("T")[0];
  return new Date(date).toISOString().split("T")[0];
}

export async function handleSitemap(req: Request, res: Response) {
  try {
    // Fetch all published blog posts
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const posts = await db
      .select({
        slug: blogPosts.slug,
        updatedAt: blogPosts.updatedAt,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));

    const urlEntries: string[] = [];

    // Static pages
    for (const page of STATIC_PAGES) {
      urlEntries.push(`  <url>
    <loc>${xmlEscape(SITE_URL + page.path)}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
    }

    // Blog post pages
    for (const post of posts) {
      const lastmod = toW3CDate(post.updatedAt ?? post.publishedAt);
      urlEntries.push(`  <url>
    <loc>${xmlEscape(SITE_URL + "/blog/" + post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600"); // cache for 1 hour
    res.status(200).send(xml);
  } catch (err) {
    console.error("[Sitemap] Error generating sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
}
