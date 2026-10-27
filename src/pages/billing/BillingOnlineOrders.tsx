import { useCallback, useEffect, useMemo, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import {
  Bike,
  ChevronLeft,
  Eye,
  Headset,
  LayoutGrid,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { AggregatorLogo, type AggregatorName } from '../../components/common/AggregatorLogo'
import { AggregatorHelpCenterModal } from '../../components/online-orders/AggregatorHelpCenterModal'
import { subscribeToRail } from '../../services/liveRailClient'
import { listOnlineOrdersApi, type OnlineOrder } from '../../services/onlineOrderApi'
import { brand } from '../../theme/brand'
import { formatINR } from '../../utils/format'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

type StatusKey = 'pending' | 'cancelled' | 'accepted' | 'dispatched' | 'delivered' | 'billed'
type SortKey = 'latest' | 'oldest'
type Panel = 'details' | 'delivery'

const POLL_MS = 30_000
const RAIL_EVENTS = new Set(['online_order.received', 'online_order.updated'])

const PLATFORM_TABS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'zomato', label: 'Zomato' },
  { value: 'swiggy', label: 'Swiggy' },
]

const STATUS_STYLE: Record<StatusKey, { label: string; panel: string; dot: string }> = {
  pending: { label: 'Pending', panel: 'bg-sky-200', dot: 'bg-sky-300' },
  cancelled: { label: 'Cancelled', panel: 'bg-red-200', dot: 'bg-red-400' },
  accepted: { label: 'Accepted', panel: 'bg-cyan-100', dot: 'bg-cyan-200' },
  dispatched: { label: 'Dispatched', panel: 'bg-yellow-100', dot: 'bg-yellow-200' },
  delivered: { label: 'Delivered / Finished', panel: 'bg-emerald-300', dot: 'bg-emerald-400' },
  billed: { label: 'KOT or BILL Created', panel: 'bg-card', dot: 'border border-line bg-card' },
}

const LEGEND_ORDER: StatusKey[] = [
  'pending',
  'cancelled',
  'accepted',
  'dispatched',
  'delivered',
  'billed',
]

const ORDER_TYPE_LABEL: Record<OnlineOrder['order_type'], string> = {
  'dine-in': 'DINE IN',
  delivery: 'DELIVERY',
  'pick-up': 'PARCEL',
}

function statusKey(order: OnlineOrder): StatusKey {
  if (order.status === 'cancelled' || order.status === 'rejected') return 'cancelled'
  if (order.status === 'received') return 'pending'
  const rider = order.rider.status.toLowerCase()
  if (rider === 'delivered') return 'delivered'
  if (rider && rider !== 'none') return 'dispatched'
  return order.has_pos_order ? 'billed' : 'accepted'
}

function placedAt(order: OnlineOrder): { time: number; text: string } {
  const d = new Date(order.ordered_at ?? order.received_at)
  if (Number.isNaN(d.getTime())) return { time: 0, text: '—' }
  const pad = (n: number) => String(n).padStart(2, '0')
  const month = d.toLocaleString('en-GB', { month: 'short' })
  return {
    time: d.getTime(),
    text: `${pad(d.getHours())}:${pad(d.getMinutes())} | ${pad(d.getDate())} ${month}`,
  }
}

function platformName(platform: string): AggregatorName | null {
  const key = platform.toLowerCase()
  if (key === 'zomato') return 'Zomato'
  if (key === 'swiggy') return 'Swiggy'
  return null
}

function titleCase(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Online'
}

export default function BillingOnlineOrders() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId, token } = useAuth()
  const [billNo, setBillNo] = useState('')

  const [orders, setOrders] = useState<OnlineOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState('')
  const [status, setStatus] = useState<StatusKey | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('latest')
  const [open, setOpen] = useState<{ id: string; panel: Panel } | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)

  const load = useCallback(
    async (quiet = false) => {
      if (!encryptedOutletId) return
      if (!quiet) setLoading(true)
      try {
        const result = await listOnlineOrdersApi(encryptedOutletId)
        setOrders(result.results)
      } catch (error) {
        if (!quiet) {
          showToast(error instanceof Error ? error.message : 'Failed to load online orders')
        }
      } finally {
        setLoading(false)
      }
    },
    [encryptedOutletId],
  )

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
    const timer = window.setInterval(() => void load(true), POLL_MS)
    return () => window.clearInterval(timer)
  }, [load])

  // New orders and status changes arrive over the live rail; the poll above is
  // the fallback for a dropped connection.
  useEffect(() => {
    if (!encryptedOutletId || !token) return
    return subscribeToRail({
      outletId: encryptedOutletId,
      token,
      onEvent: (event) => {
        if (RAIL_EVENTS.has(event)) void load(true)
      },
    })
  }, [encryptedOutletId, token, load])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = orders.filter((o) => {
      if (platform && o.platform.toLowerCase() !== platform) return false
      if (status !== 'all' && statusKey(o) !== status) return false
      if (!q) return true
      return (
        o.external_order_id.toLowerCase().includes(q) ||
        o.reference.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.phone.toLowerCase().includes(q)
      )
    })
    list.sort((a, b) => {
      const diff = placedAt(b).time - placedAt(a).time
      return sort === 'oldest' ? -diff : diff
    })
    return list
  }, [orders, platform, status, search, sort])

  function toggle(id: string, panel: Panel) {
    setOpen((cur) => (cur?.id === id && cur.panel === panel ? null : { id, panel }))
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <AggregatorHelpCenterModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      <div className="flex items-center justify-between border-b border-line bg-card px-4 sm:px-6">
        <nav className="flex" aria-label="Order lists">
          <Link
            to="/billing/all-orders"
            className="px-4 py-3 text-sm font-medium text-ink hover:text-primary"
          >
            Current Order
          </Link>
          <span
            aria-current="page"
            className="border-b-2 border-primary px-4 py-3 text-sm font-semibold text-primary"
          >
            Online Order
          </span>
          <Link
            to="/billing/advance-orders"
            className="px-4 py-3 text-sm font-medium text-ink hover:text-primary"
          >
            Advance Order
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            aria-label="Refresh orders"
            data-tooltip="Refresh orders"
            className="inline-flex size-9 items-center justify-center rounded-lg text-ink hover:bg-page"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/billing/operations')}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>
      </div>

      <div className="flex border-b border-line bg-card px-4 sm:px-6">
        <div className="flex overflow-x-auto" role="tablist" aria-label="Aggregator">
          {PLATFORM_TABS.map((tab) => {
            const active = platform === tab.value
            const logo = platformName(tab.value)
            return (
              <button
                key={tab.value || 'all'}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPlatform(tab.value)}
                className={`flex min-w-[96px] flex-col items-center gap-1 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent text-ink hover:bg-page'
                }`}
              >
                {logo ? <AggregatorLogo name={logo} size="sm" /> : <LayoutGrid size={22} />}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order no., name or phone"
              aria-label="Search online orders"
              className="h-9 w-full rounded-lg border border-line bg-card pl-9 pr-9 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                data-tooltip="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            Sort By
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 rounded-lg border border-line bg-primary/10 px-2.5 text-sm text-ink outline-none focus:border-primary"
            >
              <option value="latest">Latest Date</option>
              <option value="oldest">Oldest Date</option>
            </select>
          </label>
        </div>

        <div
          className="mb-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm text-ink"
          role="group"
          aria-label="Filter by order status"
        >
          {LEGEND_ORDER.map((key) => {
            const active = status === key
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(active ? 'all' : key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 ${
                  active ? 'bg-ink/10 font-semibold' : 'hover:bg-card'
                }`}
              >
                <span className={`size-3.5 rounded-full ${STATUS_STYLE[key].dot}`} />
                {STATUS_STYLE[key].label}
              </button>
            )
          })}
        </div>

        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 py-12 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading online orders…
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-card px-6 py-12 text-center">
            <p className="text-base font-semibold text-ink">No online orders</p>
            <p className="mt-1 text-sm text-muted">
              Orders from Zomato and Swiggy will appear here.
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-line bg-card">
            {rows.map((order) => {
              const key = statusKey(order)
              const logo = platformName(order.platform)
              const panel = open?.id === order.id ? open.panel : null
              const placed = placedAt(order)
              const support = titleCase(order.platform)
              return (
                <li key={order.id} className="border-b border-line last:border-0">
                  <div className="grid grid-cols-1 items-center gap-3 p-2 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_120px_minmax(0,1.2fr)]">
                    <div className="flex items-center gap-3 px-2">
                      {logo ? (
                        <AggregatorLogo name={logo} size="md" />
                      ) : (
                        <span className="size-10 rounded bg-page" />
                      )}
                      <div className="min-w-0">
                        <span className="rounded-md bg-page px-2 py-0.5 text-xs font-semibold text-ink">
                          {ORDER_TYPE_LABEL[order.order_type]}
                        </span>
                        <p className="mt-1 truncate text-sm font-bold tabular-nums text-ink">
                          {order.external_order_id || order.reference}
                        </p>
                        <p className="truncate text-xs font-medium text-ink">
                          {support} | {brand.outletName}
                        </p>
                      </div>
                    </div>

                    <div className="border-line px-2 md:border-l">
                      <p className="text-xs text-muted">Placed at: {placed.text}</p>
                      <p className="mt-0.5 truncate text-sm font-bold text-ink">
                        {order.customer.name || '—'}
                      </p>
                      {order.order_otp ? (
                        <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          OTP: {order.order_otp}
                        </span>
                      ) : null}
                    </div>

                    <div className="border-line px-2 md:border-l">
                      <p className="text-xs text-muted">Total(₹)</p>
                      <p className="text-sm font-bold tabular-nums text-ink">
                        {Number(order.net_amount).toFixed(2)}
                      </p>
                      <p className="text-xs font-medium text-ink">
                        {order.payment_mode === 'cash' ? 'Cash' : 'Online'}
                      </p>
                    </div>

                    <div
                      className={`flex flex-wrap items-center justify-center gap-2 rounded-lg p-2 ${STATUS_STYLE[key].panel}`}
                    >
                      <button
                        type="button"
                        aria-expanded={panel === 'details'}
                        onClick={() => toggle(order.id, 'details')}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => setHelpOpen(true)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
                      >
                        <Headset size={14} />
                        {support} Support
                      </button>
                      <button
                        type="button"
                        aria-expanded={panel === 'delivery'}
                        onClick={() => toggle(order.id, 'delivery')}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
                      >
                        <Bike size={14} />
                        Delivery Status
                      </button>
                    </div>
                  </div>

                  {panel === 'details' ? (
                    <div className="border-t border-line bg-page/60 px-6 py-3 text-sm">
                      <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                        <p>
                          <span className="text-muted">Customer: </span>
                          {order.customer.name || '—'}
                          {order.customer.phone ? ` · ${order.customer.phone}` : ''}
                        </p>
                        <p>
                          <span className="text-muted">Address: </span>
                          {order.customer.address || '—'}
                        </p>
                        {order.instructions ? (
                          <p className="sm:col-span-2">
                            <span className="text-muted">Instructions: </span>
                            {order.instructions}
                          </p>
                        ) : null}
                      </div>
                      <ul className="mt-2 space-y-1">
                        {order.items.map((item, index) => (
                          <li key={`${item.name}-${index}`} className="flex justify-between gap-4">
                            <span>
                              {item.qty} × {item.name}
                              {item.note ? <span className="text-muted"> ({item.note})</span> : null}
                            </span>
                            <span className="tabular-nums">{formatINR(Number(item.line_total), 2)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-right text-xs text-muted">
                        Gross {formatINR(Number(order.gross_amount), 2)} · Discount{' '}
                        {formatINR(Number(order.discount), 2)} · Net{' '}
                        <span className="font-semibold text-ink">
                          {formatINR(Number(order.net_amount), 2)}
                        </span>
                      </p>
                    </div>
                  ) : null}

                  {panel === 'delivery' ? (
                    <div className="border-t border-line bg-page/60 px-6 py-3 text-sm">
                      {order.rider.name || order.rider.status ? (
                        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-3">
                          <p>
                            <span className="text-muted">Rider: </span>
                            {order.rider.name || '—'}
                          </p>
                          <p>
                            <span className="text-muted">Phone: </span>
                            {order.rider.number || '—'}
                          </p>
                          <p className="uppercase">
                            <span className="normal-case text-muted">Status: </span>
                            {order.rider.status || '—'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted">No rider has been assigned yet.</p>
                      )}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
