import Link from "next/link";
import { Plus, Edit3, Trash2, Package, Sparkles } from "lucide-react";
import {
  getAllCategories,
  getAllProducts,
  getStockCountByProduct,
} from "@/lib/supabase/queries";
import { actionDeleteProduct } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { cn, formatCurrency } from "@/lib/utils";

export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const [products, categories, stockMap] = await Promise.all([
    getAllProducts({ includeInactive: true }),
    getAllCategories(),
    getStockCountByProduct(),
  ]);
  const activeCount = products.filter((p) => p.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            {products.length} total · {activeCount} live
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className={buttonVariants({ variant: "gradient", size: "lg" })}
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const category = categories.find(
                    (c) => c.id === p.categoryId,
                  );
                  const stock = stockMap[p.id] ?? 0;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border/60 last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                              p.iconBg,
                            )}
                          >
                            <Sparkles className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="font-medium hover:text-primary"
                            >
                              {p.name}
                            </Link>
                            <p className="text-[11px] text-muted-foreground">
                              {p.duration}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {category?.name || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(p.retailPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            stock === 0
                              ? "destructive"
                              : stock < 5
                                ? "warning"
                                : "success"
                          }
                        >
                          <Package className="h-3 w-3" />
                          {stock}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.active ? "success" : "secondary"}>
                          {p.active ? "Active" : "Hidden"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className={cn(
                              buttonVariants({
                                variant: "outline",
                                size: "sm",
                              }),
                            )}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                          <form
                            action={actionDeleteProduct.bind(null, p.id)}
                          >
                            <SubmitButton variant="ghost" size="sm">
                              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            </SubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
