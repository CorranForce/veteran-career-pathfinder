import { PageFooter } from "@/components/PageFooter";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Mail, ShieldAlert, Bell, CreditCard, Crown, Loader2, ArrowUpRight, AlertTriangle } from "lucide-react";
import { NotificationPreferences } from "@/components/NotificationPreferences";
import { Link } from "wouter";
import { toast } from "sonner";


export default function AccountSettings() {
  const { user, loading } = useAuth();


  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Name update state
  const [name, setName] = useState("");
  const [nameChanged, setNameChanged] = useState(false);

  const settingsQuery = trpc.accountSettings.getSettings.useQuery();
  const connectedAccountsQuery = trpc.accountSettings.getConnectedAccounts.useQuery();
  const subscriptionQuery = trpc.payment.getSubscriptionStatus.useQuery();

  const createPortalMutation = trpc.payment.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Opening billing portal...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(`Billing portal error: ${error.message}`);
    },
  });

  // Detect ?mustChange=1 from login redirect
  const mustChangeFromUrl = new URLSearchParams(window.location.search).get("mustChange") === "1";
  const showMustChangeBanner = mustChangeFromUrl || (settingsQuery.data?.mustChangePassword ?? false);

  const changePasswordMutation = trpc.accountSettings.changePassword.useMutation({
    onSuccess: () => {
      setPasswordChanged(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert("Password changed successfully");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateNameMutation = trpc.accountSettings.updateName.useMutation({
    onSuccess: () => {
      setNameChanged(false);
      alert("Name updated successfully");
      settingsQuery.refetch();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Initialize name from settings
  useEffect(() => {
    if (settingsQuery.data?.name) {
      setName(settingsQuery.data.name);
    }
  }, [settingsQuery.data]);

  // Track password changes
  useEffect(() => {
    setPasswordChanged(
      currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0
    );
  }, [currentPassword, newPassword, confirmPassword]);

  // Track name changes
  useEffect(() => {
    if (settingsQuery.data?.name) {
      setNameChanged(name !== settingsQuery.data.name);
    }
  }, [name, settingsQuery.data]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNameMutation.mutate({ name });
  };

  if (loading || settingsQuery.isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access account settings</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security</p>
      </div>

      {/* Temporary password banner */}
      {showMustChangeBanner && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Action required:</strong> Your account was created with a temporary password.
            Please update it below to secure your account.
          </AlertDescription>
        </Alert>
      )}

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                disabled={updateNameMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              disabled={!nameChanged || updateNameMutation.isPending}
            >
              {updateNameMutation.isPending ? "Saving..." : "Save Name"}
            </Button>
          </form>

          <Separator />

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Input
                value={settingsQuery.data?.email || ""}
                disabled
                className="bg-muted"
              />
              {settingsQuery.data?.emailVerified ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Unverified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Email cannot be changed at this time
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      {settingsQuery.data?.hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={changePasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={8}
                  disabled={changePasswordMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  minLength={8}
                  disabled={changePasswordMutation.isPending}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={
                  !passwordChanged ||
                  changePasswordMutation.isPending ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
              >
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Manage your login methods</CardDescription>
        </CardHeader>
        <CardContent>
          {connectedAccountsQuery.isLoading ? (
            <div>Loading connected accounts...</div>
          ) : (
            <div className="space-y-3">
              {connectedAccountsQuery.data?.map((account) => (
                <div
                  key={account.provider}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {account.provider === "google" && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">G</span>
                      </div>
                    )}
                    {account.provider === "email" && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium capitalize">{account.provider}</p>
                      <p className="text-sm text-muted-foreground">{account.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Billing & Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Billing &amp; Subscription</CardTitle>
              <CardDescription>Your current plan and payment details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading subscription info...</span>
            </div>
          ) : (() => {
            const sub = subscriptionQuery.data;
            const isPlatformOwner = user?.role === "platform_owner";
            const tier = sub?.tier ?? "free";
            const planName = sub?.planName ?? "Free";

            const tierBadge = (() => {
              if (isPlatformOwner) return <Badge className="bg-purple-600 text-white"><Crown className="h-3 w-3 mr-1" />Platform Owner</Badge>;
              if (tier === "pro") return <Badge className="bg-accent text-accent-foreground">Pro</Badge>;
              if (tier === "premium") return <Badge className="bg-primary text-primary-foreground">Premium</Badge>;
              return <Badge variant="secondary">Free</Badge>;
            })();

            return (
              <div className="space-y-4">
                {/* Plan row */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-semibold">{planName}</p>
                    {sub?.purchasedAt && tier !== "free" && !isPlatformOwner && (
                      <p className="text-xs text-muted-foreground">
                        {tier === "premium" ? "Purchased" : "Started"}{" "}
                        {new Date(sub.purchasedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {tierBadge}
                </div>

                {/* Next billing / cancel warning */}
                {sub?.nextBillingDate && !sub.cancelAtPeriodEnd && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Next billing date: <strong>{new Date(sub.nextBillingDate).toLocaleDateString()}</strong></span>
                  </div>
                )}
                {sub?.cancelAtPeriodEnd && sub.nextBillingDate && (
                  <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                      Your subscription will cancel on{" "}
                      <strong>{new Date(sub.nextBillingDate).toLocaleDateString()}</strong>. You will retain access until then.
                    </AlertDescription>
                  </Alert>
                )}

                <Separator />

                {/* CTA */}
                {isPlatformOwner ? (
                  <p className="text-sm text-muted-foreground">Platform owners have full access to all features with no billing required.</p>
                ) : tier === "free" ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild>
                      <Link href="/pricing">
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Upgrade to Premium
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/pricing">View All Plans</Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => createPortalMutation.mutate()}
                    disabled={createPortalMutation.isPending}
                  >
                    {createPortalMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening...</>
                    ) : (
                      <><CreditCard className="mr-2 h-4 w-4" />Manage Billing</>
                    )}
                  </Button>
                )}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <NotificationPreferences />

      {/* Email newsletter preferences */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Email Newsletter Preferences</h3>
                <p className="text-sm text-muted-foreground">
                  Choose which Pathfinder email updates you receive
                </p>
              </div>
            </div>
            <Link href="/subscription-preferences">
              <Button variant="outline" size="sm" className="bg-background">
                Manage Preferences
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      <PageFooter />
    </div>
  );
}
