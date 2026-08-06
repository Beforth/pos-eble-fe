import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'
import type { OrderTypeSummary } from '../../types'
import { formatINR, formatNumber } from '../../utils/format'
import { ProgressBar } from '../common/ProgressBar'

interface OrderTypeCardProps {
  summary: OrderTypeSummary
  icon: ReactNode
  iconTone: 'primary' | 'accent' | 'success'
}

const iconToneClasses = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
} as const

const barColor: Record<
  OrderTypeCardProps['iconTone'],
  'primary' | 'accent' | 'success'
> = {
  primary: 'primary',
  accent: 'accent',
  success: 'success',
}

export function OrderTypeCard({
  summary,
  icon,
  iconTone,
}: OrderTypeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const pct =
    summary.totalOrders > 0
      ? Math.round((summary.orders / summary.totalOrders) * 100)
      : 0
  const showBar = summary.orders > 0

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const detailRows: Array<{ label: string; value: string }> = [
    {
      label: 'No. of order',
      value: formatNumber(summary.details.orderCount),
    },
    { label: 'Minimum', value: formatINR(summary.details.minimum) },
    { label: 'Average', value: formatINR(summary.details.average) },
    { label: 'Maximum', value: formatINR(summary.details.maximum) },
    { label: 'Discount', value: formatINR(summary.details.discount) },
    { label: 'Taxes', value: formatINR(summary.details.taxes) },
    { label: 'Total', value: formatINR(summary.details.total) },
  ]

  return (
    <section className="relative rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-start gap-2.5">
        <span
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconToneClasses[iconTone]}`}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-sm font-semibold uppercase tracking-wide text-ink">
            {summary.label}
          </p>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label={`${summary.label} details`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-md p-1 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-xl border border-line bg-card py-1.5 shadow-lg"
            >
              {detailRows.map((row) => (
                <div
                  key={row.label}
                  role="menuitem"
                  className="flex items-center justify-between gap-3 px-3 py-1.5 text-xs"
                >
                  <span className="text-muted">{row.label}</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mb-2 text-2xl font-bold tracking-tight text-ink">
        {formatINR(summary.revenue)}
      </p>

      {showBar ? (
        <>
          <p className="mb-1.5 text-xs text-muted">
            {formatNumber(summary.orders)} Order
            {summary.orders === 1 ? '' : 's'} • {pct}%
          </p>
          <ProgressBar value={pct} color={barColor[iconTone]} height={4} />
        </>
      ) : (
        <p className="text-xs text-muted">
          0 Order • 0%
          <span className="mt-1 block">
            T.T.A avg. {summary.avgTurnaroundMins} min
          </span>
        </p>
      )}
    </section>
  )
}
