import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { StatusPill } from '@/components/ui/status-pill'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Calendar,
  Tag,
  Users,
  FileText,
  ExternalLink,
  Clock,
  Hash,
} from 'lucide-react'

export default async function DraftDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const draft = await prisma.messageDraft.findUnique({
    where: { id: params.id },
    include: {
      awarenessDay: {
        include: { theme: true },
      },
    },
  })

  if (!draft) notFound()

  const subscriberCount = await prisma.subscriber.count({
    where: { optedOut: false },
  })

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back link */}
      <Link
        href="/approvals"
        className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Approvals
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Preview (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
            {/* Email header bar */}
            <div className="px-6 py-4 border-b border-black/[0.07] bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <StatusPill status={draft.status} />
                <span className="text-[12px] text-gray-400">
                  Draft v{draft.version}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {draft.subject}
              </h2>
              <p className="text-[13px] text-gray-500 mt-1">
                To: All active subscribers ({subscriberCount})
              </p>
            </div>

            {/* Email body */}
            <div className="px-6 py-6">
              <div
                className="prose prose-sm prose-gray max-w-none
                  prose-headings:font-semibold prose-headings:text-gray-900
                  prose-p:text-gray-600 prose-p:leading-relaxed
                  prose-li:text-gray-600
                  prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: draft.body }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar (1/3 width) */}
        <div className="space-y-5">
          {/* Metadata Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wider">
              Details
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-gray-400">Awareness Day</p>
                  <p className="text-[13px] font-medium text-gray-900">
                    {draft.awarenessDay.name}
                  </p>
                  <p className="text-[12px] text-gray-500">
                    {formatDate(draft.awarenessDay.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-gray-400">Theme</p>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-white mt-0.5"
                    style={{
                      backgroundColor: draft.awarenessDay.theme.color,
                    }}
                  >
                    {draft.awarenessDay.theme.label}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-gray-400">Recipients</p>
                  <p className="text-[13px] font-medium text-gray-900">
                    {subscriberCount} active subscriber{subscriberCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Hash className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-gray-400">Version</p>
                  <p className="text-[13px] font-medium text-gray-900">
                    v{draft.version}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-gray-400">Created</p>
                  <p className="text-[13px] font-medium text-gray-900">
                    {formatDate(draft.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Source Info Card */}
          {(draft.awarenessDay.sourceUrl || draft.awarenessDay.sourceNotes) && (
            <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-5 space-y-3">
              <h3 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wider">
                Source
              </h3>

              {draft.awarenessDay.sourceUrl && (
                <a
                  href={draft.awarenessDay.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] text-[#0071e3] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {draft.awarenessDay.sourceUrl}
                </a>
              )}

              {draft.awarenessDay.sourceNotes && (
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  {draft.awarenessDay.sourceNotes}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-5 space-y-3">
            <h3 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wider">
              Actions
            </h3>

            <div className="space-y-2">
              <Button className="w-full" variant="primary" size="md">
                Approve &amp; Schedule
              </Button>

              <Button className="w-full" variant="secondary" size="md">
                <FileText className="w-4 h-4" />
                Edit Draft
              </Button>

              <div className="pt-2 border-t border-black/[0.07]">
                <label className="block text-[12px] text-gray-500 mb-1.5">
                  Rejection reason
                </label>
                <textarea
                  placeholder="Provide a reason for rejecting this draft..."
                  className="w-full h-20 px-3 py-2 text-[13px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg resize-none placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
                />
                <Button className="w-full mt-2" variant="danger" size="md">
                  Reject Draft
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
