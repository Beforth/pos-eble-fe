import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { ItemRow } from '../../types'
import { formatINR, formatNumber } from '../../utils/format'
import { Card } from '../common/Card'
import { DatePickerPill, type DateRangeOption } from '../common/DatePickerPill'

interface ItemPerformancePanelProps {
  top: ItemRow[]
  low: ItemRow[]
  options?: DateRangeOption[]
  value?: string
  onSelect?: (value: string) => void
  customLabel?: string
  onCustomRange?: (from: string, to: string) => void
  className?: string
}

const VIEW = {
  TOP: 'top',
  LOW: 'low',
} as const

export function ItemPerformancePanel({
  top,
  low,
  options,
  value,
  onSelect,
  customLabel,
  onCustomRange,
  className = '',
}: ItemPerformancePanelProps) {
  const [view, setView] = useState<string>(VIEW.TOP)
  const rows = view === VIEW.TOP ? top : low

  return (
    <Card
      title="Item Performance"
      actions={
        options && value && onSelect ? (
          <DatePickerPill
            options={options}
            value={value}
            onSelect={onSelect}
            customLabel={customLabel}
            onCustomRange={onCustomRange}
          />
        ) : undefined
      }
      className={className}
      divider={false}
    >
      {/* Tabs */}
      <div className="mb-3 flex gap-4 border-b border-line">
        {[
          { value: VIEW.TOP, label: 'Top Performing' },
          { value: VIEW.LOW, label: 'Low Performing' },
        ].map((tab) => {
          const active = view === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setView(tab.value)}
              className={`-mb-px border-b-2 pb-2 text-xs font-semibold transition-colors ${
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li
            key={row.name}
            className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{row.name}</p>
              <p className="text-xs text-muted">
                ({formatNumber(row.units)} sold)
              </p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-ink tabular-nums">
              {formatINR(row.revenue, 2)}
            </p>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-3 flex items-center gap-0.5 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
      >
        View More
        <ChevronRight size={14} />
      </button>
    </Card>
  )
}
