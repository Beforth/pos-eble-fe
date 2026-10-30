import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { ConfirmDialog } from '../common/ConfirmDialog'
import {
  createAdvanceOrderApi,
  type CreateAdvanceOrderPayload,
  type OrderType,
} from '../../services/orderService'
import { showToast } from '../../utils/toast'

interface DraftItem {
  id: string
  name: string
  qty: string
  rate: string
}

interface AdvanceOrderModalProps {
  open: boolean
  outletId: string | null
  defaultDate: Date
  onClose: () => void
  onCreated: () => void
}

const PAYMENT_OPTIONS = ['Cash', 'Card', 'Due Payment', 'UPI', 'Other']

const ORDER_TYPE_CHOICES: Array<{ value: OrderType; label: string }> = [
  { value: 'pick-up', label: 'PARCEL' },
  { value: 'dine-in', label: 'DINE IN' },
]

const fieldClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toDateValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function newItem(): DraftItem {
  return { id: crypto.randomUUID(), name: '', qty: '1', rate: '0' }
}

/**
 * Books an advance order by hand (items typed in). Same layout as the billing
 * screen's Advance Order dialog: date/time, Total · Paid · Remaining, payment
 * options, advance amount and a customer note.
 */
export function AdvanceOrderModal({
  open,
  outletId,
  defaultDate,
  onClose,
  onCreated,
}: AdvanceOrderModalProps) {
  const [pending, setPending] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [orderType, setOrderType] = useState<OrderType>('pick-up')
  const [date, setDate] = useState(() => toDateValue(defaultDate))
  const [hours, setHours] = useState('19')
  const [minutes, setMinutes] = useState('00')
  const [payment, setPayment] = useState('Cash')
  const [advance, setAdvance] = useState('0')
  const [note, setNote] = useState('')
  const [items, setItems] = useState<DraftItem[]>([newItem()])
  const [pendingRemove, setPendingRemove] = useState<DraftItem | null>(null)

  // Fresh form each time the dialog opens.
  useEffect(() => {
    if (!open) return
    setCustomerName('')
    setCustomerPhone('')
    setOrderType('pick-up')
    setDate(toDateValue(defaultDate))
    setHours('19')
    setMinutes('00')
    setPayment('Cash')
    setAdvance('0')
    setNote('')
    setItems([newItem()])
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on open only
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const grandTotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const qty = Number(item.qty)
        const rate = Number(item.rate)
        if (!Number.isFinite(qty) || !Number.isFinite(rate)) return sum
        return sum + qty * rate
      }, 0),
    [items],
  )

  const advanceValue = Number(advance)
  const paid = Number.isFinite(advanceValue) && advanceValue > 0 ? advanceValue : 0
  const remaining = Math.max(0, Math.round((grandTotal - paid) * 100) / 100)

  function updateItem(id: string, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== id)))
  }

  async function handleSubmit() {
    if (!outletId) {
      showToast('No outlet selected')
      return
    }
    const lines = items
      .map((item) => {
        const name = item.name.trim()
        if (!name) return null
        const qty = Number(item.qty)
        const rate = Number(item.rate)
        const safeQty = Number.isFinite(qty) && qty > 0 ? qty : 1
        const safeRate = Number.isFinite(rate) && rate > 0 ? rate : 0
        return {
          name,
          qty: safeQty,
          unit_price: safeRate,
          total_price: Math.round(safeQty * safeRate * 100) / 100,
        }
      })
      .filter((line): line is NonNullable<typeof line> => line !== null)

    if (lines.length === 0) {
      showToast('Add at least one item')
      return
    }
    if (!date) {
      showToast('Select a date')
      return
    }
    if (paid > grandTotal) {
      showToast('Advance amount cannot be more than the total')
      return
    }

    const payload: CreateAdvanceOrderPayload = {
      order_type: orderType,
      order_type_label: ORDER_TYPE_CHOICES.find((c) => c.value === orderType)?.label,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      special_note: note.trim(),
      payment_type: payment,
      advance_amount: paid,
      grand_total: Number(grandTotal.toFixed(2)),
      scheduled_date: date,
      scheduled_time: `${hours}:${minutes}:00`,
      source: 'all-orders',
      items: lines,
    }

    setPending(true)
    try {
      const created = await createAdvanceOrderApi(outletId, payload)
      showToast(`Advance order ${created.adv_order_no} booked`)
      onCreated()
      onClose()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to book advance order')
    } finally {
      setPending(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close advance order"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Advance Order"
        className="relative z-10 flex max-h-[92vh] w-full max-w-[720px] flex-col overflow-hidden rounded-lg bg-card shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3.5">
          <h2 className="text-base font-semibold text-ink">Advance Order</h2>
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

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <label className="text-sm text-ink">
              Customer Name
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                className={`mt-1 ${fieldClass}`}
              />
            </label>
            <label className="text-sm text-ink">
              Phone
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Phone number"
                className={`mt-1 ${fieldClass}`}
              />
            </label>
            <label className="text-sm text-ink">
              Order Type
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className={`mt-1 ${fieldClass}`}
              >
                {ORDER_TYPE_CHOICES.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="text-sm text-ink">
              Select Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`mt-1 ${fieldClass}`}
              />
            </label>
            <label className="text-sm text-ink">
              Hours
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className={`mt-1 ${fieldClass}`}
              >
                {Array.from({ length: 24 }, (_, i) => pad(i)).map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-ink">
              Minutes
              <select
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className={`mt-1 ${fieldClass}`}
              >
                {Array.from({ length: 60 }, (_, i) => pad(i)).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="overflow-hidden rounded-md border border-line">
            <div className="flex items-center justify-between border-b border-line bg-page px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Items
              </p>
              <button
                type="button"
                onClick={() => setItems((prev) => [...prev, newItem()])}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-primary px-2.5 text-xs font-semibold text-primary hover:bg-primary/5"
              >
                <Plus size={13} /> Add Item
              </button>
            </div>
            <div className="max-h-44 space-y-2 overflow-y-auto p-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    placeholder="Item name"
                    className="h-9 min-w-0 flex-1 rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, { qty: e.target.value })}
                    aria-label="Quantity"
                    className="h-9 w-16 rounded-md border border-line bg-card px-2 text-right text-sm text-ink outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, { rate: e.target.value })}
                    aria-label="Rate"
                    className="h-9 w-24 rounded-md border border-line bg-card px-2 text-right text-sm text-ink outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => items.length > 1 && setPendingRemove(item)}
                    aria-label="Remove item"
                    data-tooltip="Remove item"
                    className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-primary"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-md bg-page px-3 py-3 text-sm font-semibold text-ink">
            <span>
              Total (₹) <span className="ml-2 tabular-nums">{grandTotal.toFixed(2)}</span>
            </span>
            <span>
              Paid (₹) <span className="ml-2 tabular-nums">{paid}</span>
            </span>
            <span>
              Remaining (₹) <span className="ml-2 tabular-nums">{remaining}</span>
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-4">
            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold text-ink">
                Payment Options
              </legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {PAYMENT_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink"
                  >
                    <input
                      type="radio"
                      name="advance-order-payment"
                      checked={payment === option}
                      onChange={() => setPayment(option)}
                      className="size-4 accent-primary"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="w-[190px] text-sm font-semibold text-ink">
              Advance amount
              <input
                type="number"
                min={0}
                value={advance}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setAdvance(e.target.value)}
                className={`mt-1 ${fieldClass}`}
              />
            </label>
          </div>

          <label className="block text-sm font-semibold text-ink">
            Customer Note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1 w-full resize-y rounded-md border border-line bg-card px-3 py-2 text-sm font-normal text-ink outline-none focus:border-primary"
            />
          </label>

          <p className="text-xs text-blue-600">
            Note : If a bill is printed after 9 days or if a bill is printed before the
            advance order/delivery date, consumption will not be recorded.
          </p>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md border border-line px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending}
            className="h-9 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </footer>

        <ConfirmDialog
          open={Boolean(pendingRemove)}
          compact
          title="Remove item"
          target={pendingRemove?.name?.trim() || undefined}
          message="This draft item will be removed from the advance order."
          note="Nothing is booked until you confirm — you can re-add the item before then."
          confirmLabel="Remove"
          onConfirm={() => {
            if (pendingRemove) removeItem(pendingRemove.id)
            setPendingRemove(null)
          }}
          onClose={() => setPendingRemove(null)}
        />
      </div>
    </div>
  )
}
