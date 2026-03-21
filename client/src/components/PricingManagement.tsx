import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  DollarSign,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TierPriceEditorProps {
  tier: "PREMIUM" | "PRO";
  label: string;
  description: string;
  currentPriceCents: number;
  stripePriceId: string;
  stripeProductId: string;
  stripeActive: boolean;
  type: "one_time" | "subscription";
  interval?: string;
  onSaved: () => void;
}

function TierPriceEditor({
  tier,
  label,
  description,
  currentPriceCents,
  stripePriceId,
  stripeProductId,
  stripeActive,
  type,
  interval,
  onSaved,
}: TierPriceEditorProps) {
  const [priceInput, setPriceInput] = useState(
    (currentPriceCents / 100).toFixed(2)
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Keep input in sync when data refreshes
  useEffect(() => {
    setPriceInput((currentPriceCents / 100).toFixed(2));
  }, [currentPriceCents]);

  const updateMutation = trpc.admin.updateTierPrice.useMutation({
    onSuccess: (data) => {
      toast.success(
        `${label} price updated to $${(data.newAmountCents / 100).toFixed(2)}. New Stripe price ID: ${data.newPriceId}`
      );
      onSaved();
    },
    onError: (error) => {
      toast.error(error.message || `Failed to update ${label} price`);
    },
  });

  const parsedCents = Math.round(parseFloat(priceInput) * 100);
  const hasChanged = parsedCents !== currentPriceCents;
  const isValid = !isNaN(parsedCents) && parsedCents >= 50;

  const handleSave = () => {
    if (!isValid) {
      toast.error("Price must be at least $0.50");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    updateMutation.mutate({ tier, newAmountCents: parsedCents });
  };

  return (
    <>
      <div className="rounded-lg border p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">{label}</h3>
              <Badge variant={type === "subscription" ? "default" : "secondary"}>
                {type === "subscription" ? `${interval}ly` : "One-time"}
              </Badge>
              {stripeActive ? (
                <Badge className="bg-green-500 text-white gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Inactive
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold">
              ${(currentPriceCents / 100).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {type === "subscription" ? `/ ${interval}` : "one-time"}
            </p>
          </div>
        </div>

        {/* Stripe IDs */}
        <div className="rounded-md bg-muted/50 p-3 space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground font-medium">Price ID:</span>
            <span className="font-mono truncate">{stripePriceId || "Not configured"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground font-medium">Product ID:</span>
            <span className="font-mono truncate">{stripeProductId || "Not configured"}</span>
          </div>
        </div>

        {/* Price Input */}
        <div className="space-y-1.5">
          <Label htmlFor={`price-${tier}`} className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            New Price (USD)
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id={`price-${tier}`}
                type="number"
                step="0.01"
                min="0.50"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={!hasChanged || !isValid || updateMutation.isPending}
              className="shrink-0"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Price
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Minimum $0.50 (Stripe requirement). Updating creates a new Stripe price and deactivates the current one.
          </p>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Price Update</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change the <strong>{label}</strong> price from{" "}
              <strong>${(currentPriceCents / 100).toFixed(2)}</strong> to{" "}
              <strong>${(parsedCents / 100).toFixed(2)}</strong>
              {type === "subscription" ? ` / ${interval}` : ""}.
              <br /><br />
              This will create a new Stripe price and deactivate the current one. Existing subscribers will not be affected — they keep their current price until they resubscribe. New checkouts will use the updated price immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm Update
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function PricingManagement() {
  const { data, isLoading, refetch } = trpc.admin.getPricingConfig.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Management
          </CardTitle>
          <CardDescription>Loading pricing configuration from Stripe...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Management
            </CardTitle>
            <CardDescription>
              Update prices for paid tiers. The Free tier cannot be modified. Changes are applied immediately to new checkouts.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free tier — read-only */}
        <div className="rounded-lg border border-dashed p-5 opacity-60">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base">Free Tier</h3>
                <Badge variant="outline">Free</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Preview the prompt with limited content
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">$0.00</p>
              <p className="text-xs text-muted-foreground">cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Premium tier */}
        {data?.premium && (
          <TierPriceEditor
            tier="PREMIUM"
            label={data.premium.name}
            description={data.premium.description}
            currentPriceCents={data.premium.price}
            stripePriceId={data.premium.stripePriceId}
            stripeProductId={data.premium.stripeProductId}
            stripeActive={data.premium.stripeActive}
            type={data.premium.type}
            onSaved={() => refetch()}
          />
        )}

        {/* Pro tier */}
        {data?.pro && (
          <TierPriceEditor
            tier="PRO"
            label={data.pro.name}
            description={data.pro.description}
            currentPriceCents={data.pro.price}
            stripePriceId={data.pro.stripePriceId}
            stripeProductId={data.pro.stripeProductId}
            stripeActive={data.pro.stripeActive}
            type={data.pro.type}
            interval={data.pro.interval}
            onSaved={() => refetch()}
          />
        )}
      </CardContent>
    </Card>
  );
}
