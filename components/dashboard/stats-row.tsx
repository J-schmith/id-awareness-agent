import { prisma } from '@/lib/prisma'
import { StatCard } from '@/components/ui/stat-card'
import { Calendar, FileText, Users, Send } from 'lucide-react'

export default async function StatsRow() {
  const now = new Date()
  const yearStart = new Date('2026-01-01T00:00:00.000Z')
  const yearEnd = new Date('2026-12-31T23:59:59.999Z')

  const [daysCount, pendingDrafts, activeSubscribers, sentDrafts] =
    await Promise.all([
      prisma.awarenessDay.count({
        where: {
          date: { gte: yearStart, lte: yearEnd },
        },
      }),
      prisma.messageDraft.count({
        where: { status: 'pending' },
      }),
      prisma.subscriber.count({
        where: { optedOut: false },
      }),
      prisma.messageDraft.count({
        where: { status: 'sent' },
      }),
    ])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Calendar className="w-5 h-5" />}
        value={daysCount}
        label="Awareness days in 2026"
        iconBg="bg-[#0071e3]/[0.08]"
        iconColor="text-[#0071e3]"
      />
      <StatCard
        icon={<FileText className="w-5 h-5" />}
        value={pendingDrafts}
        label="Pending drafts"
        changeType="neutral"
        iconBg="bg-[#ff9500]/10"
        iconColor="text-[#ff9500]"
      />
      <StatCard
        icon={<Users className="w-5 h-5" />}
        value={activeSubscribers}
        label="Active subscribers"
        changeType="up"
        iconBg="bg-[#af52de]/[0.08]"
        iconColor="text-[#af52de]"
      />
      <StatCard
        icon={<Send className="w-5 h-5" />}
        value={sentDrafts}
        label="Emails sent"
        iconBg="bg-[#34c759]/10"
        iconColor="text-[#34c759]"
      />
    </div>
  )
}
