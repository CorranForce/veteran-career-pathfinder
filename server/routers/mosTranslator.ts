import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { mosCodes, civilianCareerPaths, mosTranslatorSessions, MosCode, CivilianCareerPath } from "../../drizzle/schema";
import { eq, like, or, and } from "drizzle-orm";
import crypto from "crypto";

export const mosTranslatorRouter = router({
  /**
   * Search MOS codes by code, title, or keyword
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(50),
        branch: z.enum(["army", "navy", "air_force", "marine_corps", "coast_guard", "space_force", "all"]).optional().default("all"),
      })
    )
    .query(async ({ input }) => {
      const { query, branch } = input;
      const q = `%${query.trim().toUpperCase()}%`;
      const qLower = `%${query.trim().toLowerCase()}%`;

      const conditions = [
        or(
          like(mosCodes.code, q),
          like(mosCodes.title, `%${query.trim()}%`),
          like(mosCodes.searchKeywords, qLower),
          like(mosCodes.description, `%${query.trim()}%`)
        )!,
        eq(mosCodes.isActive, true),
      ];

      if (branch !== "all") {
        conditions.push(eq(mosCodes.branch, branch));
      }

      const db = await getDb();
      if (!db) return [];
      const results = await db
        .select({
          id: mosCodes.id,
          code: mosCodes.code,
          branch: mosCodes.branch,
          title: mosCodes.title,
          description: mosCodes.description,
          category: mosCodes.category,
          keySkills: mosCodes.keySkills,
        })
        .from(mosCodes)
        .where(and(...conditions))
        .limit(20);

      return results.map((r: { id: number; code: string; branch: string; title: string; description: string; category: string; keySkills: string }) => ({
        ...r,
        keySkills: JSON.parse(r.keySkills || "[]") as string[],
      }));
    }),

  /**
   * Get full MOS details with all civilian career paths
   */
  getByCode: publicProcedure
    .input(
      z.object({
        code: z.string().min(1).max(20),
        ipAddress: z.string().optional(), // passed from client for session tracking
        userId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { code } = input;

      const db = await getDb();
      if (!db) return null;
      const [mos] = await db
        .select()
        .from(mosCodes)
        .where(and(eq(mosCodes.code, code.toUpperCase()), eq(mosCodes.isActive, true)))
        .limit(1);

      if (!mos) return null;

      const paths = await db
        .select()
        .from(civilianCareerPaths)
        .where(eq(civilianCareerPaths.mosId, mos.id))
        .orderBy(civilianCareerPaths.displayOrder);

      // Track session (fire-and-forget)
      const ipHash = input.ipAddress
        ? crypto.createHash("sha256").update(input.ipAddress).digest("hex")
        : null;

      db?.insert(mosTranslatorSessions)
        .values({
          userId: input.userId ?? null,
          mosCode: code.toUpperCase(),
          branch: mos.branch,
          ipHash,
        })
        .catch(() => {}); // non-blocking

      return {
        mos: {
          ...mos,
          keySkills: JSON.parse(mos.keySkills || "[]") as string[],
        },
        careerPaths: paths.map((p: CivilianCareerPath) => ({
          ...p,
          requiredCerts: JSON.parse(p.requiredCerts || "[]") as string[],
          recommendedCerts: JSON.parse(p.recommendedCerts || "[]") as string[],
          transferableSkills: JSON.parse(p.transferableSkills || "[]") as string[],
          skillsGap: JSON.parse(p.skillsGap || "[]") as string[],
          exampleEmployers: JSON.parse(p.exampleEmployers || "[]") as string[],
        })),
      };
    }),

  /**
   * Get all available branches for the filter dropdown
   */
  getBranches: publicProcedure.query(async () => {
    return [
      { value: "all", label: "All Branches" },
      { value: "army", label: "Army" },
      { value: "navy", label: "Navy" },
      { value: "air_force", label: "Air Force" },
      { value: "marine_corps", label: "Marine Corps" },
      { value: "coast_guard", label: "Coast Guard" },
      { value: "space_force", label: "Space Force" },
    ];
  }),

  /**
   * Get popular/featured MOS codes for the landing state
   */
  getFeatured: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const featured = await db
      .select({
        id: mosCodes.id,
        code: mosCodes.code,
        branch: mosCodes.branch,
        title: mosCodes.title,
        category: mosCodes.category,
      })
      .from(mosCodes)
      .where(eq(mosCodes.isActive, true))
      .limit(12);

    return featured;
  }),

  /**
   * Admin: Get translator usage stats
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "platform_owner" && ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const [totalSearches] = await db
      .select({ count: mosTranslatorSessions.id })
      .from(mosTranslatorSessions);

    const topSearches = await db
      .select({
        mosCode: mosTranslatorSessions.mosCode,
        branch: mosTranslatorSessions.branch,
      })
      .from(mosTranslatorSessions)
      .limit(10);

    return {
      totalSearches: totalSearches?.count ?? 0,
      topSearches,
    };
  }),
});
