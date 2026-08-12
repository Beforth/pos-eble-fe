import { useEffect, useState } from 'react'
import { FilePenLine, X } from 'lucide-react'

interface SaveDraftNameModalProps {
  open: boolean
  initialName?: string
  onClose: () => void
  onConfirm: (customerName: string) => void
}

function sanitizeName(value: string): string {
  return value.replace(/[^A-Za-z\s]/g, '').slice(0, 30)
}

export function SaveDraftNameModal({
  open,
  initialName = '',
  onClose,
  onConfirm,
}: SaveDraftNameModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(sanitizeName(initialName))
    setError(null)
  }, [open, initialName])

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

  if (!open) return null

  function handleSave() {
    const trimmed = name.trim().replace(/\s+/g, ' ')
    if (trimmed.length < 2) {
      setError('Enter customer name (at least 2 letters)')
      return
    }
    onConfirm(trimmed)
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close save draft"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Save draft"
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex items-center gap-2">
            <FilePenLine size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-ink">Save as Draft</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-5 py-4">
          <label className="block text-sm font-medium text-ink">
            Customer Name <span className="text-primary">*</span>
            <input
              type="text"
              value={name}
              autoFocus
              maxLength={30}
              onChange={(event) => {
                setName(sanitizeName(event.target.value))
                if (error) setError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSave()
                }
              }}
              placeholder="Enter customer name"
              className={`mt-2 h-10 w-full rounded-md border bg-card px-3 text-sm text-ink outline-none focus:border-primary ${
                error ? 'border-primary' : 'border-line'
              }`}
            />
          </label>
          {error ? (
            <p className="mt-1.5 text-xs text-primary">{error}</p>
          ) : (
            <p className="mt-1.5 text-xs text-muted">
              This name will be shown on the draft list for easy search later.
            </p>
          )}
        </div>

        <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Draft
          </button>
        </footer>
      </div>
    </div>
  )
}
