import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Wifi,
  Webhook,
  DollarSign,
  Clock,
  Zap,
  FlaskConical,
  Rocket,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "ok" | "degraded" | "error" | null }) {
  if (!status) return <Badge variant="outline">Unknown</Badge>;
  if (status === "ok")
    return (
      <Badge className="bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/20">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Healthy
      </Badge>
    );
  if (status === "degraded")
    return (
      <Badge className="bg-yellow-500/15 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/20">
        <AlertTriangle className="h-3 w-3 mr-1" /> Degraded
      </Badge>
    );
  return (
    <Badge className="bg-red-500/15 text-red-600 border-red-500/30 hover:bg-red-500/20">
      <XCircle className="h-3 w-3 mr-1" /> Error
    </Badge>
  );
}

function CheckRow({
  icon: Icon,
  label,
  value,
  ok,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
  ok: boolean | null;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs font-mono text-muted-foreground">{value}</span>}
        {ok === null ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : ok ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
    </div>
  );
}

// ─── component ──────────────────────────────────────────────────────────────

export function StripeHealthCard() {
  const utils = trpc.useUtils();

  const { data: stripeMode } = trpc.stripeProducts.getStripeMode.useQuery();

  const { data: latestPing, isLoading } = trpc.stripeProducts.getLatestPing.useQuery(undefined, {
    refetchInterval: 60_000, // refresh every minute in background
  });

  const pingMutation = trpc.stripeProducts.pingStripe.useMutation({
    onMutate: () => {
      toast.loading("Pinging Stripe…", { id: "stripe-ping" });
    },
    onSuccess: (result) => {
      utils.stripeProducts.getLatestPing.invalidate();
      utils.stripeProducts.getPingHistory.invalidate();

      if (result.status === "ok") {
        toast.success(`Stripe is healthy — ${result.latencyMs}ms`, {
          id: "stripe-ping",
          description: `Account: ${result.accountId ?? "N/A"} · Webhook: ${result.webhookConfigured ? "✓" : "✗"} · Prices: ${result.premiumPriceValid && result.proPriceValid ? "✓" : "✗"}`,
        });
      } else if (result.status === "degraded") {
        toast.warning(`Stripe degraded — ${result.latencyMs}ms`, {
          id: "stripe-ping",
          description: buildDegradedMessage(result),
        });
      } else {
        toast.error(`Stripe error — ${result.errorMessage ?? "Unknown"}`, {
          id: "stripe-ping",
        });
      }
    },
    onError: (err) => {
      toast.error(`Ping failed: ${err.message}`, { id: "stripe-ping" });
    },
  });

  function buildDegradedMessage(result: {
    webhookConfigured: boolean;
    premiumPriceValid: boolean;
    proPriceValid: boolean;
  }): string {
    const issues: string[] = [];
    if (!result.webhookConfigured) issues.push("Webhook not configured");
    if (!result.premiumPriceValid) issues.push("STRIPE_PREMIUM_PRICE_ID invalid");
    if (!result.proPriceValid) issues.push("STRIPE_PRO_PRICE_ID invalid");
    return issues.join(" · ");
  }

  const checkedAt = latestPing?.createdAt
    ? new Date(latestPing.createdAt).toLocaleString()
    : null;

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Stripe Health</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {stripeMode && (
              stripeMode.mode === "live" ? (
                <Badge className="bg-green-600/15 text-green-700 border-green-600/30 hover:bg-green-600/20 gap-1">
                  <Rocket className="h-3 w-3" /> Live Mode
                </Badge>
              ) : (
                <Badge className="bg-orange-500/15 text-orange-600 border-orange-500/30 hover:bg-orange-500/20 gap-1">
                  <FlaskConical className="h-3 w-3" /> Test Mode
                </Badge>
              )
            )}
            <StatusBadge status={latestPing?.status ?? null} />
          </div>
        </div>
        <CardDescription>
          Bi-directional connectivity check · heartbeat every 15 minutes
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Latency */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Zap className="h-4 w-4 text-primary" />
            Last Latency
          </div>
          <span className="text-2xl font-bold tabular-nums">
            {isLoading ? "—" : latestPing ? `${latestPing.latencyMs}ms` : "—"}
          </span>
        </div>

        <Separator />

        {/* Check rows */}
        <div className="space-y-0.5">
          <CheckRow
            icon={Wifi}
            label="Account reachable"
            value={latestPing?.accountId ?? undefined}
            ok={latestPing ? !!latestPing.accountId : null}
          />
          <CheckRow
            icon={Webhook}
            label="Webhook configured"
            ok={latestPing ? latestPing.webhookConfigured : null}
          />
          {latestPing?.webhookLastDeliveryAt && (
            <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>Last webhook event received</span>
              </div>
              <span className="font-mono">
                {new Date(latestPing.webhookLastDeliveryAt).toLocaleString()}
              </span>
            </div>
          )}
          <CheckRow
            icon={DollarSign}
            label="Premium price ID valid"
            ok={latestPing ? latestPing.premiumPriceValid : null}
          />
          <CheckRow
            icon={DollarSign}
            label="Pro price ID valid"
            ok={latestPing ? latestPing.proPriceValid : null}
          />
        </div>

        {/* Error message */}
        {latestPing?.errorMessage && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
            <p className="text-xs text-red-600 font-mono">{latestPing.errorMessage}</p>
          </div>
        )}

        <Separator />

        {/* Footer: last checked + manual ping */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {checkedAt ? (
              <span>Last checked: {checkedAt}</span>
            ) : (
              <span>No ping recorded yet</span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => pingMutation.mutate({ triggeredBy: "manual" })}
            disabled={pingMutation.isPending}
          >
            {pingMutation.isPending ? (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            )}
            Ping Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
