import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import type { AllOrderRow } from '../../mocks/allOrdersData'

const PAYMENT_OPTIONS = [
  { value: '', label: 'Select Payment Type' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Card', label: 'Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Other', label: 'Other' },
]

interface ChangePaymentModalProps {
  open: boolean
  order: AllOrderRow | null
  onClose: () => void
  onSave: (orderId: string, payment: string, reason: string) => void
}

function PaymentTypeSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const selected =
    PAYMENT_OPTIONS.find((option) => option.value === value) ?? PAYMENT_OPTIONS[0]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PAYMENT_OPTIONS
    return PAYMENT_OPTIONS.filter((option) =>
      option.label.toLowerCase().includes(q),
    )
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-card px-3 text-left text-sm transition-colors ${
          open
            ? 'border-primary'
            : 'border-line hover:border-muted'
        }`}
      >
        <span className={value ? 'text-ink' : 'text-muted'}>
          {selected.label}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-full overflow-hidden rounded-lg border border-line bg-card shadow-lg">
          <div className="border-b border-line p-2">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-line px-2.5">
              <Search size={14} className="shrink-0 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-sm text-ink outline-none"
              />
            </label>
          </div>
          <ul role="listbox" className="max-h-48 overflow-y-auto py-1">
            {filtered.map((option) => {
              const isSelected = option.value === value
              return (
                <li key={option.label} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-page ${
                      isSelected ? 'font-medium text-primary' : 'text-ink'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected ? (
                      <Check size={14} className="shrink-0 text-success" />
                    ) : null}
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export function ChangePaymentModal({
  open,
  order,
  onClose,
  onSave,
}: ChangePaymentModalProps) {
  const [payment, setPayment] = useState('')
  const [reason, setReason] = useState('')
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    if (open) {
      setPayment('')
      setReason('')
      setAttempted(false)
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

  if (!open || !order) return null

  const paymentError = attempted && !payment
  const reasonError = attempted && !reason.trim()

  const handleSave = () => {
    setAttempted(true)
    if (!payment || !reason.trim()) return
    onSave(order.id, payment, reason.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close change payment type"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Change Order Payment Type"
        className="relative z-10 w-full max-w-xl overflow-visible rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">
            Change Order Payment Type
          </h2>
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
            <p className="pt-2.5 text-sm font-semibold text-ink">
              Change Payment Type
              <span className="text-danger"> *</span>
            </p>
            <div>
              <PaymentTypeSelect value={payment} onChange={setPayment} />
              {paymentError ? (
                <p className="mt-1 text-xs text-danger">
                  Please select a payment type.
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[180px_1fr]">
            <p className="pt-2 text-sm font-semibold text-ink">
              Reason
              <span className="text-danger"> *</span>
            </p>
            <div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className={`w-full resize-y rounded-lg border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary ${
                  reasonError ? 'border-danger' : 'border-line'
                }`}
              />
              {reasonError ? (
                <p className="mt-1 text-xs text-danger">Please enter a reason.</p>
              ) : null}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-4 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-muted hover:text-ink"
          >
            Don&apos;t Save
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </footer>
      </div>
    </div>
  )
}
