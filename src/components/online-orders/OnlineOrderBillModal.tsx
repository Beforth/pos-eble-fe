import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { OnlineOrderRow } from '../../mocks/onlineOrdersData'

interface OnlineOrderBillModalProps {
  open: boolean
  order: OnlineOrderRow | null
  onClose: () => void
}

function DetailPair({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm leading-relaxed text-ink">
      <span className="font-normal">{label}:</span>{' '}
      <span className="font-normal">{value}</span>
    </p>
  )
}

function formatMoney(value: number) {
  return value.toFixed(2)
}

export function OnlineOrderBillModal({
  open,
  order,
  onClose,
}: OnlineOrderBillModalProps) {
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

  const totalTax = 0
  const title = `Actual Order From ${order.aggregator}`

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close actual order bill"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex max-h-[min(92vh,820px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-x-10 gap-y-2 border-b border-line pb-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <DetailPair label="Order No." value={order.orderNo} />
              <DetailPair
                label="Order Type"
                value={order.orderType.toUpperCase()}
              />
            </div>
            <div className="space-y-1.5">
              <DetailPair label="Customer Name" value={order.customerName} />
              <DetailPair label="Payment Type" value={order.paymentType} />
            </div>
          </div>

          <div className="mt-5">
            <h3 className="mb-3 text-sm font-bold text-ink">
              Online Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-sm font-bold text-ink">
                    <th className="pb-2.5 pr-3 font-bold">Item Name</th>
                    <th className="pb-2.5 pr-3 font-bold">Special Note</th>
                    <th className="pb-2.5 pr-3 text-center font-bold">
                      Quantity
                    </th>
                    <th className="pb-2.5 pr-3 text-right font-bold">
                      Unit Price
                    </th>
                    <th className="pb-2.5 text-right font-bold">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => {
                    const note = item.specialNote?.trim() || '--'
                    const hasNote = note !== '--'
                    return (
                      <tr
                        key={`${item.name}-${index}`}
                        className="border-b border-line"
                      >
                        <td className="py-2.5 pr-3 text-ink">{item.name}</td>
                        <td className="py-2.5 pr-3 text-ink">
                          {hasNote ? (
                            <span className="underline underline-offset-2">
                              {note}
                            </span>
                          ) : (
                            note
                          )}
                        </td>
                        <td className="py-2.5 pr-3 text-center tabular-nums text-ink">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-ink">
                          {formatMoney(item.unitPrice)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-ink">
                          {formatMoney(item.totalPrice)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <dl className="w-full max-w-[220px] text-sm">
                <div className="flex justify-between gap-8 border-b border-line py-2 text-ink">
                  <dt>Container Charge</dt>
                  <dd className="tabular-nums">{order.containerCharge}</dd>
                </div>
                <div className="flex justify-between gap-8 border-b border-line py-2 text-ink">
                  <dt>Total Tax</dt>
                  <dd className="tabular-nums">{totalTax}</dd>
                </div>
                <div className="flex justify-between gap-8 py-2.5 font-bold text-ink">
                  <dt>Grand Total</dt>
                  <dd className="tabular-nums">{formatMoney(order.total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
