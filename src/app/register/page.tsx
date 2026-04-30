import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { actionRegister } from "@/app/actions";
import { Input, Label } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, CheckCircle2 } from "lucide-react";

export const metadata = { title: "Create account" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <div className="grid w-full max-w-5xl gap-10 md:grid-cols-2">
        <div className="hidden flex-col justify-between rounded-3xl border border-border bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-600 p-10 text-white md:flex">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="font-bold">Digital Bazaar</p>
            </div>
            <h1 className="mt-12 text-3xl font-bold leading-tight">
              Join 12,000+ creators getting <br />
              wholesale digital products.
            </h1>
            <ul className="mt-6 space-y-2 text-sm text-white/85">
              {[
                "Wallet-based instant checkout",
                "BDT deposits via bKash / Nagad / Rocket / Bank / Crypto",
                "Apply for reseller tier — 25-45% off retail",
                "Full warranty on every product",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Card className="self-center">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Free forever. Start with a top-up to make your first purchase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={actionRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" required autoComplete="name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 6 characters.
                </p>
              </div>
              <SubmitButton variant="gradient" size="lg" className="w-full">
                Create account
              </SubmitButton>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
