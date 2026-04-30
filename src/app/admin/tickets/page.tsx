import Link from "next/link";
import { HelpCircle, MessageCircle, Send } from "lucide-react";
import {
  getAllTickets,
  getProfilesByIds,
} from "@/lib/supabase/queries";
import { actionReplyTicketForm } from "@/app/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { cn, timeAgo } from "@/lib/utils";

export const metadata = { title: "Support tickets" };

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams?: { status?: "open" | "answered" | "closed" };
}) {
  const status = searchParams?.status || "open";
  const tickets = await getAllTickets();
  const filtered = tickets.filter((t) => t.status === status);
  const counts = {
    open: tickets.filter((t) => t.status === "open").length,
    answered: tickets.filter((t) => t.status === "answered").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const userIds = Array.from(new Set(filtered.map((t) => t.userId)));
  const userProfiles = await getProfilesByIds(userIds);
  const userById = new Map(userProfiles.map((u) => [u.id, u]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support tickets</h1>
        <p className="text-muted-foreground">
          {counts.open} open · {counts.answered} answered · {counts.closed}{" "}
          closed
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["open", "Open"],
            ["answered", "Answered"],
            ["closed", "Closed"],
          ] as const
        ).map(([id, label]) => (
          <Link
            key={id}
            href={`/admin/tickets?status=${id}`}
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
            No {status} tickets.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const user = userById.get(t.userId);
            return (
              <Card key={t.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold">{t.subject}</p>
                        <Badge
                          variant={
                            t.status === "open"
                              ? "warning"
                              : t.status === "answered"
                                ? "success"
                                : "secondary"
                          }
                        >
                          {t.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {user?.name || "Unknown"} · {user?.email} ·{" "}
                        {timeAgo(t.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="whitespace-pre-line rounded-lg border border-border bg-muted/30 p-3 text-sm">
                    {t.message}
                  </p>

                  {t.reply ? (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
                      <p className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <MessageCircle className="h-3 w-3" />
                        Your reply
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm">
                        {t.reply}
                      </p>
                    </div>
                  ) : null}

                  {t.status !== "closed" ? (
                    <form action={actionReplyTicketForm} className="space-y-2">
                      <input type="hidden" name="ticketId" value={t.id} />
                      <Textarea
                        name="reply"
                        rows={3}
                        required
                        placeholder={
                          t.reply
                            ? "Send a follow-up reply..."
                            : "Type your reply to the customer..."
                        }
                      />
                      <div className="flex justify-end">
                        <SubmitButton variant="gradient" size="sm">
                          <Send className="h-3.5 w-3.5" />
                          Send reply
                        </SubmitButton>
                      </div>
                    </form>
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
