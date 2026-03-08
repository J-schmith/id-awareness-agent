import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { DateBadge } from '@/components/ui/date-badge'
import { StatusPill } from '@/components/ui/status-pill'

export default async function UpcomingDays() {
  const now = new Date()

  const upcomingDays = await prisma.awarenessDay.findMany({
    where: {
      date: { gte: now },
    },
    orderBy: { date: 'asc' },
    take: 6,
    include: { theme: true },
  })

  return (
    <Card>
      <CardHeader
        title="Upcoming Days"
        action={{ label: 'View calendar', href: '/awareness-days' }}
      />
      <CardBody className="space-y-2">
        {upcomingDays.length === 0 && (
          <p className="text-[13px] text-gray-400 py-4 text-center">
            No upcoming awareness days found.
          </p>
        )}
        {upcomingDays.map((day) => (
          <div
            key={day.id}
            className="flex items-center gap-3.5 p-2.5 rounded-xl transition-all duration-150 hover:bg-gray-50/60"
          >
            <DateBadge date={new Date(day.date)} />

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate">
                {day.name}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5">
                <span
                  className="font-medium"
                  style={{ color: day.theme.color }}
                >
                  {day.theme.label}
                </span>
              </p>
            </div>

            <StatusPill status={day.status} />
          </div>
        ))}
      </CardBody>
    </Card>
  )
}
