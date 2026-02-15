import { router, platformOwnerProcedure } from "../_core/trpc";
import { getAnalytics } from "../db";

export const analyticsRouter = router({
  // Get site-wide analytics (platform owner only)
  getSiteAnalytics: platformOwnerProcedure.query(async () => {
    const analytics = await getAnalytics();
    
    if (!analytics) {
      return {
        totalUsers: 0,
        totalResumes: 0,
        completedAnalyses: 0,
        avgAtsScore: 0,
        recentUsers: 0,
        recentResumes: 0,
        scoreDistribution: [],
      };
    }

    return analytics;
  }),
});
