import { redirect } from "next/navigation";
import { Wallet, CheckCircle2, Clock, XCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getWithdrawsForUser } from "@/lib/supabase/queries";
import { actionRequestWithdraw } from "@/app/actions";
import {
  DEPOSIT_METHODS,
  MIN_WITHDRAW,
  BDT_PER_USD,
  depositMethodMeta,
} from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { WithdrawFormFields } from "@/components/withdraw-form-fields";
import { cn, formatCurrency, timeAgo } from "@/lib/utils";

export const metadata = { title: "Withdraw" };

export default async function WithdrawPage() {
  const user = await requireUser();
  if (user.role !== "reseller" || user.resellerStatus !== "approved") {
    redirect("/reseller");
  }
  const myWithdraws = await getWithdrawsForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Withdraw earnings</h1>
        <p className="text-muted-foreground">
          Cash out to bKash, Bank, USDT or any supported method.
        </p>
      </div>

      <Card className="overflow-hidden border-0">
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Available to withdraw
          </p>
          <p className="mt-2 text-4xl font-bold tracking-tight">
            {formatCurrency(user.walletBalance)}
          </p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request withdrawal</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={actionRequestWithdraw} className="space-y-4">
              <WithdrawFormFields
                walletBalance={user.walletBalance}
                minUsd={MIN_WITHDRAW}
                rate={BDT_PER_USD}
                methods={DEPOSIT_METHODS}
              />

              <div className="space-y-2">
                <Label htmlFor="destination">
                  Destination (account / address / phone)
                </Label>
                <Input
                  id="destination"
                  name="destination"
                  required
                  placeholder="017XX-XXXXXXX or USDT TRC-20 address"
                />
              </div>

              <SubmitButton variant="gradient" size="lg" className="w-full">
                <Wallet className="h-4 w-4" />
                Request withdrawal
              </SubmitButton>
              <p className="text-center text-[11px] text-muted-foreground">
                Withdrawals are usually processed within 6-24 hours.
              </p>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myWithdraws.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No withdrawals yet.
              </p>
            ) : (
              myWithdraws.map((w) => {
                const meta = depositMethodMeta(w.method);
                return (
                  <div
                    key={w.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br text-white text-xs font-bold",
                            meta?.color || "from-slate-500 to-slate-700",
                          )}
                        >
                          {meta?.label[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{meta?.label}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {w.destination} · {timeAgo(w.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {formatCurrency(w.amount)}
                        </p>
                        <Badge
                          variant={
                            w.status === "approved"
                              ? "success"
                              : w.status === "pending"
                                ? "warning"
                                : "destructive"
                          }
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
