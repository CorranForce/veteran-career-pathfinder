import { PageFooter } from "@/components/PageFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Download,
  ArrowRight,
  Shield,
  FlaskConical,
  Compass,
  FileText,
  Languages,
  BookOpen,
  CreditCard,
  Star,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

export default function Success() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Detect Stripe mode to show test transaction notice
  const { data: stripeMode } = trpc.stripeProducts.getStripeMode.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const isTestMode = stripeMode?.mode === "test";

  // Detect which product was purchased from the URL
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  // Fetch subscription status to personalise the page
  const { data: subscription } = trpc.payment.getSubscriptionStatus.useQuery(undefined, {
    staleTime: 30 * 1000,
  });

  const isPro = subscription?.planName?.toLowerCase().includes("pro");
  const planLabel = isPro ? "Pathfinder Pro" : "Pathfinder Premium";
  const firstName = user?.name?.split(" ")[0] ?? "Veteran";

  // Content unlocked per plan
  const premiumUnlocks = [
    {
      icon: FileText,
      label: "Full AI Prompt",
      description: "The complete optimized career transition prompt",
      href: "/",
    },
    {
      icon: Languages,
      label: "MOS Translator",
      description: "Translate your military job code into civilian skills",
      href: "/mos-translator",
    },
    {
      icon: Download,
      label: "Resume Templates",
      description: "Veteran-tailored resume templates ready to download",
      href: "/templates",
    },
  ];

  const proUnlocks = [
    ...premiumUnlocks,
    {
      icon: BookOpen,
      label: "Blog & Guides",
      description: "Exclusive strategy articles and career playbooks",
      href: "/blog",
    },
  ];

  const unlocks = isPro ? proUnlocks : premiumUnlocks;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <a href="/" className="font-bold text-xl">Pathfinder</a>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/tools")}>
            Go to Dashboard
          </Button>
        </div>
      </nav>

      {/* Success Message */}
      <section className="flex-1 flex items-center justify-center py-16 bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="container mx-auto max-w-2xl space-y-5">

          {/* Test transaction notice */}
          {isTestMode && (
            <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
              <FlaskConical className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <p className="font-semibold mb-0.5">This was a test transaction</p>
                <p className="text-yellow-600 dark:text-yellow-400">
                  Stripe is currently in <strong>test mode</strong>. No real charge was made.
                  This confirmation is for testing purposes only.
                </p>
              </div>
            </div>
          )}

          {/* Main success card */}
          <Card className="border-2 border-primary shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-1">
                  <Star className="h-3.5 w-3.5 mr-1.5" />
                  {planLabel} Activated
                </Badge>
                <CardTitle className="text-3xl">
                  Welcome to the mission, {firstName}!
                </CardTitle>
                <CardDescription className="text-base">
                  {isTestMode
                    ? "Test payment confirmed. Your access has been activated."
                    : `Your ${planLabel} access is live. Your career transition journey starts now.`}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Unlocked content */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  What you've unlocked
                </h3>
                <div className="grid gap-3">
                  {unlocks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Next steps */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm">Your next 3 steps</h3>
                <div className="space-y-2.5">
                  {[
                    {
                      step: 1,
                      title: "Check your email",
                      detail: "A confirmation with your purchase details and access instructions is on its way.",
                    },
                    {
                      step: 2,
                      title: "Copy the AI prompt",
                      detail: "Head to the home page, copy the full Pathfinder prompt, and paste it into ChatGPT, Claude, or Gemini.",
                    },
                    {
                      step: 3,
                      title: "Start your 30-day plan",
                      detail: "Follow the week-by-week action plan to translate your military experience into civilian success.",
                    },
                  ].map(({ step, title, detail }) => (
                    <div key={step} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {step}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{title}</p>
                        <p className="text-xs text-muted-foreground">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1" asChild>
                  <a href="/">
                    <FileText className="mr-2 h-4 w-4" />
                    View Full Prompt
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href="/tools">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </a>
                </Button>
              </div>

              {/* Billing link */}
              <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                <span>Need to manage your subscription?</span>
                <a
                  href="/account"
                  className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  Billing & Subscription
                </a>
              </div>

              {/* Support */}
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground">
                  Questions? Email{" "}
                  <a href="mailto:support@pathfinder.casa" className="text-primary hover:underline">
                    support@pathfinder.casa
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Thank you for trusting Pathfinder with your career transition. We're honored to serve those who served.
            </p>
          </div>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
