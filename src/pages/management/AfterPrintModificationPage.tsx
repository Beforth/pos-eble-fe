import { useState } from 'react'
import {
  Calendar,
  ChevronDown,
  Download,
  Search,
} from 'lucide-react'
import { AuditTrailPageShell } from '../../components/layout/AuditTrailPageShell'
import { OutlineButton, PrimaryButton } from '../../components/menu/MenuActionButtons'

interface AfterPrintLogEntry {
  id: string
  dateTime: string
  billNo: string
  details: string
}

const AFTER_PRINT_LOGS: AfterPrintLogEntry[] = [
  {
    id: 'apm-1',
    dateTime: '12 Aug | 08:35 PM',
    billNo: '57273',
    details:
      'Payment type (Bill No.: 57273, Amount : 265) is changed from Other [UPI] to Cash by Utkarsh (Utkarsh Gosavi) (Electron Pos)',
  },
  {
    id: 'apm-2',
    dateTime: '12 Aug | 08:35 PM',
    billNo: '57273',
    details:
      'Order (Bill No.: 57273) total amount changed from 265 to 239 by Utkarsh (Utkarsh Gosavi). Discount changed from 0 to 25.24. (Electron Pos)',
  },
  {
    id: 'apm-3',
    dateTime: '12 Aug | 04:49 PM',
    billNo: '57055',
    details:
      'Order (Bill No.: 57055) total amount changed from 110 to 55 by Utkarsh (Utkarsh Gosavi). (Electron Pos)',
  },
  {
    id: 'apm-4',
    dateTime: '11 Aug | 04:07 PM',
    billNo: '56606',
    details:
      'Order (Bill No.: 56606) total amount changed from 130 to 100 by Utkarsh (Utkarsh Gosavi). (Electron Pos)',
  },
  {
    id: 'apm-5',
    dateTime: '10 Aug | 09:52 PM',
    billNo: '56536',
    details:
      'Order (Bill No.: 56536) total amount changed from 60 to 35 by Utkarsh (Utkarsh Gosavi). (Electron Pos)',
  },
  {
    id: 'apm-6',
    dateTime: '10 Aug | 07:19 PM',
    billNo: '56364',
    details:
      'Order (Bill No.: 56364) total amount changed from 450 to 425 by Utkarsh (Utkarsh Gosavi). (Electron Pos)',
  },
]

export default function AfterPrintModificationPage() {
  const [fromDate, setFromDate] = useState('2026-04-01')
  const [toDate, setToDate] = useState('2026-08-12')
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(6)

  function handleApply() {
    setAppliedSearch(searchQuery)
  }

  function handleReset() {
    setFromDate('2026-04-01')
    setToDate('2026-08-12')
    setSearchQuery('')
    setAppliedSearch('')
  }

  const filteredLogs = AFTER_PRINT_LOGS.filter((log) => {
    if (
      appliedSearch &&
      !log.details.toLowerCase().includes(appliedSearch.toLowerCase()) &&
      !log.billNo.includes(appliedSearch)
    ) {
      return false
    }
    return true
  })

  return (
    <AuditTrailPageShell activeItem="after-print-modification">
      <div className="space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">
            After Print Modification Summary
          </h1>

          <div className="flex items-center gap-3">
            <OutlineButton
              variant="gray"
              onClick={() => alert('Exporting after print modification logs...')}
            >
              <Download size={16} />
              <span>Export</span>
              <ChevronDown size={14} />
            </OutlineButton>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
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

        {/* Log List Card */}
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-xs">
          <div className="divide-y divide-line p-2 sm:p-4">
            {filteredLogs.length === 0 ? (
              <div className="py-12 text-center text-sm font-medium text-muted">
                No logs found matching your filters.
              </div>
            ) : (
              filteredLogs.slice(0, visibleCount).map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-page/40"
                >
                  {/* Left Date / Time Badge */}
                  <div className="shrink-0">
                    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary shadow-2xs">
                      {log.dateTime}
                    </span>
                  </div>

                  {/* Middle Details Description Text */}
                  <div className="flex-1 text-sm font-semibold text-slate-800 leading-relaxed">
                    {log.details}
                  </div>

                  {/* Right Bill No Column */}
                  <div className="shrink-0 text-sm font-bold text-muted sm:text-right">
                    {log.billNo}
                  </div>
                </div>
              ))
            )}

            {/* Bottom View More Action */}
            <div className="py-4 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="text-sm font-bold text-primary transition-colors hover:underline hover:text-primary-hover"
              >
                View More
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuditTrailPageShell>
  )
}
