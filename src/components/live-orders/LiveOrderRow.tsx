import type { ReactNode } from 'react'
import { formatINR, formatNumber } from '../../utils/format'
import type { LiveOrderChannelRow } from '../../mocks/liveOrdersData'

interface LiveOrderRowProps {
  row: LiveOrderChannelRow
  icon: ReactNode
}

export function LiveOrderRow({ row, icon }: LiveOrderRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-3 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-page text-muted">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{row.label}</p>
        <p className="text-xs text-muted">
          {formatNumber(row.orders)} order{row.orders === 1 ? '' : 's'}
        </p>
      </div>
      <p className="shrink-0 text-sm font-bold text-ink tabular-nums">
        {formatINR(row.amount, 2)}
      </p>
    </div>
  )
}
