/**
 * NotificationBell
 *
 * A bell icon that shows an unread badge count. Clicking it opens a dropdown
 * inbox with the latest in-app notifications. Marks individual items or all
 * items as read. Only rendered when the user has inApp notifications enabled.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  BellOff,
  CheckCheck,
  CreditCard,
  FileText,
  ShieldAlert,
  Megaphone,
  Settings,
  Info,
} from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, React.ElementType> = {
  general: Info,
  payment: CreditCard,
  resume: FileText,
  security: ShieldAlert,
  announcement: Megaphone,
  system: Settings,
};

const categoryColors: Record<string, string> = {
  general: "text-blue-500",
  payment: "text-green-500",
  resume: "text-purple-500",
  security: "text-red-500",
  announcement: "text-orange-500",
  system: "text-gray-500",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // Only show bell if user has inApp enabled
  const { data: prefs } = trpc.notifications.getPreferences.useQuery();

  const { data: countData } = trpc.notifications.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30_000, // poll every 30s
    enabled: prefs?.inAppEnabled === true,
  });

  const { data: notifications, isLoading } = trpc.notifications.list.useQuery(
    { limit: 20 },
    { enabled: open && prefs?.inAppEnabled === true }
  );

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.list.invalidate();
    },
  });

  if (!prefs?.inAppEnabled) return null;

  const unreadCount = countData?.count ?? 0;

  function handleNotificationClick(n: { id: number; isRead: boolean; actionUrl?: string | null }) {
    if (!n.isRead) {
      markReadMutation.mutate({ id: n.id });
    }
    if (n.actionUrl) {
      setOpen(false);
      navigate(n.actionUrl);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
            <BellOff className="h-8 w-8 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[360px]">
            <div className="divide-y">
              {notifications.map((n) => {
                const Icon = categoryIcons[n.category] ?? Info;
                const iconColor = categoryColors[n.category] ?? "text-blue-500";

                return (
                  <button
                    key={n.id}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors flex gap-3",
                      !n.isRead && "bg-primary/5"
                    )}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className={cn("mt-0.5 flex-shrink-0", iconColor)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium leading-tight", !n.isRead && "font-semibold")}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="border-t px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground"
            onClick={() => {
              setOpen(false);
              navigate("/account-settings");
            }}
          >
            Manage notification settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
