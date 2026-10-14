import type { ReactNode } from 'react'

interface DashCardProps {
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  className?: string
  bodyClassName?: string
  /** Render a divider between header and body. */
  divider?: boolean
  children: ReactNode
}

/** Dashboard panel shell — peach-bordered, brand-red title accent. */
export function DashCard({
  title,
  subtitle,
  actions,
  className = '',
  bodyClassName = '',
  divider = true,
  children,
}: DashCardProps) {
  const hasHeader = Boolean(title || actions)

  return (
    <section
      className={`rounded-2xl border border-surface-tint/70 bg-card shadow-[0_2px_10px_rgba(144,65,55,0.07)] ${className}`}
    >
      {hasHeader && (
        <header
          className={`flex items-start justify-between gap-3 px-4 py-3 ${
            divider ? 'border-b border-surface-tint/60' : ''
          }`}
        >
          <div className="min-w-0">
            {title && (
              <h3 className="flex items-center gap-2 truncate text-sm font-bold text-deep">
                <span className="h-3.5 w-1 shrink-0 rounded-full bg-primary" />
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 pl-3 text-xs text-muted">{subtitle}</p>
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
