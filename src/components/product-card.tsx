import Link from "next/link";
import {
  Sparkles,
  Palette,
  Code2,
  Globe,
  Zap,
  Flame,
  Lock,
  Crown,
  Gift,
  ShoppingCart,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { actionAddToCart } from "@/app/actions";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cat_ai: Sparkles,
  cat_design: Palette,
  cat_dev: Code2,
  cat_social: Globe,
};

const BADGE_META: Record<string, { label: string; variant: any; Icon: React.ComponentType<{ className?: string }> }> = {
  instant: { label: "Instant", variant: "instant", Icon: Zap },
  hot: { label: "Hot", variant: "hot", Icon: Flame },
  limited: { label: "Limited", variant: "limited", Icon: Lock },
  wholesale: { label: "Wholesale", variant: "wholesale", Icon: Crown },
  new: { label: "New", variant: "new", Icon: Gift },
};

export function ProductCard({
  product,
  showWholesale,
  stock,
}: {
  product: Product;
  showWholesale?: boolean;
  stock?: number;
}) {
  const CategoryIcon = CATEGORY_ICONS[product.categoryId] || Sparkles;
  const discountPct = Math.round(
    ((product.retailPrice - product.wholesalePrice) / product.retailPrice) * 100,
  );

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative">
        {product.imageUrl ? (
          <div className="relative h-24 overflow-hidden bg-muted sm:h-32">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            className={cn(
              "flex h-24 items-center justify-center bg-gradient-to-br p-4 sm:h-32 sm:p-6",
              product.iconBg,
            )}
          >
            <div className="absolute inset-0 bg-grid-pattern bg-[length:24px_24px] opacity-30" />
            <CategoryIcon className="relative h-10 w-10 text-white drop-shadow sm:h-12 sm:w-12" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
          {product.badges.slice(0, 2).map((b) => {
            const meta = BADGE_META[b];
            if (!meta) return null;
            const I = meta.Icon;
            return (
              <Badge key={b} variant={meta.variant} className="backdrop-blur">
                <I className="h-3 w-3" />
                {meta.label}
              </Badge>
            );
          })}
        </div>
        {typeof stock === "number" && stock <= 5 && stock > 0 ? (
          <div className="absolute right-2 top-2 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow sm:right-3 sm:top-3">
            Only {stock} left
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight tracking-tight sm:text-base">
          {product.name}
        </h3>
        <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
          {product.duration} · {product.warranty}
        </p>
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
          {product.shortDescription}
        </p>

        <div className="mt-auto pt-3 sm:pt-4">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              {showWholesale ? (
                <>
                  <p className="text-[10px] uppercase tracking-widest text-violet-500">
                    Wholesale
                  </p>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-lg font-bold tracking-tight sm:text-2xl">
                      {formatCurrency(product.wholesalePrice)}
                    </span>
                    <span className="text-[11px] text-muted-foreground line-through sm:text-xs">
                      {formatCurrency(product.retailPrice)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-lg font-bold tracking-tight sm:text-2xl">
                    {formatCurrency(product.retailPrice)}
                  </span>
                  {discountPct > 0 ? (
                    <span className="hidden text-xs font-semibold text-emerald-500 sm:inline">
                      -{discountPct}%
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <form action={actionAddToCart.bind(null, product.id, 1)}>
                <button
                  type="submit"
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-border bg-card px-2 text-[11px] font-semibold text-foreground transition-all hover:bg-accent active:scale-95 sm:h-9 sm:text-xs"
                  aria-label={`Add ${product.name} to cart`}
                  title="Add to cart"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </form>
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 text-[11px] font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30 sm:h-9 sm:px-3 sm:text-xs"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
