import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export interface FinalBillCustomer {
  name: string
  phone: string
}

interface FinalBillCustomerModalProps {
  open: boolean
  kotCount: number
  total: number
  tableNo: string
  confirmLabel?: string
  initial?: Partial<FinalBillCustomer>
  onClose: () => void
  onConfirm: (customer: FinalBillCustomer) => void
}

function normalizePhoneDigits(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2)
  }
  return digits.slice(0, 10)
}

function sanitizeName(value: string): string {
  return value.replace(/[^A-Za-z\s]/g, '').slice(0, 10)
}

function letterCount(value: string): number {
  return (value.match(/[A-Za-z]/g) ?? []).length
}

export function FinalBillCustomerModal({
  open,
  kotCount,
  total,
  tableNo,
  confirmLabel = 'Print Bill',
  initial,
  onClose,
  onConfirm,
}: FinalBillCustomerModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})

  useEffect(() => {
    if (!open) return
    setName(sanitizeName(initial?.name?.trim() ?? ''))
    setPhone(normalizePhoneDigits(initial?.phone?.trim() ?? ''))
    setErrors({})
  }, [open, initial?.name, initial?.phone])

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

  function handleConfirm() {
    const trimmedName = name.trim().replace(/\s+/g, ' ')
    const digits = normalizePhoneDigits(phone)
    const nextErrors: { name?: string; phone?: string } = {}

    const letters = letterCount(trimmedName)
    if (letters < 2 || letters > 10 || !/^[A-Za-z\s]+$/.test(trimmedName)) {
      nextErrors.name = 'Enter a valid name'
    }
    if (digits.length > 0 && digits.length !== 10) {
      nextErrors.phone = 'Enter a valid 10-digit mobile number'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onConfirm({
      name: trimmedName,
      phone: digits.length === 10 ? `+91${digits}` : '',
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close final bill customer"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Customer details for final bill"
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">Final Bill</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <p className="rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink">
            Table <span className="font-semibold">{tableNo}</span>
            {' · '}
            {kotCount} KOT{kotCount === 1 ? '' : 's'} merged
            {' · '}
            Total{' '}
            <span className="font-semibold text-accent">
              ₹
              {total.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </span>
          </p>

          <label className="block text-sm font-semibold text-ink">
            Name <span className="text-primary">*</span>
            <input
              type="text"
              value={name}
              maxLength={10}
              onChange={(e) => {
                setName(sanitizeName(e.target.value))
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              autoFocus
              placeholder="Customer name"
              className={`mt-1.5 h-10 w-full rounded-md border bg-white px-3 text-sm font-normal text-ink outline-none placeholder:text-muted focus:border-primary ${
                errors.name ? 'border-primary' : 'border-line'
              }`}
            />
            {errors.name ? (
              <span className="mt-1 block text-xs font-normal text-primary">
                {errors.name}
              </span>
            ) : null}
          </label>

          <label className="block text-sm font-semibold text-ink">
            Phone
            <div
              className={`mt-1.5 flex h-10 overflow-hidden rounded-md border bg-white focus-within:border-primary ${
                errors.phone ? 'border-primary' : 'border-line'
              }`}
            >
              <span className="inline-flex shrink-0 items-center border-r border-line bg-page px-3 text-sm font-semibold text-ink">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                maxLength={10}
                onChange={(e) => {
                  setPhone(normalizePhoneDigits(e.target.value))
                  if (errors.phone)
                    setErrors((prev) => ({ ...prev, phone: undefined }))
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleConfirm()
                  }
                }}
                placeholder="10-digit mobile (optional)"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-normal text-ink outline-none placeholder:text-muted"
              />
            </div>
            {errors.phone ? (
              <span className="mt-1 block text-xs font-normal text-primary">
                {errors.phone}
              </span>
            ) : (
              <span className="mt-1 block text-xs font-normal text-muted">
                Optional — enter up to 10 digits
              </span>
            )}
          </label>

          <p className="text-xs text-muted">
            Name will be printed on the final bill. Phone is optional.
          </p>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-ink/80 bg-white px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  )
}
