import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  createAdvanceOrderApi,
  type CreateAdvanceOrderPayload,
  type OrderType as ApiOrderType,
} from '../../services/orderService'
import { showToast } from '../../utils/toast'
import type { CartLine, OrderType } from './BillPanel'

interface BillingAdvanceOrderModalProps {
  open: boolean
  outletId: string | null
  lines: CartLine[]
  total: number
  orderType: OrderType
  customerName: string
  customerPhone: string
  onClose: () => void
  onSaved: () => void
}

const PAYMENT_OPTIONS = ['Cash', 'Card', 'Due Payment', 'UPI', 'Other']

const ORDER_TYPE_LABELS: Partial<Record<ApiOrderType, string>> = {
  'dine-in': 'DINE IN',
  'pick-up': 'PARCEL',
  delivery: 'DELIVERY',
}

const fieldClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function dateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Books the current cart as an advance order for a chosen date and time. */
export function BillingAdvanceOrderModal({
  open,
  outletId,
  lines,
  total,
  orderType,
  customerName,
  customerPhone,
  onClose,
  onSaved,
}: BillingAdvanceOrderModalProps) {
  const [pending, setPending] = useState(false)
  const [date, setDate] = useState('')
  const [hours, setHours] = useState('00')
  const [minutes, setMinutes] = useState('00')
  const [payment, setPayment] = useState('Cash')
  const [advance, setAdvance] = useState('0')
  const [note, setNote] = useState('')

  // Start from "now" each time the dialog opens.
  useEffect(() => {
    if (!open) return
    const now = new Date()
    setDate(dateValue(now))
    setHours(pad(now.getHours()))
    setMinutes(pad(now.getMinutes()))
    setPayment('Cash')
    setAdvance('0')
    setNote('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const advanceValue = Number(advance)
  const paid = Number.isFinite(advanceValue) && advanceValue > 0 ? advanceValue : 0
  const remaining = Math.max(0, Math.round((total - paid) * 100) / 100)

  async function handleSave() {
    if (!outletId) {
      showToast('No outlet selected')
      return
    }
    if (lines.length === 0) {
      showToast('Add items to the bill first')
      return
    }
    if (!date) {
      showToast('Select a date')
      return
    }
    if (paid > total) {
      showToast('Advance amount cannot be more than the total')
      return
    }

    // Advance orders only know dine-in / pick-up / delivery.
    const apiType: ApiOrderType = orderType === 'other' ? 'pick-up' : orderType
    const payload: CreateAdvanceOrderPayload = {
      order_type: apiType,
      order_type_label: ORDER_TYPE_LABELS[apiType],
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      special_note: note.trim(),
      payment_type: payment,
      advance_amount: paid,
      grand_total: Number(total.toFixed(2)),
      scheduled_date: date,
      scheduled_time: `${hours}:${minutes}:00`,
      source: 'billing',
      items: lines.map((line) => ({
        name: line.name,
        note: line.note || undefined,
        qty: line.qty,
        unit_price: line.price,
        total_price: Math.round(line.price * line.qty * 100) / 100,
      })),
    }

    setPending(true)
    try {
      const created = await createAdvanceOrderApi(outletId, payload)
      showToast(`Advance order ${created.adv_order_no} booked`)
      onSaved()
      onClose()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to book advance order')
    } finally {
      setPending(false)
    }
  }

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
        className="relative z-10 flex max-h-[92vh] w-full max-w-[670px] flex-col overflow-hidden rounded-lg bg-card shadow-2xl"
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

          <div className="grid grid-cols-3 gap-4 rounded-md bg-page px-3 py-3 text-sm font-semibold text-ink">
            <span>
              Total (₹) <span className="ml-2 tabular-nums">{total}</span>
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
                      name="advance-payment"
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
            onClick={handleSave}
            disabled={pending}
            className="h-9 rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </footer>
      </div>
    </div>
  )
}
