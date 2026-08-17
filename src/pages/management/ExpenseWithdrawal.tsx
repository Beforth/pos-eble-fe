import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

type TabId =
  | 'expense-listing'
  | 'expense-master'
  | 'withdrawal-listing'
  | 'withdrawal-master'
  | 'cash-topup-listing'
  | 'cash-topup-master'

interface ExpenseRow {
  id: string
  title: string
  total: number
}

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'expense-listing', label: 'Expense Listing' },
  { id: 'expense-master', label: 'Expense Master' },
  { id: 'withdrawal-listing', label: 'Withdrawal Listing' },
  { id: 'withdrawal-master', label: 'Withdrawal Master' },
  { id: 'cash-topup-listing', label: 'Cash Top-Up Listing' },
  { id: 'cash-topup-master', label: 'Cash Top-Up Master' },
]

const EXPENSE_ROWS: ExpenseRow[] = [
  { id: '1', title: 'Advance Salary', total: 0 },
  { id: '2', title: 'Amit Foods', total: 0 },
  { id: '3', title: 'Anjali Farsan', total: 0 },
  { id: '4', title: 'Ashit Manek (Shev)', total: 4200 },
  { id: '5', title: 'Bharat Bakery', total: 0 },
  { id: '6', title: 'Cash to Kishor Uncle', total: 0 },
  { id: '7', title: 'Cash to Mustak Bhai', total: 2200 },
  { id: '8', title: 'Chai', total: 512 },
  { id: '9', title: 'Dharam Enterprises', total: 0 },
  { id: '10', title: 'Electricity', total: 0 },
  { id: '11', title: 'Gas', total: 0 },
  { id: '12', title: 'Groceries', total: 0 },
  { id: '13', title: 'Internet', total: 0 },
  { id: '14', title: 'Jayshree Mataji Milk Center', total: 0 },
  { id: '15', title: 'Kapil Gore Pani Puri', total: 0 },
  { id: '16', title: 'Labour Charges', total: 3500 },
  { id: '17', title: 'Maintenance', total: 1800 },
  { id: '18', title: 'Milk', total: 960 },
  { id: '19', title: 'Packaging', total: 1250 },
  { id: '20', title: 'Petrol', total: 780 },
  { id: '21', title: 'Rent', total: 0 },
  { id: '22', title: 'Salary', total: 4500 },
  { id: '23', title: 'Stationery', total: 145 },
  { id: '24', title: 'Sugar', total: 320 },
  { id: '25', title: 'Tea Masala', total: 90 },
  { id: '26', title: 'Transport', total: 640 },
  { id: '27', title: 'Vegetables', total: 0 },
  { id: '28', title: 'Water', total: 0 },
  { id: '29', title: 'Cleaning', total: 200 },
  { id: '30', title: 'Misc Purchase', total: 400 },
  { id: '31', title: 'Oil', total: 0 },
  { id: '32', title: 'Spices', total: 200 },
]

const PAGE_SIZE = 15

function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function ExpenseWithdrawal() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('expense-listing')
  const [startDate, setStartDate] = useState('2026-08-01')
  const [endDate, setEndDate] = useState('2026-08-12')
  const [titleQuery, setTitleQuery] = useState('')
  const [appliedTitle, setAppliedTitle] = useState('')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<string | null>(null)
  const [top10Open, setTop10Open] = useState(false)
  const top10Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!top10Open) return
    const onPointerDown = (event: MouseEvent) => {
      if (top10Ref.current && !top10Ref.current.contains(event.target as Node)) {
        setTop10Open(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [top10Open])

  const filtered = useMemo(() => {
    const q = appliedTitle.trim().toLowerCase()
    if (!q) return EXPENSE_ROWS
    return EXPENSE_ROWS.filter((row) => row.title.toLowerCase().includes(q))
  }, [appliedTitle])

  const grandTotal = useMemo(
    () => filtered.reduce((sum, row) => sum + row.total, 0),
    [filtered],
  )

  const top10 = useMemo(
    () =>
      [...filtered]
        .filter((row) => row.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10),
    [filtered],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )
  const fromRecord =
    filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const toRecord = Math.min(currentPage * PAGE_SIZE, filtered.length)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setAppliedTitle(titleQuery)
    setPage(1)
  }

  function handleShowAll() {
    setStartDate('2026-08-01')
    setEndDate('2026-08-12')
    setTitleQuery('')
    setAppliedTitle('')
    setPage(1)
  }

  return (
    <ReportsPageShell
      title="Expense Management"
      activeItem="acct-expense-withdrawal"
      actions={
        activeTab === 'expense-listing' ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-ink">
              Grand Total:{' '}
              <span className="text-primary">
                {brand.currency} {formatAmount(grandTotal)}
              </span>
            </p>
            <div ref={top10Ref} className="relative">
              <button
                type="button"
                onClick={() => setTop10Open((prev) => !prev)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
              >
                Top 10 Expenses
                <ChevronDown size={14} className="text-muted" />
              </button>
              {top10Open ? (
                <ul className="absolute right-0 z-40 mt-1.5 w-64 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg">
                  {top10.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-muted">No expenses</li>
                  ) : (
                    top10.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm text-ink"
                      >
                        <span className="truncate">{row.title}</span>
                        <span className="shrink-0 font-medium">
                          {formatAmount(row.total)}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              ) : null}
            </div>
            <PrimaryButton
              onClick={() =>
                navigate('/management/accounting/expense-withdrawal/add')
              }
            >
              <Plus size={15} />
              Add Expense
            </PrimaryButton>
            <ExportExcelMenu
              onExportPage={() => showToast('Exporting current page…')}
              onExportAll={() => showToast('Exporting all records…')}
            />
          </div>
        ) : null
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id)
                setPage(1)
              }}
              className={`px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'border-b-2 border-primary font-semibold text-primary'
                  : 'border-b-2 border-transparent text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'expense-listing' ? (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
            <label className="text-xs text-muted">
              Start Date
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-1 block h-9 min-w-[150px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="text-xs text-muted">
              End Date
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="mt-1 block h-9 min-w-[150px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="min-w-[180px] flex-1 text-xs text-muted sm:max-w-[240px]">
              Title
              <input
                type="text"
                value={titleQuery}
                onChange={(event) => setTitleQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSearch()
                }}
                className="mt-1 block h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <OutlineButton onClick={handleSearch}>Search</OutlineButton>
            <OutlineButton variant="gray" onClick={handleShowAll}>
              Show All
            </OutlineButton>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b border-line bg-primary/5 text-sm font-semibold text-ink">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3 text-right">
                      Total Expense Reported ({brand.currency})
                    </th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-line last:border-0 hover:bg-page/50"
                    >
                      <td className="px-4 py-3 text-ink">{row.title}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink">
                        {formatAmount(row.total)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.total > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              showToast(`View details · ${row.title}`)
                            }
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View details
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-page/50 px-4 py-3">
              <p className="text-sm text-muted">
                {filtered.length === 0
                  ? 'Showing 0 records'
                  : `Showing ${fromRecord} to ${toRecord} of ${filtered.length} records`}
              </p>
              <div className="flex flex-wrap items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm ${
                        pageNumber === currentPage
                          ? 'bg-primary font-semibold text-white'
                          : 'border border-line bg-card text-ink hover:bg-page'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  className="inline-flex h-8 items-center rounded-md border border-line bg-card px-2.5 text-sm text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(totalPages)}
                  className="inline-flex h-8 items-center rounded-md border border-line bg-card px-2.5 text-sm text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-line bg-card px-6 py-16 text-center">
          <p className="text-base font-semibold text-ink">
            {TABS.find((tab) => tab.id === activeTab)?.label}
          </p>
          <p className="mt-1 text-sm text-muted">
            This section will be available soon.
          </p>
        </div>
      )}
    </ReportsPageShell>
  )
}
