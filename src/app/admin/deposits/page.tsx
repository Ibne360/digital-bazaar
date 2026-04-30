import Link from "next/link";
import { CheckCircle2, XCircle, Clock, ExternalLink, Wallet } from "lucide-react";
import {
  getAllDeposits,
  getProfilesByIds,
} from "@/lib/supabase/queries";
import {
  actionApproveDepositForm,
  actionRejectDepositForm,
} from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { depositMethodMeta } from "@/lib/constants";
import { cn, formatCurrency, formatDateTime, timeAgo } from "@/lib/utils";

export const metadata = { title: "Deposits" };

export default async function AdminDepositsPage({
  searchParams,
}: {
  searchParams?: { status?: "pending" | "approved" | "rejected" };
}) {
  const status = searchParams?.status || "pending";
  const allDeposits = await getAllDeposits();
  const filtered = allDeposits.filter((d) => d.status === status);
  const counts = {
    pending: allDeposits.filter((d) => d.status === "pending").length,
    approved: allDeposits.filter((d) => d.status === "approved").length,
    rejected: allDeposits.filter((d) => d.status === "rejected").length,
  };

  const buyerIds = Array.from(new Set(filtered.map((d) => d.userId)));
  const buyers = await getProfilesByIds(buyerIds);
  const buyerById = new Map(buyers.map((b) => [b.id, b]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deposits</h1>
        <p className="text-muted-foreground">
          Review wallet top-up requests · approve credits the wallet, reject
          notifies the user
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["pending", "Pending", "warning"],
            ["approved", "Approved", "success"],
            ["rejected", "Rejected", "destructive"],
          ] as const
        ).map(([id, label, variant]) => (
          <Link
            key={id}
            href={`/admin/deposits?status=${id}`}
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
            No {status} deposit requests.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => {
            const buyer = buyerById.get(d.userId);
            const meta = depositMethodMeta(d.method);
            return (
              <Card key={d.id}>
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
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold">
                            {meta?.label}
                          </p>
                          <Badge variant="outline">{meta?.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {buyer?.name || "Unknown user"} · {buyer?.email}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Requested {timeAgo(d.createdAt)} (
                          {formatDateTime(d.createdAt)})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
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
                        className="mt-1"
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

                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <Detail label="Transaction ID" value={d.transactionId} mono />
                    {d.senderInfo ? (
                      <Detail label="Sender info" value={d.senderInfo} />
                    ) : null}
                    {d.note ? <Detail label="User note" value={d.note} /> : null}
                    {d.screenshotUrl ? (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Screenshot
                        </p>
                        <Link
                          href={d.screenshotUrl}
                          target="_blank"
                          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    ) : null}
                    {buyer ? (
                      <Detail
                        label="Current wallet"
                        value={formatCurrency(buyer.walletBalance)}
                      />
                    ) : null}
                    {d.adminNote ? (
                      <Detail label="Admin note" value={d.adminNote} />
                    ) : null}
                  </div>

                  {d.status === "pending" ? (
                    <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                      <form
                        action={actionApproveDepositForm}
                        className="space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3"
                      >
                        <input type="hidden" name="depositId" value={d.id} />
                        <Input
                          name="adminNote"
                          placeholder="Note (optional)"
                          className="text-xs"
                        />
                        <SubmitButton variant="default" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                          <Wallet className="h-3.5 w-3.5" />
                          Approve · credit {formatCurrency(d.amount)}
                        </SubmitButton>
                      </form>
                      <form
                        action={actionRejectDepositForm}
                        className="space-y-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3"
                      >
                        <input type="hidden" name="depositId" value={d.id} />
                        <Input
                          name="adminNote"
                          placeholder="Reason for rejection"
                          className="text-xs"
                        />
                        <SubmitButton
                          variant="outline"
                          size="sm"
                          className="w-full border-rose-500/30 text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
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

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-0.5", mono && "font-mono text-sm")}>{value}</p>
    </div>
  );
}
