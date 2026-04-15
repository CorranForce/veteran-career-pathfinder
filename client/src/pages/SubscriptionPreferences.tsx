import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Mail,
  Bell,
  BellOff,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Newspaper,
  Wrench,
  Bug,
} from "lucide-react";
import EmailCaptureForm from "@/components/EmailCaptureForm";

export default function SubscriptionPreferences() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const { data: subscription, isLoading, refetch } = trpc.blogSubscription.getMySubscription.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const [prefs, setPrefs] = useState({
    subscribeToNewPosts: true,
    subscribeToFeatures: true,
    subscribeToBugFixes: true,
  });

  // Sync prefs from server when loaded
  useEffect(() => {
    if (subscription) {
      setPrefs({
        subscribeToNewPosts: subscription.subscribeToNewPosts,
        subscribeToFeatures: subscription.subscribeToFeatures,
        subscribeToBugFixes: subscription.subscribeToBugFixes,
      });
    }
  }, [subscription]);

  const updateMutation = trpc.blogSubscription.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferences saved successfully");
      refetch();
    },
    onError: (err) => toast.error(`Failed to save: ${err.message}`),
  });

  function handleSave() {
    if (!user?.email) return;
    updateMutation.mutate({
      email: user.email,
      ...prefs,
    });
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <Mail className="h-10 w-10 text-primary mx-auto mb-2" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to manage your email subscription preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple nav */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center h-14 gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pathfinder
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm font-medium text-muted-foreground">Email Preferences</span>
        </div>
      </nav>

      <div className="container max-w-2xl py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Email Preferences</h1>
              <p className="text-muted-foreground text-sm">
                Manage what emails you receive from Pathfinder
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground pl-1">
            Signed in as <strong className="text-foreground">{user?.email}</strong>
          </p>
        </div>

        {/* No subscription state */}
        {!subscription && (
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <BellOff className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <CardTitle className="text-lg">Not subscribed yet</CardTitle>
              <CardDescription>
                You are not currently subscribed to Pathfinder emails. Subscribe below to receive
                updates about new blog posts, features, and improvements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailCaptureForm
                source="subscription-preferences-page"
                placeholder="Your email address"
                buttonText="Subscribe Now"
              />
            </CardContent>
          </Card>
        )}

        {/* Active subscription — show preferences */}
        {subscription && (
          <>
            {/* Status banner */}
            <Alert
              className={
                subscription.status === "active" && subscription.isVerified
                  ? "border-green-500/30 bg-green-500/10"
                  : subscription.status === "active" && !subscription.isVerified
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-red-500/30 bg-red-500/10"
              }
            >
              <AlertDescription className="flex items-center gap-2">
                {subscription.status === "active" && subscription.isVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-green-700 dark:text-green-400">
                      Your subscription is <strong>active and verified</strong>.
                    </span>
                    <Badge className="ml-auto bg-green-500/15 text-green-600 border-green-500/30 text-xs">
                      Active
                    </Badge>
                  </>
                ) : subscription.status === "active" && !subscription.isVerified ? (
                  <>
                    <Mail className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span className="text-amber-700 dark:text-amber-400">
                      Please check your inbox and <strong>verify your email</strong> to activate your subscription.
                    </span>
                    <Badge className="ml-auto bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs">
                      Pending
                    </Badge>
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span className="text-red-700 dark:text-red-400">
                      You have <strong>unsubscribed</strong>. Re-subscribe below to receive emails again.
                    </span>
                    <Badge className="ml-auto bg-red-500/15 text-red-600 border-red-500/30 text-xs">
                      Unsubscribed
                    </Badge>
                  </>
                )}
              </AlertDescription>
            </Alert>

            {/* Preferences card — only show if active */}
            {subscription.status === "active" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notification Types</CardTitle>
                  <CardDescription>
                    Choose which types of emails you want to receive. You can change these at any time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* New Posts */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                        <Newspaper className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <Label htmlFor="new-posts" className="text-base font-medium cursor-pointer">
                          New Blog Posts
                        </Label>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Get notified when new veteran career guides and transition tips are published.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="new-posts"
                      checked={prefs.subscribeToNewPosts}
                      onCheckedChange={(v) => setPrefs((p) => ({ ...p, subscribeToNewPosts: v }))}
                    />
                  </div>

                  <Separator />

                  {/* Features */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-accent/20 p-2 mt-0.5">
                        <Wrench className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div>
                        <Label htmlFor="features" className="text-base font-medium cursor-pointer">
                          New Features
                        </Label>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Be the first to know about new Pathfinder tools, prompts, and capabilities.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="features"
                      checked={prefs.subscribeToFeatures}
                      onCheckedChange={(v) => setPrefs((p) => ({ ...p, subscribeToFeatures: v }))}
                    />
                  </div>

                  <Separator />

                  {/* Bug Fixes */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-secondary/50 p-2 mt-0.5">
                        <Bug className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <Label htmlFor="bugfixes" className="text-base font-medium cursor-pointer">
                          Bug Fixes &amp; Improvements
                        </Label>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          Receive changelogs and important platform updates.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="bugfixes"
                      checked={prefs.subscribeToBugFixes}
                      onCheckedChange={(v) => setPrefs((p) => ({ ...p, subscribeToBugFixes: v }))}
                    />
                  </div>

                  <Separator />

                  {/* Save button */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                      Subscribed since{" "}
                      {subscription.subscribedAt
                        ? new Date(subscription.subscribedAt).toLocaleDateString()
                        : "—"}
                    </p>
                    <Button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Unsubscribed — offer re-subscribe */}
            {subscription.status === "unsubscribed" && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <EmailCaptureForm
                    source="subscription-preferences-resubscribe"
                    placeholder="Your email address"
                    buttonText="Re-subscribe"
                  />
                </CardContent>
              </Card>
            )}

            {/* Unsubscribe link */}
            {subscription.status === "active" && subscription.unsubscribeToken && (
              <p className="text-center text-sm text-muted-foreground">
                Want to stop all emails?{" "}
                <Link
                  href={`/unsubscribe?token=${subscription.unsubscribeToken}`}
                  className="underline hover:text-foreground transition-colors"
                >
                  Unsubscribe completely
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
