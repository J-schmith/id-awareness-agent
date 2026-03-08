"use client";

import { Search, Plus } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 h-15 bg-white/80 backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-7">
      {/* Left: Page title */}
      <div className="flex flex-col justify-center">
        <h1 className="text-lg font-semibold text-gray-900 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[13px] text-gray-400 leading-tight">{subtitle}</p>
        )}
      </div>

      {/* Center-Right: Search + Action */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.8} />
          <input
            type="text"
            placeholder="Search..."
            className="w-56 h-9 pl-9 pr-4 rounded-lg bg-gray-100 text-[13px] text-gray-700 placeholder-gray-400 border border-transparent focus:border-[#0071e3]/30 focus:bg-white focus:ring-2 focus:ring-[#0071e3]/10 outline-none transition-all"
          />
        </div>

        {/* Run Agent button */}
        <button className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#0071e3] text-white text-[13px] font-medium hover:bg-[#0077ED] active:bg-[#006ACC] transition-colors shadow-sm">
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Run Agent</span>
        </button>
      </div>
    </header>
  );
}
