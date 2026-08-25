import { useEffect, useState } from 'react'
import { Printer, X } from 'lucide-react'
import {
  headerClassForOrderType,
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
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header
          className={`flex items-center justify-between px-5 py-3 ${headerClassForOrderType(ticket.orderType)}`}
        >
          <div>
            <h2 className="text-base font-bold">
              {ticket.tableNo} {labelForOrderType(ticket.orderType)}
            </h2>
            <p className="text-sm opacity-90">KOT {ticket.kotNo}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 hover:bg-black/10"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-3 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <p>Biller: {ticket.biller}</p>
            {ticket.persons > 0 ? (
              <p className="font-medium text-ink">
                No. of Persons: {ticket.persons}
              </p>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-lg border border-line">
            <div className="grid grid-cols-[1fr_48px_72px] gap-2 border-b border-line bg-page px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Amt</span>
            </div>
            <ul className="divide-y divide-line">
              {ticket.items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[1fr_48px_72px] gap-2 px-3 py-2.5 text-sm text-ink"
                >
                  <span>
                    {item.name}
                    {item.note ? (
                      <span className="mt-0.5 block text-xs italic text-muted">
                        [Note] {item.note}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-center tabular-nums">{item.qty}</span>
                  <span className="text-right font-semibold tabular-nums">
                    ₹{money(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {ticket.note ? (
            <div className="rounded border border-line bg-page px-3 py-2 text-xs text-ink">
              {ticket.note}
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm font-semibold text-ink">Total</span>
            <span className="text-lg font-bold text-accent">₹{money(amount)}</span>
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={() => setPrintTicket(ticket)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-page"
          >
            <Printer size={15} />
            Print KOT
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
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
