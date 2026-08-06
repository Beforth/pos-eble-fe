import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { AllOrderRow } from '../../mocks/allOrdersData'
import { formatINR } from '../../utils/format'

interface OrderLineItem {
  name: string
  specialNote: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface OrderDetailsDrawerProps {
  open: boolean
  order: AllOrderRow | null
  onClose: () => void
}

function parseLineItems(order: AllOrderRow): OrderLineItem[] {
  const parts = order.items
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return [
      {
        name: '—',
        specialNote: '--',
        quantity: 1,
        unitPrice: order.myAmount,
        totalPrice: order.myAmount,
      },
    ]
  }

  const qtyMatch = (text: string) => {
    const match = text.match(/×\s*(\d+)/i) ?? text.match(/x\s*(\d+)/i)
    return match ? Number(match[1]) : 1
  }

  const cleanName = (text: string) =>
    text.replace(/\s*[×x]\s*\d+/i, '').trim()

  const quantities = parts.map(qtyMatch)
  const totalQty = quantities.reduce((sum, q) => sum + q, 0) || 1
  const unitBase = order.myAmount / totalQty

  return parts.map((part, index) => {
    const quantity = quantities[index]
    const unitPrice = Number((unitBase).toFixed(2))
    return {
      name: cleanName(part),
      specialNote: '--',
      quantity,
      unitPrice,
      totalPrice: Number((unitPrice * quantity).toFixed(2)),
    }
  })
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-ink">{label}:</p>
      <p className="mt-0.5 break-words text-sm text-muted">{value || '—'}</p>
    </div>
  )
}

export function OrderDetailsDrawer({
  open,
  order,
  onClose,
}: OrderDetailsDrawerProps) {
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

  const lineItems = order ? parseLineItems(order) : []
  const halfTax = order ? Number((order.tax / 2).toFixed(2)) : 0
  const roundOff = order
    ? Number((order.grandTotal - order.myAmount - order.tax + order.discount).toFixed(2))
    : 0

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close order details"
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Order Details"
        className={`absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 className="text-base font-bold text-ink">Order Details</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        {order && (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 border-b border-line pb-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3">
                <DetailField label="Order No." value={order.orderNo} />
                <DetailField label="Customer Phone" value="—" />
                <DetailField label="No. of Persons" value="—" />
                <DetailField
                  label="Total Tax"
                  value={formatINR(order.tax, 2)}
                />
                <DetailField label="Settlement Amount" value={formatINR(0, 2)} />
                <DetailField label="Paid" value="Yes" />
                <DetailField label="Tip" value="—" />
                <DetailField label="Settlement Counter" value="—" />
              </div>

              <div className="space-y-3">
                <DetailField label="Billing User" value="Utkarsh" />
                <DetailField label="Customer Address" value="—" />
                <DetailField label="Order Type" value={order.orderType} />
                <DetailField
                  label="Total Discount"
                  value={`₹ (${order.discount.toFixed(2)})`}
                />
                <DetailField label="Order Status" value={order.status} />
                <DetailField label="Payment Type" value={order.payment} />
                <DetailField label="Sub Order Type" value={order.orderType} />
                <DetailField label="Settled By" value="—" />
              </div>

              <div className="space-y-3">
                <DetailField
                  label="Customer Name"
                  value={order.customerName || '—'}
                />
                <DetailField label="Customer Locality" value="—" />
                <DetailField label="Assign To" value={order.assignTo || '—'} />
                <DetailField
                  label="Grand Total"
                  value={formatINR(order.grandTotal, 2)}
                />
                <DetailField
                  label="Printed"
                  value={
                    order.status === 'Printed' || order.status === 'Settled'
                      ? `Yes ${order.created}`
                      : 'No'
                  }
                />
                <DetailField label="Coupon Code" value="" />
                <DetailField label="Sequence Name" value="—" />
              </div>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 text-sm font-bold text-ink">Order Items</h3>
              <div className="overflow-x-auto rounded-lg border border-line">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-primary/5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                      <th className="px-3 py-2.5">Item Name</th>
                      <th className="px-3 py-2.5">Special Note</th>
                      <th className="px-3 py-2.5 text-center">Quantity</th>
                      <th className="px-3 py-2.5 text-right">Unit Price (₹)</th>
                      <th className="px-3 py-2.5 text-right">Total Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, index) => (
                      <tr
                        key={`${item.name}-${index}`}
                        className="border-t border-line"
                      >
                        <td className="px-3 py-2.5 text-ink">{item.name}</td>
                        <td className="px-3 py-2.5 text-muted">
                          {item.specialNote}
                        </td>
                        <td className="px-3 py-2.5 text-center tabular-nums text-ink">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-ink">
                          {item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-ink">
                          {item.totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <dl className="w-full max-w-xs space-y-1.5 text-sm">
                  <div className="flex justify-between gap-6 text-muted">
                    <dt>CGST 2.5%</dt>
                    <dd className="tabular-nums text-ink">{halfTax.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between gap-6 text-muted">
                    <dt>SGST 2.5%</dt>
                    <dd className="tabular-nums text-ink">{halfTax.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between gap-6 text-muted">
                    <dt>Delivery Charge</dt>
                    <dd className="tabular-nums text-ink">0.00</dd>
                  </div>
                  <div className="flex justify-between gap-6 text-muted">
                    <dt>Container Charge</dt>
                    <dd className="tabular-nums text-ink">0.00</dd>
                  </div>
                  <div className="flex justify-between gap-6 text-muted">
                    <dt>Service Charge</dt>
                    <dd className="tabular-nums text-ink">0</dd>
                  </div>
                  <div className="flex justify-between gap-6 text-muted">
                    <dt>Round Off</dt>
                    <dd className="tabular-nums text-ink">
                      {roundOff.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-6 border-t border-line pt-2 font-bold text-ink">
                    <dt>Grand Total</dt>
                    <dd className="tabular-nums">
                      {order.grandTotal.toFixed(2)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
