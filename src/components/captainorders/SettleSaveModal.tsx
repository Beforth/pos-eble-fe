import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { PaymentMethod } from './BillPanel'
import { roundSettlementAmount } from '../../utils/settlementRound'

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'due', label: 'Due' },
  { id: 'other', label: 'Other' },
  { id: 'part', label: 'Part' },
]

export interface SettleSaveResult {
  payment: PaymentMethod
  customerPaid: number
  tip: number
  settlementAmount: number
  returnToCustomer: number
}

interface SettleSaveModalProps {
  open: boolean
  label: string
  billAmount: number
  onClose: () => void
  onConfirm: (result: SettleSaveResult) => void
}

function money(n: number) {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function SettleSaveModal({
  open,
  label,
  billAmount,
  onClose,
  onConfirm,
}: SettleSaveModalProps) {
  const defaultSettlement = roundSettlementAmount(billAmount)
  const [payment, setPayment] = useState<PaymentMethod>('cash')
  const [customerPaid, setCustomerPaid] = useState('')
  const [tip, setTip] = useState('0')
  const [settlement, setSettlement] = useState('')

  useEffect(() => {
    if (!open) return
    setPayment('cash')
    setCustomerPaid('')
    setTip('0')
    setSettlement(String(defaultSettlement))
  }, [open, defaultSettlement])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const settlementValue = useMemo(() => {
    const raw = Number(settlement)
    if (settlement.trim() === '' || Number.isNaN(raw) || raw < 0) {
      return defaultSettlement
    }
    return roundSettlementAmount(raw)
  }, [settlement, defaultSettlement])

  const tipValue = Number(tip) || 0
  const paidValue = Number(customerPaid) || 0
  const returnToCustomer = Math.max(
    0,
    Math.round((paidValue - settlementValue - tipValue) * 100) / 100,
  )

  function handleConfirm() {
    const paid = Number(customerPaid)
    if (customerPaid.trim() === '' || Number.isNaN(paid) || paid < 0) {
      return
    }
    onConfirm({
      payment,
      customerPaid: paid,
      tip: tipValue < 0 ? 0 : tipValue,
      settlementAmount: settlementValue,
      returnToCustomer,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close settle and save"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settle and Save"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">
            Settle &amp; Save For - {label}{' '}
            <span className="font-semibold text-accent">
              [ ₹{money(billAmount)} ]
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Payment Type</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {PAYMENT_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink"
                >
                  <input
                    type="radio"
                    name="settle-payment"
                    checked={payment === option.id}
                    onChange={() => setPayment(option.id)}
                    className="size-3.5 accent-primary"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <label className="grid grid-cols-[140px_1fr] items-center gap-3 text-sm font-semibold text-ink">
            Customer Paid
            <input
              type="number"
              min={0}
              step="0.01"
              value={customerPaid}
              onChange={(e) => setCustomerPaid(e.target.value)}
              autoFocus
              className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink outline-none focus:border-primary"
            />
          </label>

          <div className="grid grid-cols-[140px_1fr] items-center gap-3 text-sm font-semibold text-ink">
            Return to Customer
            <span className="text-base font-bold text-primary">
              {money(returnToCustomer)}
            </span>
          </div>

          <label className="grid grid-cols-[140px_1fr] items-center gap-3 text-sm font-semibold text-ink">
            Tip
            <input
              type="number"
              min={0}
              step="0.01"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink outline-none focus:border-primary"
            />
          </label>

          <label className="grid grid-cols-[140px_1fr] items-center gap-3 text-sm font-semibold text-ink">
            Settlement Amount
            <input
              type="number"
              min={0}
              step="0.01"
              value={settlement}
              onChange={(e) => setSettlement(e.target.value)}
              onBlur={() => {
                const raw = Number(settlement)
                if (settlement.trim() === '' || Number.isNaN(raw) || raw < 0) {
                  setSettlement(String(defaultSettlement))
                  return
                }
                setSettlement(String(roundSettlementAmount(raw)))
              }}
              className="h-10 rounded-md border border-line bg-white px-3 text-sm font-normal text-ink outline-none focus:border-primary"
            />
          </label>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-9 rounded-lg bg-ink px-4 text-sm font-semibold text-white hover:bg-ink/90"
          >
            Settle &amp; Save
          </button>
        </footer>
      </div>
    </div>
  )
}
