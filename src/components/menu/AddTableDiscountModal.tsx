import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface AddTableDiscountModalProps {
  open: boolean
  tableLabel: string | null
  initialPercent?: number | string
  onClose: () => void
  onSave: (percent: number) => void
}

export function AddTableDiscountModal({
  open,
  tableLabel,
  initialPercent = '',
  onClose,
  onSave,
}: AddTableDiscountModalProps) {
  const [percent, setPercent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setPercent(
      initialPercent === '' || initialPercent === undefined
        ? ''
        : String(initialPercent),
    )
    setError('')
  }, [open, initialPercent])

  useEffect(() => {
    if (!open) return
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
  }, [open, onClose])

  if (!open) return null

  function handleSave() {
    const value = percent.trim()
    if (!value) {
      setError('Percentage is required.')
      return
    }
    const parsed = Number(value)
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      setError('Enter a valid percentage between 0 and 100.')
      return
    }
    onSave(parsed)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-table-discount-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2
            id="add-table-discount-title"
            className="text-base font-semibold text-ink"
          >
            Add Discount{tableLabel ? ` - ${tableLabel}` : ''}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Percentage <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={percent}
            onChange={(event) => {
              setPercent(event.target.value)
              if (error) setError('')
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSave()
            }}
            autoFocus
            className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
          />
          {error ? (
            <p className="mt-1.5 text-sm text-primary">{error}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
