import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Check, Pencil, X } from 'lucide-react'
import Link from 'next/link'

export default async function ApprovalQueue() {
  const pendingDrafts = await prisma.messageDraft.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      awarenessDay: {
        include: { theme: true },
      },
    },
  })

  return (
    <Card>
      <CardHeader
        title="Approval Queue"
        action={{ label: 'View all', href: '/approvals' }}
      />
      <CardBody className="space-y-3">
        {pendingDrafts.length === 0 && (
          <p className="text-[13px] text-gray-400 py-4 text-center">
            No pending drafts to review.
          </p>
        )}
        {pendingDrafts.map((draft) => (
          <div
            key={draft.id}
            className="flex gap-3.5 p-3 rounded-xl bg-gray-50/60 border border-black/[0.04] transition-all duration-150 hover:bg-gray-50"
          >
            {/* Icon dot */}
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#ff9500]/10 text-[#ff9500] shrink-0 text-base font-medium mt-0.5">
              {draft.awarenessDay.name.slice(0, 1)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate">
                {draft.awarenessDay.name}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {format(new Date(draft.awarenessDay.date), 'MMM d, yyyy')}
                {' \u00b7 '}
                <span
                  className="font-medium"
                  style={{ color: draft.awarenessDay.theme.color }}
                >
                  {draft.awarenessDay.theme.label}
                </span>
              </p>
              <p className="text-[12px] text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                {draft.subject}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-start gap-1.5 shrink-0">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-[#34c759] hover:bg-[#34c759]/10">
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Link href={`/approvals`}>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:bg-gray-100">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-[#ff3b30] hover:bg-[#ff3b30]/[0.08]">
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  )
}
