import { cn } from '@/lib/utils'
import { TrendingUp, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  value: string | number
  label: string
  change?: string
  changeType?: 'up' | 'neutral'
  iconBg?: string
  iconColor?: string
  className?: string
}

export function StatCard({
  icon,
  value,
  label,
  change,
  changeType = 'neutral',
  iconBg = 'bg-[#0071e3]/[0.08]',
  iconColor = 'text-[#0071e3]',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-xl',
            iconBg,
            iconColor
          )}
        >
          {icon}
        </div>
        {change && (
          <div
            className={cn(
              'flex items-center gap-1 text-[12px] font-medium rounded-full px-2 py-0.5',
              changeType === 'up'
                ? 'text-[#248a3d] bg-[#34c759]/10'
                : 'text-gray-500 bg-gray-100'
            )}
          >
            {changeType === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[28px] font-bold tracking-tight text-gray-900">
          {value}
        </p>
        <p className="text-[13px] text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
