import { useState } from 'react'
import { Calendar, RotateCcw, Search } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

interface ExpenseLogEntry {
  id: string
  dateTime: string
  category: string
  amount: number
  updateType: 'Created' | 'Updated' | 'Deleted'
  remarks: string
  performedBy: string
}

const SAMPLE_EXPENSE_LOGS: ExpenseLogEntry[] = [
  {
    id: 'el-1',
    dateTime: '13 Aug 2026 10:20:00',
    category: 'Kitchen Supplies',
    amount: 1450,
    updateType: 'Created',
    remarks: 'Daily milk and butter purchase voucher',
    performedBy: 'Amit Thakkar',
  },
  {
    id: 'el-2',
    dateTime: '12 Aug 2026 17:45:00',
    category: 'Utility & Repairs',
    amount: 850,
    updateType: 'Updated',
    remarks: 'Gas cylinder refilling receipt amount corrected',
    performedBy: 'Utkarsh Gosavi',
  },
]

const UPDATE_TYPE_OPTIONS = ['All', 'Created', 'Updated', 'Deleted']

export default function ExpenseLogsPage() {
  const [fromDate, setFromDate] = useState('13 Aug 2026 00:00:00')
  const [toDate, setToDate] = useState('13 Aug 2026 23:59:59')
  const [updateType, setUpdateType] = useState('All')
  const [isSearched, setIsSearched] = useState(true)
  const [logs, setLogs] = useState<ExpenseLogEntry[]>([])
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setIsSearched(true)
    if (updateType === 'All') {
      setLogs([])
    } else {
      setLogs(SAMPLE_EXPENSE_LOGS.filter((l) => l.updateType === updateType))
    }
    showToast('Search applied')
  }

  function handleReset() {
    setFromDate('13 Aug 2026 00:00:00')
    setToDate('13 Aug 2026 23:59:59')
    setUpdateType('All')
    setLogs([])
    setIsSearched(true)
    showToast('Filters reset')
  }

  return (
    <ReportsPageShell title="Expense Logs" activeItem="user-logs-expense">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="space-y-4">
        {/* Filter Controls */}
        <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-4">
            <label className="min-w-[180px] flex-1 text-xs font-semibold text-muted">
              From Date
              <div className="relative mt-1">
                <input
                  type="text"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
                <Calendar
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </label>

            <label className="min-w-[180px] flex-1 text-xs font-semibold text-muted">
              To Date
              <div className="relative mt-1">
                <input
                  type="text"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
                <Calendar
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </label>

            <div className="min-w-[180px] flex-1">
              <span className="text-xs font-semibold text-muted">
                Update Type
              </span>
              <div className="mt-1">
                <SearchableSelect
                  label=""
                  value={updateType}
                  options={UPDATE_TYPE_OPTIONS}
                  onChange={setUpdateType}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PrimaryButton onClick={handleSearch}>
                <Search size={15} />
                Search
              </PrimaryButton>
              <OutlineButton variant="gray" onClick={handleReset}>
                <RotateCcw size={15} />
                Reset
              </OutlineButton>
            </div>
          </div>
        </div>

        {/* Content Card / Empty State / Table */}
        <div className="min-h-[380px] overflow-hidden rounded-xl border border-line bg-card p-6">
          {isSearched && logs.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-page text-muted/60">
                <Search size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold text-ink">No Results Found.</h3>
              <p className="mt-1 text-xs text-muted">
                We couldn't find a match for your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Amount (₹)</th>
                    <th className="px-4 py-3">Update Type</th>
                    <th className="px-4 py-3">Remarks</th>
                    <th className="px-4 py-3 text-right">Performed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {logs.map((l) => (
                    <tr
                      key={l.id}
                      className="transition-colors hover:bg-page/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                        {l.dateTime}
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">
                        {l.category}
                      </td>
                      <td className="px-4 py-3 font-bold text-ink">
                        ₹{l.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {l.updateType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted">{l.remarks}</td>
                      <td className="px-4 py-3 text-right text-muted">
                        {l.performedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ReportsPageShell>
  )
}
