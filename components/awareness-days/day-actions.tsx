'use client'

import { useState } from 'react'
import Link from 'next/link'
import { confirmDay, skipDay } from '@/actions/awareness-days'
import { triggerDraftGeneration } from '@/actions/agent'
import { ExternalLink, Check, X, FileText, Loader2, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

interface DayActionsProps {
  dayId: string
  status: string
  sourceUrl: string | null
  draftId: string | null
  hasDrafts: boolean
}

export function DayActions({ dayId, status, sourceUrl, draftId, hasDrafts }: DayActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading('confirm')
    const result = await confirmDay(dayId)
    if (result.success) {
      toast.success('Day confirmed')
    } else {
      toast.error(result.error || 'Failed to confirm')
    }
    setLoading(null)
  }

  async function handleSkip() {
    setLoading('skip')
    const result = await skipDay(dayId)
    if (result.success) {
      toast.success('Day skipped')
    } else {
      toast.error(result.error || 'Failed to skip')
    }
    setLoading(null)
  }

  async function handleRestore() {
    setLoading('restore')
    const result = await confirmDay(dayId)
    if (result.success) {
      toast.success('Day restored')
    } else {
      toast.error(result.error || 'Failed to restore')
    }
    setLoading(null)
  }

  async function handleGenerateDraft() {
    setLoading('draft')
    const result = await triggerDraftGeneration(dayId)
    if (result.success) {
      toast.success('Draft generation started')
    } else {
      toast.error(result.error || 'Failed to generate draft')
    }
    setLoading(null)
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* Status actions */}
      {status === 'discovered' && (
        <>
          <button
            onClick={handleConfirm}
            disabled={loading !== null}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            {loading === 'confirm' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Confirm
          </button>
          <button
            onClick={handleSkip}
            disabled={loading !== null}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading === 'skip' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
            Skip
          </button>
        </>
      )}

      {status === 'confirmed' && !hasDrafts && (
        <button
          onClick={handleGenerateDraft}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-[#0071e3] bg-[#0071e3]/[0.06] border border-[#0071e3]/20 hover:bg-[#0071e3]/[0.12] transition-colors disabled:opacity-50"
        >
          {loading === 'draft' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
          Generate Draft
        </button>
      )}

      {status === 'skipped' && (
        <button
          onClick={handleRestore}
          disabled={loading !== null}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading === 'restore' ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
          Restore
        </button>
      )}

      {/* View Draft link */}
      {draftId && (
        <Link
          href={`/approvals/${draftId}`}
          className="text-[11px] font-medium text-[#0071e3] hover:underline px-1"
        >
          View Draft
        </Link>
      )}

      {/* Source link */}
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="View source"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  )
}
