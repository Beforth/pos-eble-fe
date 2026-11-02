import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { useChrome } from '../state/ChromeContext'
import { useAuth } from '../auth/AuthContext'

import { showToast } from '../utils/toast'
import {
  BarChart3,
  ChevronDown,
  CircleHelp,
  LayoutGrid,
} from 'lucide-react'
import { AllOrdersChart } from '../components/all-orders/AllOrdersChart'
import { OnlineOrdersTable } from '../components/online-orders/OnlineOrdersTable'
import { AggregatorHelpCenterModal } from '../components/online-orders/AggregatorHelpCenterModal'
import { AggregatorLogo } from '../components/common/AggregatorLogo'
import { ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import { listOnlineOrdersApi } from '../services/onlineOrderApi'
import {
  lastDaysSeries,
  toOnlineOrderRow,
  type OnlineAggregator,
  type OnlineOrderRow,
} from '../utils/onlineOrderRows'
import { brand } from '../theme/brand'

const PAGE_SIZE = 5

/** The API serves at most this many days of history. */
const MAX_HISTORY_DAYS = 90
const DAY_MS = 24 * 60 * 60 * 1000

const PRESET_DAYS: Record<string, number> = { '24h': 1, today: 1, '3d': 3, '7d': 7, '30d': 30 }

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseDateInput(value: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? null : date
}

/** How many days back the server must be asked for to cover the filter. */
function daysToFetch(recordType: string, from: string): number {
  if (recordType === 'custom') {
    const start = parseDateInput(from)
    if (!start) return 3
    const span = Math.ceil((Date.now() - start.getTime()) / DAY_MS)
    return Math.min(MAX_HISTORY_DAYS, Math.max(1, span))
  }
  return PRESET_DAYS[recordType] ?? 3
}

function matchesRecordType(
  row: OnlineOrderRow,
  recordType: string,
  from: string,
  to: string,
): boolean {
  const received = new Date(row.receivedAt)
  if (Number.isNaN(received.getTime())) return true
  const now = new Date()

  if (recordType === 'today') {
    return received.toDateString() === now.toDateString()
  }
  if (recordType === '24h') {
    return now.getTime() - received.getTime() <= DAY_MS
  }
  if (recordType === 'custom') {
    const start = parseDateInput(from)
    const end = parseDateInput(to)
    if (start && received < start) return false
    if (end && received >= new Date(end.getTime() + DAY_MS)) return false
    return true
  }
  const days = PRESET_DAYS[recordType]
  if (days) {
    const first = startOfDay(now)
    first.setDate(first.getDate() - (days - 1))
    return received >= first
  }
  return true
}

export default function OnlineOrders() {
  const { collapsed, toggleCollapsed } = useChrome()
  const { encryptedOutletId, user } = useAuth()
  const [orders, setOrders] = useState<OnlineOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  const [tab, setTab] = useState<OnlineAggregator>('All')
  const [recordType, setRecordType] = useState('24h')
  const [status, setStatus] = useState('all')
  const [orderNo, setOrderNo] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [appliedRecordType, setAppliedRecordType] = useState('24h')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')
  const [appliedOrderNo, setAppliedOrderNo] = useState('')
  const [appliedStatus, setAppliedStatus] = useState('all')
  const [filtersApplied, setFiltersApplied] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [chartOpen, setChartOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)


  const closeOtherDrawers = () => {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  const outletName = user?.outlet || brand.outletName

  const fetchDays = daysToFetch(appliedRecordType, appliedFrom)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    try {
      const data = await listOnlineOrdersApi(encryptedOutletId, {
        // At least 5 so the "Last 5 Days Orders" chart is complete.
        days: Math.max(fetchDays, 5),
      })
      setOrders(data.results.map((order) => toOnlineOrderRow(order, outletName)))
      setLoadError('')
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Failed to load online orders',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, outletName, fetchDays])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [load])

  const chartSeries = useMemo(() => lastDaysSeries(orders, 5), [orders])

  const filtered = useMemo(() => {
    const query = appliedOrderNo.trim().toLowerCase()
    return orders.filter((row) => {
      const tabOk = tab === 'All' || row.aggregator === tab
      const recordOk = matchesRecordType(
        row,
        appliedRecordType,
        appliedFrom,
        appliedTo,
      )
      const statusOk =
        appliedStatus === 'all' ||
        row.status.toLowerCase() === appliedStatus.toLowerCase()
      const orderOk =
        !query ||
        row.orderNo.toLowerCase().includes(query) ||
        row.customerName.toLowerCase().includes(query) ||
        Boolean(row.customerPhone?.includes(query))
      return tabOk && recordOk && statusOk && orderOk
    })
  }, [orders, tab, appliedRecordType, appliedFrom, appliedTo, appliedOrderNo, appliedStatus])

  const visibleRows = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  function applyFilters() {
    setAppliedRecordType(recordType)
    setAppliedFrom(fromDate)
    setAppliedTo(toDate)
    setAppliedOrderNo(orderNo)
    setAppliedStatus(status)
    setFiltersApplied(true)
    setVisibleCount(PAGE_SIZE)
  }

  function showAll() {
    setRecordType('24h')
    setFromDate('')
    setToDate('')
    setAppliedFrom('')
    setAppliedTo('')
    setStatus('all')
    setOrderNo('')
    setAppliedRecordType('24h')
    setAppliedOrderNo('')
    setAppliedStatus('all')
    setFiltersApplied(false)
    setTab('All')
    setVisibleCount(orders.length)
    showToast('Filters cleared')
  }

  function handleFilterKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      applyFilters()
    }
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    applyFilters()
  }

  return (
    <div className="min-h-screen bg-page">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem="online-orders"
      />

      <SupportAgentDrawer
        open={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <ActionCenterDrawer
        open={actionCenterOpen}
        onClose={() => setActionCenterOpen(false)}
      />
      <AggregatorHelpCenterModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
      />

      <div
        className={`transition-all duration-300 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[264px]'}`}
      >
        <TopBar
          onMenuClick={() => setMobileOpen(true)}
          onSupportClick={() => {
            closeOtherDrawers()
            setSupportOpen(true)
          }}
          onNotificationsClick={() => {
            closeOtherDrawers()
            setNotificationsOpen(true)
          }}
          outletName={brand.outletName}
        />

        <main className="px-4 py-4 sm:px-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-bold text-ink sm:text-xl">
              Online Orders Activity
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-expanded={chartOpen}
                onClick={() => setChartOpen((prev) => !prev)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary bg-card px-3 text-sm font-medium text-primary hover:bg-primary/5"
              >
                <BarChart3 size={14} />
                Last 5 Days Orders
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    chartOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
              >
                <CircleHelp size={14} className="text-primary" />
                Aggregator Help Center
              </button>
            </div>
          </div>

          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              chartOpen ? 'mb-4 grid-rows-[1fr]' : 'mb-0 grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <AllOrdersChart series={chartSeries} />
            </div>
          </div>

          {/* Aggregator tabs */}
          <div className="mb-4 flex items-center gap-1 border-b border-line">
            {(
              [
                { value: 'All' as const, label: 'All', icon: true },
                { value: 'Zomato' as const, label: 'Zomato' },
                { value: 'Swiggy' as const, label: 'Swiggy' },
              ] as const
            ).map((option) => {
              const active = tab === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTab(option.value)
                    setVisibleCount(PAGE_SIZE)
                  }}
                  className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {'icon' in option && option.icon ? (
                    <LayoutGrid size={15} />
                  ) : (
                    <AggregatorLogo name={option.value as 'Zomato' | 'Swiggy'} size="xs" />
                  )}
                  {option.label}
                </button>
              )
            })}
          </div>

          {/* Filters */}
          <form
            onSubmit={handleFilterSubmit}
            className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-line bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <label className="min-w-[140px] text-xs text-muted">
              Record Type
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none"
              >
                <option value="24h">Last 24 Hrs</option>
                <option value="today">Today</option>
                <option value="3d">Last 3 Days</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </label>
            {recordType === 'custom' ? (
              <>
                <label className="min-w-[140px] text-xs text-muted">
                  From
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
                  />
                </label>
                <label className="min-w-[140px] text-xs text-muted">
                  To
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(e) => setToDate(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
                  />
                </label>
              </>
            ) : null}
            <label className="min-w-[140px] text-xs text-muted">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none"
              >
                <option value="all">All</option>
                <option value="delivered">Delivered</option>
                <option value="received">Received</option>
                <option value="accepted">Accepted</option>
                <option value="food ready">Food Ready</option>
                <option value="dispatched">Dispatched</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label className="min-w-[160px] flex-1 text-xs text-muted">
              Order No.
              <input
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                onKeyDown={handleFilterKeyDown}
                placeholder="Order No. / Customer"
                className="mt-1 h-9 w-full rounded-lg border border-line px-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              className="h-9 rounded-lg border border-primary bg-primary px-4 text-sm font-semibold text-white hover:brightness-95"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={showAll}
              className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Clear Filter
            </button>
            <button
              type="button"
              className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Export Report
            </button>
          </form>

          {filtersApplied && (
            <p className="mb-3 text-xs text-muted">
              Showing {filtered.length} result
              {filtered.length === 1 ? '' : 's'}
              {appliedStatus !== 'all' ? ` · Status: ${appliedStatus}` : ''}
              {appliedOrderNo.trim()
                ? ` · Search: “${appliedOrderNo.trim()}”`
                : ''}
            </p>
          )}

          {loadError ? (
            <p className="mb-3 text-sm text-primary">{loadError}</p>
          ) : null}

          {loading && orders.length === 0 ? (
            <div className="rounded-xl border border-line bg-card px-6 py-16 text-center text-sm text-muted">
              Loading online orders…
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-line bg-card px-6 py-16 text-center">
              <p className="text-base font-semibold text-ink">No Results Found</p>
              <p className="mt-1 text-sm text-muted">
                We couldn&apos;t find a match for your search.
              </p>
            </div>
          ) : (
            <>
              <OnlineOrdersTable rows={visibleRows} />
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!hasMore}
                  onClick={() =>
                    setVisibleCount((n) =>
                      Math.min(filtered.length, n + PAGE_SIZE),
                    )
                  }
                  className="h-9 rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Load More
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
