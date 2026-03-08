import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { StatusPill } from '@/components/ui/status-pill'
import { Button } from '@/components/ui/button'
import { ClipboardCheck, ChevronRight } from 'lucide-react'

const TABS = ['all', 'pending', 'reviewed'] as const

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const activeTab = (searchParams.tab ?? 'all') as (typeof TABS)[number]

  const statusFilter =
    activeTab === 'pending'
      ? { status: 'pending' }
      : activeTab === 'reviewed'
        ? { status: { in: ['approved', 'rejected', 'sent'] } }
        : {}

  const drafts = await prisma.messageDraft.findMany({
    where: statusFilter,
    include: {
      awarenessDay: {
        include: { theme: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Approval Queue</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and approve AI-generated message drafts
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ClipboardCheck className="w-4 h-4" />
          <span>{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map((tab) => (
          <Link
            key={tab}
            href={`/approvals${tab === 'all' ? '' : `?tab=${tab}`}`}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </Link>
        ))}
      </div>

      {/* Draft List */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
        {drafts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ClipboardCheck className="w-10 h-10 mb-3 text-gray-300" />
            <p className="text-sm font-medium">No drafts found</p>
            <p className="text-xs mt-1">
              {activeTab === 'pending'
                ? 'All drafts have been reviewed'
                : 'No drafts match this filter'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-black/[0.07]">
            {drafts.map((draft) => (
              <li key={draft.id}>
                <Link
                  href={`/approvals/${draft.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-black/[0.02] transition-colors group"
                >
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="text-[14px] font-semibold text-gray-900 truncate">
                        {draft.awarenessDay.name}
                      </h3>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-white"
                        style={{ backgroundColor: draft.awarenessDay.theme.color }}
                      >
                        {draft.awarenessDay.theme.label}
                      </span>
                    </div>
                    <p className="text-[13px] text-gray-500 truncate">
                      {draft.subject}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1">
                      {formatDate(draft.awarenessDay.date)} &middot; v{draft.version}
                    </p>
                  </div>

                  {/* Right: Status + Arrow */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusPill status={draft.status} />
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
