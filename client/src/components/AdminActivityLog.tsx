import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, UserX, UserCheck, Trash2, UserCog, Eye, AlertCircle } from "lucide-react";

const actionIcons = {
  suspend_user: UserX,
  reactivate_user: UserCheck,
  delete_user: Trash2,
  change_role: UserCog,
  view_purchases: Eye,
  update_product: Shield,
  other: AlertCircle,
};

const actionColors = {
  suspend_user: "destructive",
  reactivate_user: "default",
  delete_user: "destructive",
  change_role: "secondary",
  view_purchases: "outline",
  update_product: "secondary",
  other: "outline",
} as const;

export function AdminActivityLog() {
  const { data: logs, isLoading } = trpc.admin.getAdminActivityLogs.useQuery({ limit: 50 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Activity Log</CardTitle>
          <CardDescription>Loading activity history...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Activity Log</CardTitle>
        <CardDescription>Audit trail of all administrative actions</CardDescription>
      </CardHeader>
      <CardContent>
        {!logs || logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No admin activity recorded yet
          </p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {logs.map((log) => {
                const Icon = actionIcons[log.actionType as keyof typeof actionIcons] || AlertCircle;
                const badgeVariant = actionColors[log.actionType as keyof typeof actionColors] || "outline";
                
                return (
                  <div
                    key={log.id}
                    className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={badgeVariant as any} className="text-xs">
                          {log.actionType.replace(/_/g, " ").toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{log.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          <strong>Admin:</strong> {log.adminName} ({log.adminEmail})
                        </span>
                        {log.targetUserName && (
                          <span>
                            <strong>Target:</strong> {log.targetUserName} ({log.targetUserEmail})
                          </span>
                        )}
                      </div>
                      {log.metadata && (
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer hover:text-foreground">
                            View metadata
                          </summary>
                          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(JSON.parse(log.metadata), null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
