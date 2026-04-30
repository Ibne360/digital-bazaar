import { requireUser } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <DashboardSidebar
          user={{ role: user.role, resellerStatus: user.resellerStatus }}
          variant="user"
        />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
