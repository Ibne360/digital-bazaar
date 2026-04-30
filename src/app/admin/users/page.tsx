import Link from "next/link";
import {
  Wallet,
  Shield,
} from "lucide-react";
import {
  getAllProfiles,
  getAllOrders,
} from "@/lib/supabase/queries";
import {
  actionAdminAdjustBalance,
} from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { cn, formatCurrency, timeAgo } from "@/lib/utils";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const [allUsers, orders] = await Promise.all([
    getAllProfiles(),
    getAllOrders(),
  ]);

  const users = allUsers;
  const counts = {
    all: allUsers.length,
    users: allUsers.filter((u) => u.role === "user").length,
    admins: allUsers.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          {counts.all} total · {counts.admins} admin{counts.admins === 1 ? "" : "s"} · {counts.users} customer{counts.users === 1 ? "" : "s"}
        </p>
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
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {u.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {timeAgo(u.createdAt)}
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
                    </div>
                  </div>

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
