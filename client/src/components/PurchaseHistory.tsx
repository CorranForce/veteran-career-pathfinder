import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, Loader2, ShoppingBag } from "lucide-react";
import { format } from "date-fns";

const PAGE_SIZE = 5;

export default function PurchaseHistory() {
  const { data: purchases, isLoading } = trpc.payment.getPurchases.useQuery();
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.ceil(purchases.length / PAGE_SIZE);
  const paginated = purchases.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {paginated.map((purchase) => (
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

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, purchases.length)} of {purchases.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-3 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
