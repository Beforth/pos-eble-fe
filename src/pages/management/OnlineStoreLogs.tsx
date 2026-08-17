import { useState } from 'react'
import { Calendar, Info, RotateCcw, Search, Sparkles } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { PiPredictiveDrawer } from '../../components/management/PiPredictiveDrawer'

interface LogEntry {
  id: string
  dateTime: string
  outlet: string
  channel: string
  action: string
  performedBy: string
  status: 'Success' | 'Pending' | 'Failed'
}

const SAMPLE_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    dateTime: '13 Aug 2026 10:30:15',
    outlet: "Annapurna's Rajubhai Dabeliwale",
    channel: 'Zomato',
    action: 'Store Status changed to ONLINE',
    performedBy: 'Amit Thakkar (Manager)',
    status: 'Success',
  },
  {
    id: 'log-2',
    dateTime: '13 Aug 2026 09:14:02',
    outlet: "Annapurna's Rajubhai Dabeliwale",
    channel: 'Swiggy',
    action: 'Auto-Accept enabled for Peak Hours',
    performedBy: 'System Auto',
    status: 'Success',
  },
  {
    id: 'log-3',
    dateTime: '12 Aug 2026 21:45:00',
    outlet: "Annapurna's Rajubhai Dabeliwale",
    channel: 'Online Store',
    action: 'Store Status changed to OFFLINE (Closing Hours)',
    performedBy: 'Utkarsh Gosavi',
    status: 'Success',
  },
]

const OUTLET_OPTIONS = [
  'Select Outlet',
  'All Outlets',
  "Annapurna's Rajubhai Dabeliwale - Main",
  "Annapurna's Rajubhai Dabeliwale - Express",
]

export default function OnlineStoreLogs() {
  const [fromDate, setFromDate] = useState('13 Aug 2026 00:00:00')
  const [toDate, setToDate] = useState('13 Aug 2026 23:59:59')
  const [selectedOutlet, setSelectedOutlet] = useState('Select Outlet')
  const [isSearched, setIsSearched] = useState(true)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [piDrawerOpen, setPiDrawerOpen] = useState(false)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setIsSearched(true)
    if (selectedOutlet === 'Select Outlet' || selectedOutlet === 'All Outlets') {
      setLogs([])
    } else {
      setLogs(
        SAMPLE_LOGS.filter(
          (log) =>
            selectedOutlet === 'Select Outlet' ||
            log.outlet.toLowerCase().includes('rajubhai'),
        ),
      )
    }
    showToast('Search applied')
  }

  function handleReset() {
    setFromDate('13 Aug 2026 00:00:00')
    setToDate('13 Aug 2026 23:59:59')
    setSelectedOutlet('Select Outlet')
    setLogs([])
    setIsSearched(true)
    showToast('Filters reset')
  }

  return (
    <ReportsPageShell
      title="Online Store Logs"
      activeItem="user-logs-online-store"
      actions={
        <PrimaryButton onClick={() => setPiDrawerOpen(true)}>
          <Sparkles size={15} />
          Pi
        </PrimaryButton>
      }
    >
      <PiPredictiveDrawer
        open={piDrawerOpen}
        onClose={() => setPiDrawerOpen(false)}
      />
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="space-y-4">
        {/* Info Banner */}
        <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-[#fffbeb] p-3.5 text-sm text-[#854d0e] shadow-xs">
          <Info size={18} className="shrink-0 text-amber-600" />
          <span className="font-medium">
            When All outlets selected date filter available with only date.
          </span>
        </div>

        {/* Filter Controls */}
        <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-4">
            <label className="min-w-[200px] flex-1 text-xs font-semibold text-muted">
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

            <label className="min-w-[200px] flex-1 text-xs font-semibold text-muted">
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

            <div className="min-w-[200px] flex-1">
              <span className="text-xs font-semibold text-muted">
                Select Outlet
              </span>
              <div className="mt-1">
                <SearchableSelect
                  label=""
                  value={selectedOutlet}
                  options={OUTLET_OPTIONS}
                  onChange={setSelectedOutlet}
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

        {/* Content Card / Table / Empty State */}
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
                    <th className="px-4 py-3">Outlet</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Action Description</th>
                    <th className="px-4 py-3">Performed By</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-page/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                        {log.dateTime}
                      </td>
                      <td className="px-4 py-3 text-muted">{log.outlet}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {log.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {log.performedBy}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-success">
                        {log.status}
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
