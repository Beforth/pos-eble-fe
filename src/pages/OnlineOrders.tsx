import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import {
  BarChart3,
  ChevronDown,
  CircleHelp,
  LayoutGrid,
} from 'lucide-react'
import { AllOrdersChart } from '../components/all-orders/AllOrdersChart'
import { OnlineOrdersTable } from '../components/online-orders/OnlineOrdersTable'
import { AggregatorHelpCenterModal } from '../components/online-orders/AggregatorHelpCenterModal'
import { ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import {
  onlineOrdersChartSeries,
  onlineOrdersList,
  type OnlineAggregator,
  type OnlineOrderRow,
} from '../mocks/onlineOrdersData'
import { brand } from '../theme/brand'

const PAGE_SIZE = 5

/** Parse mock timestamps like `23-07-2026 13:56:52` into a Date. */
function parseOrderDate(value: string): Date | null {
  const match = value.match(
    /^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/,
  )
  if (!match) return null
  const [, dd, mm, yyyy, hh, mi, ss] = match
  return new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(mi),
    Number(ss),
  )
}

/** Use latest order day as "today" so mock data filters meaningfully. */
const REFERENCE_DAY = (() => {
  let latest = new Date(0)
  for (const row of onlineOrdersList) {
    const created = parseOrderDate(row.created)
    if (created && created > latest) latest = created
  }
  return new Date(latest.getFullYear(), latest.getMonth(), latest.getDate())
})()

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function matchesRecordType(row: OnlineOrderRow, recordType: string): boolean {
  if (recordType === 'custom') return true

  const created = parseOrderDate(row.created)
  if (!created) return true

  const day = startOfDay(created)
  const today = REFERENCE_DAY

  if (recordType === 'today') {
    return day.getTime() === today.getTime()
  }

  if (recordType === '24h') {
    const windowStart = new Date(today)
    windowStart.setHours(0, 0, 0, 0)
    const windowEnd = new Date(today)
    windowEnd.setHours(23, 59, 59, 999)
    return created >= windowStart && created <= windowEnd
  }

  if (recordType === '7d') {
    const from = new Date(today)
    from.setDate(from.getDate() - 6)
    from.setHours(0, 0, 0, 0)
    const to = new Date(today)
    to.setHours(23, 59, 59, 999)
    return created >= from && created <= to
  }

  return true
}

function AggregatorMark({ name }: { name: 'Zomato' | 'Swiggy' }) {
  const isSwiggy = name === 'Swiggy'
  return (
    <span className="relative inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded">
      <img
        src={isSwiggy ? '/swiggy.png' : '/zomato.png'}
        alt={`${name} logo`}
        width={isSwiggy ? 40 : 24}
        height={isSwiggy ? 40 : 24}
        className={
          isSwiggy
            ? 'absolute size-10 max-w-none scale-110 object-cover'
            : 'size-6 object-contain'
        }
      />
    </span>
  )
}

export default function OnlineOrders() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  const [tab, setTab] = useState<OnlineAggregator>('All')
  const [recordType, setRecordType] = useState('24h')
  const [status, setStatus] = useState('all')
  const [orderNo, setOrderNo] = useState('')
  const [appliedRecordType, setAppliedRecordType] = useState('24h')
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

  const filtered = useMemo(() => {
    const query = appliedOrderNo.trim().toLowerCase()
    return onlineOrdersList.filter((row) => {
      const tabOk = tab === 'All' || row.aggregator === tab
      const recordOk = matchesRecordType(row, appliedRecordType)
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
  }, [tab, appliedRecordType, appliedOrderNo, appliedStatus])

  const visibleRows = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  function applyFilters() {
    setAppliedRecordType(recordType)
    setAppliedOrderNo(orderNo)
    setAppliedStatus(status)
    setFiltersApplied(true)
    setVisibleCount(PAGE_SIZE)
  }

  function showAll() {
    setRecordType('24h')
    setStatus('all')
    setOrderNo('')
    setAppliedRecordType('24h')
    setAppliedOrderNo('')
    setAppliedStatus('all')
    setFiltersApplied(false)
    setTab('All')
    setVisibleCount(onlineOrdersList.length)
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
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
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
              <AllOrdersChart series={onlineOrdersChartSeries} />
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
                    <AggregatorMark name={option.value as 'Zomato' | 'Swiggy'} />
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
                <option value="7d">Last 7 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </label>
            <label className="min-w-[140px] text-xs text-muted">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 h-9 w-full rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none"
              >
                <option value="all">All</option>
                <option value="delivered">Delivered</option>
                <option value="accepted">Accepted</option>
                <option value="food ready">Food Ready</option>
                <option value="dispatched">Dispatched</option>
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
              Show All
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

          {filtered.length === 0 ? (
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
