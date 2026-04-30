import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { actionLogin } from "@/app/actions";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ShieldCheck, Zap, Wallet } from "lucide-react";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string; error?: string };
}) {
  if (await getCurrentUser()) redirect(searchParams?.next || "/dashboard");

  return (
    <div className="container flex items-center justify-center py-6 sm:py-10 md:min-h-[calc(100vh-180px)] md:py-12">
      <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2 md:gap-10">
        <div className="hidden flex-col justify-between rounded-3xl border border-border bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white md:flex">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="font-bold">Digital Bazaar</p>
            </div>
            <h1 className="mt-12 text-3xl font-bold leading-tight">
              Welcome back. <br />
              Your <span className="opacity-80">wallet</span> is ready.
            </h1>
            <p className="mt-4 text-white/80">
              Top up via bKash, Nagad, Rocket, Bank, Binance or USDT — buy any
              digital product instantly with your wallet balance.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-white/85">
            {[
              { Icon: Wallet, text: "Wallet-based instant checkout" },
              { Icon: Zap, text: "Sub-60 second digital delivery" },
              { Icon: ShieldCheck, text: "Full warranty on every product" },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <Card className="self-center">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your email and password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={actionLogin} className="space-y-4">
              <input type="hidden" name="next" value={searchParams?.next || ""} />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <SubmitButton variant="gradient" size="lg" className="w-full">
                Sign in
              </SubmitButton>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium text-primary hover:underline">
                  Create one
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
