import Link from "next/link";
import { Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getAllCategories,
  getAllProducts,
  getStockCountByProduct,
} from "@/lib/supabase/queries";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = { title: "All products" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string; q?: string };
}) {
  const [user, categories, allProducts, stockMap] = await Promise.all([
    getCurrentUser(),
    getAllCategories(),
    getAllProducts(),
    getStockCountByProduct(),
  ]);
  const showWholesale =
    user?.role === "reseller" && user.resellerStatus === "approved";

  const category = searchParams?.category;
  const q = (searchParams?.q || "").trim().toLowerCase();

  let products = allProducts;
  if (category) {
    const cat = categories.find((c) => c.slug === category);
    if (cat) products = products.filter((p) => p.categoryId === cat.id);
  }
  if (q) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q),
    );
  }

  return (
    <div className="container py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <Badge variant="outline" className="mb-2">
          Marketplace
        </Badge>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          {category
            ? categories.find((c) => c.slug === category)?.name ||
              "All products"
            : "All products"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
          {products.length} products · Instant delivery · Full warranty
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/products"
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              !category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent",
            )}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                category === c.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-accent",
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <form action="/products" method="get" className="relative w-full sm:w-72">
          {category ? (
            <input type="hidden" name="category" value={category} />
          ) : null}
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Search products..."
            defaultValue={q}
            className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-lg font-semibold">No products found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different category or search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              showWholesale={showWholesale}
              stock={stockMap[p.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
