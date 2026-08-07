import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { KotRow } from '../../mocks/kotData'
import { formatINR } from '../../utils/format'

interface OrderLineItem {
  name: string
  specialNote: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface KotOrderDetailsDrawerProps {
  open: boolean
  kot: KotRow | null
  onClose: () => void
}

function parseLineItems(kot: KotRow): OrderLineItem[] {
  const parts = kot.items
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  const qtyMatch = (text: string) => {
    const match =
      text.match(/\{(\d+)[^}]*\}/) ??
      text.match(/[×x]\s*(\d+)/i)
    return match ? Number(match[1]) : 1
  }

  const cleanName = (text: string) =>
    text.replace(/\s*[×x]\s*\d+/i, '').trim()

  if (parts.length === 0) {
    return [
      {
        name: '—',
        specialNote: '--',
        quantity: 1,
        unitPrice: 38.1,
        totalPrice: 38.1,
      },
    ]
  }

  const quantities = parts.map(qtyMatch)
  const totalQty = quantities.reduce((sum, q) => sum + q, 0) || 1
  // Keep demo totals close to typical POS values (e.g. ₹40 for one item)
  const baseSubtotal = Number((38.1 * totalQty).toFixed(2))
  const unitBase = baseSubtotal / totalQty

  return parts.map((part, index) => {
    const quantity = quantities[index]
    const unitPrice = Number(unitBase.toFixed(2))
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
      <p className="mt-0.5 break-words text-sm text-muted">{value}</p>
    </div>
  )
}

function orderStatusFromKot(kot: KotRow): string {
  if (kot.status === 'Cancelled') return 'Cancelled'
  if (kot.status === 'Pending') return 'Saved'
  return 'Printed'
}

export function KotOrderDetailsDrawer({
  open,
  kot,
  onClose,
}: KotOrderDetailsDrawerProps) {
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

  const lineItems = kot ? parseLineItems(kot) : []
  const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const cgst = Number((subtotal * 0.025).toFixed(2))
  const sgst = Number((subtotal * 0.025).toFixed(2))
  const beforeRound = subtotal + cgst + sgst
  const grandTotal = Math.round(beforeRound)
  const roundOff = Number((grandTotal - beforeRound).toFixed(2))
  const totalTax = Number((cgst + sgst).toFixed(2))
  const orderNo = kot ? String(54000 + kot.kotId) : ''
  const status = kot ? orderStatusFromKot(kot) : ''
  const printed =
    kot && status === 'Printed'
      ? `Yes (${kot.billPrintDate !== '--' ? kot.billPrintDate : kot.created})`
      : 'No'

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
        className={`absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
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

        {kot && (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 border-b border-line pb-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3">
                <DetailField label="Order No." value={orderNo} />
                <DetailField
                  label="Customer Phone"
                  value={kot.customerPhone || '-'}
                />
                <DetailField label="No. of Persons" value="-" />
                <DetailField label="Total Tax" value={formatINR(totalTax, 2)} />
                <DetailField
                  label="Settlement Amount"
                  value={formatINR(0, 2)}
                />
                <DetailField label="Paid" value="Yes" />
                <DetailField label="Tip" value="-" />
                <DetailField label="Settlement Counter" value="-" />
              </div>

              <div className="space-y-3">
                <DetailField label="Billing User" value="Utkarsh" />
                <DetailField label="Customer Address" value="-" />
                <DetailField label="Order Type" value={kot.orderType} />
                <DetailField
                  label="Total Discount"
                  value={`₹ (${(0).toFixed(2)})`}
                />
                <DetailField label="Order Status" value={status} />
                <DetailField label="Payment Type" value="Cash" />
                <DetailField label="Sub Order Type" value={kot.orderType} />
                <DetailField label="Settled By" value="-" />
              </div>

              <div className="space-y-3">
                <DetailField
                  label="Customer Name"
                  value={kot.customerName || '-'}
                />
                <DetailField label="Customer Locality" value="-" />
                <DetailField label="Assign to" value="-" />
                <DetailField
                  label="Grand Total"
                  value={formatINR(grandTotal, 2)}
                />
                <DetailField label="Printed" value={printed} />
                <DetailField label="Coupon Code" value="" />
                <DetailField label="Sequence Name" value="-" />
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
                    <dd className="tabular-nums text-ink">{cgst.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between gap-6 text-muted">
                    <dt>SGST 2.5%</dt>
                    <dd className="tabular-nums text-ink">{sgst.toFixed(2)}</dd>
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
                    <dd className="tabular-nums">{grandTotal.toFixed(2)}</dd>
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
