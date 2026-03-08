import { cn } from '@/lib/utils'

type Status =
  | 'scheduled'
  | 'pending'
  | 'draft'
  | 'approved'
  | 'rejected'
  | 'sent'
  | 'discovered'
  | 'confirmed'
  | 'skipped'
  | 'active'
  | 'opted-out'

const statusStyles: Record<string, string> = {
  scheduled: 'bg-[#34c759]/10 text-[#248a3d] border-[#34c759]/20',
  pending: 'bg-[#ff9500]/10 text-[#c77c02] border-[#ff9500]/20',
  draft: 'bg-[#0071e3]/[0.08] text-[#0071e3] border-[#0071e3]/15',
  approved: 'bg-[#34c759]/10 text-[#248a3d] border-[#34c759]/20',
  rejected: 'bg-[#ff3b30]/[0.08] text-[#ff3b30] border-[#ff3b30]/15',
  sent: 'bg-[#34c759]/10 text-[#248a3d] border-[#34c759]/20',
  discovered: 'bg-[#af52de]/[0.08] text-[#af52de] border-[#af52de]/15',
  confirmed: 'bg-[#34c759]/10 text-[#248a3d] border-[#34c759]/20',
  skipped: 'bg-gray-50 text-gray-500 border-gray-200',
  active: 'bg-[#34c759]/10 text-[#248a3d] border-[#34c759]/20',
  'opted-out': 'bg-gray-50 text-gray-500 border-gray-200',
}

interface StatusPillProps {
  status: string
  className?: string
}

export function StatusPill({ status, className }: StatusPillProps) {
  const key = status.toLowerCase()
  const styles = statusStyles[key] ?? 'bg-gray-50 text-gray-600 border-gray-200'

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize',
        styles,
        className
      )}
    >
      {status}
    </span>
  )
}
