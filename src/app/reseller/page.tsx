import Link from "next/link";
import {
  Crown,
  TrendingUp,
  Wallet,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  ShieldCheck,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getReferralsForUser,
  getWithdrawsForUser,
} from "@/lib/supabase/queries";
import { actionApplyReseller } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stat } from "@/components/ui/misc";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/copy-button";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatCurrency, timeAgo } from "@/lib/utils";

export const metadata = { title: "Reseller hub" };

export default async function ResellerHubPage() {
  const user = await requireUser();

  // Apply state machine
  if (user.role !== "reseller") {
    if (user.resellerStatus === "pending") {
      return (
        <ApplicationStatus
          title="Under review"
          variant="pending"
          desc="Our team is reviewing your reseller application. Approval typically takes 6-24 hours."
        />
      );
    }
    if (user.resellerStatus === "rejected") {
      return (
        <ApplicationStatus
          title="Application rejected"
          variant="rejected"
          desc="Sorry — your reseller application was not approved at this time. Reach out to support to learn more."
        />
      );
    }
    return <Apply />;
  }

  // Approved reseller view
  const referralUrl = `https://digital-bazaar.app/r/${user.referralCode}`;
  const [myReferrals, myWithdraws] = await Promise.all([
    getReferralsForUser(user.id),
    getWithdrawsForUser(user.id, 5),
  ]);
  const monthlyEarn = myReferrals
    .filter((r) => Date.now() - new Date(r.createdAt).getTime() < 30 * 86400_000)
    .reduce((s, r) => s + r.commission, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Badge variant="wholesale">
          <Crown className="h-3 w-3" />
          Approved Reseller
        </Badge>
        <span className="text-xs text-muted-foreground">
          Wholesale pricing active
        </span>
      </div>

      <Card className="overflow-hidden border-0">
        <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Reseller wallet
          </p>
          <p className="mt-2 text-5xl font-bold tracking-tight">
            {formatCurrency(user.walletBalance)}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/reseller/withdraw"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-fuchsia-700 transition-all hover:scale-[1.02]"
            >
              <Wallet className="h-4 w-4" />
              Withdraw
            </Link>
            <Link
              href="/reseller/catalog"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/20"
            >
              Wholesale catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="Total earned"
          value={formatCurrency(user.totalEarned)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <Stat
          label="Last 30 days"
          value={formatCurrency(monthlyEarn)}
          delta={monthlyEarn > 0 ? "+10% commission" : undefined}
          icon={<Sparkles className="h-4 w-4" />}
        />
        <Stat
          label="Referred sales"
          value={myReferrals.length}
          icon={<Crown className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your referral link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Share this link — you earn 10% commission on every sale. Customers
            can also enter your referral code at checkout.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
            <code className="flex-1 break-all font-mono text-sm">
              {referralUrl}
            </code>
            <CopyButton text={referralUrl} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Code:
            </span>
            <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-xs font-bold text-primary">
              {user.referralCode}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent referrals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myReferrals.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Share your link to start earning commission.
              </p>
            ) : (
              myReferrals.slice(0, 6).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">Order ·{r.orderId.slice(-8)}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(r.createdAt)} · sale {formatCurrency(r.amount)}
                    </p>
                  </div>
                  <span className="font-bold text-emerald-500">
                    +{formatCurrency(r.commission)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent withdrawals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myWithdraws.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No withdrawals yet.
              </p>
            ) : (
              myWithdraws.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium uppercase">{w.method}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(w.createdAt)} · {w.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(w.amount)}</p>
                    <Badge
                      variant={
                        w.status === "approved"
                          ? "success"
                          : w.status === "pending"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {w.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ApplicationStatus({
  title,
  desc,
  variant,
}: {
  title: string;
  desc: string;
  variant: "pending" | "rejected";
}) {
  const Icon = variant === "pending" ? Clock : XCircle;
  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-2xl border p-8 text-center",
          variant === "pending"
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-rose-500/30 bg-rose-500/5",
        )}
      >
        <div
          className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-full",
            variant === "pending"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-300"
              : "bg-rose-500/15 text-rose-600 dark:text-rose-300",
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold">{title}</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          {desc}
        </p>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "mt-5",
          )}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function Apply() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <Card className="overflow-hidden border-0">
        <div className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white sm:p-8">
          <div className="absolute inset-0 bg-grid-pattern bg-[length:24px_24px] opacity-20" />
          <div className="relative">
            <Badge
              variant="outline"
              className="border-white/30 bg-white/10 text-white backdrop-blur"
            >
              <Crown className="h-3 w-3" />
              Reseller program
            </Badge>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Become a Digital Bazaar reseller
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
              Get wholesale prices (25-45% off retail), generate referral links,
              earn 10% commission on referrals, and withdraw to bKash / bank /
              USDT. Free to apply, no monthly fees.
            </p>

            <ul className="mt-5 grid gap-2 text-sm text-white/90 sm:mt-6 sm:grid-cols-2">
              {[
                "Wholesale price on every product",
                "10% commission on every referral sale",
                "Referral link & custom code",
                "Same-day withdraw approval",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {t}
                </li>
              ))}
            </ul>

            <form action={actionApplyReseller} className="mt-5 sm:mt-6">
              <SubmitButton
                variant="default"
                size="lg"
                className="w-full bg-white text-violet-700 hover:bg-white/90 sm:w-auto"
              >
                <ShieldCheck className="h-4 w-4" />
                Apply for reseller status
              </SubmitButton>
            </form>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        {[
          { Icon: Crown, title: "Wholesale catalog", text: "Buy at 25-45% below retail and resell on your own platform." },
          { Icon: TrendingUp, title: "Earnings tracking", text: "Live wallet, conversion rates and best-seller analytics." },
          { Icon: ShieldCheck, title: "Brand protection", text: "Replacement guarantee covers all your end-customers too." },
        ].map(({ Icon, title, text }) => (
          <Card key={title}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="mt-2.5 text-sm font-semibold sm:mt-3 sm:text-base">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
