import Link from "next/link";
import {
  Wallet,
  ShoppingBag,
  ArrowUpRight,
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Sparkles,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getOrdersForUser,
  getDepositsForUser,
} from "@/lib/supabase/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatCurrency, formatDateTime, timeAgo } from "@/lib/utils";
import { depositMethodMeta } from "@/lib/constants";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [orders, deposits] = await Promise.all([
    getOrdersForUser(user.id),
    getDepositsForUser(user.id),
  ]);
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const totalDeposited = deposits
    .filter((d) => d.status === "approved")
    .reduce((s, d) => s + d.amount, 0);
  const pendingDeposits = deposits.filter((d) => d.status === "pending").length;
  const recentOrders = orders.slice(0, 5);
  const recentDeposits = deposits.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      {/* Wallet hero */}
      <Card className="overflow-hidden border-0">
        <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white">
          <div className="absolute inset-0 bg-grid-pattern bg-[length:24px_24px] opacity-20" />
          <div className="relative grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Wallet balance
              </p>
              <p className="mt-2 text-5xl font-bold tracking-tight">
                {formatCurrency(user.walletBalance)}
              </p>
              <p className="mt-1 text-sm text-white/80">
                {user.role === "reseller"
                  ? "You see wholesale prices on every product."
                  : "Top up to checkout instantly with your wallet."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/dashboard/deposit"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-violet-700 transition-all hover:scale-[1.02]"
                >
                  <Plus className="h-4 w-4" />
                  Deposit funds
                </Link>
                <Link
                  href="/products"
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20"
                >
                  Shop products
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-white/70">
                  Total deposited
                </p>
                <p className="mt-1 text-lg font-bold">
                  {formatCurrency(totalDeposited)}
                </p>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-white/70">
                  Total spent
                </p>
                <p className="mt-1 text-lg font-bold">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div className="col-span-2 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur">
                <p className="text-xs uppercase tracking-wider text-white/70">
                  {user.role === "reseller"
                    ? "Reseller earnings"
                    : "Reseller program"}
                </p>
                <p className="mt-1 text-lg font-bold">
                  {user.role === "reseller"
                    ? formatCurrency(user.totalEarned)
                    : "Apply for wholesale"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Orders"
          value={orders.length}
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <Stat
          label="Pending deposits"
          value={pendingDeposits}
          icon={<Clock className="h-4 w-4" />}
        />
        <Stat
          label="Reseller status"
          value={
            user.role === "reseller"
              ? "Approved"
              : user.resellerStatus === "pending"
                ? "Pending review"
                : "Not enrolled"
          }
          icon={<Crown className="h-4 w-4" />}
        />
      </div>

      {/* Reseller CTA if not enrolled */}
      {user.role !== "reseller" && user.role !== "admin" ? (
        <Card>
          <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <Badge variant="wholesale" className="mb-2">
                <Sparkles className="h-3 w-3" />
                Unlock 25-45% off retail
              </Badge>
              <p className="font-semibold">Become a reseller</p>
              <p className="text-sm text-muted-foreground">
                Get wholesale pricing, generate referral links, earn 10% on every
                referred sale, and withdraw to bKash/Bank/USDT.
              </p>
            </div>
            <Link
              href="/reseller/apply"
              className={buttonVariants({ variant: "gradient", size: "lg" })}
            >
              Apply now
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Link
              href="/dashboard/orders"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentOrders.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
                No orders yet — your first purchase will appear here.
              </p>
            ) : (
              recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-medium">
                      {o.items.map((i) => i.productName).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(o.createdAt)} · {o.items.length} item
                      {o.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {formatCurrency(o.total)}
                    </p>
                    <Badge variant="success" className="mt-0.5">
                      {o.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent deposits</CardTitle>
            <Link
              href="/dashboard/deposit"
              className="text-xs font-medium text-primary hover:underline"
            >
              Top up
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentDeposits.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
                No deposits yet — make your first wallet top-up.
              </p>
            ) : (
              recentDeposits.map((d) => {
                const meta = depositMethodMeta(d.method);
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-white text-xs font-bold",
                          meta?.color || "from-slate-500 to-slate-700",
                        )}
                      >
                        {meta?.label[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{meta?.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(d.createdAt)} · TrxID {d.transactionId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {formatCurrency(d.amount)}
                      </p>
                      <Badge
                        variant={
                          d.status === "approved"
                            ? "success"
                            : d.status === "pending"
                              ? "warning"
                              : "destructive"
                        }
                        className="mt-0.5"
                      >
                        {d.status === "approved" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : d.status === "pending" ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {d.status}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
