import { useCallback, useEffect, useRef, useState } from 'react'
import { Globe, Loader2, RefreshCw, Search } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { AcceptOrderCard, WebsiteOrderCard } from '../components/online-orders/AcceptOrderCard'
import { ActionCenterDrawer } from '../components/layout/ActionCenterDrawer'
import { NotificationsDrawer } from '../components/layout/NotificationsDrawer'
import { Sidebar } from '../components/layout/Sidebar'
import { SupportAgentDrawer } from '../components/layout/SupportAgentDrawer'
import { TopBar } from '../components/layout/TopBar'
import {
  acceptOnlineOrderApi,
  listOnlineOrdersApi,
  markFoodReadyApi,
  rejectOnlineOrderApi,
  type OnlineOrder,
  type OnlineOrderStatus,
  type RejectionReason,
} from '../services/onlineOrderApi'
import {
  acceptWebsiteOrderApi,
  markWebsiteOrderDeliveredApi,
  markWebsiteOrderOutForDeliveryApi,
  listWebsiteOrdersApi,
  rejectWebsiteOrderApi,
  WEBSITE_REJECT_REASONS,
  WEBSITE_TAB_STATUSES,
  type WebsiteOrder,
} from '../services/websiteOrderApi'
import { subscribeToRail } from '../services/liveRailClient'
import { useChrome } from '../state/ChromeContext'
import { useOnlineOrders } from '../state/OnlineOrdersContext'
import { brand } from '../theme/brand'
import { showError, showToast } from '../utils/toast'

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
  { id: 'website', label: 'Website' },
]

/** Wera orders and first-party website orders share one queue; the data stays separate. */
type Row =
  | { source: 'wera'; order: OnlineOrder }
  | { source: 'website'; order: WebsiteOrder }

interface QueueData {
  rows: Row[]
  counts: Record<Tab, number>
  defaultPreparation: number
  reasons: RejectionReason[]
}

const FALLBACK_PREPARATION = 20

const POLL_MS = 15_000
const RAIL_EVENTS = new Set([
  'online_order.received',
  'online_order.updated',
  'website_order.received',
  'website_order.updated',
])

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
  const [data, setData] = useState<QueueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  // A source that is down is reported once, not on every 15 s poll.
  const failedSources = useRef({ wera: false, website: false })

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
    const wantWera = platform !== 'website'
    const wantWebsite = platform === '' || platform === 'website'
    const empty = { results: [], counts: { received: 0, in_progress: 0, closed: 0 } }
    Promise.allSettled([
      wantWera
        ? listOnlineOrdersApi(encryptedOutletId, { status: statuses, platform, search })
        : Promise.resolve(null),
      wantWebsite
        ? listWebsiteOrdersApi(encryptedOutletId, {
            status: WEBSITE_TAB_STATUSES[tab],
            search,
          })
        : Promise.resolve(null),
    ])
      .then(([wera, website]) => {
        if (cancelled) return
        const failed = {
          wera: wera.status === 'rejected',
          website: website.status === 'rejected',
        }
        if (failed.wera && failed.website) {
          setError(true)
          return
        }
        if (failed.wera && !failedSources.current.wera) {
          showError("Couldn't load Zomato and Swiggy orders")
        }
        if (failed.website && !failedSources.current.website) {
          showError("Couldn't load website orders")
        }
        failedSources.current = failed
        const weraData = wera.status === 'fulfilled' ? wera.value : null
        const webData = website.status === 'fulfilled' ? website.value : null
        const rows: Row[] = [
          ...(weraData?.results ?? []).map((order): Row => ({ source: 'wera', order })),
          ...(webData?.results ?? []).map((order): Row => ({ source: 'website', order })),
        ].sort(
          (a, b) => Date.parse(b.order.received_at) - Date.parse(a.order.received_at),
        )
        const wc = weraData?.counts ?? empty.counts
        const bc = webData?.counts ?? empty.counts
        setData({
          rows,
          counts: {
            received: wc.received + bc.received,
            in_progress: wc.in_progress + bc.in_progress,
            closed: wc.closed + bc.closed,
          },
          defaultPreparation: weraData?.default_preparation_time ?? FALLBACK_PREPARATION,
          reasons: weraData?.rejection_reasons ?? [],
        })
        setError(false)
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

  const hasWaiting = tab === 'received' && (data?.rows.length ?? 0) > 0
  useEffect(() => {
    if (!hasWaiting) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [hasWaiting])

  async function handleAccept(row: Row, minutes: number) {
    if (!encryptedOutletId) return
    const order = row.order
    setBusyId(order.id)
    try {
      if (row.source === 'website') {
        await acceptWebsiteOrderApi(encryptedOutletId, order.id, minutes)
      } else {
        await acceptOnlineOrderApi(encryptedOutletId, order.id, minutes)
      }
      showToast('Order accepted - kitchen ticket sent')
    } catch (failure) {
      showToast(errorText(failure, 'Could not accept the order'))
    } finally {
      setBusyId(null)
      refetch()
      refreshCounter()
    }
  }

  async function handleReject(row: Row, reasonId: number) {
    if (!encryptedOutletId) return
    const order = row.order
    setBusyId(order.id)
    try {
      if (row.source === 'website') {
        await rejectWebsiteOrderApi(encryptedOutletId, order.id, reasonId)
      } else {
        await rejectOnlineOrderApi(encryptedOutletId, order.id, reasonId)
      }
      showToast('Order rejected')
    } catch (failure) {
      showToast(errorText(failure, 'Could not reject the order'))
    } finally {
      setBusyId(null)
      refetch()
      refreshCounter()
    }
  }

  async function handleWebsiteStep(
    order: WebsiteOrder,
    call: (outletId: string, id: string) => Promise<WebsiteOrder>,
    done: string,
    failed: string,
  ) {
    if (!encryptedOutletId) return
    setBusyId(order.id)
    try {
      await call(encryptedOutletId, order.id)
      showToast(done)
    } catch (failure) {
      showToast(errorText(failure, failed))
    } finally {
      setBusyId(null)
      refetch()
      refreshCounter()
    }
  }

  async function handleFoodReady(order: OnlineOrder) {
    if (!encryptedOutletId) return
    setBusyId(order.id)
    try {
      await markFoodReadyApi(encryptedOutletId, order.id)
      showToast('Wera told the food is ready')
    } catch (failure) {
      showToast(errorText(failure, 'Could not mark the food ready'))
    } finally {
      setBusyId(null)
      refetch()
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
                Zomato, Swiggy and website orders appear here by themselves. Answer
                within 3 minutes, or they are accepted for you.
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
          ) : data && data.rows.length === 0 ? (
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
              {data.rows.map((row) =>
                row.source === 'website' ? (
                  <WebsiteOrderCard
                    key={`website-${row.order.id}`}
                    order={row.order}
                    now={now}
                    defaultPreparation={data.defaultPreparation}
                    reasons={WEBSITE_REJECT_REASONS}
                    busy={busyId === row.order.id}
                    onAccept={(_order, minutes) => handleAccept(row, minutes)}
                    onReject={(_order, reasonId) => handleReject(row, reasonId)}
                    onOutForDelivery={(o) =>
                      handleWebsiteStep(
                        o,
                        markWebsiteOrderOutForDeliveryApi,
                        'Order is out for delivery',
                        'Could not mark the order out for delivery',
                      )
                    }
                    onDelivered={(o) =>
                      handleWebsiteStep(
                        o,
                        markWebsiteOrderDeliveredApi,
                        'Order delivered',
                        'Could not mark the order delivered',
                      )
                    }
                  />
                ) : (
                  <AcceptOrderCard
                    key={`wera-${row.order.id}`}
                    order={row.order}
                    now={now}
                    defaultPreparation={data.defaultPreparation}
                    reasons={data.reasons}
                    busy={busyId === row.order.id}
                    onAccept={(_order, minutes) => handleAccept(row, minutes)}
                    onReject={(_order, reasonId) => handleReject(row, reasonId)}
                    onFoodReady={handleFoodReady}
                  />
                ),
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
