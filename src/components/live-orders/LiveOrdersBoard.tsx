import type { ReactNode } from 'react'
import { formatINR, formatNumber } from '../../utils/format'
import type {
  LiveOrderChannelRow,
  LiveOrdersSummary,
} from '../../services/orderService'
import { LiveOrderRow } from './LiveOrderRow'

interface LiveOrdersBoardProps {
  title: string
  /** One plain sentence saying what this list is. */
  subtitle?: string
  /** Shown when there is nothing to list. */
  emptyText?: string
  data: LiveOrdersSummary
  icons: Record<string, ReactNode>
  onRowClick?: (row: LiveOrderChannelRow) => void
  /**
   * Hide channels with zero orders (default). The Running Orders board passes
   * `false` because the server zero-fills every order type, so all of its rows
   * are meaningful — filtering would make a channel look deleted the moment its
   * last bill settled. Pending Orders leaves this on: its `out` row is a
   * placeholder with no data behind it yet.
   */
  hideEmptyRows?: boolean
}

export function LiveOrdersBoard({
  title,
  subtitle,
  emptyText = 'Nothing here right now.',
  data,
  icons,
  onRowClick,
  hideEmptyRows = true,
}: LiveOrdersBoardProps) {
  const rows = hideEmptyRows
    ? data.rows.filter((row) => row.orders > 0)
    : data.rows

  return (
    <section className="rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span
            className="live-dot size-2.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-ink">{title}</h2>
        </div>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted">{subtitle}</p>
        ) : null}
        <p className="mt-2 text-sm text-ink">
          <span className="font-bold tabular-nums">
            {formatNumber(data.totalOrders)}
          </span>{' '}
          order{data.totalOrders === 1 ? '' : 's'}
          {data.totalAmount > 0 ? (
            <>
              {' · '}
              <span className="font-bold tabular-nums">
                {formatINR(data.totalAmount, 2)}
              </span>
            </>
          ) : null}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-line px-4 py-8 text-center">
          <p className="text-sm font-medium text-muted">{emptyText}</p>
          <p className="mt-1 text-xs text-muted/70">
            New orders will appear here automatically.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => (
            <li key={row.id}>
              <LiveOrderRow
                row={row}
                icon={icons[row.icon]}
                onClick={
                  onRowClick && row.orders > 0
                    ? () => onRowClick(row)
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
