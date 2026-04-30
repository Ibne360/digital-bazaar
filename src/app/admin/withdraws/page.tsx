import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Wallet } from "lucide-react";
import {
  getAllWithdraws,
  getProfilesByIds,
} from "@/lib/supabase/queries";
import {
  actionApproveWithdraw,
  actionRejectWithdraw,
} from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { depositMethodMeta } from "@/lib/constants";
import { cn, formatCurrency, formatDateTime, timeAgo } from "@/lib/utils";

export const metadata = { title: "Withdraws" };

export default async function AdminWithdrawsPage({
  searchParams,
}: {
  searchParams?: { status?: "pending" | "approved" | "rejected" };
}) {
  const status = searchParams?.status || "pending";
  const allWithdraws = await getAllWithdraws();
  const filtered = allWithdraws.filter((w) => w.status === status);
  const counts = {
    pending: allWithdraws.filter((w) => w.status === "pending").length,
    approved: allWithdraws.filter((w) => w.status === "approved").length,
    rejected: allWithdraws.filter((w) => w.status === "rejected").length,
  };

  const resellerIds = Array.from(new Set(filtered.map((w) => w.userId)));
  const resellers = await getProfilesByIds(resellerIds);
  const resellerById = new Map(resellers.map((r) => [r.id, r]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Withdrawals</h1>
        <p className="text-muted-foreground">
          Reseller withdraw requests · approve marks paid, reject refunds the
          held balance
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
          ] as const
        ).map(([id, label]) => (
          <Link
            key={id}
            href={`/admin/withdraws?status=${id}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              status === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:bg-accent",
            )}
          >
            {label} ({counts[id]})
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No {status} withdrawal requests.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => {
            const reseller = resellerById.get(w.userId);
            const meta = depositMethodMeta(w.method);
            return (
              <Card key={w.id}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white font-bold",
                          meta?.color || "from-slate-500 to-slate-700",
                        )}
                      >
                        {meta?.label[0]}
                      </div>
                      <div>
                        <p className="text-base font-semibold">
                          {reseller?.name || "Unknown reseller"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {reseller?.email} · Code{" "}
                          <code className="rounded bg-muted px-1 text-[11px]">
                            {reseller?.referralCode}
                          </code>
                        </p>
                        <p className="mt-2 text-sm">
                          <span className="text-muted-foreground">Send to:</span>{" "}
                          <span className="font-mono">{w.destination}</span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Requested {timeAgo(w.createdAt)} (
                          {formatDateTime(w.createdAt)})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(w.amount)}
                      </p>
                      <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                        via {meta?.label}
                      </p>
                      <Badge
                        variant={
                          w.status === "approved"
                            ? "success"
                            : w.status === "pending"
                              ? "warning"
                              : "destructive"
                        }
                        className="mt-1"
                      >
                        {w.status === "approved" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : w.status === "pending" ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {w.status}
                      </Badge>
                    </div>
                  </div>

                  {w.status === "pending" ? (
                    <div className="mt-4 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
                      <form action={actionApproveWithdraw.bind(null, w.id)}>
                        <SubmitButton
                          variant="default"
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Mark as paid
                        </SubmitButton>
                      </form>
                      <form action={actionRejectWithdraw.bind(null, w.id)}>
                        <SubmitButton
                          variant="outline"
                          size="sm"
                          className="w-full border-rose-500/30 text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject (refund balance)
                        </SubmitButton>
                      </form>
                    </div>
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
