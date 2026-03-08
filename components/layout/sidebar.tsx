"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  Tag,
  Users,
  Activity,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: string;
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Agent",
    items: [
      { name: "Approvals", href: "/approvals", icon: ClipboardCheck, badgeKey: "approvals" },
      { name: "Awareness Days", href: "/awareness-days", icon: Calendar, badgeKey: "awarenessDays" },
      { name: "Themes", href: "/themes", icon: Tag },
    ],
  },
  {
    label: "Manage",
    items: [
      { name: "Subscribers", href: "/subscribers", icon: Users },
      { name: "Audit Log", href: "/audit-log", icon: Activity },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

const badgeColors: Record<string, string> = {
  approvals: "bg-[#ff9500]",
  awarenessDays: "bg-[#af52de]",
};

interface SidebarProps {
  badges?: Record<string, number>;
}

export default function Sidebar({ badges = {} }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white/80 backdrop-blur-xl border-r border-black/5 flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0071e3] to-indigo-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-semibold tracking-tight">
              I&D
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              Awareness Agent
            </span>
            <span className="text-[11px] text-gray-400 leading-tight">
              DEI Team Portal
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-3 mb-1.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const badgeCount = item.badgeKey ? badges[item.badgeKey] : undefined;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-[#0071e3]/10 text-[#0071e3]"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? "text-[#0071e3]" : "text-gray-400"
                        }`}
                        strokeWidth={1.8}
                      />
                      <span className="flex-1">{item.name}</span>
                      {badgeCount !== undefined && badgeCount > 0 && (
                        <span className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-white text-[11px] font-semibold px-1.5 ${badgeColors[item.badgeKey!] || "bg-gray-400"}`}>
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="px-3 pb-5 pt-2 border-t border-black/5">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0071e3] to-indigo-500 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">SL</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium text-gray-900 truncate">
              Sarah Lane
            </span>
            <span className="text-[11px] text-gray-400 truncate">
              DEI Admin
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
