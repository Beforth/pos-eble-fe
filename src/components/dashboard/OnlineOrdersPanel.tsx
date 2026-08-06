import type { OnlineOrdersData } from '../../types'
import { formatINR, formatNumber } from '../../utils/format'
import { Card } from '../common/Card'
import { DatePickerPill, type DateRangeOption } from '../common/DatePickerPill'
import { PlatformOrdersTable } from './PlatformOrdersTable'

interface OnlineOrdersPanelProps {
  data: OnlineOrdersData
  options?: DateRangeOption[]
  value?: string
  onSelect?: (value: string) => void
  customLabel?: string
  onCustomRange?: (from: string, to: string) => void
  className?: string
}

export function OnlineOrdersPanel({
  data,
  options,
  value,
  onSelect,
  customLabel,
  onCustomRange,
  className = '',
}: OnlineOrdersPanelProps) {
  const splitTotal = Math.max(data.prepaidRevenue + data.codRevenue, 1)
  const prepaidPct = Math.round((data.prepaidRevenue / splitTotal) * 100)
  const codPct = 100 - prepaidPct

  return (
    <Card
      title="Online orders"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <p className="text-base font-bold text-ink tabular-nums">
              {formatINR(data.totalRevenue)}
            </p>
            <p className="text-xs text-muted">
              {formatNumber(data.totalOrders)} orders
            </p>
          </div>
          {options && value && onSelect && (
            <DatePickerPill
              options={options}
              value={value}
              onSelect={onSelect}
              customLabel={customLabel}
              onCustomRange={onCustomRange}
            />
          )}
        </div>
      }
      className={className}
      divider={false}
    >
      {/* Prepaid / COD split */}
      <div className="mb-3 grid grid-cols-2 gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <span className="size-2 rounded-full bg-primary" />
            Prepaid
          </p>
          <p className="mt-1 text-lg font-bold text-ink tabular-nums">
            {formatINR(data.prepaidRevenue)}
          </p>
          <p className="text-xs text-muted">
            {formatNumber(data.prepaidOrders)} orders settled by aggregator
          </p>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <span className="size-2 rounded-full bg-danger" />
            COD
          </p>
          <p className="mt-1 text-lg font-bold text-ink tabular-nums">
            {formatINR(data.codRevenue)}
          </p>
          <p className="text-xs text-muted">
            {formatNumber(data.codOrders)} orders cash to collect
          </p>
        </div>
      </div>

      <div className="mb-4 flex h-2 w-full overflow-hidden rounded-full bg-page">
        <div
          className="h-full bg-primary"
          style={{ width: `${prepaidPct}%` }}
        />
        <div className="h-full bg-danger" style={{ width: `${codPct}%` }} />
      </div>

      <PlatformOrdersTable platforms={data.platforms} />
    </Card>
  )
}
