import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Gift, Loader2, MousePointerClick, RotateCcw, Shield, Users, WalletCards } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AuthenticatedNav } from "@/components/AuthenticatedNav";
import { PageFooter } from "@/components/PageFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type ReferralConversion = {
  id: number;
  referralCodeId: number;
  referrerId: number;
  refereeId: number;
  purchaseId: number;
  rewardCents: number;
  rewardStatus: "pending" | "issued" | "reversed" | "failed";
  rewardIssuedAt: Date | null;
  rewardReversedAt: Date | null;
  notes: string | null;
  createdAt: Date;
};

function formatReward(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function RewardStatusBadge({ status }: { status: ReferralConversion["rewardStatus"] }) {
  if (status === "issued") return <Badge>Issued</Badge>;
  if (status === "reversed") return <Badge variant="destructive">Reversed</Badge>;
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

export default function AdminReferrals() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [conversionToReverse, setConversionToReverse] = useState<ReferralConversion | null>(null);

  const { data, isLoading, refetch } = trpc.referral.adminGetAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "platform_owner",
  });

  const issueReward = trpc.referral.issueReward.useMutation({
    onSuccess: () => {
      toast.success("Referral reward marked as issued");
      void refetch();
    },
    onError: (error) => toast.error(error.message || "Unable to issue the reward"),
  });

  const reverseReward = trpc.referral.adminReverseReward.useMutation({
    onSuccess: () => {
      toast.success("Referral reward reversed");
      setConversionToReverse(null);
      void refetch();
    },
    onError: (error) => toast.error(error.message || "Unable to reverse the reward"),
  });

  const totals = useMemo(() => {
    const codes = data?.codes ?? [];
    const conversions = data?.conversions ?? [];
    return {
      codes: codes.length,
      clicks: codes.reduce((sum, code) => sum + code.totalClicks, 0),
      signups: codes.reduce((sum, code) => sum + code.totalSignups, 0),
      conversions: conversions.length,
      pendingCents: conversions
        .filter((conversion) => conversion.rewardStatus === "pending")
        .reduce((sum, conversion) => sum + conversion.rewardCents, 0),
    };
  }, [data]);

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAuthenticated || user?.role !== "platform_owner") {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="max-w-md text-center">
          <Shield className="mx-auto mb-4 h-14 w-14 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Platform owner access required</h1>
          <p className="mt-2 text-muted-foreground">Referral reward controls are available only to the platform owner.</p>
          <Button className="mt-6" onClick={() => setLocation("/tools")}>Return to dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AuthenticatedNav />
      <main className="container mx-auto flex-1 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-primary">
              <Gift className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wide">Refer a Veteran</span>
            </div>
            <h1 className="text-3xl font-bold">Referral Management</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Monitor program engagement, review referral conversions, and record reward fulfillment after a referral credit has been delivered.
            </p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/admin/dashboard")}>Back to Admin Dashboard</Button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Active referral codes", value: totals.codes, icon: Gift },
            { label: "Referral visits", value: totals.clicks, icon: MousePointerClick },
            { label: "Attributed signups", value: totals.signups, icon: Users },
            { label: "Premium conversions", value: totals.conversions, icon: WalletCards },
            { label: "Pending reward value", value: formatReward(totals.pendingCents), icon: WalletCards },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Referral Code Performance</CardTitle>
            <CardDescription>Aggregate traffic and conversion activity for each issued referral code.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Referrer ID</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Signups</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Signup rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></TableCell></TableRow>
                ) : data?.codes?.length ? (
                  data.codes.map((code) => {
                    const signupRate = code.totalClicks ? Math.round((code.totalSignups / code.totalClicks) * 100) : 0;
                    return (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono font-medium">{code.code}</TableCell>
                        <TableCell>{code.userId}</TableCell>
                        <TableCell>{code.totalClicks.toLocaleString()}</TableCell>
                        <TableCell>{code.totalSignups.toLocaleString()}</TableCell>
                        <TableCell>{code.totalConversions.toLocaleString()}</TableCell>
                        <TableCell>{signupRate}%</TableCell>
                        <TableCell><Badge variant={code.isActive ? "outline" : "secondary"}>{code.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No referral codes have been issued yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Conversions &amp; Rewards</CardTitle>
            <CardDescription>Mark a reward as issued only after the credit has been fulfilled outside this dashboard. Reversals are intended for refunded purchases.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conversion</TableHead>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Referee</TableHead>
                  <TableHead>Purchase</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="py-8 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></TableCell></TableRow>
                ) : data?.conversions?.length ? (
                  data.conversions.map((conversion) => (
                    <TableRow key={conversion.id}>
                      <TableCell>#{conversion.id}</TableCell>
                      <TableCell>#{conversion.referrerId}</TableCell>
                      <TableCell>#{conversion.refereeId}</TableCell>
                      <TableCell>#{conversion.purchaseId}</TableCell>
                      <TableCell className="font-medium">{formatReward(conversion.rewardCents)}</TableCell>
                      <TableCell>{format(new Date(conversion.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell><RewardStatusBadge status={conversion.rewardStatus} /></TableCell>
                      <TableCell className="text-right">
                        {conversion.rewardStatus === "pending" ? (
                          <Button size="sm" onClick={() => issueReward.mutate({ conversionId: conversion.id })} disabled={issueReward.isPending}>
                            {issueReward.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark issued"}
                          </Button>
                        ) : conversion.rewardStatus === "issued" ? (
                          <Button size="sm" variant="outline" onClick={() => setConversionToReverse(conversion as ReferralConversion)}>
                            <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reverse
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">No action</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No Premium purchases have been attributed to a referral yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <PageFooter />

      <AlertDialog open={Boolean(conversionToReverse)} onOpenChange={(open) => !open && setConversionToReverse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reverse this referral reward?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks the {conversionToReverse ? formatReward(conversionToReverse.rewardCents) : ""} reward for conversion #{conversionToReverse?.id} as reversed. Use this only when the related purchase has been refunded or the reward must be cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reverseReward.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => conversionToReverse && reverseReward.mutate({ conversionId: conversionToReverse.id, notes: "Reversed by platform owner" })}
              disabled={reverseReward.isPending}
            >
              {reverseReward.isPending ? "Reversing…" : "Reverse reward"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
