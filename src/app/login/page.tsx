import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { actionLogin } from "@/app/actions";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: { next?: string; error?: string };
}) {
  if (await getCurrentUser()) redirect(searchParams?.next || "/dashboard");

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <div className="grid w-full max-w-5xl gap-10 md:grid-cols-2">
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
          <div className="space-y-2 rounded-xl border border-white/20 bg-white/10 p-4 text-sm backdrop-blur">
            <p className="font-semibold">Try the demo</p>
            <p className="text-white/80">
              <span className="font-medium">Admin:</span> admin@bazaar.dev / admin123
            </p>
            <p className="text-white/80">
              <span className="font-medium">Reseller:</span> reseller@bazaar.dev / reseller123
            </p>
            <p className="text-white/80">
              <span className="font-medium">User:</span> demo@bazaar.dev / user1234
            </p>
          </div>
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
                  defaultValue="demo@bazaar.dev"
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
                  defaultValue="user1234"
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
