import { cn } from '@/lib/utils'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-[#0071e3] text-white hover:bg-[#0077ED] active:bg-[#006ACC] shadow-sm',
  secondary:
    'bg-white text-gray-700 border border-black/[0.12] hover:bg-gray-50 active:bg-gray-100 shadow-sm',
  ghost: 'text-gray-600 hover:bg-black/[0.04] active:bg-black/[0.06]',
  danger:
    'bg-[#ff3b30] text-white hover:bg-[#e0352b] active:bg-[#cc3027] shadow-sm',
}

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12px] rounded-lg gap-1.5',
  md: 'h-9 px-4 text-[13px] rounded-lg gap-2',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/30 disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, type ButtonProps }
