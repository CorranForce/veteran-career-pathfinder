import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  UserX,
  UserCheck,
  Trash2,
  UserCog,
  Eye,
  AlertCircle,
  ShieldAlert,
  Globe,
  Lock,
  KeyRound,
} from "lucide-react";

const PAGE_SIZE = 5;

const actionIcons = {
  suspend_user: UserX,
  reactivate_user: UserCheck,
  delete_user: Trash2,
  change_role: UserCog,
  view_purchases: Eye,
  update_product: Shield,
  rate_limit_blocked: ShieldAlert,
  login_failed: KeyRound,
  other: AlertCircle,
};

const actionColors = {
  suspend_user: "destructive",
  reactivate_user: "default",
  delete_user: "destructive",
  change_role: "secondary",
  view_purchases: "outline",
  update_product: "secondary",
  rate_limit_blocked: "destructive",
  login_failed: "destructive",
  other: "outline",
} as const;

/** Safely parse a JSON string; returns null on failure. */
function tryParseJson(raw: string | null | undefined): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function LogEntry({
  log,
}: {
  log: {
    id: number;
    actionType: string;
    description: string;
    adminName: string;
    adminEmail: string;
    targetUserName?: string | null;
    targetUserEmail?: string | null;
    metadata?: string | null;
    createdAt: Date;
  };
}) {
  const Icon = actionIcons[log.actionType as keyof typeof actionIcons] ?? AlertCircle;
  const badgeVariant = actionColors[log.actionType as keyof typeof actionColors] ?? "outline";
  const meta = tryParseJson(log.metadata);

  const isSecurityEvent =
    log.actionType === "rate_limit_blocked" || log.actionType === "login_failed";

  return (
    <div className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={badgeVariant as "destructive" | "default" | "secondary" | "outline"}
            className="text-xs"
          >
            {log.actionType.replace(/_/g, " ").toUpperCase()}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(log.createdAt).toLocaleString()}
          </span>
        </div>
        <p className="text-sm font-medium">{log.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {isSecurityEvent ? (
            <>
              {meta?.ip && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  <strong>IP:</strong> {String(meta.ip)}
                </span>
              )}
              {meta?.endpoint && (
                <span className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <strong>Endpoint:</strong> {String(meta.endpoint)}
                </span>
              )}
              {meta?.email && (
                <span className="flex items-center gap-1">
                  <KeyRound className="h-3 w-3" />
                  <strong>Email:</strong> {String(meta.email)}
                </span>
              )}
              {meta?.reason && (
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <strong>Reason:</strong> {String(meta.reason)}
                </span>
              )}
            </>
          ) : (
            <>
              <span>
                <strong>Admin:</strong> {log.adminName} ({log.adminEmail})
              </span>
              {log.targetUserName && (
                <span>
                  <strong>Target:</strong> {log.targetUserName} ({log.targetUserEmail})
                </span>
              )}
            </>
          )}
        </div>
        {meta && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">View details</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {JSON.stringify(meta, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground text-center py-8">{message}</p>;
}

/** Reusable pagination bar for a flat log array. */
function PaginatedLogs({
  logs,
  loading,
  loadingMessage,
  emptyMessage,
  headerSlot,
}: {
  logs: Parameters<typeof LogEntry>[0]["log"][] | undefined;
  loading: boolean;
  loadingMessage: string;
  emptyMessage: string;
  headerSlot?: React.ReactNode;
}) {
  const [page, setPage] = useState(1);

  const total = logs?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    if (!logs) return [];
    const start = (safePage - 1) * PAGE_SIZE;
    return logs.slice(start, start + PAGE_SIZE);
  }, [logs, safePage]);

  if (loading) return <EmptyState message={loadingMessage} />;
  if (!logs || logs.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <>
      {headerSlot}
      <div className="space-y-4">
        {paginated.map((log) => (
          <LogEntry key={log.id} log={log} />
        ))}
      </div>

      {/* Pagination Controls */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={safePage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage === 1}
            >
              Previous
            </Button>
            <span className="px-3 text-sm">
              Page {safePage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(safePage + 1)}
              disabled={safePage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export function AdminActivityLog() {
  const [tab, setTab] = useState<"admin" | "security" | "logins">("admin");

  const { data: adminLogs, isLoading: adminLoading } = trpc.admin.getAdminActivityLogs.useQuery(
    { limit: 50 },
    { enabled: tab === "admin" }
  );

  const { data: rateLimitLogs, isLoading: rateLimitLoading } =
    trpc.admin.getRateLimitEvents.useQuery({ limit: 100 }, { enabled: tab === "security" });

  const { data: failedLoginLogs, isLoading: failedLoginLoading } =
    trpc.admin.getFailedLoginEvents.useQuery({ limit: 100 }, { enabled: tab === "logins" });

  // Filter admin-only logs (exclude security events that live in their own tabs)
  const filteredAdminLogs = useMemo(
    () =>
      adminLogs?.filter(
        (l) => l.actionType !== "rate_limit_blocked" && l.actionType !== "login_failed"
      ) ?? [],
    [adminLogs]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity &amp; Security Log</CardTitle>
        <CardDescription>
          Audit trail of administrative actions, rate-limit blocks, and failed login attempts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "admin" | "security" | "logins")}>
          <TabsList className="mb-4">
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin Actions
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Rate-Limit Blocks
            </TabsTrigger>
            <TabsTrigger value="logins" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Failed Logins
            </TabsTrigger>
          </TabsList>

          {/* ── Admin Actions tab ── */}
          <TabsContent value="admin">
            <PaginatedLogs
              logs={filteredAdminLogs}
              loading={adminLoading}
              loadingMessage="Loading activity history…"
              emptyMessage="No admin activity recorded yet"
            />
          </TabsContent>

          {/* ── Rate-Limit Blocks tab ── */}
          <TabsContent value="security">
            <PaginatedLogs
              logs={rateLimitLogs}
              loading={rateLimitLoading}
              loadingMessage="Loading rate-limit events…"
              emptyMessage="No rate-limit blocks recorded yet"
              headerSlot={
                rateLimitLogs && rateLimitLogs.length > 0 ? (
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                    <span>
                      <strong>{rateLimitLogs.length}</strong> blocked request
                      {rateLimitLogs.length !== 1 ? "s" : ""} recorded
                    </span>
                  </div>
                ) : undefined
              }
            />
          </TabsContent>

          {/* ── Failed Logins tab ── */}
          <TabsContent value="logins">
            <PaginatedLogs
              logs={failedLoginLogs}
              loading={failedLoginLoading}
              loadingMessage="Loading failed login events…"
              emptyMessage="No failed login attempts recorded yet"
              headerSlot={
                failedLoginLogs && failedLoginLogs.length > 0 ? (
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <KeyRound className="h-4 w-4 text-destructive" />
                    <span>
                      <strong>{failedLoginLogs.length}</strong> failed attempt
                      {failedLoginLogs.length !== 1 ? "s" : ""} recorded
                    </span>
                  </div>
                ) : undefined
              }
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
