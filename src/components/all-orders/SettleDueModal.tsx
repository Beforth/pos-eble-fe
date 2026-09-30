import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { AllOrderRow } from '../../mocks/allOrdersData'
import { formatINR } from '../../utils/format'

const METHOD_OPTIONS = ['Cash', 'Card', 'UPI', 'Other']

export interface SettleDueSavePayload {
  amount: number
  method: string
  note: string
}

interface SettleDueModalProps {
  open: boolean
  order: AllOrderRow | null
  onClose: () => void
  onSave: (orderId: string, payload: SettleDueSavePayload) => void
}

export function SettleDueModal({
  open,
  order,
  onClose,
  onSave,
}: SettleDueModalProps) {
  const due = order?.balanceDue ?? 0
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Cash')
  const [note, setNote] = useState('')
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    if (open) {
      setAmount(due > 0 ? String(due) : '')
      setMethod('Cash')
      setNote('')
      setAttempted(false)
    }
  }, [open, due])

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

  const parsed = Number(amount)
  const amountError = attempted && (!Number.isFinite(parsed) || parsed <= 0)
  const overDueError =
    attempted && Number.isFinite(parsed) && parsed > 0 && parsed > due

  const handleSave = () => {
    setAttempted(true)
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > due) return
    onSave(order.id, { amount: parsed, method, note: note.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close settle due"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settle Due Payment"
        className="relative z-10 w-full max-w-xl overflow-visible rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">Settle Due Payment</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-5 px-5 py-5">
          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[180px_1fr]">
            <p className="pt-2.5 text-sm font-semibold text-ink">Order</p>
            <div className="rounded-lg bg-page px-3 py-2 text-sm text-ink">
              #{order.orderNo}
              <span className="ml-2 text-muted">
                {order.orderType} · {order.customerName || 'Walk-in'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[180px_1fr]">
            <p className="pt-2.5 text-sm font-semibold text-ink">
              Due Balance
            </p>
            <p className="rounded-lg bg-accent/10 px-3 py-2 text-sm font-bold text-accent">
              {formatINR(due)}
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[180px_1fr]">
            <p className="pt-2.5 text-sm font-semibold text-ink">
              Amount
              <span className="text-danger"> *</span>
            </p>
            <div>
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full rounded-lg border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary ${
                  attempted && (amountError || overDueError)
                    ? 'border-danger'
                    : 'border-line'
                }`}
              />
              {amountError ? (
                <p className="mt-1 text-xs text-danger">
                  Enter an amount greater than zero.
                </p>
              ) : null}
              {overDueError ? (
                <p className="mt-1 text-xs text-danger">
                  Amount cannot exceed the due balance ({formatINR(due)}).
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[180px_1fr]">
            <p className="pt-2.5 text-sm font-semibold text-ink">Method</p>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            >
              {METHOD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[180px_1fr]">
            <p className="pt-2.5 text-sm font-semibold text-ink">Note</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Optional note"
              className="w-full resize-y rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
        </div>

        <footer className="flex items-center justify-end gap-4 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Collect Due
          </button>
        </footer>
      </div>
    </div>
  )
}