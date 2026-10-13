import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { useAuth } from '../../auth/AuthContext'
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

function inputClass() {
  return 'h-9 w-full rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary'
}

const ORDER_TYPE_CHOICES: Array<{ value: OrderType; label: string }> = [
  { value: 'pick-up', label: 'PICK UP' },
  { value: 'delivery', label: 'DELIVERY' },
  { value: 'dine-in', label: 'DINE IN' },
]

function toDateValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function AdvanceOrderModal({
  open,
  outletId,
  defaultDate,
  onClose,
  onCreated,
}: AdvanceOrderModalProps) {
  const { user } = useAuth()
  const [pending, setPending] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [orderType, setOrderType] = useState<OrderType>('pick-up')
  const [scheduledDate, setScheduledDate] = useState(() => toDateValue(defaultDate))
  const [scheduledTime, setScheduledTime] = useState('19:00')
  const [advanceAmount, setAdvanceAmount] = useState('0')
  const [specialNote, setSpecialNote] = useState('')
  const [items, setItems] = useState<DraftItem[]>([])
  const [pendingRemove, setPendingRemove] = useState<DraftItem | null>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (items.length === 0) {
      setItems([{ id: crypto.randomUUID(), name: '', qty: '1', rate: '0' }])
    }
    return () => {
      document.body.style.overflow = previous
    }
  }, [open, items.length])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const grandTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = Number(item.qty)
      const rate = Number(item.rate)
      if (!Number.isFinite(qty) || !Number.isFinite(rate)) return sum
      return sum + qty * rate
    }, 0)
  }, [items])

  function updateItem(id: string, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: '', qty: '1', rate: '0' },
    ])
  }

  function removeItem(id: string) {
    setItems((prev) => {
      if (prev.length === 1) return prev
      return prev.filter((item) => item.id !== id)
    })
  }

  async function handleSubmit() {
    if (!outletId) {
      showToast('No outlet selected')
      return
    }
    const lines = items
      .map((item) => {
        const name = item.name.trim()
        const qty = Number(item.qty)
        const rate = Number(item.rate)
        if (!name) return null
        return {
          name,
          qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
          unit_price: Number.isFinite(rate) && rate > 0 ? rate : 0,
          total_price:
            (Number.isFinite(qty) && qty > 0 ? qty : 1) *
            (Number.isFinite(rate) && rate > 0 ? rate : 0),
        }
      })
      .filter((line): line is NonNullable<typeof line> => line !== null)

    if (lines.length === 0) {
      showToast('Add at least one item')
      return
    }
    if (!scheduledDate) {
      showToast('Pick a scheduled date')
      return
    }

    const payload: CreateAdvanceOrderPayload = {
      order_type: orderType,
      order_type_label: ORDER_TYPE_CHOICES.find((c) => c.value === orderType)?.label,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      special_note: specialNote.trim(),
      payment_type: 'Cash',
      advance_amount: Number.isFinite(Number(advanceAmount)) ? Number(advanceAmount) || 0 : 0,
      grand_total: Number(grandTotal.toFixed(2)),
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime ? `${scheduledTime}:00` : null,
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

  const biller = user?.name?.trim() || user?.identifier?.trim() || ''

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close new advance order"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="New Advance Order"
        className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">New Advance Order</h2>
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

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs text-muted">
              Customer Name
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`mt-1 ${inputClass()}`}
                placeholder="Customer name"
              />
            </label>
            <label className="text-xs text-muted">
              Phone
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className={`mt-1 ${inputClass()}`}
                placeholder="Phone number"
              />
            </label>
            <label className="text-xs text-muted">
              Order Type
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className={`mt-1 ${inputClass()}`}
              >
                {ORDER_TYPE_CHOICES.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted">
              Booking User
              <div className={`mt-1 flex h-9 items-center px-2.5 ${inputClass()}`}>
                {biller || '—'}
              </div>
            </label>
            <label className="text-xs text-muted">
              Scheduled Date
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={`mt-1 ${inputClass()}`}
              />
            </label>
            <label className="text-xs text-muted">
              Scheduled Time
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className={`mt-1 ${inputClass()}`}
              />
            </label>
            <label className="text-xs text-muted">
              Advance Amount (₹)
              <input
                type="number"
                min="0"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                className={`mt-1 ${inputClass()}`}
              />
            </label>
            <label className="text-xs text-muted">
              Special Note
              <input
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                className={`mt-1 ${inputClass()}`}
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="rounded-lg border border-line">
            <div className="flex items-center justify-between border-b border-line bg-primary/5 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Items
              </p>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-primary px-2 text-xs font-semibold text-primary hover:bg-primary/5"
              >
                <Plus size={13} /> Add Item
              </button>
            </div>
            <div className="max-h-52 space-y-2 overflow-y-auto p-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    placeholder="Item name"
                    className="h-8 min-w-0 flex-1 rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, { qty: e.target.value })}
                    aria-label="Quantity"
                    className="h-8 w-16 rounded-lg border border-line bg-card px-2 text-right text-sm text-ink outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, { rate: e.target.value })}
                    aria-label="Rate"
                    className="h-8 w-24 rounded-lg border border-line bg-card px-2 text-right text-sm text-ink outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => items.length > 1 && setPendingRemove(item)}
                    aria-label="Remove item"
                    data-tooltip="Remove item"
                    className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-line px-3 py-2 text-sm">
              <span className="text-muted">Grand Total</span>
              <span className="font-semibold tabular-nums text-ink">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending}
            className="inline-flex h-9 items-center rounded-lg border border-primary bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {pending ? 'Booking…' : 'Book Advance Order'}
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