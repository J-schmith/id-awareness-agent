import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

const actionColorMap: Record<string, string> = {
  sent: 'bg-[#34c759]',
  approved: 'bg-[#0071e3]',
  generated: 'bg-[#ff9500]',
  rejected: 'bg-[#ff3b30]',
  created: 'bg-[#af52de]',
}

function dotColor(action: string): string {
  const lower = action.toLowerCase()
  for (const [key, cls] of Object.entries(actionColorMap)) {
    if (lower.includes(key)) return cls
  }
  return 'bg-gray-400'
}

function actionLabel(action: string): string {
  return action
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function ActivityTimeline() {
  const entries = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: 8,
  })

  return (
    <Card>
      <CardHeader
        title="Recent Activity"
        action={{ label: 'Audit log', href: '/audit-log' }}
      />
      <CardBody>
        {entries.length === 0 && (
          <p className="text-[13px] text-gray-400 py-4 text-center">
            No activity recorded yet.
          </p>
        )}
        <div className="relative">
          {entries.map((entry, i) => {
            const isLast = i === entries.length - 1
            return (
              <div key={entry.id} className="flex gap-3 pb-4 last:pb-0">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-full shrink-0 mt-1',
                      dotColor(entry.action)
                    )}
                  />
                  {!isLast && (
                    <div className="w-px flex-1 bg-gray-200 mt-1.5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 -mt-0.5">
                  <p className="text-[13px] text-gray-800 font-medium truncate">
                    {actionLabel(entry.action)}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {entry.actor}
                    {' \u00b7 '}
                    {formatDistanceToNow(new Date(entry.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}
