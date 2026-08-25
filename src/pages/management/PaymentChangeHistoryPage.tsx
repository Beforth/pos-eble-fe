import { useState } from 'react'
import {
  Calendar,
  ChevronDown,
  Download,
  Search,
} from 'lucide-react'
import { AuditTrailPageShell } from '../../components/layout/AuditTrailPageShell'
import { OutlineButton, PrimaryButton } from '../../components/menu/MenuActionButtons'

interface PaymentChangeLogEntry {
  id: string
  dateTime: string
  details: string
}

const PAYMENT_CHANGE_LOGS: PaymentChangeLogEntry[] = [
  {
    id: 'pcl-1',
    dateTime: '12 Aug | 08:38 PM',
    details:
      'Payment type (Bill No.: 57233, Amount : 110) is changed from Cash to Other [UPI] by Utkarsh (Utkarsh Gosavi) (Electron Pos)',
  },
  {
    id: 'pcl-2',
    dateTime: '12 Aug | 08:38 PM',
    details:
      'Payment type (Bill No.: 57218, Amount : 125) is changed from Other [UPI] to Cash by Utkarsh (Utkarsh Gosavi) (Electron Pos)',
  },
  {
    id: 'pcl-3',
    dateTime: '12 Aug | 08:38 PM',
    details:
      'Payment type (Bill No.: 57233, Amount : 110) is changed from Other [UPI] to Cash by Utkarsh (Utkarsh Gosavi) (Electron Pos)',
  },
  {
    id: 'pcl-4',
    dateTime: '12 Aug | 08:35 PM',
    details:
      'Payment type (Bill No.: 57273, Amount : 265) is changed from Other [UPI] to Cash by Utkarsh (Utkarsh Gosavi) (Electron Pos)',
  },
  {
    id: 'pcl-5',
    dateTime: '12 Aug | 08:25 PM',
    details:
      'Payment type (Bill No.: 57264, Amount : 35) is changed from Other [UPI] to Cash by Utkarsh (Utkarsh Gosavi) (Electron Pos)',
  },
  {
    id: 'pcl-6',
    dateTime: '12 Aug | 08:18 PM',
    details:
      'Payment type (Bill No.: 57259, Amount : 85) is changed from Cash to Other [UPI] by Utkarsh (Utkarsh Gosavi) (Electron Pos)',
  },
]

const SUMMARY_STATS = [
  {
    label: 'Total Payments Changed',
    amount: '730.00',
    subtext: '6 changes',
  },
  {
    label: 'Cash to UPI',
    amount: '195.00',
    subtext: '2 payments',
  },
  {
    label: 'UPI to Cash',
    amount: '535.00',
    subtext: '4 payments',
  },
]

const LOG_PAGE_SIZE = 5

export default function PaymentChangeHistoryPage() {
  const [fromDate, setFromDate] = useState('2026-04-01')
  const [toDate, setToDate] = useState('2026-08-13')
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(LOG_PAGE_SIZE)

  function handleApply() {
    setAppliedSearch(searchQuery)
    setVisibleCount(LOG_PAGE_SIZE)
  }

  function handleReset() {
    setFromDate('2026-04-01')
    setToDate('2026-08-13')
    setSearchQuery('')
    setAppliedSearch('')
    setVisibleCount(LOG_PAGE_SIZE)
  }

  const filteredLogs = PAYMENT_CHANGE_LOGS.filter((log) => {
    if (
      appliedSearch &&
      !log.details.toLowerCase().includes(appliedSearch.toLowerCase())
    ) {
      return false
    }
    return true
  })

  const visibleLogs = filteredLogs.slice(0, visibleCount)
  const hasMore = visibleCount < filteredLogs.length

  return (
    <AuditTrailPageShell activeItem="after-print-payment">
      <div className="space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">
            Payment Change History
          </h1>

          <div className="flex items-center gap-3">
            <OutlineButton
              variant="gray"
              onClick={() => alert('Exporting payment change logs...')}
            >
              <Download size={16} />
              <span>Export</span>
              <ChevronDown size={14} />
            </OutlineButton>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {/* From Date */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-muted">From</label>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-10 rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <Calendar
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </div>

            {/* To Date */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-muted">To</label>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-10 rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <Calendar
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </div>

            {/* Search Box */}
            <div className="space-y-1.5 flex-1 min-w-[220px] max-w-xs">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary placeholder:text-muted"
                />
              </div>
            </div>

            {/* Apply Button */}
            <PrimaryButton onClick={handleApply}>Apply</PrimaryButton>

            {/* Reset Button */}
            <OutlineButton variant="gray" onClick={handleReset}>
              Reset
            </OutlineButton>
          </div>

          <p className="text-xs font-medium text-muted">
            Note: The displayed log data is updated up to the previous day only.
          </p>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SUMMARY_STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-1 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <span className="text-xs font-bold text-muted leading-snug">
                {stat.label}
              </span>
              <span className="text-lg font-bold tabular-nums text-ink">
                ₹{stat.amount}
              </span>
              {stat.subtext ? (
                <span className="text-xs font-medium text-muted">
                  {stat.subtext}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {/* Log List Card */}
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="divide-y divide-line p-2 sm:p-4">
            {visibleLogs.length === 0 ? (
              <div className="py-12 text-center text-sm font-medium text-muted">
                No payment change records found matching your filters.
              </div>
            ) : (
              visibleLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-page/40"
                >
                  {/* Left Date / Time Badge */}
                  <div className="shrink-0">
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary">
                      {log.dateTime}
                    </span>
                  </div>

                  {/* Middle Details Description Text */}
                  <div className="flex-1 text-sm font-semibold text-ink leading-relaxed">
                    {log.details}
                  </div>
                </div>
              ))
            )}

            {/* View More */}
            {hasMore ? (
              <div className="py-4 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + LOG_PAGE_SIZE)}
                  className="text-sm font-bold text-primary transition-colors hover:underline hover:text-primary-hover"
                >
                  View More
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AuditTrailPageShell>
  )
}
