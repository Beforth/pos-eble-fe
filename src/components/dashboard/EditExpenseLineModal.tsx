import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { ExpenseType } from '../../types'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { SearchableSelect } from '../inventory/SearchableSelect'

interface EditExpenseLineModalProps {
  type: ExpenseType | null
  onClose: () => void
  onSave: (amount: number) => void
}

const TITLES: Record<ExpenseType, string[]> = {
  expense: [
    'Advance Salary',
    'Chai',
    'Electricity',
    'Gas',
    'Groceries',
    'Internet',
    'Labour Charges',
    'Maintenance',
    'Packaging',
    'Petrol',
    'Rent',
    'Salary',
    'Vegetables',
  ],
  withdrawal: [
    'Owner withdrawal',
    'Partner withdrawal',
    'Bank deposit',
    'Personal',
  ],
  topup: ['Opening cash', 'Bank to till', 'Cash from owner'],
}

const COPY: Record<
  ExpenseType,
  { title: string; titleLabel: string }
> = {
  expense: { title: 'Add expense', titleLabel: 'Expense title' },
  withdrawal: { title: 'Add withdrawal', titleLabel: 'Withdrawal title' },
  topup: { title: 'Add cash top up', titleLabel: 'Top up title' },
}

function todayInput(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function EditExpenseLineModal({
  type,
  onClose,
  onSave,
}: EditExpenseLineModalProps) {
  const titleId = useId()
  const [date, setDate] = useState(todayInput)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!type) return
    setDate(todayInput())
    setTitle('')
    setAmount('')
    setPaymentMode('Cash')
    setNote('')
    setError('')
  }, [type])

  useEffect(() => {
    if (!type) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [type, onClose])

  if (!type) return null

  const copy = COPY[type]

  function handleSave() {
    const value = Number(amount)
    if (!title) {
      setError('Please select a title')
      return
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter an amount greater than 0')
      return
    }
    onSave(value)
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-line bg-card shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            {copy.title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
          <SearchableSelect
            label={copy.titleLabel}
            required
            value={title}
            options={TITLES[type]}
            placeholder="Please select"
            onChange={setTitle}
          />
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value)
              setError('')
            }}
            placeholder="0.00"
            required
          />
          <SearchableSelect
            label="Payment mode"
            value={paymentMode}
            options={['Cash', 'UPI', 'Card', 'Bank']}
            onChange={setPaymentMode}
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">
              Note
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Optional"
              className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </label>
          {error ? (
            <p className="text-xs text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
