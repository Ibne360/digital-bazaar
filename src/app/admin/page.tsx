import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Wallet,
  Users,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Database,
} from "lucide-react";
import {
  getAllOrders,
  getAllDeposits,
  getAllProfiles,
  getAllProducts,
  getProfilesByIds,
  getStockCountByProduct,
} from "@/lib/supabase/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatCurrency, timeAgo } from "@/lib/utils";

export const metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const [orders, deposits, users, products, stockMap] =
    await Promise.all([
      getAllOrders(),
      getAllDeposits(),
      getAllProfiles(),
      getAllProducts({ includeInactive: true }),
      getStockCountByProduct(),
    ]);
  const totalRevenue = orders
    .filter((o) => o.status === "delivered" || o.status === "paid")
    .reduce((s, o) => s + o.total, 0);
  const totalApprovedDeposits = deposits
    .filter((d) => d.status === "approved")
    .reduce((s, d) => s + d.amount, 0);
  const pendingDeposits = deposits.filter((d) => d.status === "pending");
  const lowStockProducts = products
    .filter((p) => p.active)
    .map((p) => ({ product: p, count: stockMap[p.id] ?? 0 }))
    .filter((x) => x.count < 5)
    .sort((a, b) => a.count - b.count);

  const recentOrders = orders.slice(0, 6);
  // Resolve buyer profiles for the recent orders
  const buyerIds = Array.from(new Set(recentOrders.map((o) => o.userId)));
  const buyers = await getProfilesByIds(buyerIds);
  const buyerById = new Map(buyers.map((b) => [b.id, b]));
  const activeProductCount = products.filter((p) => p.active).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin overview</h1>
        <p className="text-muted-foreground">
          {pendingDeposits.length} pending deposit{pendingDeposits.length === 1 ? "" : "s"}{" "}
          · {activeProductCount} live products · {users.length} users
        </p>
      </div>

      {/* Top KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-0">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Revenue (delivered)
            </p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="mt-2 text-xs text-white/80">
              From {orders.length} order
              {orders.length === 1 ? "" : "s"}
            </p>
          </div>
        </Card>
        <Card className="overflow-hidden border-0">
          <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Wallet inflow (approved)
            </p>
            <p className="mt-1 text-2xl font-bold">
              {formatCurrency(totalApprovedDeposits)}
            </p>
            <p className="mt-2 text-xs text-white/80">
              {deposits.length} deposit requests total
            </p>
          </div>
        </Card>
        <Card className="overflow-hidden border-0">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Pending deposits
            </p>
            <p className="mt-1 text-2xl font-bold">{pendingDeposits.length}</p>
            <p className="mt-2 text-xs text-white/80">
              {formatCurrency(
                pendingDeposits.reduce((s, d) => s + d.amount, 0),
              )}{" "}
              awaiting review
            </p>
          </div>
        </Card>
        <Card className="overflow-hidden border-0">
          <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Low / out of stock
            </p>
            <p className="mt-1 text-2xl font-bold">
              {lowStockProducts.length}
            </p>
            <p className="mt-2 text-xs text-white/80">
              Add inventory to keep selling
            </p>
          </div>
        </Card>
      </div>

      {/* Action queues */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ActionCard
          icon={<Wallet className="h-4 w-4" />}
          title="Deposits to approve"
          count={pendingDeposits.length}
          href="/admin/deposits"
          variant="warning"
        />
        <ActionCard
          icon={<Users className="h-4 w-4" />}
          title="Total users"
          count={users.length}
          href="/admin/users"
          variant="default"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-primary hover:underline"
            >
              All orders
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentOrders.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No orders yet.
              </p>
            ) : (
              recentOrders.map((o) => {
                const buyer = buyerById.get(o.userId);
                return (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {buyer?.name || "Unknown"}{" "}
                        <span className="text-muted-foreground">
                          · {o.items.length} item
                          {o.items.length === 1 ? "" : "s"}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(o.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {formatCurrency(o.total)}
                      </p>
                      <Badge
                        variant={
                          o.status === "delivered"
                            ? "success"
                            : o.status === "paid"
                              ? "warning"
                              : "secondary"
                        }
                        className="mt-0.5"
                      >
                        {o.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Low stock alerts</CardTitle>
            <Link
              href="/admin/products"
              className="text-xs font-medium text-primary hover:underline"
            >
              Manage products
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockProducts.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Inventory looks healthy across all products. ✅
              </p>
            ) : (
              lowStockProducts.slice(0, 6).map(({ product, count }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Retail {formatCurrency(product.retailPrice)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      count === 0
                        ? "destructive"
                        : count < 3
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {count === 0 ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <Package className="h-3 w-3" />
                    )}
                    {count} left
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-5">
          <span className="text-sm font-semibold">Quick actions:</span>
          {[
            { href: "/admin/products/new", label: "+ Add product" },
            { href: "/admin/products", label: "Manage products" },
            { href: "/admin/deposits", label: "Approve deposits" },
            { href: "/admin/users", label: "Users" },
            { href: "/admin/orders", label: "Orders" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
              )}
            >
              {l.label}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  count,
  href,
  variant,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  href: string;
  variant: "warning" | "default";
}) {
  const isWarn = variant === "warning" && count > 0;
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center justify-between rounded-2xl border p-4 transition-all hover:shadow-md",
        isWarn
          ? "border-amber-500/30 bg-amber-500/10"
          : count > 0
            ? "border-primary/30 bg-primary/5"
            : "border-border bg-card",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            isWarn
              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
              : count > 0
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-2xl font-bold leading-tight">{count}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
