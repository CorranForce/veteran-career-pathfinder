import { useEffect, useState } from "react";
import { Compass, CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

export default function Unsubscribe() {
  const [token, setToken] = useState<string | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Extract token from URL query string on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
  }, []);

  const unsubscribeMutation = trpc.blogSubscription.unsubscribe.useMutation();

  // Trigger unsubscribe once we have the token
  useEffect(() => {
    if (token && !hasTriggered) {
      setHasTriggered(true);
      unsubscribeMutation.mutate({ token });
    }
  }, [token, hasTriggered]);

  const isPending = unsubscribeMutation.isPending || (!hasTriggered && token !== null);
  const isSuccess = unsubscribeMutation.isSuccess;
  const isError = unsubscribeMutation.isError || (hasTriggered && token === null) || (!token && !isPending);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pathfinder</span>
          </a>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center space-y-6">

          {/* No token in URL */}
          {!token && !isPending && (
            <>
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
              <h1 className="text-3xl font-bold">Invalid Unsubscribe Link</h1>
              <p className="text-muted-foreground leading-relaxed">
                This unsubscribe link is missing a required token. Please use the unsubscribe link
                from one of our emails, or contact us at{" "}
                <a href="mailto:support@pathfinder.casa" className="text-primary underline underline-offset-2">
                  support@pathfinder.casa
                </a>{" "}
                if you need help.
              </p>
              <Button asChild variant="outline">
                <a href="/">Return to Home</a>
              </Button>
            </>
          )}

          {/* Processing */}
          {isPending && token && (
            <>
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
              <h1 className="text-3xl font-bold">Processing…</h1>
              <p className="text-muted-foreground">
                We're removing you from our mailing list. This will only take a moment.
              </p>
            </>
          )}

          {/* Success */}
          {isSuccess && (
            <>
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold">You've Been Unsubscribed</h1>
              <p className="text-muted-foreground leading-relaxed">
                You have been successfully removed from our mailing list. You will no longer receive
                blog update emails from Pathfinder.
              </p>
              <p className="text-sm text-muted-foreground">
                Changed your mind?{" "}
                <a href="/" className="text-primary underline underline-offset-2 hover:opacity-80">
                  Re-subscribe on our homepage
                </a>
                .
              </p>
              <Button asChild>
                <a href="/">Return to Home</a>
              </Button>
            </>
          )}

          {/* Error */}
          {!isPending && !isSuccess && isError && token && (
            <>
              <div className="flex justify-center">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
              <h1 className="text-3xl font-bold">Unsubscribe Failed</h1>
              <p className="text-muted-foreground leading-relaxed">
                {unsubscribeMutation.error?.message ||
                  "This unsubscribe link may be invalid or expired. Please contact us for assistance."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <a href="/">Return to Home</a>
                </Button>
                <Button asChild>
                  <a href="mailto:support@pathfinder.casa?subject=Unsubscribe Request">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
              </div>
            </>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t bg-card">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">Pathfinder</span>
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/refund" className="hover:text-foreground transition-colors">Refund Policy</a>
          </div>
          <p>© {new Date().getFullYear()} Pathfinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
