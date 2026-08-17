import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Ban,
  Eye,
  Save,
  ShoppingCart,
  Ticket,
  UserRound,
  X,
} from 'lucide-react'
import {
  ORDER_TYPE_LEGEND,
  headerClassForOrderType,
  kotTicketAmount,
  labelForOrderType,
  sortKotTicketsForDisplay,
  ticketsForTable,
  type KotTicket,
} from '../../mocks/kotViewData'
import { CancelKotModal } from './CancelKotModal'
import { KotTicketViewModal } from './KotTicketViewModal'
import { SettleSaveModal, type SettleSaveResult } from './SettleSaveModal'

interface KotViewProps {
  tickets: KotTicket[]
  onBack: () => void
  onFoodReady: (id: string) => void
  onDismiss: (id: string) => void
  onSettleSave: (payload: {
    tableId: string
    ticketIds: string[]
    result: SettleSaveResult
  }) => void
}

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const ss = String(totalSec % 60).padStart(2, '0')
  return `${mm} : ${ss}`
}

function KotCard({
  ticket,
  now,
  onFoodReady,
  onDismiss,
  onView,
  onSettle,
  onCancelOrder,
}: {
  ticket: KotTicket
  now: number
  onFoodReady: (id: string) => void
  onDismiss: (id: string) => void
  onView: (ticket: KotTicket) => void
  onSettle: (ticket: KotTicket) => void
  onCancelOrder: (ticket: KotTicket) => void
}) {
  const isReady = ticket.status === 'ready'

  return (
    <article className="flex w-[260px] shrink-0 flex-col overflow-hidden rounded-lg border border-line bg-white shadow-sm sm:w-[280px]">
      <header
        className={`flex items-start justify-between gap-2 px-3 py-2 text-xs font-semibold ${headerClassForOrderType(ticket.orderType)}`}
      >
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">
            {ticket.tableNo} {labelForOrderType(ticket.orderType)}
          </p>
          <p className="mt-0.5 opacity-90">KOT {ticket.kotNo}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <p className="tabular-nums">{formatElapsed(now - ticket.createdAt)}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="KOT view"
              aria-label="KOT view"
              onClick={() => onView(ticket)}
              className="inline-flex size-7 items-center justify-center rounded border border-black/15 bg-white/80 text-ink hover:bg-white"
            >
              <Eye size={14} />
            </button>
            <button
              type="button"
              title="Save and settle"
              aria-label="Save and settle"
              onClick={() => onSettle(ticket)}
              className="inline-flex size-7 items-center justify-center rounded border border-black/15 bg-white/80 text-ink hover:bg-white"
            >
              <Save size={14} />
            </button>
            <button
              type="button"
              title="Cancel order"
              aria-label="Cancel order"
              onClick={() => onCancelOrder(ticket)}
              className="inline-flex size-7 items-center justify-center rounded border border-black/15 bg-white/80 text-primary hover:bg-white"
            >
              <Ban size={14} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-3 py-2.5">
        <p className="mb-1 inline-flex items-center gap-1.5 text-xs text-muted">
          <UserRound size={13} />
          {ticket.biller}
        </p>
        {ticket.persons > 0 ? (
          <p className="mb-2 text-xs font-medium text-ink">
            No. of Persons: {ticket.persons}
          </p>
        ) : (
          <div className="mb-2" />
        )}

        <div className="mb-1 grid grid-cols-[1fr_auto] gap-2 border-b border-line pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <span>Item</span>
          <span className="w-8 text-center">Qty.</span>
        </div>

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto py-1">
          {ticket.items.map((item) => (
            <li key={item.id} className="text-sm text-ink">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <span className="min-w-0 leading-snug">{item.name}</span>
                <span className="w-8 text-center tabular-nums font-medium">
                  {item.qty}
                </span>
              </div>
              {item.note ? (
                <p className="mt-0.5 text-xs italic text-muted">
                  [Note] {item.note}
                </p>
              ) : null}
            </li>
          ))}
        </ul>

        {ticket.note ? (
          <div className="mt-2 rounded border border-line bg-page px-2.5 py-2 text-xs leading-relaxed text-ink">
            {ticket.note}
          </div>
        ) : null}
      </div>

      <footer className="flex items-center gap-2 border-t border-line px-3 py-2.5">
        <button
          type="button"
          title="Dismiss KOT"
          aria-label="Dismiss KOT"
          onClick={() => onDismiss(ticket.id)}
          className="flex size-8 items-center justify-center rounded-full border border-line text-muted hover:bg-page hover:text-primary"
        >
          <X size={16} />
        </button>
        <button
          type="button"
          disabled={isReady}
          onClick={() => onFoodReady(ticket.id)}
          className={`h-9 flex-1 rounded-md text-sm font-semibold text-white ${
            isReady
              ? 'cursor-default bg-success'
              : 'bg-primary hover:bg-primary-hover'
          }`}
        >
          {isReady ? 'Ready' : 'Food Is Ready'}
        </button>
      </footer>
    </article>
  )
}

export function KotView({
  tickets,
  onBack,
  onFoodReady,
  onDismiss,
  onSettleSave,
}: KotViewProps) {
  const [search, setSearch] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [viewTicket, setViewTicket] = useState<KotTicket | null>(null)
  const [settleTicket, setSettleTicket] = useState<KotTicket | null>(null)
  const [cancelTicket, setCancelTicket] = useState<KotTicket | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = !q
      ? tickets
      : tickets.filter(
          (t) =>
            String(t.kotNo).includes(q) ||
            t.tableNo.toLowerCase().includes(q) ||
            t.items.some((i) => i.name.toLowerCase().includes(q)),
        )
    return sortKotTicketsForDisplay(list)
  }, [search, tickets])

  const settleGroup = useMemo(() => {
    if (!settleTicket) return []
    if (settleTicket.tableId === 'no-table') return [settleTicket]
    return ticketsForTable(tickets, settleTicket.tableId)
  }, [settleTicket, tickets])

  const settleAmount = useMemo(
    () => settleGroup.reduce((sum, t) => sum + kotTicketAmount(t), 0),
    [settleGroup],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <KotTicketViewModal
        open={Boolean(viewTicket)}
        ticket={viewTicket}
        onClose={() => setViewTicket(null)}
      />

      <CancelKotModal
        open={Boolean(cancelTicket)}
        kotNo={cancelTicket?.kotNo ?? 0}
        onClose={() => setCancelTicket(null)}
        onConfirm={() => {
          if (!cancelTicket) return
          onDismiss(cancelTicket.id)
          setCancelTicket(null)
        }}
      />

      <SettleSaveModal
        open={Boolean(settleTicket)}
        label={settleTicket?.tableNo ?? '—'}
        billAmount={settleAmount}
        onClose={() => setSettleTicket(null)}
        onConfirm={(result) => {
          if (!settleTicket) return
          onSettleSave({
            tableId: settleTicket.tableId,
            ticketIds: settleGroup.map((t) => t.id),
            result,
          })
          setSettleTicket(null)
        }}
      />

      {/* Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 border-b-2 border-transparent px-3 py-3 text-sm font-semibold text-muted transition-colors hover:text-ink"
          >
            <ShoppingCart size={16} />
            Order View
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 border-b-2 border-primary px-3 py-3 text-sm font-semibold text-primary"
          >
            <Ticket size={16} />
            Kot View
          </button>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      {/* Filters / legend */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-2.5">
        <button
          type="button"
          className="h-8 rounded-md border border-line px-3 text-sm font-medium text-ink hover:bg-page"
        >
          Search
        </button>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {ORDER_TYPE_LEGEND.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted"
            >
              <span className={`size-2.5 rounded-full ${item.color}`} />
              {item.label}
            </span>
          ))}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter kot/Order no."
            className="h-8 w-[180px] rounded-md border border-line bg-white px-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
          />
          <button
            type="button"
            className="h-8 rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            MFR
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto bg-page p-4">
        {filtered.length === 0 ? (
          <div className="flex h-full min-h-[240px] items-center justify-center text-sm text-muted">
            No active KOTs
          </div>
        ) : (
          <div className="flex h-full min-h-[320px] flex-row items-stretch justify-start gap-3">
            {filtered.map((ticket) => (
              <KotCard
                key={ticket.id}
                ticket={ticket}
                now={now}
                onFoodReady={onFoodReady}
                onDismiss={onDismiss}
                onView={setViewTicket}
                onSettle={setSettleTicket}
                onCancelOrder={setCancelTicket}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
