import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Target, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { AuthenticatedNav } from "@/components/AuthenticatedNav";
import { PageFooter } from "@/components/PageFooter";

export default function Marketing() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect non-admins
  if (user?.role !== "admin") {
    navigate("/");
    return null;
  }

  // Fetch marketing data
  const { data: dripStats } = trpc.marketing.getDripStats.useQuery();
  const { data: segmentStats } = trpc.marketing.getSegmentStats.useQuery();
  const { data: dripCampaigns } = trpc.marketing.getDripCampaigns.useQuery();
  const { data: reEngagementCandidates } = trpc.marketing.getReEngagementCandidates.useQuery();
  const { data: upsellCandidates } = trpc.marketing.getUpsellCandidates.useQuery();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AuthenticatedNav />
      <div className="flex-1 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Marketing Automation</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Manage drip campaigns, A/B tests, and subscriber segments
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/admin">Back to Admin</a>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="drip" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="drip">Drip Campaigns</TabsTrigger>
            <TabsTrigger value="ab">A/B Testing</TabsTrigger>
            <TabsTrigger value="segments">Segments</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          {/* Drip Campaigns Tab */}
          <TabsContent value="drip" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {dripStats?.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    <CardDescription>Day {campaign.dayOffset}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Sent</p>
                      <p className="text-2xl font-bold">{campaign.sent}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Open Rate</p>
                      <p className="text-2xl font-bold">{campaign.openRate}%</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      Edit Campaign
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* A/B Testing Tab */}
          <TabsContent value="ab" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>A/B Test Performance</CardTitle>
                <CardDescription>
                  Subject line variants and their performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    A/B testing framework is active. Variants are assigned randomly based on weights.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="font-semibold mb-2">How it works:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>Create multiple subject line variants for each campaign</li>
                      <li>Subscribers receive random variants based on weight distribution</li>
                      <li>Track open rates for each variant</li>
                      <li>Determine winner based on highest open rate</li>
                      <li>Automatically adjust weights to favor winning variant</li>
                    </ul>
                  </div>
                  <Button>Create New A/B Test</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Segment Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Segment Distribution</CardTitle>
                  <CardDescription>Subscribers by engagement level</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Highly Engaged</span>
                      <Badge className="bg-green-600">{segmentStats?.highly_engaged || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active</span>
                      <Badge className="bg-blue-600">{segmentStats?.active || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Inactive</span>
                      <Badge className="bg-yellow-600">{segmentStats?.inactive || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cold Leads</span>
                      <Badge className="bg-red-600">{segmentStats?.cold_lead || 0}</Badge>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold">Total Subscribers: {segmentStats?.total || 0}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Segmentation Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Segmentation Strategy</CardTitle>
                  <CardDescription>How subscribers are classified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-green-600">Highly Engaged (Score ≥ 15)</p>
                      <p className="text-muted-foreground">Perfect for premium upsells</p>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-600">Active (Score 5-14)</p>
                      <p className="text-muted-foreground">Regular engagement with content</p>
                    </div>
                    <div>
                      <p className="font-semibold text-yellow-600">Inactive (Score 1-4)</p>
                      <p className="text-muted-foreground">Needs re-engagement campaign</p>
                    </div>
                    <div>
                      <p className="font-semibold text-red-600">Cold Leads (Score 0)</p>
                      <p className="text-muted-foreground">No engagement yet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Re-engagement Campaign */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Re-engagement Campaign
                  </CardTitle>
                  <CardDescription>Target inactive subscribers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Candidates</p>
                    <p className="text-2xl font-bold">{reEngagementCandidates?.length || 0}</p>
                  </div>
                  <p className="text-sm">
                    Send a special offer or valuable content to win back inactive subscribers.
                  </p>
                  <Button className="w-full">Launch Re-engagement Campaign</Button>
                </CardContent>
              </Card>

              {/* Upsell Campaign */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Upsell Campaign
                  </CardTitle>
                  <CardDescription>Target highly engaged subscribers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Candidates</p>
                    <p className="text-2xl font-bold">{upsellCandidates?.length || 0}</p>
                  </div>
                  <p className="text-sm">
                    Promote premium offerings to your most engaged subscribers.
                  </p>
                  <Button className="w-full">Launch Upsell Campaign</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Total Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{dripCampaigns?.length || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">4</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {dripStats && dripStats.length > 0
                  ? Math.round(
                      dripStats.reduce((sum, c) => sum + c.openRate, 0) / dripStats.length
                    )
                  : 0}
                %
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      <PageFooter />
    </div>
  );
}
