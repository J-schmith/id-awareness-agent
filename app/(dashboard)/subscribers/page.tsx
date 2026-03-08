import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { parseSegments, formatDate } from '@/lib/utils'
import { StatusPill } from '@/components/ui/status-pill'
import { Button } from '@/components/ui/button'
import { Users, Plus, Upload, Search } from 'lucide-react'

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q?.trim() ?? ''

  const where = query
    ? {
        OR: [
          { name: { contains: query } },
          { email: { contains: query } },
        ],
      }
    : {}

  const subscribers = await prisma.subscriber.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  const totalActive = await prisma.subscriber.count({ where: { optedOut: false } })
  const totalOptedOut = await prisma.subscriber.count({ where: { optedOut: true } })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Subscribers</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalActive} active &middot; {totalOptedOut} opted out
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/subscribers/import">
            <Button variant="secondary" size="md">
              <Upload className="w-4 h-4" />
              Import CSV
            </Button>
          </Link>
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            Add Subscriber
          </Button>
        </div>
      </div>

      {/* Search */}
      <form className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by name or email..."
          className="w-full h-9 pl-9 pr-4 rounded-lg bg-gray-100 text-[13px] text-gray-700 placeholder-gray-400 border border-transparent focus:border-[#0071e3]/30 focus:bg-white focus:ring-2 focus:ring-[#0071e3]/10 outline-none transition-all"
        />
      </form>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm overflow-hidden">
        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Users className="w-10 h-10 mb-3 text-gray-300" />
            <p className="text-sm font-medium">No subscribers found</p>
            <p className="text-xs mt-1">
              {query
                ? `No results for "${query}"`
                : 'Add subscribers or import from CSV'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.07]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Segments
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Added
                </th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => {
                const segments = parseSegments(sub.segments)

                return (
                  <tr
                    key={sub.id}
                    className="border-b border-black/[0.07] last:border-0 hover:bg-black/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-medium text-gray-900">
                        {sub.name || '--'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] text-gray-600">{sub.email}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {segments.length > 0 ? (
                          segments.map((seg) => (
                            <span
                              key={seg}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium text-gray-600"
                            >
                              {seg}
                            </span>
                          ))
                        ) : (
                          <span className="text-[12px] text-gray-400">--</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={sub.optedOut ? 'opted-out' : 'active'} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[12px] text-gray-400">
                        {formatDate(sub.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="text-[12px] font-medium text-[#0071e3] hover:underline">
                        Edit
                      </button>
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
