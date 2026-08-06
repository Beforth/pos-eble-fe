import { useMemo, useState } from 'react'
import {
  BarChart3,
  ChevronDown,
  CircleHelp,
  LayoutGrid,
} from 'lucide-react'
import { OnlineOrdersTable } from '../components/online-orders/OnlineOrdersTable'
import { ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import {
  onlineOrdersList,
  type OnlineAggregator,
} from '../mocks/onlineOrdersData'
import { brand } from '../theme/brand'

const PAGE_SIZE = 5

function AggregatorMark({ name }: { name: 'Zomato' | 'Swiggy' }) {
  if (name === 'Zomato') {
    return (
      <span className="flex size-5 items-center justify-center rounded bg-[#E23744] text-[10px] font-black text-white">
        Z
      </span>
    )
  }
  return (
    <span className="flex size-5 items-center justify-center rounded-full bg-[#FC8019] text-[10px] font-black text-white">
      S
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
  const [appliedOrderNo, setAppliedOrderNo] = useState('')
  const [appliedStatus, setAppliedStatus] = useState('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const closeOtherDrawers = () => {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  const filtered = useMemo(() => {
    return onlineOrdersList.filter((row) => {
      const tabOk = tab === 'All' || row.aggregator === tab
      const statusOk =
        appliedStatus === 'all' ||
        row.status.toLowerCase() === appliedStatus.toLowerCase()
      const orderOk =
        !appliedOrderNo.trim() ||
        row.orderNo.includes(appliedOrderNo.trim()) ||
        row.customerName.toLowerCase().includes(appliedOrderNo.trim().toLowerCase())
      return tabOk && statusOk && orderOk
    })
  }, [tab, appliedOrderNo, appliedStatus])

  const visibleRows = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  function applyFilters() {
    setAppliedOrderNo(orderNo)
    setAppliedStatus(status)
    setVisibleCount(PAGE_SIZE)
  }

  function showAll() {
    setRecordType('24h')
    setStatus('all')
    setOrderNo('')
    setAppliedOrderNo('')
    setAppliedStatus('all')
    setVisibleCount(onlineOrdersList.length)
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
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-primary bg-card px-3 text-sm font-medium text-primary"
              >
                <BarChart3 size={14} />
                Last 5 Days Orders
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
              >
                <CircleHelp size={14} className="text-primary" />
                Aggregator Help Center
              </button>
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
          <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-line bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
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
                placeholder="Order No. / Customer"
                className="mt-1 h-9 w-full rounded-lg border border-line px-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <button
              type="button"
              onClick={applyFilters}
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
          </div>

          <OnlineOrdersTable rows={visibleRows} />

          {filtered.length === 0 ? (
            <div className="mt-4 rounded-xl border border-line bg-card px-6 py-16 text-center">
              <p className="text-base font-semibold text-ink">No Results Found</p>
              <p className="mt-1 text-sm text-muted">
                We couldn&apos;t find a match for your search.
              </p>
            </div>
          ) : (
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
          )}
        </main>
      </div>
    </div>
  )
}
