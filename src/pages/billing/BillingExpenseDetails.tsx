import { useCallback, useEffect, useState } from 'react'

import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Loader2, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  getExpenseDayApi,
  saveExpenseDayApi,
  type ExpenseChoices,
  type ExpenseRow,
} from '../../services/expenseService'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

const BATCH = 10

const cellClass =
  'h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary disabled:bg-page disabled:text-ink'

type Row = ExpenseRow & { key: number; amountText: string }

let nextKey = 1

function blankRow(): Row {
  return {
    key: nextKey++,
    reason: '',
    amount: null,
    amountText: '',
    explanation: '',
    employee: null,
    paid_from: 'cash',
  }
}

function blanks(count: number): Row[] {
  return Array.from({ length: count }, blankRow)
}

/**
 * One day's expenses: Add / Edit (a grid of rows) or, with `?view=1`, a
 * read-only view that `?print=1` also sends to the printer.
 */
export default function BillingExpenseDetails() {
  const navigate = useNavigate()
  const { date = '' } = useParams<{ date: string }>()
  const [search] = useSearchParams()
  const viewOnly = search.get('view') === '1'
  const autoPrint = search.get('print') === '1'
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [rows, setRows] = useState<Row[]>(() => blanks(BATCH))
  const [choices, setChoices] = useState<ExpenseChoices>({
    reasons: [],
    employees: [],
    paid_from: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      const detail = await getExpenseDayApi(encryptedOutletId, date)
      setChoices({
        reasons: detail.reasons,
        employees: detail.employees,
        paid_from: detail.paid_from,
      })
      const saved: Row[] = detail.rows.map((row) => ({
        ...row,
        key: nextKey++,
        amountText: row.amount == null ? '' : String(row.amount),
      }))
      // Edit pads to a full form; view shows only what was saved.
      setRows(viewOnly ? saved : [...saved, ...blanks(Math.max(0, BATCH - saved.length))])
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, date, viewOnly])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
  }, [load])

  useEffect(() => {
    if (!autoPrint || loading) return
    const timer = window.setTimeout(() => window.print(), 300)
    return () => window.clearTimeout(timer)
  }, [autoPrint, loading])

  function patch(key: number, changes: Partial<Row>) {
    setRows((cur) => cur.map((r) => (r.key === key ? { ...r, ...changes } : r)))
  }

  async function handleSave() {
    if (!encryptedOutletId) return
    const payload: ExpenseRow[] = rows.map((r) => {
      const parsed = r.amountText.trim() === '' ? null : Number(r.amountText)
      return {
        reason: r.reason,
        amount: parsed != null && Number.isFinite(parsed) ? parsed : null,
        explanation: r.explanation,
        employee: r.employee,
        paid_from: r.paid_from,
      }
    })
    if (rows.some((r) => r.amountText.trim() !== '' && !Number.isFinite(Number(r.amountText)))) {
      showToast('Amounts must be numbers')
      return
    }
    setSaving(true)
    try {
      await saveExpenseDayApi(encryptedOutletId, date, payload)
      showToast('Expenses saved')
      navigate('/billing/expenses')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save expenses')
    } finally {
      setSaving(false)
    }
  }

  const reasonOptions = (row: Row) =>
    row.reason && !choices.reasons.includes(row.reason)
      ? [row.reason, ...choices.reasons]
      : choices.reasons

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Expense Details</h1>
          <button
            type="button"
            onClick={() => navigate('/billing/expenses')}
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4 text-sm">
            <span className="text-ink">Date: {date}</span>
            {viewOnly ? null : (
              <span className="text-blue-600">
                Note: Only rows with reason &amp; amount will get saved.
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" />
              Loading expenses…
            </div>
          ) : rows.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted">
              No expenses were recorded for this day.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-sm">
                <thead>
                  <tr className="bg-page text-left text-sm font-medium text-muted">
                    <th scope="col" className="px-4 py-3">Reason</th>
                    <th scope="col" className="px-4 py-3">Amount</th>
                    <th scope="col" className="px-4 py-3">Explanation</th>
                    <th scope="col" className="px-4 py-3">Employee</th>
                    <th scope="col" className="px-4 py-3">Paid From</th>
                    {viewOnly ? null : (
                      <th scope="col" className="px-4 py-3">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className="border-t border-line">
                      <td className="min-w-[200px] px-3 py-2">
                        <select
                          value={row.reason}
                          disabled={viewOnly}
                          onChange={(e) => patch(row.key, { reason: e.target.value })}
                          aria-label="Reason"
                          className={cellClass}
                        >
                          <option value="">Select Reason</option>
                          {reasonOptions(row).map((reason) => (
                            <option key={reason} value={reason}>
                              {reason}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="min-w-[150px] px-3 py-2">
                        <input
                          value={row.amountText}
                          disabled={viewOnly}
                          onChange={(e) => patch(row.key, { amountText: e.target.value })}
                          inputMode="decimal"
                          placeholder="Enter Amount"
                          aria-label="Amount"
                          className={cellClass}
                        />
                      </td>
                      <td className="min-w-[190px] px-3 py-2">
                        <input
                          value={row.explanation}
                          disabled={viewOnly}
                          onChange={(e) => patch(row.key, { explanation: e.target.value })}
                          maxLength={255}
                          placeholder="Enter Explanation"
                          aria-label="Explanation"
                          className={cellClass}
                        />
                      </td>
                      <td className="min-w-[200px] px-3 py-2">
                        <select
                          value={row.employee ?? ''}
                          disabled={viewOnly}
                          onChange={(e) => patch(row.key, { employee: e.target.value || null })}
                          aria-label="Employee"
                          className={cellClass}
                        >
                          <option value="">Select Employee</option>
                          {choices.employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="min-w-[150px] px-3 py-2">
                        <select
                          value={row.paid_from}
                          disabled={viewOnly}
                          onChange={(e) =>
                            patch(row.key, { paid_from: e.target.value as Row['paid_from'] })
                          }
                          aria-label="Paid from"
                          className={cellClass}
                        >
                          {choices.paid_from.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      {viewOnly ? null : (
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            aria-label="Remove row"
                            data-tooltip="Remove row"
                            onClick={() => setRows((cur) => cur.filter((r) => r.key !== row.key))}
                            className="inline-flex size-9 items-center justify-center rounded-lg bg-page text-muted hover:text-ink"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewOnly ? null : (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-primary/10 px-5 py-3">
              <button
                type="button"
                onClick={() => setRows((cur) => [...cur, ...blanks(BATCH)])}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-primary bg-card px-4 text-sm font-medium text-primary hover:bg-primary/5"
              >
                <Plus size={14} />
                Add {BATCH} Rows
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/billing/expenses')}
                  disabled={saving}
                  className="inline-flex h-10 items-center rounded-lg border border-line bg-card px-5 text-sm font-medium text-ink hover:bg-page disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || loading}
                  className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
