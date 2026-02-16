import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { UrgencyBanner } from "@/components/UrgencyBanner";
import { SocialProof } from "@/components/SocialProof";
import Testimonials from "@/components/Testimonials";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, Shield, Users, Zap, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { getLoginUrl, getSignupUrl } from "@/const";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { SimpleContactButton } from "@/components/LiveChatWidget";

export default function Pricing() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // Check if user came from exit-intent popup (offer=exit20 in URL)
  const urlParams = new URLSearchParams(window.location.search);
  const hasExitOffer = urlParams.get('offer') === 'exit20';
  
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

  const handleCheckout = (productKey: "PREMIUM_PROMPT") => {
    if (!isAuthenticated) {
      toast.info("Please sign up or log in to continue");
      window.location.href = getSignupUrl();
      return;
    }

    // Apply exit-intent coupon if user came from popup
    const couponCode = hasExitOffer ? '5zlB9zup' : undefined;
    createCheckoutMutation.mutate({ productKey, couponCode });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ExitIntentPopup />
      <SimpleContactButton />
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
              <div className="flex flex-col gap-4 mt-8">
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

      {/* Urgency Banner */}
      <UrgencyBanner />

      {/* Pricing Hero */}
      <section className="py-20 bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="container mx-auto text-center space-y-6">
          <Badge className="bg-accent text-accent-foreground">Flexible Pricing</Badge>
          <h1 className="text-5xl font-bold">Choose Your Mission</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with the essentials or go all-in with ongoing support. Every veteran deserves the right tools for transition.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          {/* Sign Up Free Banner */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-gradient-to-r from-accent/20 to-primary/20 border-2 border-accent">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-accent text-accent-foreground rounded-full p-3">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Sign Up Free • No Credit Card Required</h3>
                      <p className="text-sm text-muted-foreground">Join 2,847+ veterans who've started their transition • Takes only 30 seconds</p>
                    </div>
                  </div>
                  <Button size="lg" asChild className="shrink-0">
                    <a href="/signup">Create Free Account</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <Card className="border-2 relative">
              <CardHeader>
                <CardTitle className="text-2xl">Free Preview</CardTitle>
                <CardDescription>Get a taste of what's possible</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">$0</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Basic prompt overview</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Limited career path examples</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">General transition guidance</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/#prompt-section">View Free Version</a>
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Tier */}
            <Card className="border-2 border-primary shadow-xl relative order-first md:order-none">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Premium Package</CardTitle>
                <CardDescription>Everything you need for a successful transition</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Full optimized AI prompt</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">3-4 detailed career paths with salary data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Skills gap analysis & certification roadmap</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">30-day action plan with weekly milestones</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Bonus: Resume translation templates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Lifetime access & updates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Monthly live career transition webinars</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Private veteran community access (Skool)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Q&A sessions with career experts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">Job posting board & networking</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={() => handleCheckout("PREMIUM_PROMPT")}
                  disabled={createCheckoutMutation.isPending}
                >
                  {createCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Get Premium Access
                    </>
                  )}
                </Button>
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

      {/* Social Proof Section */}
      <SocialProof />

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">What if I'm not satisfied?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee. If the prompt doesn't help you gain clarity on your career transition, 
                we'll refund your purchase—no questions asked.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">How do I use the prompt?</h3>
              <p className="text-muted-foreground">
                After purchase, you'll get instant access to the full prompt. Copy it and use it with any AI assistant 
                (ChatGPT, Claude, Gemini, etc.). Just provide your military background and the AI will guide you through your transition.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I upgrade from Premium to Pro later?</h3>
              <p className="text-muted-foreground">
                Absolutely! You can upgrade to Pro membership at any time to access the community and monthly webinars.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Is this only for recent veterans?</h3>
              <p className="text-muted-foreground">
                No! Whether you separated last month or 10 years ago, the prompt is designed to help any veteran translate 
                their military experience into civilian career opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Pathfinder</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Empowering veterans to translate their service into successful civilian careers
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 Pathfinder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
