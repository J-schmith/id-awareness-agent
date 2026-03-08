import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingDrafts, discoveredDays] = await Promise.all([
    prisma.messageDraft.count({ where: { status: "pending" } }),
    prisma.awarenessDay.count({ where: { status: "discovered" } }),
  ]);

  const badges: Record<string, number> = {};
  if (pendingDrafts > 0) badges.approvals = pendingDrafts;
  if (discoveredDays > 0) badges.awarenessDays = discoveredDays;

  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar */}
      <Sidebar badges={badges} />

      {/* Main area offset by sidebar width */}
      <div className="flex-1 ml-60 flex flex-col">
        {/* Sticky topbar */}
        <Topbar title="Dashboard" subtitle="Overview of your I&D programme" />

        {/* Content */}
        <main className="flex-1 p-7">{children}</main>
      </div>
    </div>
  );
}
