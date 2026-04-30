import { ShoppingBag, Wallet, Sparkles } from "lucide-react";
import {
  getAllOrders,
  getProfilesByIds,
} from "@/lib/supabase/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  const buyerIds = Array.from(new Set(orders.map((o) => o.userId)));
  const buyers = await getProfilesByIds(buyerIds);
  const buyerById = new Map(buyers.map((b) => [b.id, b]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All orders</h1>
        <p className="text-muted-foreground">
          {orders.length} order{orders.length === 1 ? "" : "s"} · total revenue{" "}
          {formatCurrency(orders.reduce((s, o) => s + o.total, 0))}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No orders yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const buyer = buyerById.get(o.userId);
            return (
              <Card key={o.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">
                        Order · {o.id.slice(-10)}
                      </p>
                      <p className="text-sm font-semibold">
                        {buyer?.name || "Unknown user"} ·{" "}
                        <span className="font-normal text-muted-foreground">
                          {buyer?.email}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(o.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold">
                        {formatCurrency(o.total)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Wallet {formatCurrency(o.walletBalanceBefore)} →{" "}
                        {formatCurrency(o.walletBalanceAfter)}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center justify-end gap-1">
                        <Badge
                          variant={
                            o.status === "delivered"
                              ? "success"
                              : o.status === "paid"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {o.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {o.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">
                            {item.productName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            × {item.quantity}
                          </span>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {o.couponCode ? (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Coupon: {o.couponCode} · -{formatCurrency(o.discount)}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
