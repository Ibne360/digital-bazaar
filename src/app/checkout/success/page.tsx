import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Wallet, ArrowRight, Copy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrderById } from "@/lib/supabase/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Order placed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams?: { order?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = searchParams?.order;
  if (!id) redirect("/dashboard");
  const order = await getOrderById(id);
  if (!order || order.userId !== user.id) redirect("/dashboard");

  return (
    <div className="container max-w-3xl py-12">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Order delivered!
          </h1>
          <p className="mt-2 text-white/90">
            Your wallet was charged {formatCurrency(order.total)} —
            digital items have been added to your dashboard.
          </p>
        </div>

        <CardContent className="space-y-6 p-8">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Order #
              </p>
              <p className="mt-1 font-mono">{order.id.slice(-10)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Date
              </p>
              <p className="mt-1">{formatDateTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <Badge variant="success" className="mt-1">
                {order.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Total
              </p>
              <p className="mt-1 font-bold">{formatCurrency(order.total)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                <Wallet className="h-4 w-4" />
                Wallet
              </span>
              <span className="text-emerald-700 dark:text-emerald-300">
                {formatCurrency(order.walletBalanceBefore)} →{" "}
                <span className="font-bold">
                  {formatCurrency(order.walletBalanceAfter)}
                </span>
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Delivered items
            </p>
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="rounded-xl border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{item.productName}</p>
                  <span className="text-sm font-medium">
                    × {item.quantity} · {formatCurrency(item.total)}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {item.deliveredItems.map((d) => (
                    <div
                      key={d.itemId}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3"
                    >
                      <code className="flex-1 break-all font-mono text-xs">
                        {d.payload}
                      </code>
                      <CopyButton text={d.payload} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/dashboard/orders"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              View all orders
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className={cn(buttonVariants({ variant: "gradient", size: "lg" }))}
            >
              Continue shopping
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
