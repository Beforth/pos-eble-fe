import type { ReactNode } from 'react'
import { formatINR, formatNumber } from '../../utils/format'
import type { LiveOrdersSummary } from '../../mocks/liveOrdersData'
import { LiveOrderRow } from './LiveOrderRow'

interface LiveOrdersBoardProps {
  title: string
  data: LiveOrdersSummary
  icons: Record<string, ReactNode>
}

export function LiveOrdersBoard({ title, data, icons }: LiveOrdersBoardProps) {
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

      <ul className="space-y-2.5">
        {data.rows.map((row) => (
          <li key={row.id}>
            <LiveOrderRow row={row} icon={icons[row.icon]} />
          </li>
        ))}
      </ul>
    </section>
  )
}
