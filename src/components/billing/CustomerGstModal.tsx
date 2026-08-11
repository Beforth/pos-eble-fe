import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface CustomerGstModalProps {
  open: boolean
  initialGstNo?: string
  onClose: () => void
  onSave: (gstNo: string) => void
}

export function CustomerGstModal({
  open,
  initialGstNo = '',
  onClose,
  onSave,
}: CustomerGstModalProps) {
  const [gstNo, setGstNo] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setGstNo(initialGstNo)
    setError(null)
  }, [open, initialGstNo])

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

  function handleSave() {
    const value = gstNo.trim().toUpperCase()
    if (value && !/^[0-9A-Z]{15}$/.test(value)) {
      setError('Enter a valid 15-character GST number')
      return
    }
    onSave(value)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close customer GST information"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Customer GST Information"
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line bg-page px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">Customer GST Information</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-white hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-5 py-5">
          <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="shrink-0 text-sm font-semibold text-ink">GST No.</span>
            <input
              type="text"
              value={gstNo}
              onChange={(e) => {
                setGstNo(e.target.value.toUpperCase())
                if (error) setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSave()
                }
              }}
              autoFocus
              maxLength={15}
              placeholder="GST NUMBER"
              className={`h-10 w-full rounded-md border bg-white px-3 text-sm uppercase text-ink outline-none placeholder:normal-case placeholder:text-muted focus:border-primary ${
                error ? 'border-primary' : 'border-line'
              }`}
            />
          </label>
          {error ? (
            <p className="mt-2 text-xs text-primary sm:pl-[5.5rem]">{error}</p>
          ) : null}
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
            onClick={handleSave}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  )
}
