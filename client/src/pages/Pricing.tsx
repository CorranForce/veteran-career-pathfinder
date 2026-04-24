import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  Loader2,
  Shield,
  Menu,
  Star,
  X,
  AlertTriangle,
  Crown,
  ExternalLink,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { PRODUCTS } from "@shared/products";

/** Format cents to a USD string, e.g. 2900 → "$29.00" */
function fmt(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default function PricingNew() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [testBannerDismissed, setTestBannerDismissed] = useState(false);
  const [memberBannerDismissed, setMemberBannerDismissed] = useState(false);

  // Detect Stripe mode to show test-mode warning banner
  const { data: stripeMode } = trpc.stripeProducts.getStripeMode.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const isTestMode = stripeMode?.mode === "test";

  // Live prices from Stripe — falls back to shared/products.ts values while loading
  const { data: livePrices } = trpc.payment.getLivePrices.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // Fetch the user's current subscription/access level (only when logged in)
  const { data: subscriptionStatus } = trpc.payment.getSubscriptionStatus.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });

  const premiumCents = livePrices?.premium.amountCents ?? PRODUCTS.PREMIUM.price;

  // Derive the user's current tier
  const isPlatformOwner = user?.role === "platform_owner";
  const currentTier = isPlatformOwner ? "owner" : (subscriptionStatus?.tier ?? "free");
  const hasPaidAccess = currentTier === "premium" || currentTier === "owner";

  const createCheckoutMutation = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(`Payment error: ${error.message}`);
    },
  });

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

  const handleCheckout = () => {
    if (authLoading) {
      toast.info("Loading, please try again in a moment...");
      return;
    }
    if (!isAuthenticated) {
      toast.info("Please log in or sign up to continue");
      window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
      return;
    }
    createCheckoutMutation.mutate({ productId: "PREMIUM" });
  };

  const handleManageBilling = () => {
    createPortalMutation.mutate();
  };

  // Determine the CTA for each tier card
  const freeCta = (
    <Button variant="outline" className="w-full" asChild>
      <a href={isAuthenticated ? "/tools" : "/signup"}>
        {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
      </a>
    </Button>
  );

  const premiumCta = (() => {
    if (currentTier === "owner") {
      return (
        <Button className="w-full" disabled>
          <Crown className="mr-2 h-4 w-4" />
          Platform Owner Access
        </Button>
      );
    }
    if (currentTier === "premium") {
      return (
        <Button
          className="w-full"
          variant="outline"
          onClick={handleManageBilling}
          disabled={createPortalMutation.isPending}
        >
          {createPortalMutation.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Opening...</>
          ) : (
            <><ExternalLink className="mr-2 h-4 w-4" />Manage Billing</>
          )}
        </Button>
      );
    }
    return (
      <Button
        className="w-full"
        onClick={handleCheckout}
        disabled={createCheckoutMutation.isPending}
      >
        {createCheckoutMutation.isPending ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
        ) : (
          "Get Premium Access"
        )}
      </Button>
    );
  })();

  useEffect(() => {
    document.title = "Pricing | Pathfinder Veteran Career Platform";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Pricing | Pathfinder Veteran Career Platform</title>
        <meta name="description" content="Free and Premium plans for military veterans. Unlock AI career paths, MOS translation, resume templates, and a 30-day action plan. Start free today." />
        <meta name="keywords" content="veteran career transition pricing, military career tools, MOS translator, veteran resume builder, AI career advisor cost" />
        <meta property="og:title" content="Pricing | Pathfinder Veteran Career Platform" />
        <meta property="og:description" content="Free and Premium plans for military veterans. Unlock AI career paths, MOS translation, resume templates, and a 30-day action plan. Start free today." />
        <meta property="og:url" content="https://pathfinder.casa/pricing" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://d2xsxph8kpxj0f.cloudfront.net/310519663037092468/TZPpwPgA6PciQ95BpgomX4/og-pricing-5L4ifgKg4nforoxg3VVbeq.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Pathfinder Pricing — Free and Premium Plans for Veterans" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing | Pathfinder Veteran Career Platform" />
        <meta name="twitter:description" content="Free and Premium plans for military veterans. Unlock AI career paths, MOS translation, resume templates, and a 30-day action plan." />
        <meta name="twitter:image" content="https://d2xsxph8kpxj0f.cloudfront.net/310519663037092468/TZPpwPgA6PciQ95BpgomX4/og-pricing-5L4ifgKg4nforoxg3VVbeq.png" />
        <link rel="canonical" href="https://pathfinder.casa/pricing" />
      </Helmet>
      {/* Test-mode banner */}
      {isTestMode && !testBannerDismissed && (
        <div className="bg-yellow-500/15 border-b border-yellow-500/30 px-4 py-2.5">
          <div className="container mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm font-medium">
                <strong>Test Mode Active</strong> — Payments are in Stripe test mode. No real charges will occur.
                Use card <code className="font-mono bg-yellow-500/20 px-1 rounded">4242 4242 4242 4242</code> with any future date and CVC to test.
              </p>
            </div>
            <button
              onClick={() => setTestBannerDismissed(true)}
              className="text-yellow-700 dark:text-yellow-400 hover:opacity-70 flex-shrink-0"
              aria-label="Dismiss test mode banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Already-a-member banner */}
      {hasPaidAccess && !memberBannerDismissed && (
        <div className="bg-green-500/10 border-b border-green-500/30 px-4 py-2.5">
          <div className="container mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm font-medium">
                {isPlatformOwner
                  ? "You have Platform Owner access — all features are unlocked."
                  : `You already have ${subscriptionStatus?.planName ?? "paid"} access. Your content is available in your `}
                {!isPlatformOwner && (
                  <a href="/tools" className="underline font-semibold">Dashboard</a>
                )}
                {!isPlatformOwner && "."}
              </p>
            </div>
            <button
              onClick={() => setMemberBannerDismissed(true)}
              className="text-green-700 dark:text-green-400 hover:opacity-70 flex-shrink-0"
              aria-label="Dismiss member banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <a href="/" className="font-bold text-xl">Pathfinder</a>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="/">Home</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="/blog">Blog</a>
            </Button>
            {isAuthenticated ? (
              <Button variant="outline" asChild>
                <a href="/tools">Dashboard</a>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <a href="/login">Login</a>
                </Button>
                <Button asChild>
                  <a href="/signup">Sign Up</a>
                </Button>
              </>
            )}
          </div>
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <div className="flex flex-col gap-3 mt-8">
                <Button variant="ghost" className="justify-start" asChild>
                  <a href="/">Home</a>
                </Button>
                <Button variant="ghost" className="justify-start" asChild>
                  <a href="/blog">Blog</a>
                </Button>
                {isAuthenticated ? (
                  <Button variant="outline" className="justify-start" asChild>
                    <a href="/tools">Dashboard</a>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" asChild>
                      <a href="/login">Login</a>
                    </Button>
                    <Button className="justify-start" asChild>
                      <a href="/signup">Sign Up</a>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="container mx-auto text-center space-y-6">
          <Badge className="bg-accent text-accent-foreground">Simple, Transparent Pricing</Badge>
          <h1 className="text-5xl md:text-6xl font-bold">
            Choose Your Path Forward
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you're ready. All plans include our veteran-focused career transition tools.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">

            {/* Free Tier */}
            <Card className={`border-2 relative ${currentTier === "free" && isAuthenticated ? "ring-2 ring-muted-foreground/30" : ""}`}>
              {currentTier === "free" && isAuthenticated && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary" className="px-4 py-1">Your Current Plan</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{PRODUCTS.FREE.name}</CardTitle>
                <CardDescription>{PRODUCTS.FREE.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$0.00</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {PRODUCTS.FREE.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                {freeCta}
              </CardFooter>
            </Card>

            {/* Premium Tier - Most Popular */}
            <Card className={`border-4 border-primary relative shadow-xl ${currentTier === "premium" ? "ring-4 ring-primary/40" : ""}`}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2">
                {currentTier === "premium" ? (
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                    Your Plan
                  </Badge>
                ) : currentTier === "owner" ? (
                  <Badge className="bg-purple-600 text-white px-4 py-1">
                    <Crown className="h-3 w-3 mr-1 inline" />
                    Owner Access
                  </Badge>
                ) : (
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="h-3 w-3 mr-1 inline" />
                    Most Popular
                  </Badge>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{livePrices?.premium.name ?? PRODUCTS.PREMIUM.name}</CardTitle>
                <CardDescription>{livePrices?.premium.description ?? PRODUCTS.PREMIUM.description}</CardDescription>
                <div className="mt-4 space-y-1">
                  <div className="flex items-baseline gap-2">
                    {livePrices ? (
                      <span className="text-4xl font-bold">{fmt(premiumCents)}</span>
                    ) : (
                      <span className="text-4xl font-bold animate-pulse text-muted-foreground">
                        Loading...
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      {livePrices?.premium.isRecurring
                        ? `/${livePrices.premium.billingInterval ?? "month"}`
                        : "one-time"}
                    </span>
                  </div>
                  {(livePrices?.premium.yearlyDiscountPercent ?? 0) > 0 && (
                    <Badge className="bg-green-500/15 text-green-600 border-green-500/30 text-xs">
                      Save {livePrices!.premium.yearlyDiscountPercent}% vs. monthly
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {PRODUCTS.PREMIUM.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                {premiumCta}
              </CardFooter>
            </Card>

          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center space-y-4">
            <p className="text-sm text-muted-foreground">Secure payment powered by Stripe</p>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Veteran-Owned</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">What does Premium include?</h3>
              <p className="text-muted-foreground">
                Premium gives you lifetime access to our complete career transition toolkit with a one-time payment —
                including the full Pathfinder prompt suite, resume rewriter, interview prep module, LinkedIn optimizer,
                salary negotiation scripts, and networking templates.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Is there a recurring fee?</h3>
              <p className="text-muted-foreground">
                No. Pathfinder Premium is a one-time purchase with lifetime access. Pay once, use it forever.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What if I'm not satisfied?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee. If you're not completely satisfied with your purchase,
                contact us within 30 days for a full refund.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do I need a Stripe account to purchase?</h3>
              <p className="text-muted-foreground">
                No, you just need a credit or debit card. Stripe handles all payment processing securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-card/30">
        <div className="container mx-auto text-center text-sm text-muted-foreground space-y-2">
          <p>© {new Date().getFullYear()} Pathfinder. All rights reserved.</p>
          <div className="flex items-center justify-center gap-4">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/refund" className="hover:text-foreground transition-colors">Refund Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
