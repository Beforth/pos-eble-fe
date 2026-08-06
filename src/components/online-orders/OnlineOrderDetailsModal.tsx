import { useEffect } from 'react'
import { Bolt, X } from 'lucide-react'
import type { OnlineOrderRow } from '../../mocks/onlineOrdersData'

interface OnlineOrderDetailsModalProps {
  open: boolean
  order: OnlineOrderRow | null
  onClose: () => void
}

function displayValue(value?: string) {
  return value && value.trim() ? value : '-'
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <p className="min-w-0 text-sm leading-relaxed text-ink">
      <span className="font-bold">{label}:</span>{' '}
      <span className="font-normal">{value}</span>
    </p>
  )
}

export function OnlineOrderDetailsModal({
  open,
  order,
  onClose,
}: OnlineOrderDetailsModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close online order details"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Online Order Details"
        className="relative z-10 flex max-h-[min(92vh,820px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">Online Order Details</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        {order.isUrgent && (
          <div className="flex shrink-0 items-center gap-2 border-b border-primary/10 bg-primary/10 px-5 py-2.5">
            <Bolt size={16} className="shrink-0 fill-accent text-accent" />
            <p className="text-sm font-bold text-accent">BOLT-Urgent Order</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3 border-b border-line pb-4">
            <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-3">
              <DetailCell label="Order No." value={order.orderNo} />
              <DetailCell label="Order From" value={order.channelLabel} />
              <DetailCell label="Customer Name" value={order.customerName} />
              <DetailCell
                label="Customer Phone"
                value={displayValue(order.customerPhone)}
              />
              <DetailCell
                label="Customer Address"
                value={displayValue(order.customerAddress)}
              />
              <DetailCell
                label="No. of Persons"
                value={displayValue(order.persons)}
              />
              <DetailCell label="Order Type" value={order.orderType} />
              <DetailCell label="Payment Type" value={order.paymentType} />
              <DetailCell label="Order Status" value={order.status} />
            </div>
            <DetailCell label="Restaurant" value={order.outletName} />
            <DetailCell
              label="Customer Notes"
              value={displayValue(order.customerNotes)}
            />
          </div>

          <div className="mt-5">
            <h3 className="mb-3 text-sm font-bold text-ink">
              Online Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-sm text-muted">
                    <th className="pb-2.5 pr-3 font-normal">Item Name</th>
                    <th className="pb-2.5 pr-3 font-normal">Special Note</th>
                    <th className="pb-2.5 pr-3 text-center font-normal">
                      Quantity
                    </th>
                    <th className="pb-2.5 pr-3 text-right font-normal">
                      Unit Price
                    </th>
                    <th className="pb-2.5 text-right font-normal">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr
                      key={`${item.name}-${index}`}
                      className="border-b border-line last:border-0"
                    >
                      <td className="py-2.5 pr-3 font-medium text-ink">
                        {item.name}
                      </td>
                      <td className="py-2.5 pr-3 text-muted">
                        {item.specialNote}
                      </td>
                      <td className="py-2.5 pr-3 text-center tabular-nums text-ink">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-ink">
                        {item.unitPrice}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-ink">
                        {item.totalPrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex justify-end">
              <dl className="w-full max-w-[220px] space-y-1.5 text-sm">
                <div className="flex justify-between gap-8 text-ink">
                  <dt>Delivery Charge</dt>
                  <dd className="tabular-nums">{order.deliveryCharge}</dd>
                </div>
                <div className="flex justify-between gap-8 text-ink">
                  <dt>Container Charge</dt>
                  <dd className="tabular-nums">{order.containerCharge}</dd>
                </div>
                <div className="flex justify-between gap-8 pt-1 text-base font-bold text-ink">
                  <dt>Grand Total</dt>
                  <dd className="tabular-nums">{order.total.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
