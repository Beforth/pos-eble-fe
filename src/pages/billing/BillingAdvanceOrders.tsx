import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronLeft, Eye, LayoutGrid, Loader2, Plus, Search, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { AdvanceOrderModal } from '../../components/all-orders/AdvanceOrderModal'
import { ConfirmDialog } from '../../components/common/ConfirmDialog'
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

const RANGE_TABS: { value: RangeKey; label: string; days?: number }[] = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today', days: 0 },
  { value: '1', label: 'Within 1 Day', days: 1 },
  { value: '2', label: 'Within 2 Day(s)', days: 2 },
]

/** Row tint and legend dot per status; the legend names mirror the Orders page. */
const STATUS_STYLE: Record<
  AdvanceOrderStatus,
  { label: string; row: string; dot: string }
> = {
  booked: { label: 'Saved Bill', row: 'bg-card', dot: 'border border-line bg-card' },
  confirmed: { label: 'Printed Bill', row: 'bg-emerald-300', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled Bill', row: 'bg-red-100', dot: 'bg-red-400' },
  completed: { label: 'Paid', row: 'bg-orange-100', dot: 'bg-orange-300' },
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
  const [expanded, setExpanded] = useState<string | null>(null)
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

      <div className="flex flex-wrap items-stretch justify-between border-b border-line bg-card px-4 sm:px-6">
        <div className="flex overflow-x-auto" role="tablist" aria-label="Delivery window">
          {RANGE_TABS.map((tab) => {
            const active = range === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setRange(tab.value)}
                className={`flex min-w-[96px] flex-col items-center justify-center gap-1 border-b-2 px-4 py-3 text-xs font-medium transition-colors ${
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-transparent text-ink hover:bg-page'
                }`}
              >
                {tab.value === 'all' ? <LayoutGrid size={22} /> : null}
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 py-2">
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
        {pastDate !== null ? (
          <label className="mb-3 inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-sm text-muted">
            <CalendarDays size={14} />
            Delivery date
            <input
              type="date"
              value={pastDate}
              onChange={(e) => setPastDate(e.target.value || null)}
              className="h-8 rounded-md border border-line bg-page px-2 text-sm text-ink outline-none focus:border-primary"
            />
          </label>
        ) : null}

        {cumulativeOpen ? (
          <div className="mb-4 rounded-xl border border-line bg-card p-4">
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
              aria-label="Search advance orders"
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

          <div className="flex flex-wrap items-center gap-3">
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
            <div
              className="flex flex-wrap items-center gap-3 rounded-lg bg-card px-3 py-2 text-sm text-ink"
              role="group"
              aria-label="Filter by bill status"
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
                      active ? 'bg-ink/10 font-semibold' : 'hover:bg-page'
                    }`}
                  >
                    <span className={`size-3.5 rounded-full ${STATUS_STYLE[key].dot}`} />
                    {STATUS_STYLE[key].label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-line bg-card px-4 py-12 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading advance orders…
          </div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-line bg-card px-6 py-12 text-center">
            <p className="text-base font-semibold text-ink">No advance orders</p>
            <p className="mt-1 text-sm text-muted">
              Bookings for a later date or time will show here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-page">
                    {['Delivery Date', 'Customer Name / Mobile', 'Grand Total (₹)', 'Customer Note', 'Created', ''].map(
                      (heading) => (
                        <th
                          key={heading || 'actions'}
                          scope="col"
                          className="whitespace-nowrap px-3 py-3 text-left text-xs font-bold text-ink"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((order) => {
                    const open = expanded === order.id
                    return (
                      <Fragment key={order.id}>
                        <tr className={`border-b border-line ${STATUS_STYLE[order.status].row}`}>
                          <td className="px-3 py-3">
                            <p className="whitespace-nowrap">{deliveryText(order)}</p>
                            <p className="uppercase">[{order.order_type_label}]</p>
                          </td>
                          <td className="px-3 py-3">
                            <p>{order.customer_name}</p>
                            <p className="text-muted">{order.customer_phone}</p>
                          </td>
                          <td className="px-3 py-3">
                            <span className="inline-block rounded-lg bg-card px-2 py-1 font-semibold tabular-nums text-primary">
                              {Number(order.grand_total).toFixed(2)}
                            </span>
                            {Number(order.advance_amount) > 0 ? (
                              <p className="mt-0.5 text-xs text-muted">
                                {formatINR(Number(order.advance_amount), 2)} advance paid
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-3">{order.special_note}</td>
                          <td className="whitespace-nowrap px-3 py-3">{createdText(order.created_at)}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                aria-label="View items"
                                data-tooltip="View items"
                                aria-expanded={open}
                                onClick={() => setExpanded(open ? null : order.id)}
                                className="inline-flex size-8 items-center justify-center rounded-lg bg-card text-ink hover:bg-page"
                              >
                                <Eye size={15} />
                              </button>
                              {order.status === 'booked' || order.status === 'confirmed' ? (
                                <button
                                  type="button"
                                  aria-label="Cancel advance order"
                                  data-tooltip="Cancel advance order"
                                  onClick={() => setCancelTarget(order)}
                                  className="inline-flex size-8 items-center justify-center rounded-lg bg-card text-ink hover:bg-page"
                                >
                                  <X size={15} />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                        {open ? (
                          <tr className="border-b border-line bg-card">
                            <td colSpan={6} className="px-6 py-3">
                              {order.items.length === 0 ? (
                                <p className="text-sm text-muted">No items on this booking.</p>
                              ) : (
                                <ul className="space-y-1 text-sm">
                                  {order.items.map((item, index) => (
                                    <li key={`${item.name}-${index}`} className="flex justify-between gap-4">
                                      <span>
                                        {item.qty} × {item.name}
                                        {item.note ? (
                                          <span className="text-muted"> ({item.note})</span>
                                        ) : null}
                                      </span>
                                      <span className="tabular-nums">
                                        {formatINR(Number(item.total_price), 2)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
