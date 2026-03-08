'use client'

import { cn } from '@/lib/utils'

interface ThemeChipProps {
  label: string
  color: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export function ThemeChip({
  label,
  color,
  active = false,
  onClick,
  className,
}: ThemeChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150 border',
        active
          ? 'bg-white border-black/[0.12] shadow-sm text-gray-900'
          : 'bg-transparent border-transparent text-gray-500 hover:bg-black/[0.03] hover:text-gray-700',
        className
      )}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {label}
    </button>
  )
}
