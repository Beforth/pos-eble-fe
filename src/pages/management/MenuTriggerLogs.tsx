import { useEffect, useState } from 'react'

import { showToast } from '../../utils/toast'
import { Calendar, ChevronLeft, ChevronRight, Filter, RotateCcw, Search } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { listTriggerLogsApi } from '../../services/menuService'
import type { MenuTriggerLog } from '../../types/menu'

const THIRDPARTY_USER_OPTIONS = [
  'Select Thirdparty User',
  'All Thirdparty Users',
  'Zomato Integration API',
  'Swiggy UrbanPiper Webhook',
  'Magicpin Direct Sync',
  'POS-Eble POS Callback Engine',
]

const PAGE_SIZE = 20

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

function sourceName(log: MenuTriggerLog): string {
  if (log.template_name) return log.template_name
  if (log.schedule_name) return log.schedule_name
  return '—'
}

export default function MenuTriggerLogs() {
  const { encryptedOutletId } = useAuth()
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedUser, setSelectedUser] = useState('Select Thirdparty User')
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<MenuTriggerLog[]>([])
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [next, setNext] = useState<string | null>(null)
  const [previous, setPrevious] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) return
    setLoading(true)
    listTriggerLogsApi(encryptedOutletId, { page, page_size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        setLogs(res.results)
        setCount(res.count)
        setNext(res.next)
        setPrevious(res.previous)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error ? error.message : 'Failed to load trigger logs',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, page])

  function handleReset() {
    setFromDate('')
    setToDate('')
    setSelectedUser('Select Thirdparty User')
    setShowMoreFilters(false)
    setPage(1)
    showToast('Filters reset')
  }

  return (
    <ReportsPageShell
      title="Online Menu Trigger Logs"
      activeItem="user-logs-menu-trigger"
    >

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
              <PrimaryButton onClick={() => setPage(1)}>
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
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <span className="text-sm text-muted">Loading...</span>
            </div>
          ) : logs.length === 0 ? (
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
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-ink">
                  <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {logs.map((l) => (
                      <tr
                        key={l.id}
                        className="transition-colors hover:bg-page/50"
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                          {formatDateTime(l.created_at)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-ink">
                          {sourceName(l)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                            {l.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted" title={JSON.stringify(l.details)}>
                          {(() => {
                            const raw = JSON.stringify(l.details)
                            return raw.length > 60 ? raw.slice(0, 57) + '...' : raw
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-muted">
                  {count} total record{count === 1 ? '' : 's'}
                </span>
                <div className="flex items-center gap-2">
                  <OutlineButton
                    variant="gray"
                    className={
                      page <= 1 || previous === null
                        ? 'cursor-default opacity-40'
                        : ''
                    }
                    onClick={
                      page <= 1 || previous === null
                        ? undefined
                        : () => setPage((p) => Math.max(1, p - 1))
                    }
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </OutlineButton>
                  <span className="text-xs font-medium text-muted">
                    Page {page}
                  </span>
                  <OutlineButton
                    variant="gray"
                    className={
                      next === null ? 'cursor-default opacity-40' : ''
                    }
                    onClick={
                      next === null
                        ? undefined
                        : () => setPage((p) => p + 1)
                    }
                  >
                    Next
                    <ChevronRight size={14} />
                  </OutlineButton>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ReportsPageShell>
  )
}
