import { useState } from 'react'
import { Calendar, Filter, RotateCcw, Search } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

interface MenuTriggerLogEntry {
  id: string
  dateTime: string
  thirdPartyUser: string
  triggerEvent: string
  status: 'Success' | 'Failed' | 'Pending'
  responseCode: number
}

const SAMPLE_TRIGGER_LOGS: MenuTriggerLogEntry[] = [
  {
    id: 'mt-1',
    dateTime: '13 Aug 2026 10:45:10',
    thirdPartyUser: 'Zomato Integration API',
    triggerEvent: 'Menu Callback Item Price Update',
    status: 'Success',
    responseCode: 200,
  },
  {
    id: 'mt-2',
    dateTime: '13 Aug 2026 09:12:00',
    thirdPartyUser: 'Swiggy UrbanPiper Webhook',
    triggerEvent: 'Item Stock Out Trigger (Vada Pav)',
    status: 'Success',
    responseCode: 200,
  },
]

const THIRDPARTY_USER_OPTIONS = [
  'Select Thirdparty User',
  'All Thirdparty Users',
  'Zomato Integration API',
  'Swiggy UrbanPiper Webhook',
  'Magicpin Direct Sync',
  'POS-Eble POS Callback Engine',
]

export default function MenuTriggerLogs() {
  const [fromDate, setFromDate] = useState('13 Aug 2026 00:00:00')
  const [toDate, setToDate] = useState('13 Aug 2026 23:59:59')
  const [selectedUser, setSelectedUser] = useState('Select Thirdparty User')
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [isSearched, setIsSearched] = useState(true)
  const [logs, setLogs] = useState<MenuTriggerLogEntry[]>([])
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setIsSearched(true)
    if (selectedUser === 'Select Thirdparty User') {
      setLogs([])
    } else {
      setLogs(
        SAMPLE_TRIGGER_LOGS.filter(
          (l) =>
            selectedUser === 'All Thirdparty Users' ||
            l.thirdPartyUser.toLowerCase().includes(selectedUser.toLowerCase()),
        ),
      )
    }
    showToast('Search applied')
  }

  function handleReset() {
    setFromDate('13 Aug 2026 00:00:00')
    setToDate('13 Aug 2026 23:59:59')
    setSelectedUser('Select Thirdparty User')
    setShowMoreFilters(false)
    setLogs([])
    setIsSearched(true)
    showToast('Filters reset')
  }

  return (
    <ReportsPageShell
      title="Online Menu Trigger Logs"
      activeItem="user-logs-menu-trigger"
    >
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

            <div className="min-w-[200px] flex-1">
              <span className="text-xs font-semibold text-muted">
                Select Thirdparty User
              </span>
              <div className="mt-1">
                <SearchableSelect
                  label=""
                  value={selectedUser}
                  options={THIRDPARTY_USER_OPTIONS}
                  onChange={setSelectedUser}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <OutlineButton
                variant="gray"
                onClick={() => {
                  setShowMoreFilters(!showMoreFilters)
                  showToast(
                    showMoreFilters
                      ? 'Additional filters closed'
                      : 'Additional filters opened',
                  )
                }}
              >
                <Filter size={15} />
                More Filters
              </OutlineButton>
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

          {/* More Filters Extended Panel */}
          {showMoreFilters ? (
            <div className="mt-4 border-t border-line pt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="text-xs font-semibold text-muted">
                Event Status
                <select className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none">
                  <option value="All">All Statuses</option>
                  <option value="Success">Success (200 OK)</option>
                  <option value="Failed">Failed (Error)</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-muted">
                Response Code
                <input
                  type="text"
                  placeholder="e.g. 200, 500"
                  className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none"
                />
              </label>
            </div>
          ) : null}
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
                    <th className="px-4 py-3">Thirdparty User</th>
                    <th className="px-4 py-3">Trigger Event</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Response Code</th>
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
                        {l.thirdPartyUser}
                      </td>
                      <td className="px-4 py-3 text-muted">{l.triggerEvent}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs font-bold text-ink">
                        {l.responseCode}
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
