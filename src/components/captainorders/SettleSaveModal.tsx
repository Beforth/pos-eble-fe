import { useEffect, useMemo, useRef, useState } from 'react'
import { Clock3, CreditCard, Plus, Trash2, X } from 'lucide-react'
import { ConfirmDialog } from '../common/ConfirmDialog'
import {
  SelectDropdown,
  type SelectDropdownOption,
} from '../common/SelectDropdown'
import type { PaymentMethod } from './BillPanel'
import { OTHER_PAYMENT_TYPES, type OtherPaymentType } from './OtherPaymentModal'
import { showToast } from '../../utils/toast'

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'due', label: 'Due' },
  { id: 'other', label: 'Other' },
  { id: 'part', label: 'Part' },
]

const OTHER_PAYMENT_OPTIONS: SelectDropdownOption[] = OTHER_PAYMENT_TYPES.map(
  (type) => ({ value: type, label: type }),
)

type PartMethod = 'cash' | 'card' | 'upi' | 'other' | 'due'

interface PartEntry {
  id: string
  method: PartMethod
  label: string
  amount: number
}

const PART_METHODS: { id: PartMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'upi', label: 'UPI' },
  { id: 'other', label: 'Other' },
  { id: 'due', label: 'Due' },
]

export interface SettleSaveResult {
  payment: PaymentMethod
  customerPaid: number
  tip: number
  settlementAmount: number
  returnToCustomer: number
  due: number
  customerName: string
  otherType?: string
  partEntries?: PartEntry[]
}

interface SettleSaveModalProps {
  open: boolean
  label: string
  billAmount: number
  customerName?: string
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
  customerName,
  onClose,
  onConfirm,
}: SettleSaveModalProps) {
  /** The tax-inclusive `grand_total` this settle will send, at 2dp.
   *
   *  Every cap in this modal runs against this exact figure, never against a
   *  whole-rupee rounding of it: a bill of 1234.40 pre-fills to "1234.40", and
   *  clamping that to `roundSettlementAmount(billAmount)` (1234) would settle
   *  40 paise short and book a phantom `balance_due` on an untouched settle.
   *  Capping on the exact value also returns the right change when the cashier
   *  types an over-payment. */
  const exactBill = useMemo(
    () => Math.round(Number(billAmount) * 100) / 100,
    [billAmount],
  )
  const [payment, setPayment] = useState<PaymentMethod>('cash')
  const [customerPaid, setCustomerPaid] = useState('')
  const [tip, setTip] = useState('0')
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [otherType, setOtherType] = useState<OtherPaymentType>(
    OTHER_PAYMENT_TYPES[0],
  )
  const [partEntries, setPartEntries] = useState<PartEntry[]>([])
  const [pendingPart, setPendingPart] = useState<PartEntry | null>(null)
  const [partMethod, setPartMethod] = useState<PartMethod>('cash')
  const [partAmount, setPartAmount] = useState('')
  const [partOtherType, setPartOtherType] = useState<string>(
    OTHER_PAYMENT_TYPES[0],
  )
  const nameInputRef = useRef<HTMLInputElement>(null)
  const wasOpen = useRef(false)
  const customerPaidTouched = useRef(false)

  useEffect(() => {
    if (open && !wasOpen.current) {
      setPayment('cash')
      setCustomerPaid(String(exactBill))
      setTip('0')
      setName((customerName ?? '').trim())
      setNameError('')
      setOtherType(OTHER_PAYMENT_TYPES[0])
      setPartEntries([])
      setPartMethod('cash')
      setPartAmount(String(exactBill || ''))
      setPartOtherType(OTHER_PAYMENT_TYPES[0])
      customerPaidTouched.current = false
    }
    wasOpen.current = open
  }, [open, customerName, billAmount, exactBill])

  /**
   * Both terminals feed one kitchen, so another KOT can land on this table while
   * the settle modal is open. Re-fill the amount when the bill grows, but only
   * while the cashier has not typed — otherwise a stale prefill would settle
   * short and silently book a due.
   */
  useEffect(() => {
    if (!open || customerPaidTouched.current) return
    setCustomerPaid(String(exactBill))
  }, [open, exactBill])

  useEffect(() => {
    if (!open) return
const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
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

  const partPaid = useMemo(
    () => partEntries.reduce((sum, entry) => sum + entry.amount, 0),
    [partEntries],
  )
  const partRemaining = Math.max(
    0,
    Math.round((exactBill - partPaid) * 100) / 100,
  )

  useEffect(() => {
    if (payment !== 'part') return
    setPartAmount(partRemaining > 0 ? String(partRemaining) : '')
  }, [payment, partRemaining])

  const settlementValue = useMemo(() => {
    if (payment === 'part') {
      return Math.min(exactBill, partPaid)
    }
    if (payment === 'due') {
      const raw = Number(customerPaid)
      if (customerPaid.trim() === '' || Number.isNaN(raw) || raw < 0) {
        return 0
      }
      return raw >= exactBill ? exactBill : raw
    }
    const raw = Number(customerPaid)
    if (customerPaid.trim() === '' || Number.isNaN(raw) || raw < 0) {
      return exactBill
    }
    return raw >= exactBill ? exactBill : raw
  }, [customerPaid, exactBill, payment, partPaid])

  const tipValue = Number(tip) || 0
  const paidValue =
    payment === 'part' ? partPaid : Number(customerPaid) || 0
  const returnToCustomer = Math.max(
    0,
    Math.round((paidValue - settlementValue - tipValue) * 100) / 100,
  )
  const balanceDue = Math.max(
    0,
    Math.round((Number(billAmount) - settlementValue) * 100) / 100,
  )

  function handlePaymentSelect(method: PaymentMethod) {
    if (method === 'other') {
      setPayment('other')
      setPartEntries([])
      setNameError('')
      return
    }
    if (method === 'part') {
      setPayment('part')
      setNameError('')
      if (partEntries.length === 0) {
        setPartAmount(String(exactBill || ''))
      }
      return
    }
    if (method === 'due') {
      setPayment('due')
      setPartEntries([])
      window.setTimeout(() => nameInputRef.current?.focus(), 0)
      if (!name.trim()) {
        setNameError('Customer name is required for Due payment')
      }
      showToast('Due payment — enter customer name')
      return
    }
    if (method === 'card') {
      setPayment('card')
      setPartEntries([])
      setNameError('')
      showToast('Card payment selected')
      return
    }
    setPayment(method)
    setPartEntries([])
    setNameError('')
  }

  function addPartEntry() {
    const value = Number(partAmount)
    if (!Number.isFinite(value) || value <= 0) {
      showToast('Enter a valid part payment amount')
      return
    }
    if (value > partRemaining + 0.001) {
      showToast(`Amount cannot exceed remaining ₹${money(partRemaining)}`)
      return
    }
    const label =
      partMethod === 'other'
        ? `Other (${partOtherType})`
        : PART_METHODS.find((item) => item.id === partMethod)?.label ??
          partMethod
    setPartEntries((prev) => [
      ...prev,
      {
        id: `part-${Date.now()}`,
        method: partMethod,
        label,
        amount: Number(value.toFixed(2)),
      },
    ])
  }

  function handleConfirm() {
    if (payment === 'part') {
      if (partEntries.length === 0) {
        showToast('Add at least one part payment')
        return
      }
      if (partRemaining > 0.001) {
        showToast(
          `₹${money(partRemaining)} still remaining — add another payment or switch to Due`,
        )
        return
      }
    } else {
      const paid = Number(customerPaid)
      if (customerPaid.trim() === '' || Number.isNaN(paid) || paid < 0) {
        showToast('Enter the amount the customer paid')
        return
      }
    }

    if ((payment === 'due' || balanceDue > 0) && name.trim() === '') {
      setNameError('Required — a due balance needs a customer name')
      nameInputRef.current?.focus()
      return
    }

    onConfirm({
      payment,
      customerPaid: payment === 'part' ? partPaid : Number(customerPaid) || 0,
      tip: tipValue < 0 ? 0 : tipValue,
      settlementAmount: settlementValue,
      returnToCustomer: payment === 'part' ? 0 : returnToCustomer,
      due: balanceDue,
      customerName: name.trim(),
      otherType: payment === 'other' ? otherType : undefined,
      partEntries: payment === 'part' ? partEntries : undefined,
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
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
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
            data-tooltip="Close"
            className="cursor-pointer rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Payment Type</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_OPTIONS.map((option) => {
                const selected = payment === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handlePaymentSelect(option.id)}
                    className={`inline-flex h-9 cursor-pointer items-center rounded-md border px-3 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-line bg-white text-ink hover:bg-page'
                    }`}
                  >
                    {option.label}
                    {option.id === 'other' && payment === 'other' ? (
                      <span className="ml-1 text-xs text-muted">({otherType})</span>
                    ) : null}
                  </button>
                )
              })}
            </div>
            {payment === 'due' ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                <Clock3 size={13} />
                Due payment — customer name is required
              </p>
            ) : null}
            {payment === 'card' ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                <CreditCard size={13} />
                Card payment selected
              </p>
            ) : null}
            {payment === 'other' ? (
              <div className="mt-2 grid grid-cols-[140px_1fr] items-center gap-3">
                <span className="text-sm font-semibold text-ink">Paid via</span>
                <SelectDropdown
                  value={otherType}
                  options={OTHER_PAYMENT_OPTIONS}
                  onChange={(next) => setOtherType(next as OtherPaymentType)}
                  caption="Paid via"
                  searchable={false}
                  triggerClassName="w-full"
                />
              </div>
            ) : null}
          </div>

          <label className="grid grid-cols-[140px_1fr] items-center gap-3 text-sm font-semibold text-ink">
            Customer Name
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (nameError) setNameError('')
              }}
              placeholder={
                payment === 'due' || balanceDue > 0 ? 'Required' : 'Walk-in'
              }
              className={`h-10 rounded-md border bg-white px-3 text-sm font-normal text-ink outline-none focus:border-primary ${
                nameError ? 'border-amber-500' : 'border-line'
              }`}
            />
          </label>

          {nameError ? (
            <p className="pl-[152px] text-xs font-medium text-amber-600">
              {nameError}
            </p>
          ) : null}

          {payment === 'part' ? (
            <div className="space-y-3 rounded-lg border border-line bg-page/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="font-semibold text-ink">Part Payment</p>
                <p className="text-muted">
                  Remaining:{' '}
                  <span className="font-semibold text-primary">
                    ₹{money(partRemaining)}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PART_METHODS.map((method) => {
                  const active = partMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPartMethod(method.id)}
                      className={`inline-flex h-8 cursor-pointer items-center rounded-md border px-2.5 text-xs font-semibold ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-line bg-white text-ink hover:bg-card'
                      }`}
                    >
                      {method.label}
                    </button>
                  )
                })}
              </div>

              {partMethod === 'other' ? (
                <select
                  value={partOtherType}
                  onChange={(e) => setPartOtherType(e.target.value)}
                  className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm outline-none focus:border-primary"
                >
                  {OTHER_PAYMENT_TYPES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : null}

              <div className="flex flex-wrap items-end gap-2">
                <label className="text-sm font-medium text-ink">
                  Amount
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={partAmount}
                    onChange={(e) => setPartAmount(e.target.value)}
                    className="mt-1 block h-9 w-36 rounded-md border border-line bg-white px-3 text-sm font-normal outline-none focus:border-primary"
                  />
                </label>
                <button
                  type="button"
                  onClick={addPartEntry}
                  className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  <Plus size={15} />
                  Add
                </button>
              </div>

              {partEntries.length > 0 ? (
                <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
                  {partEntries.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <span className="text-ink">
                        {entry.label}{' '}
                        <span className="font-semibold text-primary">
                          ₹{money(entry.amount)}
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${entry.label}`}
                        data-tooltip={`Remove ${entry.label}`}
                        onClick={() => setPendingPart(entry)}
                        className="cursor-pointer rounded p-1 text-muted hover:bg-page hover:text-ink"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted">
                  Add one or more payments until the remaining amount is zero.
                </p>
              )}
            </div>
          ) : (
            <>
              <label className="grid grid-cols-[140px_1fr] items-center gap-3 text-sm font-semibold text-ink">
                Customer Paid
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={customerPaid}
                  onChange={(e) => {
                    customerPaidTouched.current = true
                    setCustomerPaid(e.target.value)
                  }}
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
            </>
          )}

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
            <span className="text-base font-bold text-primary">
              {money(settlementValue)}
            </span>
          </label>

          {balanceDue > 0 ? (
            <div className="grid grid-cols-[140px_1fr] items-center gap-3 text-sm font-semibold text-ink">
              Balance Due
              <span className="text-base font-bold text-amber-600">
                {money(balanceDue)}
              </span>
            </div>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 cursor-pointer rounded-lg px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-9 cursor-pointer rounded-lg bg-ink px-4 text-sm font-semibold text-white hover:bg-ink/90"
          >
            Settle &amp; Save
          </button>
        </footer>
      </div>

      <ConfirmDialog
        open={Boolean(pendingPart)}
        compact
        title="Remove payment part"
        target={pendingPart?.label}
        message={
          pendingPart
            ? `${pendingPart.label} of ₹${pendingPart.amount.toFixed(2)} will be removed from this settle entry.`
            : undefined
        }
        note="Nothing is recorded until you settle — the amount goes back to the outstanding total."
        confirmLabel="Remove"
        onConfirm={() => {
          if (pendingPart)
            setPartEntries((prev) =>
              prev.filter((item) => item.id !== pendingPart.id),
            )
          setPendingPart(null)
        }}
        onClose={() => setPendingPart(null)}
      />
    </div>
  )
}
