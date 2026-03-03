import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { StripeHealthCard } from "@/components/StripeHealthCard";
import {
  Package,
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  RefreshCw,
  DollarSign,
  Repeat,
  CheckCircle2,
  XCircle,
  Tag,
  X,
} from "lucide-react";

// ─── types ───────────────────────────────────────────────────────────────────

type Product = {
  id: number;
  name: string;
  description: string;
  features: string; // JSON string
  price: number;
  currency: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  isRecurring: boolean;
  billingInterval: string | null;
  status: "active" | "disabled" | "archived";
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

type ProductFormData = {
  name: string;
  description: string;
  features: string[];
  price: string; // dollars (user input)
  currency: string;
  isRecurring: boolean;
  billingInterval: "month" | "year";
  displayOrder: string;
};

const DEFAULT_FORM: ProductFormData = {
  name: "",
  description: "",
  features: [""],
  price: "",
  currency: "usd",
  isRecurring: false,
  billingInterval: "month",
  displayOrder: "0",
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function parseFeatures(raw: string): string[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function StatusBadge({ status }: { status: Product["status"] }) {
  if (status === "active")
    return (
      <Badge className="bg-green-500/15 text-green-600 border-green-500/30">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Active
      </Badge>
    );
  if (status === "archived")
    return (
      <Badge className="bg-gray-500/15 text-gray-500 border-gray-500/30">
        <Archive className="h-3 w-3 mr-1" /> Archived
      </Badge>
    );
  return (
    <Badge className="bg-yellow-500/15 text-yellow-600 border-yellow-500/30">
      <XCircle className="h-3 w-3 mr-1" /> Disabled
    </Badge>
  );
}

// ─── Product Form Dialog ──────────────────────────────────────────────────────

function ProductFormDialog({
  open,
  onClose,
  editProduct,
}: {
  open: boolean;
  onClose: () => void;
  editProduct?: Product;
}) {
  const utils = trpc.useUtils();
  const isEdit = !!editProduct;

  const [form, setForm] = useState<ProductFormData>(() =>
    editProduct
      ? {
          name: editProduct.name,
          description: editProduct.description,
          features: parseFeatures(editProduct.features),
          price: (editProduct.price / 100).toFixed(2),
          currency: editProduct.currency,
          isRecurring: editProduct.isRecurring,
          billingInterval: (editProduct.billingInterval as "month" | "year") ?? "month",
          displayOrder: String(editProduct.displayOrder),
        }
      : DEFAULT_FORM
  );

  const [dirty, setDirty] = useState(false);

  function update<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function addFeature() {
    update("features", [...form.features, ""]);
  }

  function removeFeature(idx: number) {
    update(
      "features",
      form.features.filter((_, i) => i !== idx)
    );
  }

  function updateFeature(idx: number, val: string) {
    const next = [...form.features];
    next[idx] = val;
    update("features", next);
  }

  const createMutation = trpc.stripeProducts.createProduct.useMutation({
    onSuccess: () => {
      toast.success("Product created in Stripe and saved locally");
      utils.stripeProducts.listProducts.invalidate();
      onClose();
    },
    onError: (err) => toast.error(`Failed to create: ${err.message}`),
  });

  const updateMutation = trpc.stripeProducts.updateProduct.useMutation({
    onSuccess: () => {
      toast.success("Product updated");
      utils.stripeProducts.listProducts.invalidate();
      onClose();
    },
    onError: (err) => toast.error(`Failed to update: ${err.message}`),
  });

  function handleSubmit() {
    const priceCents = Math.round(parseFloat(form.price) * 100);
    if (isNaN(priceCents) || priceCents < 50) {
      toast.error("Price must be at least $0.50");
      return;
    }
    const features = form.features.filter((f) => f.trim().length > 0);
    if (features.length === 0) {
      toast.error("Add at least one feature");
      return;
    }

    if (isEdit && editProduct) {
      updateMutation.mutate({
        id: editProduct.id,
        name: form.name,
        description: form.description,
        features,
        price: priceCents,
        displayOrder: parseInt(form.displayOrder) || 0,
      });
    } else {
      createMutation.mutate({
        name: form.name,
        description: form.description,
        features,
        price: priceCents,
        currency: form.currency,
        isRecurring: form.isRecurring,
        billingInterval: form.isRecurring ? form.billingInterval : undefined,
        displayOrder: parseInt(form.displayOrder) || 0,
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Product" : "Create New Product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Changes to name/description sync to Stripe. Price changes create a new Stripe price."
              : "Creates the product and price in Stripe, then saves locally."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Premium Prompt Access"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Full AI career transition prompt + bonus materials"
              rows={3}
            />
          </div>

          {/* Features */}
          <div className="space-y-1.5">
            <Label>Features</Label>
            <div className="space-y-2">
              {form.features.map((f, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={f}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder={`Feature ${idx + 1}`}
                  />
                  {form.features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Feature
              </Button>
            </div>
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-price">Price (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="p-price"
                  className="pl-8"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="29.00"
                  type="number"
                  min="0.50"
                  step="0.01"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-order">Display Order</Label>
              <Input
                id="p-order"
                value={form.displayOrder}
                onChange={(e) => update("displayOrder", e.target.value)}
                type="number"
                min="0"
              />
            </div>
          </div>

          {/* Recurring (only for new products) */}
          {!isEdit && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Recurring Subscription</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enable for monthly/annual billing
                  </p>
                </div>
                <Switch
                  checked={form.isRecurring}
                  onCheckedChange={(v) => update("isRecurring", v)}
                />
              </div>
              {form.isRecurring && (
                <div className="space-y-1.5">
                  <Label>Billing Interval</Label>
                  <Select
                    value={form.billingInterval}
                    onValueChange={(v) => update("billingInterval", v as "month" | "year")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || (!dirty && isEdit)}>
            {isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : isEdit ? (
              <Pencil className="h-4 w-4 mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {isEdit ? "Save Changes" : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductManagementPage() {
  const utils = trpc.useUtils();

  const { data: productList = [], isLoading } = trpc.stripeProducts.listProducts.useQuery();

  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Product | null>(null);

  const archiveMutation = trpc.stripeProducts.archiveProduct.useMutation({
    onSuccess: () => {
      toast.success("Product archived and deactivated in Stripe");
      utils.stripeProducts.listProducts.invalidate();
      setArchiveTarget(null);
    },
    onError: (err) => toast.error(`Archive failed: ${err.message}`),
  });

  const restoreMutation = trpc.stripeProducts.restoreProduct.useMutation({
    onSuccess: () => {
      toast.success("Product restored and re-activated in Stripe");
      utils.stripeProducts.listProducts.invalidate();
    },
    onError: (err) => toast.error(`Restore failed: ${err.message}`),
  });

  const syncMutation = trpc.stripeProducts.syncFromStripe.useMutation({
    onMutate: () => toast.loading("Syncing from Stripe…", { id: "sync" }),
    onSuccess: (res) => {
      toast.success(`Synced ${res.synced} product(s) from Stripe`, { id: "sync" });
      utils.stripeProducts.listProducts.invalidate();
    },
    onError: (err) => toast.error(`Sync failed: ${err.message}`, { id: "sync" }),
  });

  const active = productList.filter((p) => p.status !== "archived");
  const archived = productList.filter((p) => p.status === "archived");

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-7 w-7 text-primary" />
            Product Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage products and prices with full Stripe synchronization
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sync from Stripe
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Product
          </Button>
        </div>
      </div>

      {/* Stripe Health Card */}
      <StripeHealthCard />

      <Separator />

      {/* Active Products */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Products ({active.length})</h2>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-4 bg-muted rounded w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : active.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No active products yet</p>
              <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Create First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {active.map((product) => (
              <ProductCard
                key={product.id}
                product={product as Product}
                onEdit={() => setEditProduct(product as Product)}
                onArchive={() => setArchiveTarget(product as Product)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Archived Products */}
      {archived.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Archived Products ({archived.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {archived.map((product) => (
              <ProductCard
                key={product.id}
                product={product as Product}
                onRestore={() => restoreMutation.mutate({ id: product.id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {createOpen && (
        <ProductFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      )}
      {editProduct && (
        <ProductFormDialog
          open={!!editProduct}
          onClose={() => setEditProduct(null)}
          editProduct={editProduct}
        />
      )}

      {/* Archive Confirmation */}
      <AlertDialog open={!!archiveTarget} onOpenChange={(o) => !o && setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive "{archiveTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the product and its price in Stripe. Existing customers are
              unaffected, but new purchases will no longer be possible. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => archiveTarget && archiveMutation.mutate({ id: archiveTarget.id })}
            >
              Archive Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onEdit,
  onArchive,
  onRestore,
}: {
  product: Product;
  onEdit?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
}) {
  const features = parseFeatures(product.features);
  const isArchived = product.status === "archived";

  return (
    <Card className={`border-2 ${isArchived ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base truncate">{product.name}</CardTitle>
            <CardDescription className="mt-0.5 line-clamp-2">{product.description}</CardDescription>
          </div>
          <StatusBadge status={product.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Price */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-2xl font-bold">
            {formatPrice(product.price, product.currency)}
          </div>
          {product.isRecurring && (
            <Badge variant="outline" className="text-xs">
              <Repeat className="h-3 w-3 mr-1" />/{product.billingInterval}
            </Badge>
          )}
        </div>

        {/* Stripe IDs */}
        {product.stripePriceId && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            <span className="font-mono truncate">{product.stripePriceId}</span>
          </div>
        )}

        {/* Features */}
        {features.length > 0 && (
          <ul className="space-y-1">
            {features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
            {features.length > 4 && (
              <li className="text-xs text-muted-foreground pl-5">+{features.length - 4} more</li>
            )}
          </ul>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          {!isArchived && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
          )}
          {!isArchived && onArchive && (
            <Button
              variant="outline"
              size="sm"
              onClick={onArchive}
              className="flex-1 text-destructive hover:text-destructive"
            >
              <Archive className="h-3.5 w-3.5 mr-1.5" /> Archive
            </Button>
          )}
          {isArchived && onRestore && (
            <Button variant="outline" size="sm" onClick={onRestore} className="flex-1">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Restore
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
