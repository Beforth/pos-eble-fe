import { useCallback, useEffect, useState } from 'react'
import { Globe, Loader2, RefreshCw, Search } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { AcceptOrderCard } from '../components/online-orders/AcceptOrderCard'
import { ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import {
  acceptOnlineOrderApi,
  listOnlineOrdersApi,
  rejectOnlineOrderApi,
  type OnlineOrder,
  type OnlineOrderList,
  type OnlineOrderStatus,
} from '../services/onlineOrderApi'
import { subscribeToRail } from '../services/liveRailClient'
import { useChrome } from '../state/ChromeContext'
import { useOnlineOrders } from '../state/OnlineOrdersContext'
import { brand } from '../theme/brand'
import { showToast } from '../utils/toast'

type Tab = 'received' | 'in_progress' | 'closed'

const TABS: Array<{ id: Tab; label: string; statuses: OnlineOrderStatus[] }> = [
  { id: 'received', label: 'New', statuses: ['received'] },
  { id: 'in_progress', label: 'Accepted', statuses: ['accepted', 'auto_accepted'] },
  { id: 'closed', label: 'Closed', statuses: ['rejected', 'cancelled'] },
]

const PLATFORMS: Array<{ id: string; label: string }> = [
  { id: '', label: 'All' },
  { id: 'zomato', label: 'Zomato' },
  { id: 'swiggy', label: 'Swiggy' },
]

const POLL_MS = 15_000
const RAIL_EVENTS = new Set(['online_order.received', 'online_order.updated'])

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

/**
 * Where online orders are answered. Deliberately a page of its own: a new order
 * never interrupts whatever the cashier is doing, it just appears here and in
 * the header counter. The older Online Orders page is unchanged.
 */
export default function AcceptOnlineOrders() {
  const { encryptedOutletId, token } = useAuth()
  const { collapsed, toggleCollapsed } = useChrome()
  const { refresh: refreshCounter } = useOnlineOrders()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [supportOpen, setSupportOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [actionCenterOpen, setActionCenterOpen] = useState(false)

  const [tab, setTab] = useState<Tab>('received')
  const [platform, setPlatform] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [data, setData] = useState<OnlineOrderList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const refetch = useCallback(() => setReload((n) => n + 1), [])

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput), 350)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (!encryptedOutletId) {
      setLoading(false)
      return
    }
    let cancelled = false
    const statuses = TABS.find((t) => t.id === tab)?.statuses ?? []
    listOnlineOrdersApi(encryptedOutletId, { status: statuses, platform, search })
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(false)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, tab, platform, search, reload])

  // New orders and Wera's own updates arrive over the live rail; the poll is the
  // fallback for a dropped connection.
  useEffect(() => {
    if (!encryptedOutletId || !token) return
    return subscribeToRail({
      outletId: encryptedOutletId,
      token,
      onEvent: (event) => {
        if (RAIL_EVENTS.has(event)) refetch()
      },
    })
  }, [encryptedOutletId, token, refetch])

  useEffect(() => {
    const timer = window.setInterval(refetch, POLL_MS)
    return () => window.clearInterval(timer)
  }, [refetch])

  const hasWaiting = tab === 'received' && (data?.results.length ?? 0) > 0
  useEffect(() => {
    if (!hasWaiting) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [hasWaiting])

  async function handleAccept(order: OnlineOrder, minutes: number) {
    if (!encryptedOutletId) return
    setBusyId(order.id)
    try {
      await acceptOnlineOrderApi(encryptedOutletId, order.id, minutes)
      showToast('Order accepted - kitchen ticket sent')
    } catch (failure) {
      showToast(errorText(failure, 'Could not accept the order'))
    } finally {
      setBusyId(null)
      refetch()
      refreshCounter()
    }
  }

  async function handleReject(order: OnlineOrder, reasonId: number) {
    if (!encryptedOutletId) return
    setBusyId(order.id)
    try {
      await rejectOnlineOrderApi(encryptedOutletId, order.id, reasonId)
      showToast('Order rejected')
    } catch (failure) {
      showToast(errorText(failure, 'Could not reject the order'))
    } finally {
      setBusyId(null)
      refetch()
      refreshCounter()
    }
  }

  const closeOtherDrawers = () => {
    setSupportOpen(false)
    setNotificationsOpen(false)
    setActionCenterOpen(false)
  }

  const count = (id: Tab) => data?.counts[id] ?? 0

  return (
    <div className="min-h-screen bg-page">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapsed}
        onCloseMobile={() => setMobileOpen(false)}
        activeItem="accept-orders"
      />
      <SupportAgentDrawer open={supportOpen} onClose={() => setSupportOpen(false)} />
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-lg font-bold text-ink sm:text-xl">
                <Globe size={20} className="text-primary" />
                Accept Online Orders
              </h1>
              <p className="mt-0.5 text-xs text-muted">
                Zomato and Swiggy orders appear here by themselves. Answer within
                3 minutes, or Wera accepts them for you.
              </p>
            </div>
            <button
              type="button"
              onClick={refetch}
              aria-label="Refresh online orders"
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:border-muted"
            >
              <RefreshCw size={15} className="text-muted" />
              Refresh
            </button>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div role="tablist" aria-label="Order status" className="flex gap-1 rounded-lg bg-card p-1 shadow-[0_0_0_1px_var(--color-line)]">
              {TABS.map((item) => {
                const active = tab === item.id
                const n = count(item.id)
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(item.id)}
                    className={`inline-flex h-8 cursor-pointer items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
                      active ? 'bg-primary text-white' : 'text-ink hover:bg-page'
                    }`}
                  >
                    {item.label}
                    <span
                      className={`rounded-full px-1.5 text-[11px] font-bold leading-5 ${
                        active
                          ? 'bg-white/25 text-white'
                          : item.id === 'received' && n > 0
                            ? 'bg-primary text-white'
                            : 'bg-page text-muted'
                      }`}
                    >
                      {n}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-1">
              {PLATFORMS.map((item) => (
                <button
                  key={item.id || 'all'}
                  type="button"
                  aria-pressed={platform === item.id}
                  onClick={() => setPlatform(item.id)}
                  className={`inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-xs font-semibold ${
                    platform === item.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-line bg-card text-muted hover:text-ink'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="relative ml-auto w-full sm:w-64">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Order id, name or phone"
                aria-label="Search online orders"
                className="h-9 w-full rounded-lg border border-line bg-card pl-8 pr-3 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
          </div>

          {loading && !data ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-line bg-card">
              <Loader2 size={22} className="animate-spin text-primary" />
            </div>
          ) : error && !data ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 text-center">
              <p className="text-base font-semibold text-ink">
                Couldn't load online orders
              </p>
              <p className="mt-1 text-sm text-muted">Check your connection and retry.</p>
              <button
                type="button"
                onClick={refetch}
                className="mt-4 inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:border-muted"
              >
                <RefreshCw size={15} className="text-muted" />
                Retry
              </button>
            </div>
          ) : data && data.results.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-card px-6 text-center">
              <p className="text-sm font-semibold text-ink">
                {tab === 'received'
                  ? 'No new online orders'
                  : tab === 'in_progress'
                    ? 'No accepted orders in the last 3 days'
                    : 'Nothing closed in the last 3 days'}
              </p>
              <p className="mt-1 text-xs text-muted">
                {tab === 'received'
                  ? 'New orders will show up here by themselves.'
                  : 'Try another tab or clear the filters.'}
              </p>
            </div>
          ) : data ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {data.results.map((order) => (
                <AcceptOrderCard
                  key={order.id}
                  order={order}
                  now={now}
                  defaultPreparation={data.default_preparation_time}
                  reasons={data.rejection_reasons}
                  busy={busyId === order.id}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
