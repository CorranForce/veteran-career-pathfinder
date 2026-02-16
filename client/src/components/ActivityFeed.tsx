import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserPlus, FileUp, DollarSign, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed() {
  const { data: activities, isLoading } = trpc.admin.getRecentActivity.useQuery(
    { limit: 20 },
    {
      refetchInterval: 30000, // Auto-refresh every 30 seconds
      refetchIntervalInBackground: false, // Only refresh when tab is active
    }
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_signup":
        return <UserPlus className="h-4 w-4" />;
      case "resume_upload":
        return <FileUp className="h-4 w-4" />;
      case "purchase":
        return <DollarSign className="h-4 w-4" />;
      case "template_download":
        return <Download className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user_signup":
        return "bg-green-500/10 text-green-500";
      case "resume_upload":
        return "bg-blue-500/10 text-blue-500";
      case "purchase":
        return "bg-purple-500/10 text-purple-500";
      case "template_download":
        return "bg-orange-500/10 text-orange-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Live platform activity feed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Live platform activity feed</CardDescription>
      </CardHeader>
      <CardContent>
        {activities && activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className={`p-2 rounded-full ${getActivityColor(activity.activityType)}`}>
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {activity.userName && (
                      <span key="user-name" className="text-xs text-muted-foreground">{activity.userName}</span>
                    )}
                    {activity.userEmail && (
                      <span key="user-email" className="text-xs text-muted-foreground">({activity.userEmail})</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-xs">
                    {activity.activityType.replace("_", " ")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
