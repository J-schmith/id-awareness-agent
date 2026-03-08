import { Suspense } from 'react'
import AgentBanner from '@/components/dashboard/agent-banner'
import StatsRow from '@/components/dashboard/stats-row'
import ApprovalQueue from '@/components/dashboard/approval-queue'
import UpcomingDays from '@/components/dashboard/upcoming-days'
import ActivityTimeline from '@/components/dashboard/activity-timeline'
import ActiveThemes from '@/components/dashboard/active-themes'

function SectionSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-5 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
      <div className="space-y-3">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-3/5" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Agent status banner */}
      <AgentBanner />

      {/* Stats row */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SectionSkeleton key={i} />
            ))}
          </div>
        }
      >
        <StatsRow />
      </Suspense>

      {/* Main two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column — 3/5 */}
        <div className="lg:col-span-3 space-y-6">
          <Suspense fallback={<SectionSkeleton />}>
            <ApprovalQueue />
          </Suspense>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Suspense fallback={<SectionSkeleton />}>
              <ActivityTimeline />
            </Suspense>
            {/* Subscribers summary placeholder — can be filled in later */}
            <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-5">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-3">
                Subscribers
              </h3>
              <p className="text-[13px] text-gray-400">
                Subscriber analytics coming soon.
              </p>
            </div>
          </div>
        </div>

        {/* Right column — 2/5 */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<SectionSkeleton />}>
            <UpcomingDays />
          </Suspense>

          <Suspense fallback={<SectionSkeleton />}>
            <ActiveThemes />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
