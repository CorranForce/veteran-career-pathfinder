import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";

const actionIcons = {
  suspend_user: UserX,
  reactivate_user: UserCheck,
  delete_user: Trash2,
  change_role: UserCog,
  view_purchases: Eye,
  update_product: Shield,
  rate_limit_blocked: ShieldAlert,
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

function LogEntry({ log }: { log: { id: number; actionType: string; description: string; adminName: string; adminEmail: string; targetUserName?: string | null; targetUserEmail?: string | null; metadata?: string | null; createdAt: Date } }) {
  const Icon = actionIcons[log.actionType as keyof typeof actionIcons] ?? AlertCircle;
  const badgeVariant = actionColors[log.actionType as keyof typeof actionColors] ?? "outline";
  const meta = tryParseJson(log.metadata);

  return (
    <div className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={badgeVariant as "destructive" | "default" | "secondary" | "outline"} className="text-xs">
            {log.actionType.replace(/_/g, " ").toUpperCase()}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(log.createdAt).toLocaleString()}
          </span>
        </div>
        <p className="text-sm font-medium">{log.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {log.actionType === "rate_limit_blocked" ? (
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
  return (
    <p className="text-sm text-muted-foreground text-center py-8">{message}</p>
  );
}

export function AdminActivityLog() {
  const [tab, setTab] = useState<"admin" | "security">("admin");

  const { data: adminLogs, isLoading: adminLoading } = trpc.admin.getAdminActivityLogs.useQuery(
    { limit: 50 },
    { enabled: tab === "admin" }
  );

  const { data: securityLogs, isLoading: securityLoading } = trpc.admin.getRateLimitEvents.useQuery(
    { limit: 100 },
    { enabled: tab === "security" }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity &amp; Security Log</CardTitle>
        <CardDescription>
          Audit trail of administrative actions and rate-limit security events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "admin" | "security")}>
          <TabsList className="mb-4">
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin Actions
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Security Events
            </TabsTrigger>
          </TabsList>

          {/* ── Admin Actions tab ── */}
          <TabsContent value="admin">
            {adminLoading ? (
              <EmptyState message="Loading activity history…" />
            ) : !adminLogs || adminLogs.length === 0 ? (
              <EmptyState message="No admin activity recorded yet" />
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {adminLogs
                    .filter((l) => l.actionType !== "rate_limit_blocked")
                    .map((log) => (
                      <LogEntry key={log.id} log={log} />
                    ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* ── Security Events tab ── */}
          <TabsContent value="security">
            {securityLoading ? (
              <EmptyState message="Loading security events…" />
            ) : !securityLogs || securityLogs.length === 0 ? (
              <EmptyState message="No rate-limit events recorded yet" />
            ) : (
              <>
                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                  <span>
                    <strong>{securityLogs.length}</strong> blocked request
                    {securityLogs.length !== 1 ? "s" : ""} recorded
                  </span>
                </div>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {securityLogs.map((log) => (
                      <LogEntry key={log.id} log={log} />
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
