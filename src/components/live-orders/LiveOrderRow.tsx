import type { ReactNode } from 'react'
import { formatINR, formatNumber } from '../../utils/format'
import type { LiveOrderChannelRow } from '../../services/orderService'

interface LiveOrderRowProps {
  row: LiveOrderChannelRow
  icon: ReactNode
  onClick?: () => void
}

export function LiveOrderRow({ row, icon, onClick }: LiveOrderRowProps) {
  const content = (
    <>
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
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-xl border border-line bg-card px-3 py-3 text-left transition-colors hover:border-primary/40"
      >
        {content}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-3 py-3">
      {content}
    </div>
  )
}
