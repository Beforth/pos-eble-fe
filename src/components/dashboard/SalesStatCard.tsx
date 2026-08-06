import type { SalesStats } from '../../types'
import { formatINR } from '../../utils/format'
import { Card } from '../common/Card'

interface SalesStatCardProps {
  stats: SalesStats
  className?: string
}

/** Colors mapped from the brand palette, keyed by payment method label. */
const sliceColors: Record<string, string> = {
  Cash: 'bg-primary',
  Card: 'bg-success',
  Other: 'bg-accent',
  'Not Paid': 'bg-muted',
}

export function SalesStatCard({ stats, className = '' }: SalesStatCardProps) {
  const total = stats.payments.reduce((sum, slice) => sum + slice.value, 0)

  return (
    <Card
      title="Total Sales"
      subtitle={`${stats.periodLabel} • ${stats.totalOrders} orders`}
      className={className}
      bodyClassName="pt-3"
    >
      <p className="text-3xl font-bold tracking-tight text-ink">
        {formatINR(stats.totalSales)}
      </p>

      {/* Horizontal stacked breakdown */}
      <div className="mt-4 flex h-1.5 w-full overflow-hidden rounded-full bg-page">
        {stats.payments.map((slice) => {
          if (slice.value <= 0) return null
          return (
            <div
              key={slice.label}
              title={`${slice.label} — ${formatINR(slice.value)}`}
              className={`h-full ${sliceColors[slice.label] ?? 'bg-muted'}`}
              style={{ width: `${total > 0 ? (slice.value / total) * 100 : 0}%` }}
            />
          )
        })}
      </div>

      {/* Legend with amount + % */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
        {stats.payments.map((slice) => {
          const pct = total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0.0'
          return (
            <div key={slice.label} className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <span
                  className={`size-2 shrink-0 rounded-full ${sliceColors[slice.label] ?? 'bg-muted'}`}
                />
                <span className="truncate">{slice.label}</span>
              </div>
              <p className="mt-0.5 pl-3.5 text-xs font-semibold text-ink tabular-nums">
                {formatINR(slice.value)}{' '}
                <span className="font-normal text-muted">({pct}%)</span>
              </p>
            </div>
          )
        })}
      </div>

      <div className="mt-4 border-t border-dashed border-line pt-3 text-xs text-muted">
        Online —{' '}
        <span className="font-semibold text-ink">
          {formatINR(stats.onlineSubtotal)}
        </span>{' '}
        this period
      </div>
    </Card>
  )
}
