/**
 * NotificationPreferences
 *
 * Renders three toggle switches (In-App, Email, Push) that let users opt in
 * or out of each notification channel. The Save button is disabled until a
 * change is made, and returns to disabled after saving.
 *
 * Push notifications additionally require browser permission.
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Bell, Mail, Smartphone, Info } from "lucide-react";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i);
  return view;
}

export function NotificationPreferences() {
  const utils = trpc.useUtils();

  const { data: prefs, isLoading } = trpc.notifications.getPreferences.useQuery();

  const [inApp, setInApp] = useState(false);
  const [email, setEmail] = useState(false);
  const [push, setPush] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");

  // Sync state from server
  useEffect(() => {
    if (!prefs) return;
    setInApp(prefs.inAppEnabled);
    setEmail(prefs.emailEnabled);
    setPush(prefs.pushEnabled);
    setDirty(false);
  }, [prefs]);

  // Check current push permission
  useEffect(() => {
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const updateMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      utils.notifications.getPreferences.invalidate();
      toast.success("Notification preferences saved");
      setDirty(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const subscribePushMutation = trpc.notifications.subscribePush.useMutation();
  const unsubscribePushMutation = trpc.notifications.unsubscribePush.useMutation();

  function handleToggle(
    setter: (v: boolean) => void,
    value: boolean
  ) {
    setter(value);
    setDirty(true);
  }

  async function requestPushPermissionAndSubscribe(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Your browser does not support push notifications");
      return false;
    }

    const permission = await Notification.requestPermission();
    setPushPermission(permission);

    if (permission !== "granted") {
      toast.error("Push notification permission denied. Please allow notifications in your browser settings.");
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        toast.error("Failed to create push subscription");
        return false;
      }

      await subscribePushMutation.mutateAsync({
        endpoint: json.endpoint,
        p256dhKey: json.keys.p256dh,
        authKey: json.keys.auth,
        userAgent: navigator.userAgent.slice(0, 500),
      });

      return true;
    } catch (err) {
      console.error("[Push] Subscribe error:", err);
      toast.error("Failed to register push subscription");
      return false;
    }
  }

  async function handlePushToggle(enabled: boolean) {
    if (enabled) {
      const ok = await requestPushPermissionAndSubscribe();
      if (!ok) return; // Don't toggle if permission denied
    } else {
      // Unsubscribe from push manager
      try {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const sub = await registration.pushManager.getSubscription();
          if (sub) {
            await unsubscribePushMutation.mutateAsync({ endpoint: sub.endpoint });
            await sub.unsubscribe();
          }
        }
      } catch (err) {
        console.error("[Push] Unsubscribe error:", err);
      }
    }
    handleToggle(setPush, enabled);
  }

  async function handleSave() {
    updateMutation.mutate({ inAppEnabled: inApp, emailEnabled: email, pushEnabled: push });
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading preferences…</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to be notified about activity on your account.
          All channels are opt-in — you control what you receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* In-App */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Label htmlFor="toggle-inapp" className="text-sm font-medium cursor-pointer">
                In-App Notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Show a notification bell in the navigation bar with an unread badge.
                Receive alerts for payments, resume updates, and announcements.
              </p>
            </div>
          </div>
          <Switch
            id="toggle-inapp"
            checked={inApp}
            onCheckedChange={(v) => handleToggle(setInApp, v)}
          />
        </div>

        <div className="border-t" />

        {/* Email */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Label htmlFor="toggle-email" className="text-sm font-medium cursor-pointer">
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receive email alerts for important events such as payment confirmations
                and account security changes.
              </p>
            </div>
          </div>
          <Switch
            id="toggle-email"
            checked={email}
            onCheckedChange={(v) => handleToggle(setEmail, v)}
          />
        </div>

        <div className="border-t" />

        {/* Push */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Label htmlFor="toggle-push" className="text-sm font-medium cursor-pointer">
                Browser Push Notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receive push notifications in this browser even when the tab is not active.
                Your browser will ask for permission when you enable this.
              </p>
              {pushPermission === "denied" && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Info className="h-3 w-3 text-destructive" />
                  <span className="text-xs text-destructive">
                    Permission blocked. Please allow notifications in your browser settings and reload.
                  </span>
                </div>
              )}
              {push && pushPermission === "granted" && (
                <Badge variant="secondary" className="mt-1.5 text-xs">
                  Active on this browser
                </Badge>
              )}
            </div>
          </div>
          <Switch
            id="toggle-push"
            checked={push}
            disabled={pushPermission === "denied"}
            onCheckedChange={handlePushToggle}
          />
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={!dirty || updateMutation.isPending}
            className="w-full sm:w-auto"
          >
            {updateMutation.isPending ? "Saving…" : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
