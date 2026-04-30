import Link from "next/link";
import { type ComponentType } from "react";
import {
  Sparkles,
  Palette,
  Code2,
  Globe,
  Zap,
  Flame,
  Lock,
  Gift,
  ShoppingCart,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { actionAddToCart } from "@/app/actions";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  cat_ai: Sparkles,
  cat_design: Palette,
  cat_dev: Code2,
  cat_social: Globe,
};

const BADGE_META: Record<
  string,
  { label: string; variant: any; Icon: ComponentType<{ className?: string }> }
> = {
  instant: { label: "Instant", variant: "instant", Icon: Zap },
  hot: { label: "Hot", variant: "hot", Icon: Flame },
  limited: { label: "Limited", variant: "limited", Icon: Lock },
  new: { label: "New", variant: "new", Icon: Gift },
};

export function ProductCard({
  product,
  stock,
}: {
  product: Product;
  stock?: number;
}) {
  const CategoryIcon = CATEGORY_ICONS[product.categoryId] || Sparkles;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border-border/70 bg-card/95 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative">
        {product.imageUrl ? (
          <div className="relative h-32 overflow-hidden bg-muted sm:h-32">
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
              "flex h-32 items-center justify-center bg-gradient-to-br p-4 sm:h-32 sm:p-6",
              product.iconBg,
            )}
          >
            <div className="absolute inset-0 bg-grid-pattern bg-[length:24px_24px] opacity-30" />
            <CategoryIcon className="relative h-10 w-10 text-white drop-shadow sm:h-12 sm:w-12" />
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
          {product.badges.slice(0, 2).map((badge) => {
            const meta = BADGE_META[badge];
            if (!meta) return null;
            const Icon = meta.Icon;
            return (
              <Badge key={badge} variant={meta.variant} className="backdrop-blur">
                <Icon className="h-3 w-3" />
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

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-2 text-base font-semibold leading-tight tracking-tight">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {product.duration} - {product.warranty}
        </p>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-auto pt-4">
          <div className="min-w-0">
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-2xl font-bold tracking-tight">
                {formatCurrency(product.retailPrice)}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <form action={actionAddToCart.bind(null, product.id, 1)}>
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground transition-all hover:bg-accent active:scale-95"
                aria-label={`Add ${product.name} to cart`}
                title="Add to cart"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to cart
              </button>
            </form>
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
