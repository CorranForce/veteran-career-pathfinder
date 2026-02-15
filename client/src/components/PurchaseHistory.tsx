import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Loader2, ShoppingBag } from "lucide-react";
import { format } from "date-fns";

export default function PurchaseHistory() {
  const { data: purchases, isLoading } = trpc.payment.getPurchases.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!purchases || purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
        <p className="text-muted-foreground mb-4">
          Your purchase history will appear here once you make a purchase
        </p>
        <Button asChild>
          <a href="/pricing">View Pricing</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase) => (
        <div
          key={purchase.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold">
                {purchase.productType === "premium_prompt"
                  ? "Premium Prompt Access"
                  : "Pro Subscription"}
              </h4>
              <Badge
                variant={
                  purchase.status === "completed"
                    ? "default"
                    : purchase.status === "pending"
                    ? "secondary"
                    : "destructive"
                }
              >
                {purchase.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Purchased on {format(new Date(purchase.createdAt), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {purchase.status === "completed" && purchase.promptPdfUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={purchase.promptPdfUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </Button>
            )}
            {purchase.status === "completed" && (
              <Button variant="ghost" size="sm" asChild>
                <a href="/downloads">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </a>
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
