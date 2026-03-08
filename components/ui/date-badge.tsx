import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface DateBadgeProps {
  date: Date
  className?: string
}

export function DateBadge({ date, className }: DateBadgeProps) {
  const month = format(date, 'MMM').toUpperCase()
  const day = format(date, 'd')

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center w-11 h-12 rounded-xl bg-gray-50 border border-black/[0.05] shrink-0',
        className
      )}
    >
      <span className="text-[10px] font-semibold text-gray-400 leading-none tracking-wider">
        {month}
      </span>
      <span className="text-[18px] font-bold text-gray-900 leading-tight">
        {day}
      </span>
    </div>
  )
}
