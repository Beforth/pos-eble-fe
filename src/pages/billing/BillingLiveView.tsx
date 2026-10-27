import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bike,
  CheckCheck,
  Clock3,
  Loader2,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { KotTicketViewModal } from '../../components/billing/KotTicketViewModal'
import {
  kotTicketAmount,
  type KotTicket,
  type KotViewOrderType,
} from '../../mocks/kotViewData'
import { markKotReadyApi } from '../../services/orderService'
import { useLiveKotTickets } from '../../state/useLiveKotTickets'
import { useNewOrder } from '../../state/useNewOrder'
import { billingUrlForKotId } from '../../utils/billingLinks'
import { formatINR, formatNumber } from '../../utils/format'
import { isServerBackedKotId } from '../../utils/kotListStore'
import { updateKotTicketStatus } from '../../utils/tableStatusStore'
import { showToast } from '../../utils/toast'

/** The filter groups tickets the way the counter thinks of them: Pick Up and Other are both Parcel. */
type TypeFilter = 'all' | 'dine-in' | 'delivery' | 'parcel'

const TYPE_CHIPS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'dine-in', label: 'Dine In' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'parcel', label: 'Parcel' },
]

function filterGroup(type: KotViewOrderType): Exclude<TypeFilter, 'all'> {
  if (type === 'dine-in' || type === 'delivery') return type
  return 'parcel'
}

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const hh = Math.floor(totalSec / 3600)
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')
  return hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Badge icon and label per order type; everything is in the app's primary colour. */
const TYPE_STYLE: Record<KotViewOrderType, { icon: LucideIcon; label: string }> = {
  'dine-in': { icon: ShoppingBag, label: 'Dine In' },
  delivery: { icon: Truck, label: 'Delivery' },
  'pick-up': { icon: Bike, label: 'Parcel' },
  other: { icon: Bike, label: 'Parcel' },
}

/** The longer a ticket waits, the louder its timer. */
function timerTone(ms: number): string {
  const minutes = ms / 60000
  if (minutes < 10) return 'bg-success/10 text-success'
  if (minutes < 20) return 'bg-accent/15 text-accent'
  return 'bg-primary/10 text-primary'
}

function whereLine(ticket: KotTicket): string {
  if (ticket.tableId && ticket.tableId !== 'no-table') {
    return `Table ${ticket.tableNo}`
  }
  if (ticket.orderType === 'delivery') return 'Delivery order'
  if (ticket.orderType === 'pick-up') return 'Customer will pick up the order'
  return 'Counter order'
}

/**
 * Billing "Live View": every open kitchen ticket as a card, filtered by order
 * type, with the running timer and a Food Is Ready action. A ticket that is
 * ready *and* already paid is finished business and drops off.
 */
export default function BillingLiveView() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId } = useAuth()
  const { tickets, refresh } = useLiveKotTickets()
  const [billNo, setBillNo] = useState('')
  const [type, setType] = useState<TypeFilter>('all')
  const [search, setSearch] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [viewTicket, setViewTicket] = useState<KotTicket | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  const live = useMemo(
    () =>
      tickets
        .filter((ticket) => !(ticket.status === 'ready' && ticket.billed))
        // Newest first: a ticket that was just punched shows at the top.
        .sort((a, b) => b.createdAt - a.createdAt),
    [tickets],
  )

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return live
    return live.filter(
      (ticket) =>
        String(ticket.kotNo).includes(q) ||
        (ticket.billNo ?? '').toLowerCase().includes(q) ||
        ticket.tableNo.toLowerCase().includes(q),
    )
  }, [live, search])

  const counts = useMemo(() => {
    const result: Record<TypeFilter, number> = {
      all: searched.length,
      'dine-in': 0,
      delivery: 0,
      parcel: 0,
    }
    for (const ticket of searched) result[filterGroup(ticket.orderType)] += 1
    return result
  }, [searched])

  const visible = type === 'all' ? searched : searched.filter((t) => filterGroup(t.orderType) === type)

  async function handleReady(ticket: KotTicket) {
    if (busyId) return
    setBusyId(ticket.id)
    try {
      // Server first: marking it ready here only is what used to leave Billing
      // and Live Orders saying Pending.
      if (encryptedOutletId && isServerBackedKotId(ticket.id)) {
        await markKotReadyApi(encryptedOutletId, ticket.id)
      }
      updateKotTicketStatus(ticket.id, 'ready')
      showToast(`KOT ${ticket.kotNo} is ready`)
    } catch (error) {
      showToast(
        error instanceof Error
          ? `Could not mark it ready: ${error.message}`
          : 'Could not mark it ready. Try again.',
      )
    } finally {
      setBusyId(null)
    }
  }

  function handleRefresh() {
    if (refreshing) return
    setRefreshing(true)
    refresh()
    window.setTimeout(() => setRefreshing(false), 800)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <KotTicketViewModal
        open={Boolean(viewTicket)}
        ticket={viewTicket}
        onClose={() => setViewTicket(null)}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-ink">Live Orders</h1>
            <p className="mt-0.5 text-sm text-muted">
              Every kitchen ticket that is still open. This page updates by itself.
            </p>
          </div>
          <div className="flex items-center gap-2">
          <Link
            to="/billing/live-summary"
            className="inline-flex h-9 items-center rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            Summary
          </Link>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh live orders"
            data-tooltip="Refresh"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-card text-muted hover:text-ink disabled:opacity-80"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-primary' : ''} />
          </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Order type">
            {TYPE_CHIPS.map((chip) => {
              const active = type === chip.value
              return (
                <button
                  key={chip.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setType(chip.value)}
                  className={`inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-line bg-card text-ink hover:bg-page'
                  }`}
                >
                  {chip.label}
                  <span
                    className={`rounded-full px-1.5 text-xs tabular-nums ${
                      active ? 'bg-white/20' : 'bg-page text-muted'
                    }`}
                  >
                    {counts[chip.value]}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative ml-auto w-full sm:w-64">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="KOT, bill or table no."
              aria-label="Find a ticket"
              className="h-9 w-full rounded-lg border border-line bg-card pl-8 pr-8 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                data-tooltip="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-ink"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>
        </div>

        <p className="mb-3 text-sm font-semibold text-primary">
          Total Orders <span className="text-muted">|</span> {formatNumber(visible.length)}
        </p>

        {visible.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-card px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-page text-muted">
              <CheckCheck size={26} />
            </span>
            <p className="text-base font-semibold text-ink">No open orders</p>
            <p className="text-sm text-muted">
              {search || type !== 'all'
                ? 'Nothing matches these filters.'
                : 'New kitchen tickets will show up here as soon as they are sent.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.map((ticket) => {
              const ready = ticket.status === 'ready'
              const style = TYPE_STYLE[ticket.orderType]
              const atTable = Boolean(ticket.tableId) && ticket.tableId !== 'no-table'
              const waited = now - ticket.createdAt
              const TypeIcon = style.icon
              return (
                <div key={ticket.id} className="relative h-[400px] pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(billingUrlForKotId(ticket.id))}
                    aria-label={`Open KOT ${ticket.kotNo} in billing`}
                    data-tooltip="Open in billing"
                    className={`absolute left-1/2 top-0 z-10 flex size-9 -translate-x-1/2 items-center justify-center rounded-full text-white shadow-md ring-4 ring-page transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-primary/40 ${
                      ready ? 'bg-success' : 'bg-primary'
                    }`}
                  >
                    {ready ? <CheckCheck size={18} /> : <TypeIcon size={18} />}
                  </button>
                <article
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-card pt-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3 px-4 pb-2 pt-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-base font-bold text-ink">
                          {atTable ? `Table ${ticket.tableNo}` : ticket.tableNo}
                        </p>
                        <span
                          className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary"
                        >
                          {style.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        KOT <span className="font-semibold text-ink">{ticket.kotNo}</span>
                        <span className="mx-1.5 text-line">|</span>
                        Bill <span className="font-semibold text-ink">{ticket.billNo ?? '--'}</span>
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
                        ready ? 'bg-success/10 text-success' : timerTone(waited)
                      }`}
                    >
                      <Clock3 size={12} />
                      {formatElapsed(waited)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-4 pb-2 text-xs text-muted">
                    <span className="truncate">{whereLine(ticket)}</span>
                    {ticket.persons > 0 ? (
                      <span className="inline-flex shrink-0 items-center gap-1">
                        <Users size={12} />
                        {ticket.persons}
                      </span>
                    ) : null}
                    {ticket.billed ? (
                      <span className="ml-auto shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                        Paid
                      </span>
                    ) : null}
                  </div>

                  <ul className="mx-4 min-h-0 flex-1 divide-y divide-line/70 overflow-y-auto border-y border-line/70 py-1">
                    {ticket.items.map((item, index) => (
                      <li key={`${ticket.id}-${index}`} className="flex items-start gap-2.5 py-2">
                        <span className="mt-0.5 inline-flex min-w-7 shrink-0 items-center justify-center rounded-md bg-page px-1.5 py-0.5 text-xs font-bold tabular-nums text-ink">
                          {formatNumber(item.qty)}x
                        </span>
                        <span className="min-w-0 text-sm text-ink">
                          <span className="font-medium">{item.name}</span>
                          {item.note ? (
                            <span className="mt-0.5 block text-xs italic text-accent">
                              {item.note}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between gap-2 px-4 py-3">
                    <p className="text-base font-bold tabular-nums text-ink">
                      {formatINR(kotTicketAmount(ticket), 2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewTicket(ticket)}
                        className="h-8 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
                      >
                        Info
                      </button>
                      {ready ? (
                        <span className="inline-flex h-8 items-center gap-1 rounded-lg bg-success/10 px-3 text-sm font-semibold text-success">
                          <CheckCheck size={14} />
                          Ready
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleReady(ticket)}
                          disabled={busyId === ticket.id}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-70"
                        >
                          {busyId === ticket.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : null}
                          Food Is Ready
                        </button>
                      )}
                    </div>
                  </div>
                </article>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
