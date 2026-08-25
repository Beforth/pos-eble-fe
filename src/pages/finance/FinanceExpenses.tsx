import { useMemo, useState, type ReactNode } from 'react'
import {
  Banknote,
  Download,
  PiggyBank,
  Receipt,
} from 'lucide-react'
import { FinancePageShell } from '../../components/layout/FinancePageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import {
  EXPENSE_SUMMARY,
  FINANCE_EXPENSES,
} from '../../mocks/financeExpensesData'

const PAGE_SIZE = 10

export default function FinanceExpenses() {
  const [fromDate, setFromDate] = useState('2026-07-28')
  const [toDate, setToDate] = useState('2026-08-12')
  const [status, setStatus] = useState('All')
  const [type, setType] = useState('All')
  const [paidFrom, setPaidFrom] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [applied, setApplied] = useState({
    status: 'All',
    type: 'All',
    paidFrom: '',
    minAmount: '',
    maxAmount: '',
  })
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return FINANCE_EXPENSES.filter((row) => {
      if (applied.status !== 'All' && row.status !== applied.status) return false
      if (applied.type !== 'All' && row.type !== applied.type) return false
      if (
        applied.paidFrom &&
        !row.paidFrom.toLowerCase().includes(applied.paidFrom.toLowerCase())
      ) {
        return false
      }
      const min = applied.minAmount ? Number(applied.minAmount) : null
      const max = applied.maxAmount ? Number(applied.maxAmount) : null
      if (min != null && !Number.isNaN(min) && row.amount < min) return false
      if (max != null && !Number.isNaN(max) && row.amount > max) return false
      return true
    })
  }, [applied])

  const totalRecords = Math.max(EXPENSE_SUMMARY.expense.count, filtered.length)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setApplied({
      status,
      type,
      paidFrom: paidFrom.trim(),
      minAmount: minAmount.trim(),
      maxAmount: maxAmount.trim(),
    })
    setPage(1)
  }

  function handleClear() {
    setFromDate('2026-07-28')
    setToDate('2026-08-12')
    setStatus('All')
    setType('All')
    setPaidFrom('')
    setMinAmount('')
    setMaxAmount('')
    setApplied({
      status: 'All',
      type: 'All',
      paidFrom: '',
      minAmount: '',
      maxAmount: '',
    })
    setPage(1)
  }

  return (
    <FinancePageShell activeItem="expenses">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Expenses</h1>
        <button
          type="button"
          onClick={() => showToast('Download started')}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <Download size={15} />
          Download
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          title="Expense"
          amount={EXPENSE_SUMMARY.expense.amount}
          count={EXPENSE_SUMMARY.expense.count}
          icon={<Receipt size={18} />}
          iconClass="bg-primary/10 text-primary"
        />
        <SummaryCard
          title="Withdrawal"
          amount={EXPENSE_SUMMARY.withdrawal.amount}
          count={EXPENSE_SUMMARY.withdrawal.count}
          icon={<Banknote size={18} />}
          iconClass="bg-secondary/40 text-deep"
        />
        <SummaryCard
          title="Cash Top up"
          amount={EXPENSE_SUMMARY.cashTopUp.amount}
          count={EXPENSE_SUMMARY.cashTopUp.count}
          icon={<PiggyBank size={18} />}
          iconClass="bg-success/10 text-success"
        />
      </div>

      <div className="mb-4 rounded-xl border border-line bg-page/60 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="h-9 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="h-9 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="min-w-[130px]">
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Status
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="min-w-[140px]">
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Type
            </label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
            >
              <option>All</option>
              <option>Expense</option>
              <option>Withdrawal</option>
              <option>Cash Top up</option>
            </select>
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Paid From
            </label>
            <input
              type="text"
              value={paidFrom}
              onChange={(event) => setPaidFrom(event.target.value)}
              placeholder="Paid From"
              className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Min Amount
            </label>
            <input
              type="text"
              value={minAmount}
              onChange={(event) => setMinAmount(event.target.value)}
              placeholder="Min Amount"
              className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="min-w-[120px]">
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Max Amount
            </label>
            <input
              type="text"
              value={maxAmount}
              onChange={(event) => setMaxAmount(event.target.value)}
              placeholder="Max Amount"
              className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
          <OutlineButton variant="gray" onClick={handleClear}>
            Clear
          </OutlineButton>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-ink">
              <tr>
                <th className="px-3 py-2.5">Expense Date</th>
                <th className="px-3 py-2.5">Description</th>
                <th className="px-3 py-2.5 text-right">Amount (Rs.)</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5">Paid From</th>
                <th className="px-3 py-2.5">Billing User</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-line last:border-b-0 ${
                    index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                  }`}
                >
                  <td className="px-3 py-2.5 text-ink">{row.expenseDate}</td>
                  <td className="px-3 py-2.5 font-medium text-ink">
                    {row.description}
                  </td>
                  <td className="px-3 py-2.5 text-right text-ink">
                    {row.amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-ink">{row.category}</td>
                  <td className="px-3 py-2.5 text-ink">{row.status}</td>
                  <td className="px-3 py-2.5 text-ink">{row.type}</td>
                  <td className="px-3 py-2.5 text-ink">{row.paidFrom}</td>
                  <td className="px-3 py-2.5 text-muted">{row.billingUser}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-primary/5 px-4 py-3">
          <p className="text-sm text-ink">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{' '}
            {totalRecords} expenses
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <PagerButton
              label="First"
              disabled={currentPage <= 1}
              onClick={() => setPage(1)}
            />
            <PagerButton
              label="Previous"
              disabled={currentPage <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            />
            {Array.from(
              { length: Math.min(totalPages, 3) },
              (_, i) => i + 1,
            ).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`flex size-8 items-center justify-center rounded-md border text-sm font-medium ${
                  currentPage === n
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-card text-ink hover:bg-page'
                }`}
              >
                {n}
              </button>
            ))}
            <PagerButton
              label="Next"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
            />
            <PagerButton
              label="Last"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(totalPages)}
            />
          </div>
        </div>
      </div>
    </FinancePageShell>
  )
}

function SummaryCard({
  title,
  amount,
  count,
  icon,
  iconClass,
}: {
  title: string
  amount: number
  count: number
  icon: ReactNode
  iconClass: string
}) {
  return (
    <div
      className="rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className={`inline-flex size-9 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </span>
      </div>
      <p className="text-sm font-medium text-muted">{title}</p>
      <p className="mt-1 text-xl font-bold text-ink">
        Rs.{' '}
        {amount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
      <p className="mt-1 text-xs text-muted">{count} transactions</p>
    </div>
  )
}

function PagerButton({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-8 rounded-md border border-line px-2.5 text-sm font-medium text-ink hover:bg-page disabled:opacity-40"
    >
      {label}
    </button>
  )
}
