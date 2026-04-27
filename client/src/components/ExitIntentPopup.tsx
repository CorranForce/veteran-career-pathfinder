import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Gift, ArrowRight, Copy, Check, Mail, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { PRODUCTS } from "@shared/products";
import { toast } from "sonner";

/** Format cents to a USD string, e.g. 2320 → "$23.20" */
function fmt(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

type Step = "email" | "reveal";

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch live Premium price from Stripe so discount math is always correct
  const { data: livePrices } = trpc.payment.getLivePrices.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const fullPriceCents = livePrices?.premium.amountCents ?? PRODUCTS.PREMIUM.price;
  const discountedCents = Math.round(fullPriceCents * 0.8);

  const submitMutation = trpc.exitIntent.submit.useMutation({
    onSuccess: (data) => {
      setCouponCode(data.couponCode);
      setStep("reveal");
    },
    onError: (err) => {
      setEmailError(err.message || "Something went wrong. Please try again.");
    },
  });

  useEffect(() => {
    const popupShown = sessionStorage.getItem("exitIntentShown");
    if (popupShown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown && !isOpen) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown, isOpen]);

  // Focus email input when popup opens
  useEffect(() => {
    if (isOpen && step === "email") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, step]);

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError("Please enter your email address.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    submitMutation.mutate({ email: email.trim() });
  };

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      toast.success("Copied!", { description: "Coupon code copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard
      toast.info("Code: " + couponCode, { description: "Copy the code above." });
    }
  };

  const handleClaimOffer = () => {
    setIsOpen(false);
    setLocation("/pricing?offer=exit20");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Header gradient */}
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {step === "email" ? "Wait! Don't Leave Yet" : "Your Discount Is Ready!"}
              </DialogTitle>
              <DialogDescription className="text-white/90 text-sm">
                {step === "email"
                  ? "Special offer for veterans like you"
                  : "Use this code at checkout"}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* ── STEP 1: Email capture ── */}
          {step === "email" && (
            <>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Get 20% Off Your Premium Package</h3>
                <p className="text-muted-foreground text-sm">
                  Enter your email and we'll send you an exclusive{" "}
                  <strong>20% discount code</strong> — just{" "}
                  <strong>{fmt(discountedCents)}</strong> instead of{" "}
                  <span className="line-through text-muted-foreground">{fmt(fullPriceCents)}</span>.
                </p>
              </div>

              {/* Savings callout */}
              <div className="flex items-center gap-3 rounded-md bg-green-500/10 border border-green-500/30 px-4 py-3">
                <span className="text-green-600 font-bold text-lg">
                  {fmt(fullPriceCents - discountedCents)}
                </span>
                <span className="text-sm text-green-700">savings with your 20% veteran discount</span>
              </div>

              {/* Email form */}
              <form onSubmit={handleSubmitEmail} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="exit-email" className="text-sm font-medium">
                    Your Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="exit-email"
                      ref={inputRef}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) validateEmail(e.target.value);
                      }}
                      className={`pl-9 ${emailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      disabled={submitMutation.isPending}
                      autoComplete="email"
                    />
                  </div>
                  {emailError && (
                    <p className="text-destructive text-xs">{emailError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-base"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting your code…
                    </>
                  ) : (
                    <>
                      Reveal My 20% Discount <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
              >
                No thanks, I'll pay full price
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                We respect your privacy. No spam, ever.
              </p>
            </>
          )}

          {/* ── STEP 2: Coupon reveal ── */}
          {step === "reveal" && (
            <>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Here's Your Exclusive Code</h3>
                <p className="text-muted-foreground text-sm">
                  We've also emailed this code to <strong>{email}</strong>. Copy it and use it at
                  checkout to save <strong>{fmt(fullPriceCents - discountedCents)}</strong>.
                </p>
              </div>

              {/* Coupon code display */}
              <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-orange-400 bg-orange-50 dark:bg-orange-950/20 p-4">
                <div className="flex-1 text-center">
                  <p className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">
                    Your Coupon Code
                  </p>
                  <p className="text-3xl font-bold tracking-widest text-orange-600 dark:text-orange-400">
                    {couponCode}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyCoupon}
                  className="shrink-0 border-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-orange-600" />
                  )}
                </Button>
              </div>

              {/* Savings reminder */}
              <div className="flex items-center gap-3 rounded-md bg-green-500/10 border border-green-500/30 px-4 py-3">
                <span className="text-green-600 font-bold text-lg">
                  {fmt(fullPriceCents - discountedCents)}
                </span>
                <span className="text-sm text-green-700">
                  savings — pay just {fmt(discountedCents)} instead of{" "}
                  <span className="line-through">{fmt(fullPriceCents)}</span>
                </span>
              </div>

              <Button
                onClick={handleClaimOffer}
                size="lg"
                className="w-full text-base"
              >
                Go to Pricing &amp; Apply Code <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
              >
                I'll use it later
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Check your inbox — we sent the code to {email}
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
