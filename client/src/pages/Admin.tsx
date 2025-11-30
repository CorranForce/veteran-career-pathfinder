import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Download, Mail, TrendingUp, Users, Calendar, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Admin() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const { data: subscribers, isLoading: subsLoading } = trpc.email.getAll.useQuery();
  const { data: analytics, isLoading: analyticsLoading } = trpc.email.getAnalytics.useQuery();
  const { data: engagement, isLoading: engagementLoading } = trpc.email.getEngagement.useQuery();

  const handleExportCSV = () => {
    if (!subscribers || subscribers.length === 0) {
      toast.error("No subscribers to export");
      return;
    }

    // Create CSV content
    const headers = ["Email", "Name", "Source", "Status", "Subscribed Date"];
    const rows = subscribers.map((sub) => [
      sub.email,
      sub.name || "",
      sub.source || "",
      sub.status,
      new Date(sub.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Subscriber list exported successfully!");
  };

  if (authLoading || subsLoading || analyticsLoading || engagementLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Simple auth check - in production, you'd want proper role-based access control
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Access Restricted</h1>
        <p className="text-muted-foreground">Please log in to access the admin dashboard.</p>
        <Button asChild>
          <a href={`/api/auth/login?redirect=${encodeURIComponent("/admin")}`}>Log In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Site
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage subscribers and view analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Logged in as {user?.name || user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 space-y-8">
        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.total || 0}</div>
              <p className="text-xs text-muted-foreground">Active email subscribers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.last24Hours || 0}</div>
              <p className="text-xs text-muted-foreground">New subscribers today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.last7Days || 0}</div>
              <p className="text-xs text-muted-foreground">This week's growth</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.last30Days || 0}</div>
              <p className="text-xs text-muted-foreground">This month's growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriber Sources */}
        {analytics?.bySource && Object.keys(analytics.bySource).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subscriber Sources</CardTitle>
              <CardDescription>Where your subscribers are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(analytics.bySource).map(([source, count]) => (
                  <Badge key={source} variant="secondary" className="text-sm">
                    {source}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Email Engagement</CardTitle>
            <CardDescription>Track how subscribers interact with your emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                <p className="text-3xl font-bold">{engagement?.openRate || 0}%</p>
                <p className="text-xs text-muted-foreground">
                  {engagement?.uniqueOpens || 0} of {engagement?.totalSent || 0} emails opened
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                <p className="text-3xl font-bold">{engagement?.clickRate || 0}%</p>
                <p className="text-xs text-muted-foreground">
                  {engagement?.uniqueClicks || 0} emails with clicks
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Click-to-Open Rate</p>
                <p className="text-3xl font-bold">{engagement?.clickToOpenRate || 0}%</p>
                <p className="text-xs text-muted-foreground">
                  {engagement?.clicks || 0} total clicks
                </p>
              </div>
            </div>
            {engagement && engagement.recentEvents && engagement.recentEvents.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {engagement.recentEvents.slice(0, 10).map((event, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm border-b pb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={event.eventType === "open" ? "default" : "secondary"}>
                          {event.eventType}
                        </Badge>
                        <span className="text-muted-foreground">{event.email}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscriber List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscriber List</CardTitle>
                <CardDescription>
                  {subscribers?.length || 0} total subscribers
                </CardDescription>
              </div>
              <Button onClick={handleExportCSV} disabled={!subscribers || subscribers.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!subscribers || subscribers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No subscribers yet. Share your email capture form to start building your list!
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>{subscriber.name || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{subscriber.source || "unknown"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={subscriber.status === "active" ? "default" : "secondary"}>
                            {subscriber.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(subscriber.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
