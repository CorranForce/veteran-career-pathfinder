import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, FileText, TrendingUp, Award, Activity, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: analytics, isLoading } = trpc.analytics.getSiteAnalytics.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "platform_owner" }
  );

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "platform_owner")) {
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Analytics</h1>
              <p className="text-muted-foreground mt-1">
                Site-wide metrics and performance overview
              </p>
            </div>
            <button
              onClick={() => setLocation("/")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{analytics.recentUsers} in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalResumes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{analytics.recentResumes} in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Analyses</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.completedAnalyses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.totalResumes > 0
                  ? `${Math.round((analytics.completedAnalyses / analytics.totalResumes) * 100)}% completion rate`
                  : "No resumes yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg ATS Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.avgAtsScore}/100</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.avgAtsScore >= 80
                  ? "Excellent average"
                  : analytics.avgAtsScore >= 60
                  ? "Good average"
                  : "Room for improvement"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Score Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              ATS Score Distribution
            </CardTitle>
            <CardDescription>
              Distribution of resume ATS scores across all analyzed resumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.scoreDistribution && analytics.scoreDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="scoreRange" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Number of Resumes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No score data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity (Last 7 Days)
            </CardTitle>
            <CardDescription>
              New users and resume uploads in the past week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">New Users</p>
                    <p className="text-sm text-muted-foreground">Registered accounts</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">{analytics.recentUsers}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">New Resumes</p>
                    <p className="text-sm text-muted-foreground">Uploaded for analysis</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">{analytics.recentResumes}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
