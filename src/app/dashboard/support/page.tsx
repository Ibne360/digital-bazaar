import { HelpCircle, MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getOrdersForUser,
  getTicketsForUser,
} from "@/lib/supabase/queries";
import { actionCreateTicket } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/misc";
import { timeAgo } from "@/lib/utils";

export const metadata = { title: "Support" };

export default async function SupportPage() {
  const user = await requireUser();
  const [tickets, myOrders] = await Promise.all([
    getTicketsForUser(user.id),
    getOrdersForUser(user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">
          Open a ticket for warranty replacements, delivery issues or general
          questions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Open a new ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={actionCreateTicket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Related order (optional)</Label>
                <Select id="orderId" name="orderId">
                  <option value="">— None —</option>
                  {myOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id.slice(-8)} · {o.items[0]?.productName}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  placeholder="e.g. Warranty replacement for ChatGPT Plus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="Describe your issue in detail..."
                />
              </div>
              <SubmitButton variant="gradient" className="w-full">
                Submit ticket
              </SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.length === 0 ? (
              <EmptyState
                icon={<HelpCircle className="h-5 w-5" />}
                title="No tickets yet"
                description="Open one if you need help — we usually respond within 4 hours."
              />
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{t.subject}</p>
                    <Badge
                      variant={
                        t.status === "answered"
                          ? "success"
                          : t.status === "open"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {t.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {timeAgo(t.createdAt)}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm text-foreground/80">
                    {t.message}
                  </p>
                  {t.reply ? (
                    <div className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <p className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <MessageCircle className="h-3 w-3" />
                        Support reply
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm text-foreground/90">
                        {t.reply}
                      </p>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
