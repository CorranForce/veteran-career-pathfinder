import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Lock,
  Compass,
  Star,
  Zap,
  FileText,
  Target,
  ArrowRight,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const FREE_FEATURES = [
  "MOS Translator — look up civilian career paths",
  "View the Pathfinder AI prompt",
  "Browse resume templates",
  "Read all blog posts & guides",
];

const PREMIUM_FEATURES = [
  { label: "Full AI Analysis prompt — pre-filled with your MOS", icon: Target },
  { label: "Unlimited resume builder & AI-powered rewrites", icon: FileText },
  { label: "Priority access to new MOS codes & career paths", icon: Compass },
  { label: "Downloadable 30-day action plan PDFs", icon: Zap },
  { label: "All future premium features included", icon: Star },
];

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const markSeenMutation = trpc.auth.markWelcomeSeen.useMutation();

  const handleDismiss = async () => {
    if (!dismissed) {
      setDismissed(true);
      try {
        await markSeenMutation.mutateAsync();
      } catch {
        // Non-blocking — modal still closes
      }
    }
    onClose();
  };

  const handleUpgrade = async () => {
    if (!dismissed) {
      setDismissed(true);
      try {
        await markSeenMutation.mutateAsync();
      } catch {
        // Non-blocking
      }
    }
    onClose();
    setLocation("/pricing");
  };

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleDismiss(); }}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        {/* Header banner */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground px-8 py-7">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 rounded-full p-2">
              <Compass className="h-6 w-6" />
            </div>
            <Badge className="bg-amber-400 text-amber-900 font-semibold border-0">
              Welcome to Pathfinder
            </Badge>
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary-foreground text-left">
              Welcome aboard, {firstName}! 🎖️
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-primary-foreground/85 text-sm leading-relaxed">
            Your account is active on the <strong>Free plan</strong>. Here's what you have access to — and what unlocks with Premium.
          </p>
        </div>

        {/* Comparison grid */}
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Free column */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Free Plan</span>
              <Badge variant="outline" className="text-xs">Current</Badge>
            </div>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                Full AI Analysis prompt locked
              </li>
              <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                Resume builder locked
              </li>
            </ul>
          </div>

          {/* Premium column */}
          <div className="px-6 py-5 bg-amber-50/60 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Premium Plan</span>
              <Badge className="bg-amber-400 text-amber-900 border-0 text-xs font-semibold">Most Popular</Badge>
            </div>
            <ul className="space-y-2.5">
              {PREMIUM_FEATURES.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Icon className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-5 bg-muted/30 border-t flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={handleUpgrade}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white gap-2 font-semibold"
            size="lg"
          >
            <Star className="h-4 w-4" />
            Upgrade to Premium
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="w-full sm:w-auto text-muted-foreground"
            size="lg"
          >
            Continue with Free
          </Button>
          <p className="text-xs text-muted-foreground sm:ml-auto text-center sm:text-right">
            One-time payment · No subscription required
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
