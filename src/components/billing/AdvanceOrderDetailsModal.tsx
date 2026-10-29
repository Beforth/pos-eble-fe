import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { AdvanceOrderDto } from '../../services/orderService'
import { formatINR } from '../../utils/format'

interface AdvanceOrderDetailsModalProps {
  order: AdvanceOrderDto | null
  /** Pre-formatted by the page, so the popup reads the same as the row. */
  deliveryText: string
  createdText: string
  statusLabel: string
  /** Shown for a booked or confirmed booking: loads it into Billing to settle. */
  onOpenInBilling?: (order: AdvanceOrderDto) => void
  onClose: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold text-ink">{label}</p>
      <p className="mt-0.5 break-words text-sm text-muted">{children || '—'}</p>
    </div>
  )
}

export function AdvanceOrderDetailsModal({
  order,
  deliveryText,
  createdText,
  statusLabel,
  onOpenInBilling,
  onClose,
}: AdvanceOrderDetailsModalProps) {
  const open = order !== null

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!order) return null

  const total = Number(order.grand_total)
  const advance = Number(order.advance_amount)
  const balance = Math.max(0, Math.round((total - advance) * 100) / 100)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close advance order details"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Advance Order Details"
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">
            Advance Order #{order.adv_order_no}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-3">
            <Field label="Customer Name:">{order.customer_name}</Field>
            <Field label="Customer Phone:">{order.customer_phone}</Field>
            <Field label="Order Type:">{order.order_type_label.toUpperCase()}</Field>
            <Field label="Delivery Date:">{deliveryText}</Field>
            <Field label="Status:">{statusLabel}</Field>
            <Field label="Payment Type:">{order.payment_type}</Field>
            <Field label="Created:">{createdText}</Field>
            <Field label="Created By:">{order.created_by}</Field>
            <Field label="Customer Note:">{order.special_note}</Field>
          </div>

          <h3 className="mb-2 mt-6 text-sm font-bold text-ink">Order Items</h3>
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-primary/5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="px-3 py-2.5">Item Name</th>
                  <th className="px-3 py-2.5 text-center">Quantity</th>
                  <th className="px-3 py-2.5 text-right">Unit Price (₹)</th>
                  <th className="px-3 py-2.5 text-right">Total Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-muted">
                      No items on this booking.
                    </td>
                  </tr>
                ) : (
                  order.items.map((item, index) => (
                    <tr key={`${item.name}-${index}`} className="border-t border-line">
                      <td className="px-3 py-2 text-ink">
                        {item.name}
                        {item.note ? (
                          <span className="text-muted"> ({item.note})</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-center tabular-nums">{item.qty}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {Number(item.unit_price).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {Number(item.total_price).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <dl className="ml-auto mt-4 w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-muted">
              <dt>Advance paid</dt>
              <dd className="tabular-nums">{formatINR(advance, 2)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Balance</dt>
              <dd className="tabular-nums">{formatINR(balance, 2)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold text-ink">
              <dt>Grand Total</dt>
              <dd className="tabular-nums">{formatINR(total, 2)}</dd>
            </div>
          </dl>
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-line px-5 py-3">
          {onOpenInBilling &&
          (order.status === 'booked' || order.status === 'confirmed') ? (
            <button
              type="button"
              onClick={() => onOpenInBilling(order)}
              className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Open in Billing
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-primary bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  )
}
