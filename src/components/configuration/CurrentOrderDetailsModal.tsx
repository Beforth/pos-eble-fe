import { useEffect } from 'react'
import { X } from 'lucide-react'
import {
  money,
  type CurrentOrderRow,
} from '../../mocks/currentOrdersData'

interface CurrentOrderDetailsModalProps {
  open: boolean
  order: CurrentOrderRow | null
  onClose: () => void
}

export function CurrentOrderDetailsModal({
  open,
  order,
  onClose,
}: CurrentOrderDetailsModalProps) {
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

  if (!open || !order) return null

  const statusLabel =
    order.status === 'printed'
      ? 'Printed'
      : order.status === 'cancelled'
        ? 'Cancelled'
        : order.status === 'paid'
          ? 'Paid'
          : 'Saved'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close order view"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order view"
        className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-base font-semibold text-ink">
            Order View · #{order.orderNo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="overflow-x-auto rounded border border-line">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="bg-page text-left text-xs font-semibold text-ink">
                  <th className="border border-line px-3 py-2">Order Status</th>
                  <th className="border border-line px-3 py-2">Printed</th>
                  <th className="border border-line px-3 py-2">Assign to</th>
                  <th className="border border-line px-3 py-2">Coupon Code</th>
                  <th className="border border-line px-3 py-2">Paid</th>
                  <th className="border border-line px-3 py-2">Tip</th>
                  <th className="border border-line px-3 py-2">Sub Order Type</th>
                  <th className="border border-line px-3 py-2">Settlement</th>
                  <th className="border border-line px-3 py-2">Sequence Name</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-line px-3 py-2">{statusLabel}</td>
                  <td className="border border-line px-3 py-2">
                    {order.printCount && order.printCount > 0
                      ? `Yes (${order.printCount} time(s))`
                      : 'No'}
                  </td>
                  <td className="border border-line px-3 py-2">-</td>
                  <td className="border border-line px-3 py-2" />
                  <td className="border border-line px-3 py-2">
                    {order.status === 'paid' ? 'Yes' : '-'}
                  </td>
                  <td className="border border-line px-3 py-2">-</td>
                  <td className="border border-line px-3 py-2">
                    {order.subOrderType ?? '-'}
                  </td>
                  <td className="border border-line px-3 py-2 leading-snug">
                    {order.settlementCounter ? (
                      <>
                        Counter : {order.settlementCounter}
                        <br />
                        By : {order.settlementBy ?? '-'}
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border border-line px-3 py-2">-</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">Order Items</h3>
            <div className="overflow-x-auto rounded border border-line">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="bg-page text-left text-xs font-semibold text-ink">
                    <th className="border border-line px-3 py-2">Item Name</th>
                    <th className="border border-line px-3 py-2">Special Note</th>
                    <th className="border border-line px-3 py-2 text-center">
                      Quantity
                    </th>
                    <th className="border border-line px-3 py-2 text-right">
                      Unit Price
                    </th>
                    <th className="border border-line px-3 py-2 text-right">
                      Total Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={`${item.name}-${item.note ?? ''}`}>
                      <td className="border border-line px-3 py-2">{item.name}</td>
                      <td className="border border-line px-3 py-2 text-muted">
                        {item.note?.trim() ? item.note : '--'}
                      </td>
                      <td className="border border-line px-3 py-2 text-center tabular-nums">
                        {item.qty}
                      </td>
                      <td className="border border-line px-3 py-2 text-right tabular-nums">
                        {money(item.unitPrice)}
                      </td>
                      <td className="border border-line px-3 py-2 text-right tabular-nums">
                        {money(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="border border-line px-3 py-2 font-medium">
                      Round Off
                    </td>
                    <td className="border border-line px-3 py-2" />
                    <td className="border border-line px-3 py-2" />
                    <td className="border border-line px-3 py-2" />
                    <td className="border border-line px-3 py-2 text-right tabular-nums">
                      0
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between bg-primary px-5 py-3 text-sm font-bold text-white">
          <span>Grand Total (₹)</span>
          <span className="tabular-nums">{money(order.grandTotal)}</span>
        </footer>
      </div>
    </div>
  )
}
