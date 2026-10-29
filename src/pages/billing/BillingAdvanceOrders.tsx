import { useCallback, useEffect, useMemo, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronLeft,
  Eye,
  LayoutGrid,
  Loader2,
  Plus,
  Search,
  ShoppingCart,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { AdvanceOrderModal } from '../../components/all-orders/AdvanceOrderModal'
import { AdvanceOrderDetailsModal } from '../../components/billing/AdvanceOrderDetailsModal'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
import { Pagination } from '../../components/common/Pagination'
import {
  cancelAdvanceOrderApi,
  listAdvanceOrdersApi,
  type AdvanceOrderDto,
  type AdvanceOrderStatus,
} from '../../services/orderService'
import { formatINR } from '../../utils/format'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

type RangeKey = 'all' | 'today' | '1' | '2'
type SortKey = 'latest' | 'oldest'

const PAGE_SIZE = 10

const RANGE_TABS: { value: RangeKey; label: string; days?: number }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today', days: 0 },
  { value: '1', label: 'Within 1 Day', days: 1 },
  { value: '2', label: 'Within 2 Day(s)', days: 2 },
]

/** Legend dot and status pill per booking status; the names mirror the Orders page. */
const STATUS_STYLE: Record<
  AdvanceOrderStatus,
  { label: string; dot: string; pill: string }
> = {
  booked: { label: 'Saved Bill', dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-700' },
  confirmed: {
    label: 'Printed Bill',
    dot: 'bg-accent',
    pill: 'bg-accent/15 text-accent',
  },
  cancelled: { label: 'Cancelled Bill', dot: 'bg-ink/40', pill: 'bg-ink/10 text-muted' },
  completed: { label: 'Paid', dot: 'bg-success', pill: 'bg-success/10 text-success' },
}

const LEGEND_ORDER: AdvanceOrderStatus[] = ['booked', 'confirmed', 'cancelled', 'completed']

function toIsoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function addDaysIso(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return toIsoDate(d)
}

function deliveryText(order: AdvanceOrderDto): string {
  if (!order.scheduled_date) return '—'
  return `${order.scheduled_date} ${(order.scheduled_time ?? '').slice(0, 8)}`.trim()
}

/** "Wed, 28 Oct" and "11:43 AM" for a card; a booking without a date shows a dash. */
function deliveryParts(order: AdvanceOrderDto): { date: string; time: string } {
  if (!order.scheduled_date) return { date: '—', time: '' }
  const d = new Date(`${order.scheduled_date}T${(order.scheduled_time ?? '00:00:00').slice(0, 8)}`)
  if (Number.isNaN(d.getTime())) return { date: order.scheduled_date, time: '' }
  return {
    date: d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }),
    time: order.scheduled_time
      ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : '',
  }
}

function createdText(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${toIsoDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

export default function BillingAdvanceOrders() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId } = useAuth()
  const [billNo, setBillNo] = useState('')

  const [orders, setOrders] = useState<AdvanceOrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<RangeKey>('all')
  const [status, setStatus] = useState<AdvanceOrderStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('latest')
  const [pastDate, setPastDate] = useState<string | null>(null)
  const [viewOrder, setViewOrder] = useState<AdvanceOrderDto | null>(null)
  const [cumulativeOpen, setCumulativeOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<AdvanceOrderDto | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    setLoading(true)
    try {
      setOrders(await listAdvanceOrdersApi(encryptedOutletId))
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load advance orders',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void load()
  }, [load])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const today = toIsoDate(new Date())
    const tab = RANGE_TABS.find((t) => t.value === range)
    const list = orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false
      if (pastDate && o.scheduled_date !== pastDate) return false
      if (tab?.days !== undefined) {
        const date = o.scheduled_date ?? ''
        if (date < today || date > addDaysIso(tab.days)) return false
      }
      if (!q) return true
      return (
        o.adv_order_no.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.toLowerCase().includes(q)
      )
    })
    list.sort((a, b) => {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      return sort === 'oldest' ? -diff : diff
    })
    return list
  }, [orders, status, pastDate, range, search, sort])

  const cumulative = useMemo(() => {
    const totals = new Map<string, number>()
    for (const order of rows) {
      if (order.status === 'cancelled') continue
      for (const item of order.items) {
        totals.set(item.name, (totals.get(item.name) ?? 0) + Number(item.qty))
      }
    }
    return Array.from(totals, ([name, quantity]) => ({ name, quantity })).sort((a, b) =>
      a.name.localeCompare(b.name),
    )
  }, [rows])

  // Chip and tab counts say what each would show, so they ignore their own filter.
  const rangeCounts = useMemo(() => {
    const today = toIsoDate(new Date())
    const counts: Record<string, number> = {}
    for (const tab of RANGE_TABS) {
      counts[tab.value] = orders.filter((o) => {
        if (tab.days === undefined) return true
        const date = o.scheduled_date ?? ''
        return date >= today && date <= addDaysIso(tab.days)
      }).length
    }
    return counts
  }, [orders])

  const statusCounts = useMemo(() => {
    const counts: Record<AdvanceOrderStatus, number> = {
      booked: 0,
      confirmed: 0,
      cancelled: 0,
      completed: 0,
    }
    for (const o of orders) counts[o.status] += 1
    return counts
  }, [orders])

  // The page restarts at 1 whenever a filter changes, without an effect: the
  // page number is only trusted while the filters it was chosen under hold.
  const filterKey = [range, status, search, sort, pastDate].join('|')
  const [pageState, setPageState] = useState({ key: '', page: 1 })
  const lastPage = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(pageState.key === filterKey ? pageState.page : 1, lastPage)
  const visible = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  function setPage(next: number) {
    setPageState({ key: filterKey, page: next })
  }

  async function confirmCancel() {
    if (!cancelTarget || !encryptedOutletId) return
    setCancelling(true)
    try {
      const updated = await cancelAdvanceOrderApi(encryptedOutletId, cancelTarget.id)
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      showToast('Advance order cancelled')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to cancel advance order',
      )
    } finally {
      setCancelling(false)
      setCancelTarget(null)
    }
  }

  function openInBilling(order: AdvanceOrderDto) {
    navigate(`/billing?openAdvance=${encodeURIComponent(order.id)}`)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <AdvanceOrderModal
        open={newOpen}
        outletId={encryptedOutletId}
        defaultDate={new Date()}
        onClose={() => setNewOpen(false)}
        onCreated={() => void load()}
      />
      <AdvanceOrderDetailsModal
        order={viewOrder}
        deliveryText={viewOrder ? deliveryText(viewOrder) : ''}
        createdText={viewOrder ? createdText(viewOrder.created_at) : ''}
        statusLabel={viewOrder ? STATUS_STYLE[viewOrder.status].label : ''}
        onOpenInBilling={openInBilling}
        onClose={() => setViewOrder(null)}
      />
      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this advance order?"
        target={cancelTarget ? `Advance order ${cancelTarget.adv_order_no}` : undefined}
        message="The booking is marked Cancelled and stays in the list."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        loading={cancelling}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => void confirmCancel()}
      />

      <div className="flex items-center justify-between border-b border-line bg-card px-4 sm:px-6">
        <nav className="flex" aria-label="Order lists">
          <Link
            to="/billing/all-orders"
            className="px-4 py-3 text-sm font-medium text-ink hover:text-primary"
          >
            Current Order
          </Link>
          <Link
            to="/billing/online-orders"
            className="px-4 py-3 text-sm font-medium text-ink hover:text-primary"
          >
            Online Order
          </Link>
          <span
            aria-current="page"
            className="border-b-2 border-primary px-4 py-3 text-sm font-semibold text-primary"
          >
            Advance Order
          </span>
        </nav>
        <button
          type="button"
          onClick={() => navigate('/billing/operations')}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card px-4 py-3 sm:px-6">
        <div
          className="inline-flex max-w-full overflow-x-auto rounded-xl border border-line bg-page p-1"
          role="tablist"
          aria-label="Delivery window"
        >
          {RANGE_TABS.map((tab) => {
            const active = range === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRange(tab.value)}
                className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-colors ${
                  active ? 'bg-primary text-white shadow-sm' : 'text-ink hover:bg-card'
                }`}
              >
                {tab.value === 'all' ? <LayoutGrid size={15} /> : null}
                {tab.label}
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    active ? 'bg-white/25' : 'bg-card text-muted'
                  }`}
                >
                  {rangeCounts[tab.value] ?? 0}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="inline-flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-sm font-medium text-white hover:bg-primary-hover"
          >
            <Plus size={14} />
            New Advance Order
          </button>
          <button
            type="button"
            onClick={() => setPastDate((d) => (d === null ? toIsoDate(new Date()) : null))}
            aria-pressed={pastDate !== null}
            className={`inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium ${
              pastDate !== null
                ? 'border-primary bg-primary text-white'
                : 'border-primary text-primary hover:bg-primary/5'
            }`}
          >
            Get Past Advance Orders
          </button>
          <button
            type="button"
            onClick={() => setCumulativeOpen((open) => !open)}
            aria-pressed={cumulativeOpen}
            className={`inline-flex h-9 items-center rounded-lg border px-3 text-sm font-medium ${
              cumulativeOpen
                ? 'border-primary bg-primary text-white'
                : 'border-primary text-primary hover:bg-primary/5'
            }`}
          >
            Cumulative Items
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {cumulativeOpen ? (
          <div className="mb-4 rounded-2xl border border-line bg-card p-4">
            <h2 className="mb-2 text-sm font-bold text-ink">
              Cumulative Items ({rows.length} advance order{rows.length === 1 ? '' : 's'}, cancelled left out)
            </h2>
            {cumulative.length === 0 ? (
              <p className="text-sm text-muted">No items to total.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2 xl:grid-cols-3">
                {cumulative.map((item) => (
                  <li key={item.name} className="flex justify-between gap-3 border-b border-line py-1">
                    <span className="text-ink">{item.name}</span>
                    <span className="font-semibold tabular-nums text-ink">{item.quantity}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-72 max-w-full">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order no., name or phone"
                aria-label="Search advance orders"
                className="h-10 w-full rounded-xl border border-line bg-card pl-9 pr-9 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
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
            {pastDate !== null ? (
              <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-card pl-3 pr-1.5 text-sm text-muted">
                <CalendarDays size={14} />
                Delivery date
                <input
                  type="date"
                  value={pastDate}
                  onChange={(e) => setPastDate(e.target.value || null)}
                  className="h-8 rounded-lg border border-line bg-page px-2 text-sm text-ink outline-none focus:border-primary"
                />
              </label>
            ) : null}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 rounded-xl border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            >
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>

        <div
          className="mb-4 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter by status"
        >
          <button
            type="button"
            aria-pressed={status === 'all'}
            onClick={() => setStatus('all')}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${
              status === 'all'
                ? 'border-ink bg-ink text-white'
                : 'border-line bg-card text-ink hover:bg-page'
            }`}
          >
            All statuses
          </button>
          {LEGEND_ORDER.map((key) => {
            const active = status === key
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(active ? 'all' : key)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${
                  active
                    ? 'border-ink bg-ink/5 text-ink'
                    : 'border-line bg-card text-ink hover:bg-page'
                }`}
              >
                <span className={`size-2.5 rounded-full ${STATUS_STYLE[key].dot}`} />
                {STATUS_STYLE[key].label}
                <span className="tabular-nums text-muted">{statusCounts[key]}</span>
              </button>
            )
          })}
        </div>

        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-card px-4 py-12 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading advance orders…
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card px-6 py-12 text-center">
            <p className="text-base font-semibold text-ink">No advance orders</p>
            <p className="mt-1 text-sm text-muted">
              Bookings for a future date will appear here.
            </p>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {visible.map((order) => {
                const when = deliveryParts(order)
                const advance = Number(order.advance_amount)
                const total = Number(order.grand_total)
                const balance = Math.max(0, Math.round((total - advance) * 100) / 100)
                const open = order.status === 'booked' || order.status === 'confirmed'
                const shownItems = order.items.slice(0, 2)
                const moreItems = order.items.length - shownItems.length
                return (
                  <li
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <CalendarDays size={18} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-base font-bold text-ink">
                              {when.date}
                              {when.time ? ` · ${when.time}` : ''}
                            </p>
                            <p className="truncate text-xs text-muted">
                              Advance #{order.adv_order_no} · Booked {createdText(order.created_at).slice(0, 16)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[order.status].pill}`}
                        >
                          {STATUS_STYLE[order.status].label}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <span className="rounded-md bg-page px-2 py-0.5 text-xs font-semibold uppercase text-ink">
                          {order.order_type_label || order.order_type}
                        </span>
                        <span className="truncate text-sm font-semibold text-ink">
                          {order.customer_name || 'No customer name'}
                        </span>
                        {order.customer_phone ? (
                          <span className="text-sm tabular-nums text-muted">
                            {order.customer_phone}
                          </span>
                        ) : null}
                      </div>

                      {order.items.length > 0 ? (
                        <p className="mt-2 truncate text-sm text-muted">
                          {shownItems.map((item) => `${item.qty} × ${item.name}`).join(', ')}
                          {moreItems > 0 ? ` +${moreItems} more` : ''}
                        </p>
                      ) : null}
                      {order.special_note ? (
                        <p className="mt-1 truncate text-xs italic text-muted">
                          Note: {order.special_note}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                            Grand total
                          </p>
                          <p className="text-xl font-bold tabular-nums text-ink">
                            {formatINR(total, 2)}
                          </p>
                          {order.status === 'completed' && (order.bill_no || order.order_no) ? (
                            <p className="text-xs text-muted">
                              Billed as #{order.bill_no || order.order_no}
                            </p>
                          ) : advance > 0 ? (
                            <p className="text-xs text-muted">
                              {formatINR(advance, 2)} advance paid ·{' '}
                              <span className="font-semibold text-ink">
                                {formatINR(balance, 2)} balance
                              </span>
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {open ? (
                            <button
                              type="button"
                              onClick={() => openInBilling(order)}
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
                            >
                              <ShoppingCart size={14} />
                              Open in Billing
                            </button>
                          ) : null}
                          <button
                            type="button"
                            aria-label="View details"
                            data-tooltip="View details"
                            onClick={() => setViewOrder(order)}
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-ink hover:bg-page"
                          >
                            <Eye size={15} />
                          </button>
                          {open ? (
                            <button
                              type="button"
                              aria-label="Cancel advance order"
                              data-tooltip="Cancel advance order"
                              onClick={() => setCancelTarget(order)}
                              className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-ink hover:bg-page hover:text-primary"
                            >
                              <X size={15} />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              total={rows.length}
              onPageChange={setPage}
            />
          </>
        )}
      </main>
    </div>
  )
}
