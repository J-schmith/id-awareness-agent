import { prisma } from '@/lib/prisma'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { StatusPill } from '@/components/ui/status-pill'
import { Activity, Filter } from 'lucide-react'

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-500',
  confirm: 'bg-blue-500',
  draft_generated: 'bg-purple-500',
  subscriber_import: 'bg-amber-500',
  approve: 'bg-emerald-500',
  reject: 'bg-red-500',
  send: 'bg-blue-500',
  update: 'bg-gray-500',
  delete: 'bg-red-500',
  skip: 'bg-gray-400',
}

const ENTITY_TYPES = [
  'AwarenessDay',
  'MessageDraft',
  'Theme',
  'Subscriber',
  'ScheduledSend',
]

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { entity?: string }
}) {
  const where = searchParams.entity
    ? { entityType: searchParams.entity }
    : {}

  const entries = await prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 200,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Audit Log</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Track all actions across the system
          </p>
        </div>
        <span className="text-sm text-gray-400">
          {entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {/* Entity type filter */}
      <div className="flex flex-wrap gap-1 items-center">
        <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
        <a
          href="/audit-log"
          className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${
            !searchParams.entity
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </a>
        {ENTITY_TYPES.map((type) => (
          <a
            key={type}
            href={`/audit-log?entity=${type}`}
            className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${
              searchParams.entity === type
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type}
          </a>
        ))}
      </div>

      {/* Timeline / Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Activity className="w-10 h-10 mb-3 text-gray-300" />
            <p className="text-sm font-medium">No audit entries found</p>
            <p className="text-xs mt-1">Actions will be logged here automatically</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.07]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-[180px]">
                  Timestamp
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Entity
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Actor
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const dotColor =
                  ACTION_COLORS[entry.action] ?? 'bg-gray-400'
                let metadata: Record<string, unknown> = {}
                try {
                  if (entry.metadata) metadata = JSON.parse(entry.metadata)
                } catch {
                  /* ignore */
                }

                return (
                  <tr
                    key={entry.id}
                    className="border-b border-black/[0.07] last:border-0 hover:bg-black/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-medium text-gray-700 tabular-nums">
                          {formatDate(entry.timestamp)}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {formatRelativeDate(entry.timestamp)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}
                        />
                        <span className="text-[13px] font-medium text-gray-900">
                          {entry.action.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-[13px] text-gray-700">
                          {entry.entityType}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono truncate max-w-[140px]">
                          {entry.entityId}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[13px] font-medium ${
                          entry.actor.startsWith('system:')
                            ? 'text-purple-600'
                            : 'text-gray-700'
                        }`}
                      >
                        {entry.actor}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {Object.keys(metadata).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(metadata)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <span
                                key={key}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-600"
                              >
                                {key}: {String(value)}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <span className="text-[12px] text-gray-400">--</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
