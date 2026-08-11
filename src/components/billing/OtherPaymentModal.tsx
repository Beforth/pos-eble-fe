import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export const OTHER_PAYMENT_TYPES = [
  'Google Pay',
  'PhonePe',
  'Paytm',
  'Amazon Pay',
  'BHIM UPI',
  'CRED',
  'Mobikwik',
  'Freecharge',
  'WhatsApp Pay',
  'Bank Transfer',
  'Other',
] as const

export type OtherPaymentType = (typeof OTHER_PAYMENT_TYPES)[number]

export interface OtherPaymentDetails {
  type: OtherPaymentType
  note: string
}

interface OtherPaymentModalProps {
  open: boolean
  initial?: Partial<OtherPaymentDetails>
  onNo: () => void
  onYes: (details: OtherPaymentDetails) => void
}

export function OtherPaymentModal({
  open,
  initial,
  onNo,
  onYes,
}: OtherPaymentModalProps) {
  const [type, setType] = useState<OtherPaymentType>('Google Pay')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open) return
    setType(initial?.type ?? 'Google Pay')
    setNote(initial?.note ?? '')
  }, [open, initial?.type, initial?.note])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onNo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onNo])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close other payment type"
        onClick={onNo}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Other Payment Type"
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">Other Payment Type</h2>
          <button
            type="button"
            onClick={onNo}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-3 px-5 py-4">
          <label className="block text-sm font-semibold text-ink">
            Other Payment Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OtherPaymentType)}
              className="mt-1.5 h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-normal text-ink outline-none focus:border-primary"
            >
              {OTHER_PAYMENT_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            placeholder="Add remark (optional)"
            className="w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
          />
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onNo}
            className="h-9 rounded-lg border border-ink/80 bg-white px-4 text-sm font-medium text-ink hover:bg-page"
          >
            No
          </button>
          <button
            type="button"
            onClick={() => onYes({ type, note: note.trim() })}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Yes
          </button>
        </footer>
      </div>
    </div>
  )
}
