import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, Shield, Menu, Star } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { getSignupUrl } from "@/const";
import { PRODUCTS, formatPrice } from "@shared/products";

export default function PricingNew() {
  const { user, isAuthenticated } = useAuth();
  
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

  const handleCheckout = (productId: "PREMIUM" | "PRO") => {
    if (!isAuthenticated) {
      toast.info("Please sign up or log in to continue");
      window.location.href = getSignupUrl();
      return;
    }

    createCheckoutMutation.mutate({ productId });
  };

  return (
    <div className="min-h-screen flex flex-col">
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
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Free Tier */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">{PRODUCTS.FREE.name}</CardTitle>
                <CardDescription>{PRODUCTS.FREE.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{formatPrice(PRODUCTS.FREE.price)}</span>
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
                <Button 
                  variant="outline" 
                  className="w-full"
                  asChild
                >
                  <a href={isAuthenticated ? "/tools" : "/signup"}>
                    Get Started Free
                  </a>
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Tier - Most Popular */}
            <Card className="border-4 border-primary relative shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  <Star className="h-3 w-3 mr-1 inline" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{PRODUCTS.PREMIUM.name}</CardTitle>
                <CardDescription>{PRODUCTS.PREMIUM.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{formatPrice(PRODUCTS.PREMIUM.price)}</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
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
                <Button 
                  className="w-full" 
                  onClick={() => handleCheckout("PREMIUM")}
                  disabled={createCheckoutMutation.isPending}
                >
                  {createCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Get Premium Access"
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Pro Tier */}
            <Card className="border-2 border-accent">
              <CardHeader>
                <CardTitle className="text-2xl">{PRODUCTS.PRO.name}</CardTitle>
                <CardDescription>{PRODUCTS.PRO.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{formatPrice(PRODUCTS.PRO.price)}</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {PRODUCTS.PRO.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground" 
                  onClick={() => handleCheckout("PRO")}
                  disabled={createCheckoutMutation.isPending}
                >
                  {createCheckoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Start Pro Membership"
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

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">What's the difference between Premium and Pro?</h3>
              <p className="text-muted-foreground">
                Premium gives you lifetime access to our complete career transition toolkit with a one-time payment. 
                Pro adds ongoing support with monthly webinars, community access, and resume reviews for active job seekers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I upgrade from Premium to Pro later?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade to Pro membership at any time. Your Premium purchase gives you all the core materials, 
                and Pro adds the community and ongoing support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">What if I'm not satisfied?</h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee on all purchases. If our tools don't help you gain clarity on your 
                career transition, we'll refund your purchase—no questions asked.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Do you offer military/veteran discounts?</h3>
              <p className="text-muted-foreground">
                Our pricing is already designed with veterans in mind. We occasionally offer special promotions—sign up 
                for our newsletter to be notified of any discounts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Can I cancel my Pro membership?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your Pro membership at any time from your account settings. You'll retain access 
                until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Start Your Transition?</h2>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Join thousands of veterans who've successfully transitioned to civilian careers with Pathfinder.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            asChild
          >
            <a href={isAuthenticated ? "#pricing" : "/signup"}>
              Get Started Now
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Pathfinder. Built by veterans, for veterans.</p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/refund" className="hover:text-foreground transition-colors">Refund Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
