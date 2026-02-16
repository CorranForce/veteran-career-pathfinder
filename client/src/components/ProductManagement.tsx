import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Package, DollarSign, FileText, Save } from "lucide-react";
import { toast } from "sonner";

export function ProductManagement() {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState({
    name: "",
    price: "",
    description: "",
  });

  // Fetch current product configuration
  const { data: product, isLoading, refetch } = trpc.admin.getProductConfig.useQuery();

  // Update product mutation
  const updateProduct = trpc.admin.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully!");
      refetch();
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  // Initialize form with current product data
  useEffect(() => {
    if (product) {
      const priceInDollars = (product.amount / 100).toFixed(2);
      setProductName(product.name);
      setProductPrice(priceInDollars);
      setProductDescription(product.description);
      setInitialData({
        name: product.name,
        price: priceInDollars,
        description: product.description,
      });
    }
  }, [product]);

  // Track changes
  useEffect(() => {
    const changed =
      productName !== initialData.name ||
      productPrice !== initialData.price ||
      productDescription !== initialData.description;
    setHasChanges(changed);
  }, [productName, productPrice, productDescription, initialData]);

  const handleSave = () => {
    const priceInCents = Math.round(parseFloat(productPrice) * 100);
    
    if (isNaN(priceInCents) || priceInCents < 50) {
      toast.error("Price must be at least $0.50");
      return;
    }

    if (!productName.trim()) {
      toast.error("Product name is required");
      return;
    }

    updateProduct.mutate({
      name: productName,
      amount: priceInCents,
      description: productDescription,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Management
          </CardTitle>
          <CardDescription>Loading product configuration...</CardDescription>
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
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Management
        </CardTitle>
        <CardDescription>
          Update your Premium Career Transition Package pricing and details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="product-name" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Product Name
          </Label>
          <Input
            id="product-name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Premium Career Transition Package"
          />
        </div>

        {/* Product Price */}
        <div className="space-y-2">
          <Label htmlFor="product-price" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price (USD)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="product-price"
              type="number"
              step="0.01"
              min="0.50"
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              className="pl-7"
              placeholder="29.00"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Minimum: $0.50 (Stripe requirement)
          </p>
        </div>

        {/* Product Description */}
        <div className="space-y-2">
          <Label htmlFor="product-description">Description</Label>
          <Textarea
            id="product-description"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            placeholder="Complete career transition toolkit with AI prompt, webinars, community access, and ongoing support"
            rows={4}
          />
        </div>

        {/* Current Stripe Info */}
        {product?.productId && product.productId !== "price_premium_prompt" && (
          <div className="rounded-lg bg-muted p-4 space-y-1">
            <p className="text-sm font-medium">Stripe Product ID:</p>
            <p className="text-sm text-muted-foreground font-mono">
              {product.productId}
            </p>
            {product.priceId && product.priceId !== "price_premium_prompt" && (
              <>
                <p className="text-sm font-medium mt-2">Stripe Price ID:</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {product.priceId}
                </p>
              </>
            )}
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateProduct.isPending}
          className="w-full"
        >
          {updateProduct.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>

        {hasChanges && (
          <p className="text-sm text-muted-foreground text-center">
            You have unsaved changes
          </p>
        )}
      </CardContent>
    </Card>
  );
}
