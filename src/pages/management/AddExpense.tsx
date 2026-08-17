import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

const EXPENSE_TITLES = [
  'Advance Salary',
  'Amit Foods',
  'Anjali Farsan',
  'Ashit Manek (Shev)',
  'Bharat Bakery',
  'Cash to Kishor Uncle',
  'Cash to Mustak Bhai',
  'Chai',
  'Dharam Enterprises',
  'Electricity',
  'Gas',
  'Groceries',
  'Internet',
  'Jayshree Mataji Milk Center',
  'Kapil Gore Pani Puri',
]

function formatDisplayDate(value: string): string {
  if (!value) return ''
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AddExpense() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [loadedDate, setLoadedDate] = useState<string | null>(null)
  const [amounts, setAmounts] = useState<Record<string, string>>({})

  const totalEntered = useMemo(() => {
    return Object.values(amounts).reduce((sum, value) => {
      const num = Number(value)
      return sum + (Number.isFinite(num) ? num : 0)
    }, 0)
  }, [amounts])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/accounting/expense-withdrawal')
  }

  function handleLoad() {
    if (!date) {
      showToast('Please select a date')
      return
    }
    setLoadedDate(date)
    setAmounts({})
    showToast(`Expenses loaded for ${formatDisplayDate(date)}`)
  }

  function handleSave() {
    if (!loadedDate) {
      showToast('Please load a date first')
      return
    }
    showToast('Expenses saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell
      title="Add Expense"
      activeItem="acct-expense-withdrawal"
      actions={
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ChevronLeft size={15} />
          Back
        </button>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-5 p-5 sm:p-6">
          <p className="text-sm text-ink">
            Please provide the Date for which you want to record your expenses.
          </p>

          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm font-medium text-ink">
              Date <span className="text-primary">*</span>
              <div className="relative mt-1.5">
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="block h-10 min-w-[200px] rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
            </label>
            <PrimaryButton onClick={handleLoad}>Load</PrimaryButton>
          </div>

          {loadedDate ? (
            <div className="space-y-4 border-t border-line pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">
                  Recording expenses for {formatDisplayDate(loadedDate)}
                </p>
                <p className="text-sm text-muted">
                  Total:{' '}
                  <span className="font-semibold text-ink">
                    {brand.currency}{' '}
                    {totalEntered.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </p>
              </div>

              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3">Expense Title</th>
                      <th className="px-4 py-3 text-right">
                        Amount ({brand.currency})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {EXPENSE_TITLES.map((title) => (
                      <tr
                        key={title}
                        className="border-b border-line last:border-0"
                      >
                        <td className="px-4 py-2.5 text-ink">{title}</td>
                        <td className="px-4 py-2.5 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amounts[title] ?? ''}
                            onChange={(event) =>
                              setAmounts((prev) => ({
                                ...prev,
                                [title]: event.target.value,
                              }))
                            }
                            placeholder="0.00"
                            className="ml-auto block h-9 w-36 rounded-md border border-line bg-card px-2.5 text-right text-sm text-ink outline-none focus:border-primary"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        {loadedDate ? (
          <div className="flex justify-end gap-2 border-t border-line px-5 py-3 sm:px-6">
            <OutlineButton variant="gray" onClick={goBack}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
          </div>
        ) : null}
      </div>
    </ReportsPageShell>
  )
}
