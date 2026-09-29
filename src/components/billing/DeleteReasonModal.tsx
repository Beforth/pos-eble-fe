import { useEffect, useState } from 'react'
import { AlertTriangle, Info, X } from 'lucide-react'

interface DeleteReasonModalProps {
  open: boolean
  title: string
  onClose: () => void
  onConfirm: (reason: string) => void
}

export function DeleteReasonModal({
  open,
  title,
  onClose,
  onConfirm,
}: DeleteReasonModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setReason('')
    setError(null)
  }, [open, title])

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
    if (!reason.trim()) {
      setError('Reason is required')
      return
    }
    onConfirm(reason.trim())
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger"
              aria-hidden="true"
            >
              <AlertTriangle size={18} />
            </span>
            <h2 className="truncate text-base font-semibold text-ink">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="px-5 py-4">
          <label className="block text-sm font-medium text-ink">
            Reason <span className="text-primary">*</span>
            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value)
                if (error) setError(null)
              }}
              rows={4}
              autoFocus
              className={`mt-2 w-full rounded-md border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary ${
                error ? 'border-primary' : 'border-line'
              }`}
              placeholder="Enter reason"
            />
          </label>
          {error ? <p className="mt-1.5 text-xs text-primary">{error}</p> : null}
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-line bg-page px-3 py-2.5">
            <Info size={14} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
            <p className="text-xs leading-relaxed text-muted">
              The item is removed from the running KOT. The reason is recorded with
              the removal so it can be reviewed later.
            </p>
          </div>
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
            className="h-9 rounded-lg bg-danger px-4 text-sm font-semibold text-white hover:brightness-95"
          >
            Remove item
          </button>
        </footer>
      </div>
    </div>
  )
}