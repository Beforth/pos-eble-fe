import type { ReactNode } from 'react'

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'neutral'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  className?: string
  children: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/40 text-deep',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  neutral: 'bg-page text-muted border border-line',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
}

const dotClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-accent',
  accent: 'bg-accent',
  success: 'bg-success',
  neutral: 'bg-muted',
}

export function Badge({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
  children,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {dot && (
        <span
          className={`size-1.5 rounded-full ${dotClasses[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}
