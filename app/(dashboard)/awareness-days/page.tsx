import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AwarenessDaysTable } from '@/components/awareness-days/awareness-days-table'

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

  // Count confirmed days without drafts
  const confirmedWithoutDrafts = days.filter(
    (d) => d.status === 'confirmed' && d.messageDrafts.length === 0
  ).length

  // Serialize for client component
  const dayRows = days.map((day) => ({
    id: day.id,
    date: formatDate(day.date),
    name: day.name,
    status: day.status,
    sourceUrl: day.sourceUrl,
    theme: { label: day.theme.label, color: day.theme.color },
    draftId: day.messageDrafts.length > 0 ? day.messageDrafts[0].id : null,
    draftCount: day.messageDrafts.length,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Awareness Days</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage upcoming inclusion and diversity awareness days
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-gray-900 text-[14px] font-semibold text-white tabular-nums">
            {days.length} <span className="text-[12px] font-medium text-gray-300">result{days.length !== 1 ? 's' : ''}</span>
          </span>
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

      {/* Table with bulk selection */}
      <AwarenessDaysTable days={dayRows} confirmedWithoutDrafts={confirmedWithoutDrafts} />
    </div>
  )
}
