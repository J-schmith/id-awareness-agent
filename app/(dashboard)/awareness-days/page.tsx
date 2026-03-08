import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { StatusPill } from '@/components/ui/status-pill'
import { Button } from '@/components/ui/button'
import { Calendar, Plus, ExternalLink } from 'lucide-react'

export default async function AwarenessDaysPage({
  searchParams,
}: {
  searchParams: { theme?: string; status?: string }
}) {
  const where: Record<string, unknown> = {}
  if (searchParams.theme) where.themeId = searchParams.theme
  if (searchParams.status) where.status = searchParams.status

  const [days, themes] = await Promise.all([
    prisma.awarenessDay.findMany({
      where,
      include: { theme: true, messageDrafts: { select: { id: true } } },
      orderBy: { date: 'asc' },
    }),
    prisma.theme.findMany({ where: { active: true }, orderBy: { label: 'asc' } }),
  ])

  const statuses = ['discovered', 'confirmed', 'skipped']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Awareness Days</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage upcoming inclusion and diversity awareness days
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="w-4 h-4" />
          Add Day
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Theme filter */}
        <div className="flex gap-1 items-center">
          <span className="text-[12px] text-gray-400 mr-1">Theme:</span>
          <Link
            href="/awareness-days"
            className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${
              !searchParams.theme
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </Link>
          {themes.map((theme) => (
            <Link
              key={theme.id}
              href={`/awareness-days?theme=${theme.id}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${
                searchParams.theme === theme.id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={
                searchParams.theme === theme.id
                  ? { backgroundColor: theme.color }
                  : undefined
              }
            >
              {theme.label}
            </Link>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-1 items-center ml-4">
          <span className="text-[12px] text-gray-400 mr-1">Status:</span>
          <Link
            href={`/awareness-days${searchParams.theme ? `?theme=${searchParams.theme}` : ''}`}
            className={`px-3 py-1 rounded-lg text-[12px] font-medium capitalize transition-colors ${
              !searchParams.status
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </Link>
          {statuses.map((status) => (
            <Link
              key={status}
              href={`/awareness-days?status=${status}${searchParams.theme ? `&theme=${searchParams.theme}` : ''}`}
              className={`px-3 py-1 rounded-lg text-[12px] font-medium capitalize transition-colors ${
                searchParams.status === status
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
        {days.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Calendar className="w-10 h-10 mb-3 text-gray-300" />
            <p className="text-sm font-medium">No awareness days found</p>
            <p className="text-xs mt-1">Try adjusting your filters or add a new day</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.07]">
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
                  className="border-b border-black/[0.07] last:border-0 hover:bg-black/[0.02] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-medium text-gray-900 tabular-nums">
                      {formatDate(day.date)}
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
                      {day.messageDrafts.length}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {day.sourceUrl && (
                        <a
                          href={day.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          title="View source"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {day.messageDrafts.length > 0 && (
                        <Link
                          href={`/approvals/${day.messageDrafts[0].id}`}
                          className="text-[12px] font-medium text-[#0071e3] hover:underline"
                        >
                          View Draft
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
