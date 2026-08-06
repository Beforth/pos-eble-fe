import type { ButtonHTMLAttributes, ReactNode } from 'react'

type IconButtonSize = 'sm' | 'md'

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string
  size?: IconButtonSize
  active?: boolean
  /** Small colored notification dot at the top-right. */
  badgeDot?: boolean
  children: ReactNode
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'size-8',
  md: 'size-9',
}

export function IconButton({
  label,
  size = 'md',
  active = false,
  badgeDot = false,
  className = '',
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`relative inline-flex shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-page hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
        active ? 'bg-page text-ink' : ''
      } ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
      {badgeDot && (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 size-2 rounded-full border-2 border-card bg-primary"
        />
      )}
    </button>
  )
}
