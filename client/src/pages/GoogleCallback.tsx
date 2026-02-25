import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function GoogleCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const handleCallback = trpc.googleAuth.handleCallback.useMutation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const errorParam = urlParams.get("error");

    if (errorParam) {
      setError("Authentication was cancelled or failed");
      setTimeout(() => setLocation("/login"), 3000);
      return;
    }

    if (!code) {
      setError("No authorization code received");
      setTimeout(() => setLocation("/login"), 3000);
      return;
    }

    // Handle the OAuth callback
    handleCallback.mutate(
      { code },
      {
        onSuccess: (data) => {
          // Set session cookie
          document.cookie = `manus_session=${data.sessionToken}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
          // Redirect to tools page after successful login
          setLocation("/tools");
        },
        onError: (err) => {
          setError(err.message || "Failed to complete authentication");
          setTimeout(() => setLocation("/login"), 3000);
        },
      }
    );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {error ? "Authentication Failed" : "Completing Sign In"}
          </CardTitle>
          <CardDescription>
            {error || "Please wait while we complete your authentication..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          {!error && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
        </CardContent>
      </Card>
    </div>
  );
}
