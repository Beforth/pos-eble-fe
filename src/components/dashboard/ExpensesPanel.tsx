import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import type { ExpenseType, ExpensesData } from '../../types'
import { formatINR } from '../../utils/format'
import { Card } from '../common/Card'
import { DatePickerPill, type DateRangeOption } from '../common/DatePickerPill'

/** Where each line is recorded; the dashboard only reports what was saved there. */
const RECORD_PATHS: Record<ExpenseType, string> = {
  expense: '/billing/expenses',
  withdrawal: '/billing/withdrawals',
  topup: '/billing/cash-top-up',
}

interface ExpensesPanelProps {
  data: ExpensesData
  options?: DateRangeOption[]
  value?: string
  onSelect?: (value: string) => void
  customLabel?: string
  onCustomRange?: (from: string, to: string) => void
  className?: string
}

export function ExpensesPanel({
  data,
  options,
  value,
  onSelect,
  customLabel,
  onCustomRange,
  className = '',
}: ExpensesPanelProps) {
  const navigate = useNavigate()

  return (
    <>
      <Card
        title="Expenses & Withdrawals"
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
        <p className="text-2xl font-bold tracking-tight text-ink tabular-nums">
          {formatINR(data.totalOutflow)}
        </p>
        <p className="mt-0.5 text-xs text-muted">Total outflow</p>

        <ul className="mt-4 divide-y divide-line">
          {data.lines.map((line) => (
            <li
              key={line.label}
              className="flex items-center justify-between gap-2 py-2.5 first:pt-0"
            >
              <span className="text-sm text-ink">{line.label}</span>
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-ink tabular-nums">
                  {formatINR(line.amount)}
                </span>
                <button
                  type="button"
                  aria-label={`Record ${line.label}`}
                  data-tooltip={`Record ${line.label}`}
                  onClick={() => navigate(RECORD_PATHS[line.type])}
                  className="rounded p-1 text-muted transition-colors hover:bg-page hover:text-ink"
                >
                  <Pencil size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </Card>

    </>
  )
}
