import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface ContentGateProps {
  /** The full content to show when access is granted */
  children: React.ReactNode;
  /** Minimum tier required: 'premium' allows premium+pro, 'pro' allows only pro */
  requiredTier?: "premium" | "pro";
  /** Short teaser shown to free users above the lock wall */
  teaser?: React.ReactNode;
  /** Title shown on the lock card */
  lockTitle?: string;
  /** Description shown on the lock card */
  lockDescription?: string;
}

/**
 * ContentGate wraps any content behind a purchase check.
 * - Unauthenticated users see a login CTA.
 * - Free users see a teaser + upgrade card.
 * - Premium/Pro users see the full content.
 */
export function ContentGate({
  children,
  requiredTier = "premium",
  teaser,
  lockTitle = "Unlock Full Access",
  lockDescription = "Get the complete AI Veteran Career Transition Strategist prompt and all bonus resources.",
}: ContentGateProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Only query access level when authenticated
  const { data: accessData, isLoading: accessLoading } = trpc.payment.getAccessLevel.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const isLoading = authLoading || (isAuthenticated && accessLoading);

  // Determine if user has sufficient access
  const hasAccess = (() => {
    if (!isAuthenticated || !accessData) return false;
    if (requiredTier === "pro") return accessData.level === "pro";
    // premium tier: premium OR pro both grant access
    return accessData.level === "premium" || accessData.level === "pro";
  })();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Locked state
  return (
    <div className="space-y-6">
      {/* Teaser content */}
      {teaser && (
        <div className="relative">
          <div className="pointer-events-none select-none">
            {teaser}
          </div>
          {/* Gradient fade-out overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      {/* Lock wall card */}
      <Card className="border-2 border-primary/30 shadow-xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <Lock className="h-7 w-7 text-primary" />
            </div>
          </div>
          <Badge className="mx-auto mb-2 bg-accent text-accent-foreground">
            <Sparkles className="h-3 w-3 mr-1" />
            Premium Content
          </Badge>
          <CardTitle className="text-2xl">{lockTitle}</CardTitle>
          <CardDescription className="text-base mt-2">{lockDescription}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Feature highlights */}
          <ul className="space-y-2 max-w-md mx-auto">
            {[
              "Full AI career transition prompt (copy & paste ready)",
              "Comprehensive MOS translation guide",
              "Detailed career path analysis framework",
              "Resume translation templates",
              "30-day action plan with weekly milestones",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {!isAuthenticated ? (
              <>
                <Button size="lg" asChild>
                  <Link href="/signup">
                    Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/pricing">
                    Unlock for $29 <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/pricing">View All Plans</Link>
                </Button>
              </>
            )}
          </div>

          {isAuthenticated && (
            <p className="text-center text-xs text-muted-foreground">
              One-time payment · Lifetime access · No subscription required
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
