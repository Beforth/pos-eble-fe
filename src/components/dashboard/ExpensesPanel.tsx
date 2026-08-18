import { useMemo, useState } from 'react'
import { Pencil } from 'lucide-react'
import type { ExpenseType, ExpensesData } from '../../types'
import { formatINR } from '../../utils/format'
import { Card } from '../common/Card'
import { DatePickerPill, type DateRangeOption } from '../common/DatePickerPill'
import { EditExpenseLineModal } from './EditExpenseLineModal'

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
  const [lines, setLines] = useState(data.lines)
  const [editing, setEditing] = useState<ExpenseType | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const totalOutflow = useMemo(
    () =>
      lines
        .filter((line) => line.type === 'expense' || line.type === 'withdrawal')
        .reduce((sum, line) => sum + line.amount, 0),
    [lines],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSave(amount: number) {
    if (!editing) return
    setLines((prev) =>
      prev.map((line) =>
        line.type === editing
          ? { ...line, amount: line.amount + amount }
          : line,
      ),
    )
    const label =
      editing === 'expense'
        ? 'Expense saved'
        : editing === 'withdrawal'
          ? 'Withdrawal saved'
          : 'Cash top up saved'
    showToast(label)
  }

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
          {formatINR(totalOutflow)}
        </p>
        <p className="mt-0.5 text-xs text-muted">Total outflow</p>

        <ul className="mt-4 divide-y divide-line">
          {lines.map((line) => (
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
                  aria-label={`Edit ${line.label}`}
                  onClick={() => setEditing(line.type)}
                  className="rounded p-1 text-muted transition-colors hover:bg-page hover:text-ink"
                >
                  <Pencil size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <EditExpenseLineModal
        type={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
      />

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </>
  )
}
