import Link from "next/link";
import {
  Trash2,
  ShoppingCart,
  Wallet,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { readCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { buildCartView } from "@/lib/orders";
import {
  actionRemoveFromCart,
  actionUpdateCart,
  actionCheckout,
} from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/misc";

export const metadata = { title: "Cart" };

export default async function CartPage({
  searchParams,
}: {
  searchParams?: { coupon?: string; ref?: string };
}) {
  const user = await getCurrentUser();
  const lines = readCart();
  const view = await buildCartView(lines, user, searchParams?.coupon);

  if (view.lines.length === 0) {
    return (
      <div className="container flex min-h-[calc(100vh-220px)] items-center justify-center py-8 sm:py-12">
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" />}
          title="Your cart is empty"
          description="Browse the marketplace and add a product to checkout instantly with your wallet balance."
          action={
            <Link
              href="/"
              className={buttonVariants({ variant: "gradient", size: "lg" })}
            >
              Browse products
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  const insufficient = !!user && user.walletBalance < view.total;
  const needed = Math.max(0, view.total - (user?.walletBalance || 0));

  return (
    <div className="container py-5 sm:py-10">
      <h1 className="text-xl font-bold tracking-tight sm:text-3xl md:text-4xl">Your cart</h1>
      <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-base">
        {view.lines.length} item{view.lines.length === 1 ? "" : "s"} ·
        {view.isReseller ? " Wholesale tier" : " Retail pricing"}
      </p>

      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-3 lg:col-span-2">
          {view.lines.map((line) => (
            <Card key={line.product.id}>
              <CardContent className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                {line.product.imageUrl ? (
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-16 sm:w-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={line.product.imageUrl}
                      alt={line.product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br sm:h-16 sm:w-16",
                      line.product.iconBg,
                    )}
                  >
                    <Sparkles className="h-6 w-6 text-white drop-shadow sm:h-7 sm:w-7" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${line.product.slug}`}
                    className="line-clamp-1 text-sm font-semibold hover:text-primary"
                  >
                    {line.product.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {line.product.duration} · {formatCurrency(line.unit)} each
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <form action={actionUpdateCart.bind(null, line.product.id, line.quantity - 1)}>
                      <button
                        type="submit"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-base hover:bg-accent active:scale-95 sm:h-7 sm:w-7 sm:text-sm"
                        aria-label="Decrease"
                      >
                        −
                      </button>
                    </form>
                    <span className="w-7 text-center text-sm font-medium">
                      {line.quantity}
                    </span>
                    <form action={actionUpdateCart.bind(null, line.product.id, line.quantity + 1)}>
                      <button
                        type="submit"
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-base hover:bg-accent active:scale-95 sm:h-7 sm:w-7 sm:text-sm"
                        aria-label="Increase"
                      >
                        +
                      </button>
                    </form>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-base font-bold">
                    {formatCurrency(line.total)}
                  </span>
                  <form action={actionRemoveFromCart.bind(null, line.product.id)}>
                    <button
                      type="submit"
                      className="text-muted-foreground hover:text-rose-500"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={actionCheckout} className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(view.subtotal)}</span>
                </div>
                {view.discount > 0 ? (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount ({view.couponCode})</span>
                    <span>-{formatCurrency(view.discount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(view.total)}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <Label htmlFor="couponCode" className="text-xs">
                  Coupon code (try WELCOME10)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="couponCode"
                    name="couponCode"
                    placeholder="e.g. WELCOME10"
                    defaultValue={searchParams?.coupon || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-xs">
                  Reseller referral code (optional)
                </Label>
                <Input
                  id="referralCode"
                  name="referralCode"
                  placeholder="e.g. TOPDEAL"
                  defaultValue={searchParams?.ref || ""}
                />
              </div>

              {user ? (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
                  <div className="flex items-center justify-between font-medium text-emerald-700 dark:text-emerald-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5" />
                      Wallet balance
                    </span>
                    <span>{formatCurrency(user.walletBalance)}</span>
                  </div>
                  {insufficient ? (
                    <p className="mt-1 text-amber-700 dark:text-amber-300">
                      You need {formatCurrency(needed)} more.
                    </p>
                  ) : (
                    <p className="mt-1 text-emerald-700/80 dark:text-emerald-300/80">
                      After purchase: {formatCurrency(user.walletBalance - view.total)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
                  <Link href="/login?next=/cart" className="font-semibold underline">
                    Sign in
                  </Link>{" "}
                  to checkout with your wallet.
                </div>
              )}

              {user ? (
                insufficient ? (
                  <Link
                    href={`/dashboard/deposit?need=${Math.ceil(needed)}&from=cart`}
                    className={cn(
                      buttonVariants({ variant: "gradient", size: "lg" }),
                      "w-full",
                    )}
                  >
                    <Wallet className="h-4 w-4" />
                    Top up {formatCurrency(needed)}
                  </Link>
                ) : (
                  <SubmitButton variant="gradient" size="lg" className="w-full">
                    <Wallet className="h-4 w-4" />
                    Pay {formatCurrency(view.total)} from wallet
                  </SubmitButton>
                )
              ) : (
                <Link
                  href="/login?next=/cart"
                  className={cn(
                    buttonVariants({ variant: "gradient", size: "lg" }),
                    "w-full",
                  )}
                >
                  Sign in to checkout
                </Link>
              )}

              <p className="text-center text-[11px] text-muted-foreground">
                Items delivered instantly to your dashboard after payment.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {view.isReseller ? (
        <Badge variant="wholesale" className="mt-6">
          <Sparkles className="h-3 w-3" />
          Wholesale pricing applied
        </Badge>
      ) : null}
    </div>
  );
}
