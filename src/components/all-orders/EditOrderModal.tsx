import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import type { AllOrderRow } from '../../mocks/allOrdersData'

interface EditLineItem {
  id: string
  name: string
  specialNote: string
  quantity: number
  unitPrice: number
}

interface EditOrderModalProps {
  open: boolean
  order: AllOrderRow | null
  onClose: () => void
  onSave?: (order: AllOrderRow, items: EditLineItem[]) => void
}

function buildLineItems(order: AllOrderRow): EditLineItem[] {
  const parts = order.items
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    return [
      {
        id: '1',
        name: 'Item',
        specialNote: '--',
        quantity: 1,
        unitPrice: Number(order.myAmount.toFixed(2)),
      },
    ]
  }

  const quantities = parts.map((text) => {
    const match = text.match(/×\s*(\d+)/i) ?? text.match(/x\s*(\d+)/i)
    return match ? Number(match[1]) : 1
  })
  const totalQty = quantities.reduce((sum, q) => sum + q, 0) || 1
  const unitBase = order.myAmount / totalQty

  return parts.map((part, index) => ({
    id: String(index + 1),
    name: part.replace(/\s*[×x]\s*\d+/i, '').trim(),
    specialNote: '--',
    quantity: quantities[index],
    unitPrice: Number(unitBase.toFixed(2)),
  }))
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-ink">{label}:</p>
      <div className="mt-0.5 text-sm text-muted">{children}</div>
    </div>
  )
}

export function EditOrderModal({
  open,
  order,
  onClose,
  onSave,
}: EditOrderModalProps) {
  const [items, setItems] = useState<EditLineItem[]>([])
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  useEffect(() => {
    if (open && order) {
      setItems(buildLineItems(order))
      setEditingItemId(null)
    }
  }, [open, order])

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

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  )
  const cgst = Number((subtotal * 0.025).toFixed(2))
  const sgst = Number((subtotal * 0.025).toFixed(2))
  const beforeRound = subtotal + cgst + sgst
  const grandTotal = Math.round(beforeRound)
  const roundOff = Number((grandTotal - beforeRound).toFixed(2))

  function setQuantity(id: string, quantity: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.floor(quantity) || 1) }
          : item,
      ),
    )
  }

  function setItemName(id: string, name: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item)),
    )
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id))
    setEditingItemId((current) => (current === id ? null : current))
  }

  if (!open || !order) return null

  const paymentParts = order.payment.match(/^(.*?)(\[.*\])?$/)
  const paymentMain = paymentParts?.[1]?.trim() || order.payment
  const paymentTag = paymentParts?.[2]

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close edit order"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit Order"
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">Edit Order</h2>
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
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 border-b border-line pb-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <Field label="Order No.">{order.orderNo}</Field>
              <Field label="Customer Phone">—</Field>
              <Field label="No. of Persons">—</Field>
              <Field label="Payment Type">
                <span>
                  {paymentMain}
                  {paymentTag ? (
                    <span className="text-accent"> {paymentTag}</span>
                  ) : null}
                </span>
              </Field>
            </div>
            <div className="space-y-3">
              <Field label="Billing User">Utkarsh</Field>
              <Field label="Customer Address">—</Field>
              <Field label="Order Type">{order.orderType}</Field>
              <Field label="Order Status">
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                >
                  {order.status}
                </button>
              </Field>
            </div>
            <div className="space-y-3">
              <Field label="Customer Name">
                {order.customerName || '—'}
              </Field>
              <Field label="Customer Locality">—</Field>
              <Field label="Settlement Amount">0.00</Field>
              <Field label="Printed">
                {order.status === 'Printed' || order.status === 'Settled'
                  ? 'Yes'
                  : 'No'}
              </Field>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary/5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="w-10 px-2 py-2.5" />
                  <th className="w-10 px-2 py-2.5" />
                  <th className="px-3 py-2.5">Item Name</th>
                  <th className="px-3 py-2.5">Special Note</th>
                  <th className="px-3 py-2.5 text-center">Quantity</th>
                  <th className="px-3 py-2.5 text-right">Unit Price (₹)</th>
                  <th className="px-3 py-2.5 text-right">Total Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isEditing = editingItemId === item.id
                  return (
                    <tr key={item.id} className="border-t border-line">
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.id)}
                          className="flex size-7 items-center justify-center rounded border border-line text-danger hover:bg-page"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <button
                          type="button"
                          aria-label={
                            isEditing ? `Done editing ${item.name}` : `Edit ${item.name}`
                          }
                          onClick={() =>
                            setEditingItemId(isEditing ? null : item.id)
                          }
                          className={`flex size-7 items-center justify-center rounded border transition-colors ${
                            isEditing
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-line text-muted hover:bg-page hover:text-ink'
                          }`}
                        >
                          <Pencil size={13} />
                        </button>
                      </td>
                      <td className="px-3 py-2 text-ink">
                        {isEditing ? (
                          <input
                            autoFocus
                            value={item.name}
                            size={Math.max(item.name.length, 8)}
                            onChange={(e) =>
                              setItemName(item.id, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === 'Escape') {
                                setEditingItemId(null)
                              }
                            }}
                            onBlur={() => setEditingItemId(null)}
                            className="h-8 max-w-[220px] rounded border border-primary bg-card px-2 text-sm text-ink outline-none"
                          />
                        ) : (
                          item.name
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted">{item.specialNote}</td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            setQuantity(item.id, Number(e.target.value))
                          }
                          className="mx-auto h-8 w-16 rounded border border-line bg-card px-2 text-center text-sm tabular-nums outline-none focus:border-primary"
                        />
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-ink">
                        {item.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-ink">
                        {(item.unitPrice * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-8 text-center text-sm text-muted"
                    >
                      No items in this order.
                    </td>
                  </tr>
                )}
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
                <dd className="tabular-nums text-ink">0.00</dd>
              </div>
              <div className="flex justify-between gap-6 text-muted">
                <dt>Round Off</dt>
                <dd className="tabular-nums text-ink">
                  {roundOff >= 0 ? '+' : ''}
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

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Don&apos;t Save
          </button>
          <button
            type="button"
            onClick={() => {
              onSave?.(order, items)
              onClose()
            }}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  )
}
