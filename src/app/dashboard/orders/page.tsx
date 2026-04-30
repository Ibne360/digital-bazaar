import { ShoppingBag, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/supabase/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/ui/misc";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const metadata = { title: "My orders" };

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await getOrdersForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My orders</h1>
        <p className="text-muted-foreground">
          {orders.length} order{orders.length === 1 ? "" : "s"} · all delivered
          items below
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="No orders yet"
          description="Your purchases and delivered keys will appear here."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">
                      Order · {o.id.slice(-10)}
                    </p>
                    <p className="text-sm font-semibold">
                      {formatDateTime(o.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Wallet className="h-3 w-3" /> Wallet
                    </span>
                    <span className="text-base font-bold">
                      {formatCurrency(o.total)}
                    </span>
                    <Badge variant="success">{o.status}</Badge>
                  </div>
                </div>

                {o.items.map((item) => (
                  <div key={item.productId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        {item.productName}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        × {item.quantity} · {formatCurrency(item.total)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {item.deliveredItems.map((d) => (
                        <div
                          key={d.itemId}
                          className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3"
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
