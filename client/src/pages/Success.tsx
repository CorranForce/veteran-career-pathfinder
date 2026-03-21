import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, ArrowRight, Shield, FlaskConical } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Success() {
  // Detect Stripe mode to show test transaction notice
  const { data: stripeMode } = trpc.stripeProducts.getStripeMode.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const isTestMode = stripeMode?.mode === "test";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <a href="/" className="font-bold text-xl">Pathfinder</a>
          </div>
        </div>
      </nav>

      {/* Success Message */}
      <section className="flex-1 flex items-center justify-center py-20 bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="container mx-auto max-w-2xl space-y-4">

          {/* Test transaction notice */}
          {isTestMode && (
            <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
              <FlaskConical className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <p className="font-semibold mb-0.5">This was a test transaction</p>
                <p className="text-yellow-600 dark:text-yellow-400">
                  Stripe is currently in <strong>test mode</strong>. No real charge was made to any payment method.
                  This confirmation is for testing purposes only.
                </p>
              </div>
            </div>
          )}

          <Card className="border-2 border-primary shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl">
                {isTestMode ? "Test Payment Successful!" : "Payment Successful!"}
              </CardTitle>
              <CardDescription className="text-lg">
                Welcome to Pathfinder. Your career transition journey starts now.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">What's Next?</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Check Your Email</p>
                      <p className="text-sm text-muted-foreground">
                        You'll receive a confirmation email with your purchase details and access instructions.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Access Your Prompt</p>
                      <p className="text-sm text-muted-foreground">
                        The full optimized prompt is now available in your dashboard. Copy it and use with any AI assistant.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Start Your Transition</p>
                      <p className="text-sm text-muted-foreground">
                        Follow the 30-day action plan and begin translating your military experience into civilian success.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1" asChild>
                  <a href="/">
                    <Download className="mr-2 h-4 w-4" />
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

              <div className="pt-6 border-t text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Need help? Have questions?
                </p>
                <p className="text-sm">
                  Email us at <a href="mailto:support@pathfinder.com" className="text-primary hover:underline">support@pathfinder.com</a>
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

      {/* Footer */}
      <footer className="py-8 border-t bg-card">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Pathfinder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
