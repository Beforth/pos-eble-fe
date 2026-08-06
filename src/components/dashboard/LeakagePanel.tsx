import type { LeakageData } from '../../types'
import { formatINR } from '../../utils/format'
import { Card } from '../common/Card'
import { DatePickerPill, type DateRangeOption } from '../common/DatePickerPill'

interface LeakagePanelProps {
  data: LeakageData
  options?: DateRangeOption[]
  value?: string
  onSelect?: (value: string) => void
  customLabel?: string
  onCustomRange?: (from: string, to: string) => void
  className?: string
}

function MetricCell({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-lg font-bold text-ink tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
    </div>
  )
}

export function LeakagePanel({
  data,
  options,
  value,
  onSelect,
  customLabel,
  onCustomRange,
  className = '',
}: LeakagePanelProps) {
  return (
    <Card
      title="Leakage"
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
      <div className="space-y-4">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            KOTS
          </p>
          <div className="grid grid-cols-3 gap-2">
            <MetricCell label="Cancelled" value={data.kots.cancelled} />
            <MetricCell label="Modified" value={data.kots.modified} />
            <MetricCell label="Shifted" value={data.kots.shifted} />
          </div>
        </div>

        <div className="border-t border-line pt-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            BILLS
          </p>
          <div className="grid grid-cols-3 gap-2">
            <MetricCell label="Modified" value={data.bills.modified} />
            <MetricCell label="Re-printed" value={data.bills.reprinted} />
            <MetricCell
              label="Waived off"
              value={formatINR(data.bills.waivedOff)}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
