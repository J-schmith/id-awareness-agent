import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar */}
      <Sidebar />

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
