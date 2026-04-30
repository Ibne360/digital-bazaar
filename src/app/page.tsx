import Link from "next/link";
import { Search, Package } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getAllCategories,
  getAllProducts,
  getStockCountByProduct,
} from "@/lib/supabase/queries";
import { ProductCard } from "@/components/product-card";
import { WhatsAppCTA } from "@/components/whatsapp-cta";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function HomePage({
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

  const activeCategory = category
    ? categories.find((c) => c.slug === category)
    : null;

  return (
    <div className="container py-5 sm:py-10">
      <section className="relative mb-6 overflow-hidden rounded-[30px] border border-border/70 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-5 text-white shadow-xl shadow-slate-950/10 sm:mb-8 sm:px-6 sm:py-7">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:28px_28px] opacity-20" />
        <div className="absolute -right-8 top-0 h-36 w-36 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Badge variant="outline" className="mb-3 border-white/15 bg-white/10 text-white">
                <Package className="h-3 w-3" />
                Marketplace
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                {activeCategory ? activeCategory.name : "All products"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/75 sm:text-base">
                {products.length} product{products.length === 1 ? "" : "s"} - Instant delivery - Full warranty
              </p>
            </div>
            <WhatsAppCTA />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-white/85 sm:flex sm:flex-wrap sm:gap-3 sm:text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
              Curated digital tools
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
              Instant account access
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
              Trusted support team
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 backdrop-blur">
              Reseller ready pricing
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-[28px] border border-border/70 bg-card/70 p-4 shadow-sm sm:mb-8 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className={cn(
                "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-colors sm:min-h-0 sm:px-3 sm:py-1.5",
                !category
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card hover:bg-accent",
              )}
            >
              All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/?category=${c.slug}`}
                className={cn(
                  "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-colors sm:min-h-0 sm:px-3 sm:py-1.5",
                  category === c.slug
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card hover:bg-accent",
                )}
              >
                {c.name}
              </Link>
            ))}
          </div>

          <form action="/" method="get" className="relative w-full sm:max-w-sm">
            {category ? (
              <input type="hidden" name="category" value={category} />
            ) : null}
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Search products..."
              defaultValue={q}
              className="h-12 w-full rounded-2xl border border-input bg-background pl-11 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </form>
        </div>
      </section>

      {products.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-border bg-card/50 p-8 text-center sm:p-12">
          <p className="text-lg font-semibold">No products found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different category or search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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
