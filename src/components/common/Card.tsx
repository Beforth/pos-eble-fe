import type { ReactNode } from 'react'

interface CardProps {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
  bodyClassName?: string
  /** Render a divider between header and body. */
  divider?: boolean
  children: ReactNode
}

export function Card({
  title,
  subtitle,
  actions,
  className = '',
  bodyClassName = '',
  divider = true,
  children,
}: CardProps) {
  const hasHeader = Boolean(title || actions)

  return (
    <section
      className={`rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      {hasHeader && (
        <header
          className={`flex items-start justify-between gap-3 px-4 py-3 ${
            divider ? 'border-b border-line' : ''
          }`}
        >
          <div className="min-w-0">
            {title && (
              <h3 className="truncate text-sm font-semibold text-deep">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </header>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </section>
  )
}
