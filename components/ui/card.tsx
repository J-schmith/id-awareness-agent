import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  action?: { label: string; href: string }
  className?: string
}

export function CardHeader({ title, action, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-5 pt-5 pb-3',
        className
      )}
    >
      <h3 className="text-[15px] font-semibold text-gray-900">{title}</h3>
      {action && (
        <Link
          href={action.href}
          className="text-[13px] font-medium text-[#0071e3] hover:text-[#0077ED] transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}

interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('px-5 pb-5', className)}>{children}</div>
}
