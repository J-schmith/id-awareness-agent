'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { bulkUpdateStatus } from '@/actions/awareness-days'
import { StatusPill } from '@/components/ui/status-pill'
import { Button } from '@/components/ui/button'
import { DayActions } from './day-actions'
import { Calendar, Check, X, Loader2, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface DayRow {
  id: string
  date: string
  name: string
  status: string
  sourceUrl: string | null
  theme: { label: string; color: string }
  draftId: string | null
  draftCount: number
}

interface AwarenessDaysTableProps {
  days: DayRow[]
  confirmedWithoutDrafts?: number
}

export function AwarenessDaysTable({ days, confirmedWithoutDrafts = 0 }: AwarenessDaysTableProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState<string | null>(null)
  const [generatingDrafts, setGeneratingDrafts] = useState(false)

  const allSelected = days.length > 0 && selected.size === days.length
  const someSelected = selected.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(days.map((d) => d.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleBulkAction(status: string) {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    setBulkLoading(status)
    const result = await bulkUpdateStatus(ids, status)
    if (result.success) {
      toast.success(`${ids.length} day${ids.length > 1 ? 's' : ''} updated to ${status}`)
      setSelected(new Set())
      router.refresh()
    } else {
      toast.error(result.error || 'Bulk update failed')
    }
    setBulkLoading(null)
  }

  async function handleGenerateAllDrafts() {
    setGeneratingDrafts(true)
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'draft' }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Draft generation started for all confirmed days')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to generate drafts')
      }
    } catch {
      toast.error('Failed to generate drafts')
    }
    setGeneratingDrafts(false)
  }

  if (days.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Calendar className="w-10 h-10 mb-3 text-gray-300" />
          <p className="text-sm font-medium">No awareness days found</p>
          <p className="text-xs mt-1">Try adjusting your filters or add a new day</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-[#0071e3]/[0.04] border border-[#0071e3]/20 rounded-xl mb-3">
          <span className="text-[13px] font-medium text-[#0071e3]">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBulkAction('confirmed')}
              disabled={bulkLoading !== null}
            >
              {bulkLoading === 'confirmed' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Confirm Selected
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkAction('skipped')}
              disabled={bulkLoading !== null}
            >
              {bulkLoading === 'skipped' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              Skip Selected
            </Button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-[12px] text-gray-500 hover:text-gray-700 px-2"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Generate all drafts bar */}
      {confirmedWithoutDrafts > 0 && !someSelected && (
        <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl mb-3">
          <span className="text-[13px] text-gray-600">
            <strong className="text-gray-900">{confirmedWithoutDrafts}</strong> confirmed day{confirmedWithoutDrafts !== 1 ? 's' : ''} without drafts
          </span>
          <button
            onClick={handleGenerateAllDrafts}
            disabled={generatingDrafts}
            className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gray-700 text-white text-[12px] font-medium hover:bg-gray-800 active:bg-gray-900 transition-colors disabled:opacity-50"
          >
            {generatingDrafts ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            {generatingDrafts ? 'Generating...' : 'Generate All Drafts'}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.07]">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-[#0071e3] focus:ring-[#0071e3]/30"
                />
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Theme
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Drafts
              </th>
              <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr
                key={day.id}
                className={`border-b border-black/[0.07] last:border-0 transition-colors ${
                  selected.has(day.id) ? 'bg-[#0071e3]/[0.03]' : 'hover:bg-black/[0.02]'
                }`}
              >
                <td className="w-10 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={selected.has(day.id)}
                    onChange={() => toggleOne(day.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0071e3] focus:ring-[#0071e3]/30"
                  />
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[13px] font-medium text-gray-900 tabular-nums">
                    {day.date}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[13px] font-medium text-gray-900">
                    {day.name}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-white"
                    style={{ backgroundColor: day.theme.color }}
                  >
                    {day.theme.label}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusPill status={day.status} />
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[13px] text-gray-500">
                    {day.draftCount}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <DayActions
                    dayId={day.id}
                    status={day.status}
                    sourceUrl={day.sourceUrl}
                    draftId={day.draftId}
                    hasDrafts={day.draftCount > 0}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
