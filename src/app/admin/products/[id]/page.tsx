import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Trash2, Plus } from "lucide-react";
import {
  getAllCategories,
  getInventoryForProduct,
  getProductById,
} from "@/lib/supabase/queries";
import { actionAddInventoryForm, actionDeleteInventory } from "@/app/actions";
import { ProductForm } from "@/components/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { formatDateTime } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);
  return { title: product?.name || "Edit product" };
}

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories] = await Promise.all([
    getProductById(params.id),
    getAllCategories(),
  ]);
  if (!product) notFound();

  const inventory = await getInventoryForProduct(product.id);
  const available = inventory.filter((i) => i.status === "available");
  const delivered = inventory.filter((i) => i.status === "delivered");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <ProductForm product={product} categories={categories} />

      {/* Inventory manager */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Inventory / stock</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {available.length} available · {delivered.length} delivered
            </p>
          </div>
          <Badge
            variant={
              available.length === 0
                ? "destructive"
                : available.length < 5
                  ? "warning"
                  : "success"
            }
          >
            <Package className="h-3 w-3" />
            {available.length} in stock
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <form
            action={actionAddInventoryForm}
            className="space-y-3 rounded-xl border border-border bg-muted/30 p-4"
          >
            <input type="hidden" name="productId" value={product.id} />
            <Label htmlFor="payload">Bulk add stock (one per line)</Label>
            <Textarea
              id="payload"
              name="payload"
              rows={5}
              required
              placeholder={`AAAA-BBBB-CCCC-DDDD
EEEE-FFFF-GGGG-HHHH
{"email":"acc@x.com","password":"..."}`}
              className="font-mono text-sm"
            />
            <div className="flex justify-end">
              <SubmitButton variant="gradient">
                <Plus className="h-4 w-4" />
                Add to inventory
              </SubmitButton>
            </div>
          </form>

          {available.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Available stock ({available.length})
              </p>
              <div className="max-h-72 space-y-2 overflow-auto rounded-lg border border-border bg-card p-3">
                {available.map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 p-2"
                  >
                    <code className="flex-1 truncate font-mono text-xs">
                      {i.payload}
                    </code>
                    <CopyButton text={i.payload} />
                    <form action={actionDeleteInventory.bind(null, i.id)}>
                      <button
                        type="submit"
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-rose-500 hover:bg-rose-500/10"
                        title="Delete this item"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {delivered.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recently delivered ({delivered.length})
              </p>
              <div className="max-h-48 space-y-1 overflow-auto rounded-lg border border-border bg-muted/20 p-3 text-xs">
                {delivered.slice(0, 50).map((i) => (
                  <div
                    key={i.id}
                    className="flex items-center justify-between gap-2 border-b border-border/40 py-1 last:border-0"
                  >
                    <code className="truncate font-mono">{i.payload}</code>
                    <span className="shrink-0 text-muted-foreground">
                      {i.deliveredAt ? formatDateTime(i.deliveredAt) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
