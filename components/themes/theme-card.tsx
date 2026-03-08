'use client'

import { useState } from 'react'
import { toggleTheme } from '@/actions/themes'
import { Check, X, Search, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ThemeCardProps {
  theme: {
    id: string
    label: string
    description: string | null
    color: string
    active: boolean
    _count: { awarenessDays: number }
  }
}

export function ThemeCard({ theme }: ThemeCardProps) {
  const [toggling, setToggling] = useState(false)
  const [discovering, setDiscovering] = useState(false)

  async function handleToggle() {
    setToggling(true)
    const result = await toggleTheme(theme.id)
    if (!result.success) {
      toast.error(result.error || 'Failed to toggle theme')
    }
    setToggling(false)
  }

  async function handleDiscover() {
    setDiscovering(true)
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'research',
          themeIds: [theme.id],
        }),
      })
      const data = await res.json()
      if (data.success || res.ok) {
        toast.success(`Research started for ${theme.label}`)
      } else {
        toast.error(data.error || 'Failed to start research')
      }
    } catch {
      toast.error('Failed to start research')
    }
    setDiscovering(false)
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-5 group hover:shadow-md transition-shadow">
      {/* Color dot + label */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: theme.color }}
          />
          <h3 className="text-[15px] font-semibold text-gray-900">
            {theme.label}
          </h3>
        </div>

        {/* Active/Inactive toggle */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
            theme.active
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          {toggling ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : theme.active ? (
            <>
              <Check className="w-3 h-3" /> Active
            </>
          ) : (
            <>
              <X className="w-3 h-3" /> Inactive
            </>
          )}
        </button>
      </div>

      {/* Description */}
      {theme.description && (
        <p className="text-[13px] text-gray-500 leading-relaxed mb-3 line-clamp-2">
          {theme.description}
        </p>
      )}

      {/* Stats + Discover button */}
      <div className="flex items-center justify-between pt-3 border-t border-black/[0.05]">
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-400">
            {theme._count.awarenessDays} awareness day
            {theme._count.awarenessDays !== 1 ? 's' : ''}
          </span>
          <span className="text-[12px] text-gray-300">&middot;</span>
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-gray-400">Color:</span>
            <span className="text-[12px] font-mono text-gray-500">
              {theme.color}
            </span>
          </div>
        </div>

        <button
          onClick={handleDiscover}
          disabled={discovering}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-[#0071e3] bg-[#0071e3]/[0.06] hover:bg-[#0071e3]/[0.12] transition-colors disabled:opacity-50"
        >
          {discovering ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Search className="w-3 h-3" />
          )}
          {discovering ? 'Discovering...' : 'Discover Days'}
        </button>
      </div>
    </div>
  )
}
