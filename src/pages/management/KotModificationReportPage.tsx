import { useState } from 'react'
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  Download,
  RotateCcw,
  Search,
} from 'lucide-react'
import { AuditTrailPageShell } from '../../components/layout/AuditTrailPageShell'
import { OutlineButton, PrimaryButton } from '../../components/menu/MenuActionButtons'

export default function KotModificationReportPage() {
  const [fromDate, setFromDate] = useState('2026-08-13')
  const [toDate, setToDate] = useState('2026-08-13')
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  function handleApply() {
    // Apply filters
  }

  function handleReset() {
    setFromDate('2026-08-13')
    setToDate('2026-08-13')
    setStatusFilter('All')
    setSearchQuery('')
  }

  return (
    <AuditTrailPageShell activeItem="kot-modification-report">
      <div className="space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">
            KOT modification report
          </h1>

          <div className="flex items-center gap-3">
            <OutlineButton
              variant="gray"
              onClick={() => alert('Exporting KOT modification report...')}
            >
              <Download size={16} />
              <span>Export</span>
              <ChevronDown size={14} />
            </OutlineButton>
          </div>
        </div>

        {/* Filter Controls Bar */}
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

          {/* Status Select */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-muted">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 min-w-[140px] rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
            >
              <option value="All">All</option>
              <option value="Modified">Modified</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="space-y-1.5 flex-1 min-w-[200px] max-w-xs">
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

        {/* Empty State Graphic Container (Exact Match to Screenshot 5420) */}
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-line bg-card p-8 text-center shadow-xs">
          <div className="flex size-14 items-center justify-center rounded-full border border-line bg-page text-muted shadow-2xs">
            <AlertCircle size={28} />
          </div>

          <h2 className="mt-4 text-lg font-bold tracking-tight text-ink">
            No data available
          </h2>

          <div className="mt-2 max-w-sm space-y-0.5 text-sm font-medium text-muted leading-relaxed">
            <p>No logs found for the selected date range. Try adjusting</p>
            <p>your filters or date range.</p>
          </div>

          <div className="mt-6">
            <OutlineButton variant="gray" onClick={handleReset}>
              <RotateCcw size={15} />
              <span>Reset Dates</span>
            </OutlineButton>
          </div>
        </div>
      </div>
    </AuditTrailPageShell>
  )
}
