import { useCallback, useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Eye, FileX, Loader2, Pencil, Plus, Printer } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  formatExpenseDate,
  listExpenseDaysApi,
  type ExpenseDay,
} from '../../services/expenseService'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

const iconBtn =
  'inline-flex size-8 items-center justify-center rounded-lg bg-page text-ink hover:bg-line/60'

export default function BillingExpenses() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId, isAdmin, hasPermission } = useAuth()
  const canWrite =
    isAdmin ||
    hasPermission('outlets.change_outlet') ||
    hasPermission('accounts.pos_expense_withdrawal_mgmt_write')
  const [billNo, setBillNo] = useState('')
  const [days, setDays] = useState<ExpenseDay[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      setDays(await listExpenseDaysApi(encryptedOutletId))
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
  }, [load])

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Expense Listing</h1>
          <div className="flex items-center gap-2">
            {canWrite ? (
              <button
                type="button"
                onClick={() => navigate('/billing/expenses/add')}
                className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                <Plus size={14} />
                Add Expense
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => navigate('/billing/operations')}
              className="inline-flex h-10 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 py-12 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading expenses…
          </div>
        ) : days.length === 0 ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-xl border border-line bg-card px-6 py-10 text-center">
            <FileX size={64} strokeWidth={1.2} className="text-muted/60" />
            <p className="text-sm text-muted">Records not available</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-page text-left text-sm font-medium text-muted">
                    <th scope="col" className="px-5 py-4">Date</th>
                    <th scope="col" className="px-5 py-4">Total Expenses Reported</th>
                    <th scope="col" className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day.date} className="border-t border-line">
                      <td className="px-5 py-5 text-ink">{formatExpenseDate(day.date)}</td>
                      <td className="px-5 py-5 tabular-nums text-ink">
                        {Number(day.total).toFixed(2)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label={`View expenses of ${formatExpenseDate(day.date)}`}
                            data-tooltip="View"
                            onClick={() => navigate(`/billing/expenses/${day.date}?view=1`)}
                            className={iconBtn}
                          >
                            <Eye size={16} />
                          </button>
                          {canWrite ? (
                            <button
                              type="button"
                              aria-label={`Edit expenses of ${formatExpenseDate(day.date)}`}
                              data-tooltip="Edit"
                              onClick={() => navigate(`/billing/expenses/${day.date}`)}
                              className={iconBtn}
                            >
                              <Pencil size={16} />
                            </button>
                          ) : null}
                          <button
                            type="button"
                            aria-label={`Print expenses of ${formatExpenseDate(day.date)}`}
                            data-tooltip="Print"
                            onClick={() => navigate(`/billing/expenses/${day.date}?view=1&print=1`)}
                            className={iconBtn}
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
