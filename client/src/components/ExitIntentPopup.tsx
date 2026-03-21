import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Gift, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { PRODUCTS } from "@shared/products";

/** Format cents to a USD string, e.g. 2320 → "$23.20" */
function fmt(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch live Premium price from Stripe so discount math is always correct
  const { data: livePrices } = trpc.payment.getLivePrices.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const fullPriceCents = livePrices?.premium.amountCents ?? PRODUCTS.PREMIUM.price;
  // 20% off — round to nearest cent
  const discountedCents = Math.round(fullPriceCents * 0.8);

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

  const handleGetOffer = () => {
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
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Gift className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                Wait! Don't Leave Yet
              </DialogTitle>
              <DialogDescription className="text-white/90 text-sm">
                Special offer for veterans like you
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">
              Get 20% Off Your Premium Package
            </h3>
            <p className="text-muted-foreground">
              We know transitioning to civilian life is challenging. That's why we're offering you an exclusive{" "}
              <strong>20% discount</strong> on our Premium Package — just{" "}
              <strong>{fmt(discountedCents)}</strong> instead of{" "}
              <span className="line-through text-muted-foreground">{fmt(fullPriceCents)}</span>.
            </p>
          </div>

          {/* Savings callout */}
          <div className="flex items-center gap-3 rounded-md bg-green-500/10 border border-green-500/30 px-4 py-3">
            <span className="text-green-600 font-bold text-lg">{fmt(fullPriceCents - discountedCents)}</span>
            <span className="text-sm text-green-700">savings with your 20% veteran discount</span>
          </div>

          <div className="bg-accent/50 rounded-lg p-4 space-y-2">
            <p className="font-medium">This exclusive offer includes:</p>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Complete AI Career Transition Strategist prompt</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>30-day action plan with weekly milestones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>MOS-to-civilian job translation guide</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Resume templates optimized for ATS systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Access to exclusive veteran career resources</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleGetOffer}
              size="lg"
              className="w-full text-lg"
            >
              Claim My 20% Discount <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
            >
              No thanks, I'll pay full price
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            This offer expires when you close this window
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
