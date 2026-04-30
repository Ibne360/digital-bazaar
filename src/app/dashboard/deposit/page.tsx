import Link from "next/link";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Info,
  ArrowRight,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDepositsForUser } from "@/lib/supabase/queries";
import { actionRequestDeposit } from "@/app/actions";
import {
  DEPOSIT_METHODS,
  MIN_DEPOSIT,
  MIN_DEPOSIT_BDT,
  BDT_PER_USD,
  depositMethodMeta,
} from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { DepositAmountInput } from "@/components/deposit-amount-input";
import { cn, formatCurrency, timeAgo } from "@/lib/utils";

export const metadata = { title: "Wallet & deposit" };

export default async function DepositPage({
  searchParams,
}: {
  searchParams?: { ok?: string; need?: string; from?: string; method?: string };
}) {
  const user = await requireUser();
  const myDeposits = await getDepositsForUser(user.id, 20);

  // `need` is in USD (wallet base). Suggest a deposit amount that covers it,
  // converted into the chosen pay-currency for nice UX.
  const needUsd = Number(searchParams?.need || 0);
  const submitted = searchParams?.ok === "1";
  const selectedMethod = searchParams?.method || "bkash";
  const selectedMeta = depositMethodMeta(selectedMethod) ?? DEPOSIT_METHODS[0];

  let suggestedAmount: number;
  if (selectedMeta.payCurrency === "BDT") {
    // round up to nearest 100 BDT
    const minBdt = needUsd > 0 ? Math.ceil(needUsd) * BDT_PER_USD : 1000;
    suggestedAmount = Math.max(MIN_DEPOSIT_BDT, Math.ceil(minBdt / 100) * 100);
  } else {
    suggestedAmount = needUsd > 0 ? Math.max(MIN_DEPOSIT, Math.ceil(needUsd)) : 10;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Wallet & Deposit</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Top up your wallet, then buy any product instantly.
        </p>
      </div>

      <Card className="overflow-hidden border-0">
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-4 text-white sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/80 sm:text-xs">
            Available balance
          </p>
          <div className="mt-1.5 flex items-end justify-between sm:mt-2">
            <p className="text-3xl font-bold tracking-tight sm:text-4xl">
              {formatCurrency(user.walletBalance)}
            </p>
            <Wallet className="h-7 w-7 opacity-70 sm:h-8 sm:w-8" />
          </div>
        </div>
      </Card>

      {submitted ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
          <p className="font-semibold text-emerald-700 dark:text-emerald-300">
            Deposit request submitted ✅
          </p>
          <p className="mt-1 text-emerald-700/80 dark:text-emerald-300/80">
            Our team will review and approve your deposit. Wallet balance will
            update automatically — usually within 5-30 minutes.
          </p>
        </div>
      ) : null}

      {needUsd > 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <p className="font-semibold text-amber-700 dark:text-amber-300">
            You need {formatCurrency(needUsd)} more to complete checkout.
          </p>
          <p className="mt-1 text-amber-700/80 dark:text-amber-300/80">
            We&apos;ve pre-filled the amount below — submit a deposit and your
            cart will stay saved.
          </p>
        </div>
      ) : null}

      {/* Method selector tabs */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Choose payment method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-6">
            {DEPOSIT_METHODS.map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/deposit?method=${m.id}${needUsd ? `&need=${needUsd}` : ""}`}
                scroll={false}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center text-xs font-semibold transition-all",
                  selectedMethod === m.id
                    ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                    : "border-border bg-card hover:bg-accent",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white sm:h-9 sm:w-9",
                    m.color,
                  )}
                >
                  {m.label[0]}
                </div>
                <span className="text-[11px] sm:text-xs">{m.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Deposit form */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Submit deposit request</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={actionRequestDeposit} className="space-y-4">
              <input type="hidden" name="method" value={selectedMethod} />

              {(() => {
                const meta = depositMethodMeta(selectedMethod) ?? DEPOSIT_METHODS[0];
                return (
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Send to ({meta.label} · {meta.type})
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <code className="break-all font-mono text-sm">
                        {meta.account}
                      </code>
                      <CopyButton text={meta.account} />
                    </div>
                    <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" />
                      {meta.instructions}
                    </p>
                  </div>
                );
              })()}

              <DepositAmountInput
                payCurrency={selectedMeta.payCurrency}
                rate={BDT_PER_USD}
                minBdt={MIN_DEPOSIT_BDT}
                minUsd={MIN_DEPOSIT}
                defaultValue={suggestedAmount}
              />

              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID / TrxID</Label>
                <Input
                  id="transactionId"
                  name="transactionId"
                  required
                  placeholder="e.g. 8H7K2L9PQ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senderInfo">Sender info (optional)</Label>
                <Input
                  id="senderInfo"
                  name="senderInfo"
                  placeholder="Sender phone or account"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenshotUrl">
                  Screenshot URL (optional)
                </Label>
                <Input
                  id="screenshotUrl"
                  name="screenshotUrl"
                  type="url"
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Upload to imgur / drive and paste the link.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note for admin (optional)</Label>
                <Textarea
                  id="note"
                  name="note"
                  rows={2}
                  placeholder="Anything we should know..."
                />
              </div>

              <SubmitButton variant="gradient" size="lg" className="w-full">
                Submit deposit request
                <ArrowRight className="h-4 w-4" />
              </SubmitButton>

              <p className="text-center text-[11px] text-muted-foreground">
                We typically approve deposits within 5-30 minutes during the
                day.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Deposit history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myDeposits.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
                No deposits yet.
              </p>
            ) : (
              myDeposits.map((d) => {
                const meta = depositMethodMeta(d.method);
                return (
                  <div
                    key={d.id}
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
                            TrxID {d.transactionId} · {timeAgo(d.createdAt)}
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
                    {d.adminNote ? (
                      <p className="mt-2 rounded-md bg-muted/40 p-2 text-[11px] text-muted-foreground">
                        Admin: {d.adminNote}
                      </p>
                    ) : null}
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
