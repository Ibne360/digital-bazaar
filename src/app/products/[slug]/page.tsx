import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Sparkles,
  Palette,
  Code2,
  Globe,
  ShieldCheck,
  Zap,
  Clock,
  Package,
  Wallet,
  ShoppingCart,
  Flame,
  Lock,
  Crown,
  Gift,
  CheckCircle2,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { priceFor } from "@/lib/orders";
import {
  getAllCategories,
  getAllProducts,
  getProductBySlug,
  getStockCountByProduct,
} from "@/lib/supabase/queries";
import { actionAddToCart, actionBuyNow } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  cat_ai: Sparkles,
  cat_design: Palette,
  cat_dev: Code2,
  cat_social: Globe,
};

const BADGE_META: Record<string, { label: string; variant: any; Icon: React.ComponentType<{ className?: string }> }> = {
  instant: { label: "Instant Delivery", variant: "instant", Icon: Zap },
  hot: { label: "Hot Seller", variant: "hot", Icon: Flame },
  limited: { label: "Limited Stock", variant: "limited", Icon: Lock },
  wholesale: { label: "Wholesale Available", variant: "wholesale", Icon: Crown },
  new: { label: "New Arrival", variant: "new", Icon: Gift },
};

const DELIVERY_LABEL: Record<string, string> = {
  account: "Login credentials",
  license_key: "License Key / CDK",
  invite_link: "Invite link",
  credits: "Credit top-up",
  manual: "Manual fulfilment",
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  return { title: product?.name || "Product" };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, user, categories, allProducts, stockMap] = await Promise.all([
    getProductBySlug(params.slug),
    getCurrentUser(),
    getAllCategories(),
    getAllProducts(),
    getStockCountByProduct(),
  ]);
  if (!product || !product.active) notFound();

  const category = categories.find((c) => c.id === product.categoryId);
  const Icon = CATEGORY_ICONS[product.categoryId] || Sparkles;
  const stock = stockMap[product.id] ?? 0;
  const price = priceFor(product, user);
  const isReseller =
    user?.role === "reseller" && user.resellerStatus === "approved";
  const savings = product.retailPrice - product.wholesalePrice;
  const savingsPct = Math.round((savings / product.retailPrice) * 100);

  const related = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const buyNow = actionBuyNow.bind(null, product.id, undefined);
  const addToCart = actionAddToCart.bind(null, product.id, 1);

  return (
    <div className="container py-5 sm:py-10">
      <nav className="mb-5 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs text-muted-foreground sm:mb-8 sm:text-sm">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground">Products</Link>
        {category ? (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-foreground"
            >
              {category.name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="grid gap-6 sm:gap-10 lg:grid-cols-2">
        {/* Visual */}
        <div>
          <div
            className={cn(
              "relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl sm:aspect-square sm:rounded-3xl",
              !product.imageUrl && `bg-gradient-to-br p-8 sm:p-12 ${product.iconBg}`,
              product.imageUrl && "bg-muted",
            )}
          >
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-grid-pattern bg-[length:32px_32px] opacity-30" />
                <Icon className="relative h-20 w-20 text-white drop-shadow-lg sm:h-32 sm:w-32" />
              </>
            )}
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4 sm:gap-2">
              {product.badges.map((b) => {
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
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
            {[
              { Icon: Zap, label: "Delivery", value: "<60 sec" },
              { Icon: ShieldCheck, label: "Warranty", value: product.warranty.split(" ")[0] },
              { Icon: Package, label: "Stock", value: stock > 0 ? `${stock} units` : "Sold out" },
            ].map(({ Icon: I, label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-border bg-card p-2.5 text-center sm:rounded-xl sm:p-3"
              >
                <I className="mx-auto h-4 w-4 text-primary" />
                <p className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground sm:mt-1.5 sm:text-[10px]">
                  {label}
                </p>
                <p className="mt-0.5 text-xs font-semibold sm:text-sm">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info & buy box */}
        <div className="flex flex-col">
          {category ? (
            <Badge variant="outline" className="mb-2.5 w-fit sm:mb-3">
              {category.name}
            </Badge>
          ) : null}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">{product.shortDescription}</p>

          <div className="mt-4 flex flex-wrap items-baseline gap-2 sm:mt-6 sm:gap-3">
            <span className="text-3xl font-bold tracking-tight sm:text-4xl">
              {formatCurrency(price)}
            </span>
            {!isReseller && savings > 0 ? (
              <span className="text-sm text-muted-foreground">
                or <span className="font-semibold text-violet-500">{formatCurrency(product.wholesalePrice)}</span> as reseller
              </span>
            ) : null}
            {isReseller ? (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.retailPrice)}
                </span>
                <Badge variant="success">-{savingsPct}% wholesale</Badge>
              </>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:gap-x-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {product.duration}
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {DELIVERY_LABEL[product.deliveryType]}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              {product.warranty}
            </span>
          </div>

          <Card className="mt-5 border-2 sm:mt-6">
            <CardContent className="space-y-3 pt-5 sm:space-y-4 sm:pt-6">
              {user ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                      <Wallet className="h-4 w-4" />
                      Wallet balance
                    </span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      {formatCurrency(user.walletBalance)}
                    </span>
                  </div>
                  {user.walletBalance < price ? (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                      You need {formatCurrency(price - user.walletBalance)} more —
                      <Link href="/dashboard/deposit" className="ml-1 underline">
                        top up wallet
                      </Link>
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                  <Link href={`/login?next=/products/${product.slug}`} className="font-medium underline">
                    Sign in
                  </Link>{" "}
                  to use your wallet & complete purchases instantly.
                </div>
              )}

              {stock > 0 ? (
                <>
                  <form action={buyNow}>
                    <SubmitButton variant="gradient" size="xl" className="w-full">
                      <Wallet className="h-5 w-5" />
                      Buy now · {formatCurrency(price)}
                    </SubmitButton>
                  </form>
                  <form action={addToCart}>
                    <SubmitButton variant="outline" size="lg" className="w-full">
                      <ShoppingCart className="h-4 w-4" />
                      Add to cart
                    </SubmitButton>
                  </form>
                </>
              ) : (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-center text-sm font-medium text-rose-600 dark:text-rose-300">
                  Currently sold out — check back soon.
                </div>
              )}

              <div className="space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                {[
                  "Instant delivery to dashboard",
                  "Full warranty during the plan",
                  "24/7 support via tickets & live chat",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    {t}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description */}
      <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About this product</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground/90">
            <p className="text-base leading-relaxed">{product.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Type
                </p>
                <p className="mt-1 font-medium">{DELIVERY_LABEL[product.deliveryType]}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Instructions
                </p>
                <p className="mt-1">{product.deliveryInstructions}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Warranty
                </p>
                <p className="mt-1">{product.warranty}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Related */}
      {related.length > 0 ? (
        <div className="mt-10 sm:mt-16">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">You might also like</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                showWholesale={isReseller}
                stock={stockMap[p.id] ?? 0}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
