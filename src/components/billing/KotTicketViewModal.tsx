import { useEffect, useState } from 'react'
import { Printer, UserRound, Users, X } from 'lucide-react'
import {
  kotTicketAmount,
  labelForOrderType,
  type KotTicket,
} from '../../mocks/kotViewData'
import { KOTPrintTemplate } from './KOTPrintTemplate'

interface KotTicketViewModalProps {
  open: boolean
  ticket: KotTicket | null
  onClose: () => void
}

function money(n: number) {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function KotTicketViewModal({
  open,
  ticket,
  onClose,
}: KotTicketViewModalProps) {
  const [printTicket, setPrintTicket] = useState<KotTicket | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open || !ticket) return null

  const amount = kotTicketAmount(ticket)

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close KOT view"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="KOT view"
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-ink">KOT {ticket.kotNo}</h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                {labelForOrderType(ticket.orderType)}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted">{ticket.tableNo}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-page px-6 py-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 font-medium text-ink">
              <UserRound size={13} className="text-muted" />
              {ticket.biller}
            </span>
            {ticket.persons > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 font-medium text-ink">
                <Users size={13} className="text-muted" />
                {ticket.persons} {ticket.persons === 1 ? 'person' : 'persons'}
              </span>
            ) : null}
            {ticket.customerName?.trim() ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 font-medium text-ink">
                {ticket.customerName.trim()}
              </span>
            ) : null}
          </div>

          {ticket.note ? (
            <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-ink">
              <span className="font-semibold">Special Note:</span> {ticket.note}
            </p>
          ) : null}

          <ul className="space-y-2">
            {ticket.items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-line bg-card px-3 py-2.5"
              >
                <span className="mt-0.5 inline-flex min-w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 px-2 py-1 text-xs font-bold tabular-nums text-primary">
                  {item.qty}×
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-ink">
                  {item.name}
                  {item.note ? (
                    <span className="mt-0.5 block text-xs font-normal italic text-muted">
                      {item.note}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                  ₹{money(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-line bg-card px-6 py-3">
          <span className="text-sm font-semibold text-ink">Total</span>
          <span className="text-xl font-bold tabular-nums text-accent">
            ₹{money(amount)}
          </span>
        </div>

        <footer className="flex justify-end gap-2 border-t border-line px-6 py-3">
          <button
            type="button"
            onClick={() => setPrintTicket(ticket)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink hover:bg-page"
          >
            <Printer size={15} />
            Print KOT
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Close
          </button>
        </footer>
      </div>

      {printTicket && (
        <KOTPrintTemplate
          ticket={printTicket}
          onClose={() => setPrintTicket(null)}
        />
      )}
    </div>
  )
}
