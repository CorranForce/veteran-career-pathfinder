import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle2, AlertTriangle, XCircle, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AgentLog {
  id: number;
  trigger: string;
  actions: string | null;
  stripeStatus: string | null;
  stripeLatencyMs: number | null;
  announcementsArchived: number | null;
  errors: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

function StripeStatusBadge({ status }: { status: string | null }) {
  if (!status || status === "skipped") return <Badge variant="outline" className="text-xs">Skipped</Badge>;
  if (status === "ok") return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">OK</Badge>;
  if (status === "degraded") return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">Degraded</Badge>;
  return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs">Error</Badge>;
}

function StatusIcon({ status }: { status: string | null }) {
  if (!status || status === "skipped") return <Clock className="h-4 w-4 text-muted-foreground" />;
  if (status === "ok") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === "degraded") return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
  return <XCircle className="h-4 w-4 text-red-600" />;
}

export function PlatformAgentCard() {
  const { data: logs, isLoading, refetch } = trpc.admin.getAgentLogs.useQuery({ limit: 10 });
  const runAgentMutation = trpc.admin.runPlatformAgent.useMutation({
    onSuccess: () => {
      toast.success("Platform Agent run triggered — check logs in a moment");
      setTimeout(() => refetch(), 3000);
    },
    onError: (e) => toast.error(`Failed to trigger agent: ${e.message}`),
  });

  const latestLog = logs?.[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Platform AI Agent</CardTitle>
              <CardDescription>
                Daily checks: announcement auto-archive, Stripe latency monitoring, and owner email alerts.
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAgentMutation.mutate()}
            disabled={runAgentMutation.isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${runAgentMutation.isPending ? "animate-spin" : ""}`} />
            Run Now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6 text-muted-foreground text-sm">Loading agent logs…</div>
        ) : !logs || logs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No agent runs yet. The agent will run automatically at startup and every 24 hours.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Latest run summary */}
            {latestLog && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={latestLog.stripeStatus} />
                    <span className="font-medium text-sm">Latest Run</span>
                    <Badge variant="outline" className="text-xs capitalize">{latestLog.trigger}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(latestLog.startedAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Stripe Status</p>
                    <StripeStatusBadge status={latestLog.stripeStatus} />
                    {latestLog.stripeLatencyMs !== null && latestLog.stripeLatencyMs > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{latestLog.stripeLatencyMs}ms</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Announcements Archived</p>
                    <p className="font-semibold">{latestLog.announcementsArchived ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-semibold text-sm">
                      {latestLog.completedAt
                        ? `${Math.round((new Date(latestLog.completedAt).getTime() - new Date(latestLog.startedAt).getTime()) / 1000)}s`
                        : "—"}
                    </p>
                  </div>
                </div>
                {latestLog.errors && (
                  <div className="rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2">
                    <p className="text-xs text-red-700 dark:text-red-400 font-medium mb-1">Errors</p>
                    <pre className="text-xs text-red-600 dark:text-red-300 whitespace-pre-wrap">
                      {(() => {
                        try { return JSON.parse(latestLog.errors!).join("\n"); }
                        catch { return latestLog.errors; }
                      })()}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Recent run history */}
            {logs.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent History</p>
                <div className="space-y-1">
                  {logs.slice(1, 6).map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <StatusIcon status={log.stripeStatus} />
                        <span className="text-muted-foreground text-xs">
                          {format(new Date(log.startedAt), "MMM d 'at' h:mm a")}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">{log.trigger}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <StripeStatusBadge status={log.stripeStatus} />
                        {(log.announcementsArchived ?? 0) > 0 && (
                          <span>{log.announcementsArchived} archived</span>
                        )}
                        {log.errors && <span className="text-red-500">⚠ errors</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
