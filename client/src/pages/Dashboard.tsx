import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Compass,
  User,
  Mail,
  Lock,
  Save,
  ExternalLink,
  LogOut,
  Home,
  Download,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useLocation } from "wouter";
import ResumeUpload from "@/components/ResumeUpload";
import ResumeList from "@/components/ResumeList";
import PurchaseHistory from "@/components/PurchaseHistory";

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch account data
  const { data: account, isLoading: accountLoading, refetch } = trpc.account.getAccount.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch password change URL
  const { data: passwordInfo } = trpc.account.getPasswordChangeUrl.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Update mutation
  const updateAccount = trpc.account.updateAccount.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setHasChanges(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Populate form when account data loads
  useEffect(() => {
    if (account) {
      setName(account.name || "");
      setEmail(account.email || "");
    }
  }, [account]);

  // Track changes
  useEffect(() => {
    if (account) {
      const nameChanged = name !== (account.name || "");
      const emailChanged = email !== (account.email || "");
      setHasChanges(nameChanged || emailChanged);
    }
  }, [name, email, account]);

  const handleSave = () => {
    const updates: { name?: string; email?: string } = {};
    if (name !== (account?.name || "")) updates.name = name;
    if (email !== (account?.email || "")) updates.email = email;
    if (Object.keys(updates).length > 0) {
      updateAccount.mutate(updates);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Compass className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Sign in to Pathfinder</CardTitle>
            <CardDescription>
              Access your dashboard to manage your account and career transition resources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
            >
              Sign In
            </Button>
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pathfinder</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/downloads")}>
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Downloads</span>
            </Button>
            {user?.role === "platform_owner" && (
              <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/dashboard")}>
                <Shield className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {(account?.name || user?.name || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">
                {account?.name || user?.name || "User"}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back{account?.name ? `, ${account.name}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and profile information.
          </p>
        </div>

        {/* Account Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Update your name and email address</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {accountLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="max-w-md"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || updateAccount.isPending}
                  >
                    {updateAccount.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                  {hasChanges && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      You have unsaved changes
                    </span>
                  )}
                  {!hasChanges && account && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      All changes saved
                    </span>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Password & Security</CardTitle>
                <CardDescription>
                  Manage your password through your login provider
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your password is managed by your authentication provider. Click the button below to be redirected to your provider's security settings where you can update your password.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                if (passwordInfo?.url) {
                  window.open(passwordInfo.url, "_blank");
                } else {
                  toast.info("Password management is handled by your login provider.");
                }
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>Your account information and membership status</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Account Role</p>
                <p className="text-sm font-medium capitalize">{account?.role || "User"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">
                  {account?.createdAt
                    ? new Date(account.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Sign In</p>
                <p className="text-sm font-medium">
                  {account?.lastSignedIn
                    ? new Date(account.lastSignedIn).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase History Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>
                  View your purchases and download digital products
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PurchaseHistory />
          </CardContent>
        </Card>

        {/* Resume Review Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">AI Resume Review</h2>
            <p className="text-muted-foreground mt-1">
              Upload your resume for AI-powered ATS analysis and get personalized recommendations
            </p>
          </div>

          <ResumeUpload />
          <ResumeList />
        </div>
      </div>
    </div>
  );
}
