import { useState } from 'react'

import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronLeft } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

/** Step one of adding expenses: pick the day they belong to. */
export default function BillingExpenseDate() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')
  const [date, setDate] = useState('')

  function search() {
    if (!date) {
      showToast('Pick a date first')
      return
    }
    navigate(`/billing/expenses/${date}`)
  }

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
          <h1 className="text-lg font-bold text-ink">Expense Management</h1>
          <button
            type="button"
            onClick={() => navigate('/billing/expenses')}
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            search()
          }}
          className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-line bg-card"
        >
          <p className="border-b border-line px-5 py-4 text-sm text-ink">
            Please provide the Date for which you want to record your expenses.
          </p>
          <div className="flex flex-wrap items-center gap-4 px-5 py-4">
            <label htmlFor="expense-date" className="text-sm text-ink">
              Date
            </label>
            <span className="relative">
              <CalendarDays
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                id="expense-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 w-56 rounded-lg border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none focus:border-primary"
              />
            </span>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg border border-primary bg-card px-8 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Search
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
