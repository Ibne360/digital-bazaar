import { requireRole } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("admin");

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <DashboardSidebar
          user={{ role: user.role }}
          variant="admin"
        />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
