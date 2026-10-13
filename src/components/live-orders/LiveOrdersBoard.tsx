import type { ReactNode } from 'react'
import { formatINR, formatNumber } from '../../utils/format'
import type {
  LiveOrderChannelRow,
  LiveOrdersSummary,
} from '../../services/orderService'
import { LiveOrderRow } from './LiveOrderRow'

interface LiveOrdersBoardProps {
  title: string
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
      <div className="mb-4 flex items-center gap-2">
        <span
          className="live-dot size-2.5 rounded-full bg-primary"
          aria-hidden="true"
        />
        <h2 className="text-sm font-bold text-ink">{title}</h2>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted">Total Orders</p>
          <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
            {formatNumber(data.totalOrders)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">Total Amount</p>
          <p className="mt-1 text-2xl font-bold text-ink tabular-nums">
            {formatINR(data.totalAmount, 2)}
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-dashed border-line px-4 py-8 text-center">
          <p className="text-sm font-medium text-muted">
            No {title.toLowerCase()} right now
          </p>
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
