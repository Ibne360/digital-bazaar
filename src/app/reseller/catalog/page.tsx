import Link from "next/link";
import { redirect } from "next/navigation";
import { Crown, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getAllProducts,
  getStockCountByProduct,
} from "@/lib/supabase/queries";
import { ProductCard } from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Wholesale catalog" };

export default async function WholesaleCatalogPage() {
  const user = await requireUser();
  if (user.role !== "reseller" || user.resellerStatus !== "approved") {
    redirect("/reseller");
  }
  const [products, stockMap] = await Promise.all([
    getAllProducts(),
    getStockCountByProduct(),
  ]);
  const totalSavings = products.reduce(
    (s, p) => s + (p.retailPrice - p.wholesalePrice),
    0,
  );
  const avgMargin =
    products.length === 0
      ? 0
      : Math.round(
          (products.reduce(
            (s, p) =>
              s + (p.retailPrice - p.wholesalePrice) / p.retailPrice,
            0,
          ) /
            products.length) *
            100,
        );

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="wholesale" className="mb-2">
          <Crown className="h-3 w-3" />
          Wholesale catalog
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight">
          {products.length} products at wholesale
        </h1>
        <p className="text-muted-foreground">
          Average margin <span className="font-semibold text-foreground">{avgMargin}%</span>
          {" · "}Total possible margin per unit:{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(totalSavings)}
          </span>
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          <Stat
            label="Avg margin"
            value={`${avgMargin}%`}
          />
          <Stat
            label="Best deal"
            value={(() => {
              const best = [...products].sort(
                (a, b) =>
                  (b.retailPrice - b.wholesalePrice) / b.retailPrice -
                  (a.retailPrice - a.wholesalePrice) / a.retailPrice,
              )[0];
              return best ? best.name : "—";
            })()}
          />
          <Stat
            label="Commission rate"
            value="10%"
            sub="on referred sales"
          />
        </CardContent>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} className="space-y-2">
            <ProductCard
              product={p}
              showWholesale
              stock={stockMap[p.id] ?? 0}
            />
            <div className="rounded-lg border border-border bg-card p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Retail</span>
                <span className="line-through">
                  {formatCurrency(p.retailPrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Wholesale</span>
                <span className="font-bold">
                  {formatCurrency(p.wholesalePrice)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-border pt-1 text-emerald-500">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Margin
                </span>
                <span className="font-bold">
                  {formatCurrency(p.retailPrice - p.wholesalePrice)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold">{value}</p>
      {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
