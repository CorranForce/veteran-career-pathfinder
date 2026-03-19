import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Star,
  Zap,
  ArrowUpCircle,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(amountInCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountInCents / 100);
}

function StatusBadge({ status, cancelAtPeriodEnd }: { status: string; cancelAtPeriodEnd?: boolean }) {
  if (cancelAtPeriodEnd) {
    return (
      <Badge variant="outline" className="border-orange-400 text-orange-600 bg-orange-50 dark:bg-orange-950/30">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Cancels at Period End
      </Badge>
    );
  }
  switch (status) {
    case "active":
      return (
        <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 dark:bg-green-950/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    case "past_due":
      return (
        <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50 dark:bg-red-950/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Past Due
        </Badge>
      );
    case "canceled":
      return (
        <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
          Canceled
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="capitalize">
          {status}
        </Badge>
      );
  }
}

export default function SubscriptionStatusCard() {
  const [, setLocation] = useLocation();
  const { data: subscription, isLoading } = trpc.payment.getSubscriptionStatus.useQuery();

  const createPortalSession = trpc.payment.createPortalSession.useMutation({
    onSuccess: (data) => {
      // Open the Stripe Customer Portal in a new tab
      window.open(data.url, "_blank", "noopener,noreferrer");
    },
    onError: (err) => {
      console.error("[SubscriptionStatusCard] Portal session error:", err);
      toast.error("Unable to open billing portal. Please try again.");
    },
  });

  const handleUpgrade = () => {
    setLocation("/pricing");
  };

  const handleManageBilling = () => {
    toast.info("Opening Stripe billing portal…");
    createPortalSession.mutate();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Subscription & Plan</CardTitle>
            <CardDescription>Your current plan and billing information</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !subscription ? (
          <p className="text-sm text-muted-foreground">Unable to load subscription data.</p>
        ) : subscription.tier === "free" ? (
          /* ── Free Tier ── */
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                  <Star className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Free Plan</p>
                  <p className="text-sm text-muted-foreground">Limited access to Pathfinder content</p>
                </div>
              </div>
              <StatusBadge status="active" />
            </div>

            <Separator />

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-3">
              <p className="text-sm font-medium">Unlock the full Pathfinder experience</p>
              <p className="text-sm text-muted-foreground">
                Upgrade to Premium for one-time lifetime access, or Pro for monthly support, webinars, and community.
              </p>
              <Button onClick={handleUpgrade} size="sm" className="gap-2">
                <ArrowUpCircle className="h-4 w-4" />
                View Upgrade Options
              </Button>
            </div>
          </div>
        ) : subscription.tier === "premium" ? (
          /* ── Premium One-Time ── */
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Star className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold">Premium Prompt Access</p>
                  <p className="text-sm text-muted-foreground">One-time purchase · Lifetime access</p>
                </div>
              </div>
              <StatusBadge status="active" />
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Purchase Date</p>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(subscription.purchasedAt)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Amount Paid</p>
                <p className="text-sm font-medium">
                  {formatCurrency(subscription.amount, subscription.currency)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Billing</p>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  No recurring charges
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Access</p>
                <p className="text-sm font-medium">Lifetime</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-muted-foreground">
                Want monthly webinars and community access?
              </p>
              <Button variant="outline" size="sm" onClick={handleUpgrade} className="gap-2">
                <Zap className="h-4 w-4" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        ) : (
          /* ── Pro Subscription ── */
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Pro Membership</p>
                  <p className="text-sm text-muted-foreground">Monthly subscription</p>
                </div>
              </div>
              <StatusBadge
                status={subscription.status}
                cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  {subscription.cancelAtPeriodEnd ? "Access Until" : "Next Billing Date"}
                </p>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                  {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Monthly Amount</p>
                <p className="text-sm font-medium">
                  {formatCurrency(subscription.amount, subscription.currency)}/mo
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Member Since</p>
                <p className="text-sm font-medium">
                  {formatDate(subscription.purchasedAt)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Billing Cycle</p>
                <p className="text-sm font-medium">Monthly</p>
              </div>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <div className="rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 p-3">
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  Your subscription is set to cancel on {formatDate(subscription.nextBillingDate)}. You will retain access until then.
                </p>
              </div>
            )}

            {subscription.status === "past_due" && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  Your payment is past due. Please update your payment method to maintain access.
                </p>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageBilling}
                disabled={createPortalSession.isPending}
                className="gap-2"
              >
                {createPortalSession.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                {createPortalSession.isPending ? "Opening Portal…" : "Manage Billing"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
