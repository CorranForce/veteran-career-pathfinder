import { useAuth } from "@/_core/hooks/useAuth";
import { AuthenticatedNav } from "@/components/AuthenticatedNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  Check,
  CircleDollarSign,
  Copy,
  Gift,
  Loader2,
  MousePointerClick,
  RefreshCw,
  Share2,
  UserPlus,
  Users,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type ReferralStatus = "pending" | "issued" | "reversed";

const statusStyles: Record<ReferralStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  issued: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  reversed: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const statusLabels: Record<ReferralStatus, string> = {
  pending: "Pending",
  issued: "Issued",
  reversed: "Reversed",
};

function formatReward(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(value: Date | string | number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function Referrals() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);

  const codeQuery = trpc.referral.getMyCode.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const conversionsQuery = trpc.referral.getMyConversions.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const handleCopy = async () => {
    if (!codeQuery.data?.shareUrl) return;

    try {
      await navigator.clipboard.writeText(codeQuery.data.shareUrl);
      setCopied(true);
      toast.success("Referral link copied", {
        description: "Share it with a veteran who could use career guidance.",
      });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy the link", {
        description: "Select and copy the link manually instead.",
      });
    }
  };

  const handleShare = async () => {
    if (!codeQuery.data?.shareUrl) return;

    if (!navigator.share) {
      await handleCopy();
      return;
    }

    try {
      await navigator.share({
        title: "Pathfinder — Veteran Career Transition",
        text: "I found a useful AI-powered tool for translating military experience into civilian career options.",
        url: codeQuery.data.shareUrl,
      });
    } catch (error) {
      // A user dismissing the native share sheet is not an error that needs UI feedback.
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Could not open sharing options. Try copying your link instead.");
    }
  };

  const refreshData = () => {
    void Promise.all([codeQuery.refetch(), conversionsQuery.refetch()]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Refer a Veteran</CardTitle>
            <CardDescription>
              Sign in to get your personal referral link and track the impact you create.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setLocation("/login?next=/referrals")}>
              Sign in to continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = codeQuery.isLoading || conversionsQuery.isLoading;
  const hasError = codeQuery.isError || conversionsQuery.isError;
  const code = codeQuery.data;
  const conversions = conversionsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Refer a Veteran | Pathfinder</title>
        <meta
          name="description"
          content="Share Pathfinder with veterans in transition, track referrals, and view your earned account credits."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AuthenticatedNav />

      <main className="container max-w-5xl py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3 gap-1.5">
              <Gift className="h-3.5 w-3.5" />
              Refer a Veteran
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Share the next mission</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Invite fellow veterans to Pathfinder. For every completed Premium referral, you earn a $5 account credit.
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <DashboardLoading />
        ) : hasError || !code ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
              <Users className="h-10 w-10 text-muted-foreground" />
              <div>
                <h2 className="font-semibold">Your referral details are unavailable</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Please refresh the page or try again in a moment.
                </p>
              </div>
              <Button onClick={refreshData}>Try again</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background">
              <CardHeader>
                <CardTitle>Your personal referral link</CardTitle>
                <CardDescription>
                  Share this private link with a veteran who is preparing for civilian employment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input aria-label="Your personal referral link" value={code.shareUrl} readOnly className="bg-background font-mono text-sm" />
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2 sm:flex-none" onClick={handleCopy}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy link"}
                    </Button>
                    <Button className="flex-1 gap-2 sm:flex-none" variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Referral code: <span className="font-mono font-medium text-foreground">{code.code}</span>
                </p>
              </CardContent>
            </Card>

            <section aria-labelledby="referral-performance-heading">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="referral-performance-heading" className="text-lg font-semibold">Your referral performance</h2>
                <p className="text-sm text-muted-foreground">Since {formatDate(code.createdAt)}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <MousePointerClick className="mb-3 h-5 w-5 text-primary" />
                    <p className="text-2xl font-bold">{code.totalClicks}</p>
                    <p className="text-sm text-muted-foreground">Link visits</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <UserPlus className="mb-3 h-5 w-5 text-primary" />
                    <p className="text-2xl font-bold">{code.totalSignups}</p>
                    <p className="text-sm text-muted-foreground">Veterans signed up</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <Users className="mb-3 h-5 w-5 text-primary" />
                    <p className="text-2xl font-bold">{code.totalConversions}</p>
                    <p className="text-sm text-muted-foreground">Premium referrals</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <CircleDollarSign className="mb-3 h-5 w-5 text-primary" />
                    <p className="text-2xl font-bold">{formatReward(code.estimatedRewardCents)}</p>
                    <p className="text-sm text-muted-foreground">Credits earned</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Card>
              <CardHeader>
                <CardTitle>Referral history</CardTitle>
                <CardDescription>Credits are reviewed and issued after each qualifying Premium purchase.</CardDescription>
              </CardHeader>
              <CardContent>
                {conversions.length === 0 ? (
                  <div className="rounded-lg border border-dashed px-6 py-12 text-center">
                    <Gift className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                    <h2 className="font-semibold">Your first referral is waiting</h2>
                    <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                      Copy your link above and share it with someone ready to translate their service into a civilian career.
                    </p>
                    <Button className="mt-4 gap-2" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                      Copy referral link
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[540px] text-left text-sm">
                      <thead className="border-b text-muted-foreground">
                        <tr>
                          <th className="pb-3 font-medium">Referral</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Credit</th>
                          <th className="pb-3 text-right font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conversions.map((conversion) => {
                          const status = conversion.rewardStatus as ReferralStatus;
                          return (
                            <tr key={conversion.id} className="border-b last:border-0">
                              <td className="py-4 font-medium">New Premium member</td>
                              <td className="py-4 text-muted-foreground">{formatDate(conversion.createdAt)}</td>
                              <td className="py-4">{formatReward(conversion.rewardCents)}</td>
                              <td className="py-4 text-right">
                                <Badge variant="outline" className={statusStyles[status] ?? statusStyles.pending}>
                                  {statusLabels[status] ?? "Pending"}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
