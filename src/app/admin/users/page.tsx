import Link from "next/link";
import {
  Crown,
  Users,
  Wallet,
  CheckCircle2,
  XCircle,
  Shield,
  TrendingUp,
} from "lucide-react";
import {
  getAllProfiles,
  getAllOrders,
} from "@/lib/supabase/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  actionApproveReseller,
  actionRejectReseller,
  actionAdminAdjustBalance,
} from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { cn, formatCurrency, timeAgo } from "@/lib/utils";

export const metadata = { title: "Users" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: { filter?: "all" | "users" | "resellers" | "pending" };
}) {
  const filter = searchParams?.filter || "all";
  const [allUsers, orders] = await Promise.all([
    getAllProfiles(),
    getAllOrders(),
  ]);

  // Pull referrals once via admin client (no per-user query).
  const adminClient = createSupabaseAdminClient();
  const { data: referralRows } = await adminClient
    .from("referrals")
    .select("referrer_id");
  const referralCountByUser: Record<string, number> = {};
  for (const row of (referralRows ?? []) as { referrer_id: string }[]) {
    referralCountByUser[row.referrer_id] =
      (referralCountByUser[row.referrer_id] ?? 0) + 1;
  }

  let users = allUsers;
  if (filter === "users") users = users.filter((u) => u.role === "user");
  else if (filter === "resellers")
    users = users.filter((u) => u.role === "reseller");
  else if (filter === "pending")
    users = users.filter((u) => u.resellerStatus === "pending");

  const counts = {
    all: allUsers.length,
    users: allUsers.filter((u) => u.role === "user").length,
    resellers: allUsers.filter((u) => u.role === "reseller").length,
    pending: allUsers.filter((u) => u.resellerStatus === "pending").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users & resellers</h1>
        <p className="text-muted-foreground">
          {counts.all} users · {counts.resellers} resellers · {counts.pending}{" "}
          pending applications
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All", counts.all],
            ["users", "Users", counts.users],
            ["resellers", "Resellers", counts.resellers],
            ["pending", "Pending applications", counts.pending],
          ] as const
        ).map(([id, label, n]) => (
          <Link
            key={id}
            href={`/admin/users?filter=${id}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              filter === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent",
            )}
          >
            {label} ({n})
          </Link>
        ))}
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No users match this filter.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((u) => {
            const userOrders = orders.filter((o) => o.userId === u.id);
            const referralCount = referralCountByUser[u.id] ?? 0;
            const totalSpent = userOrders.reduce((s, o) => s + o.total, 0);
            return (
              <Card key={u.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white font-bold",
                          u.role === "admin"
                            ? "from-rose-500 to-pink-600"
                            : u.role === "reseller"
                              ? "from-violet-500 to-fuchsia-600"
                              : "from-blue-500 to-indigo-600",
                        )}
                      >
                        {u.name
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{u.name}</p>
                          {u.role === "admin" ? (
                            <Badge variant="destructive">
                              <Shield className="h-3 w-3" />
                              Admin
                            </Badge>
                          ) : u.role === "reseller" ? (
                            <Badge variant="wholesale">
                              <Crown className="h-3 w-3" />
                              Reseller
                            </Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                          {u.resellerStatus === "pending" ? (
                            <Badge variant="warning">
                              Pending application
                            </Badge>
                          ) : null}
                          {u.resellerStatus === "rejected" ? (
                            <Badge variant="outline">Rejected</Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {u.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {timeAgo(u.createdAt)}
                          {u.referralCode ? (
                            <>
                              {" "}
                              · code{" "}
                              <code className="rounded bg-muted px-1">
                                {u.referralCode}
                              </code>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1 text-lg font-bold">
                        <Wallet className="h-4 w-4 text-emerald-500" />
                        {formatCurrency(u.walletBalance)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Spent {formatCurrency(totalSpent)} ·{" "}
                        {userOrders.length} order
                        {userOrders.length === 1 ? "" : "s"}
                      </p>
                      {u.role === "reseller" ? (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          <TrendingUp className="inline h-3 w-3" /> earned{" "}
                          {formatCurrency(u.totalEarned)} ({referralCount} ref)
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Reseller actions */}
                  {u.resellerStatus === "pending" ? (
                    <div className="grid gap-2 border-t border-border pt-3 sm:grid-cols-2">
                      <form
                        action={actionApproveReseller.bind(null, u.id)}
                      >
                        <SubmitButton
                          variant="default"
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve as reseller
                        </SubmitButton>
                      </form>
                      <form action={actionRejectReseller.bind(null, u.id)}>
                        <SubmitButton
                          variant="outline"
                          size="sm"
                          className="w-full border-rose-500/30 text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject application
                        </SubmitButton>
                      </form>
                    </div>
                  ) : null}

                  {/* Wallet adjust */}
                  {u.role !== "admin" ? (
                    <details className="border-t border-border pt-3">
                      <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                        Adjust wallet balance
                      </summary>
                      <form
                        action={async (fd: FormData) => {
                          "use server";
                          const delta = Number(fd.get("delta") || 0);
                          const reason =
                            String(fd.get("reason") || "").trim() ||
                            "Admin adjustment";
                          await actionAdminAdjustBalance(u.id, delta, reason);
                        }}
                        className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                      >
                        <div>
                          <Label htmlFor={`delta-${u.id}`} className="sr-only">
                            Amount
                          </Label>
                          <Input
                            id={`delta-${u.id}`}
                            name="delta"
                            type="number"
                            step="1"
                            placeholder="+1000 or -500"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`reason-${u.id}`} className="sr-only">
                            Reason
                          </Label>
                          <Input
                            id={`reason-${u.id}`}
                            name="reason"
                            placeholder="Reason"
                          />
                        </div>
                        <SubmitButton variant="outline" size="default">
                          Apply
                        </SubmitButton>
                      </form>
                    </details>
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
