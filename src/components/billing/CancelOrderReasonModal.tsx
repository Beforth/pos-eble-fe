import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface CancelOrderReasonModalProps {
  open: boolean
  orderNo: string
  loading?: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}

/** Asks why an order is being cancelled; the reason is required. */
export function CancelOrderReasonModal({
  open,
  orderNo,
  loading = false,
  onClose,
  onConfirm,
}: CancelOrderReasonModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setReason('')
    setError(null)
  }, [open, orderNo])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, loading, onClose])

  if (!open) return null

  function handleConfirm() {
    if (!reason.trim()) {
      setError('Reason is required')
      return
    }
    onConfirm(reason.trim())
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close cancel order"
        onClick={() => !loading && onClose()}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Cancel order ${orderNo}`}
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="text-base font-semibold text-ink">
            Cancel order {orderNo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-2 px-5 py-4">
          <label className="block text-sm font-medium text-ink">
            Reason for cancelling <span className="text-primary">*</span>
            <textarea
              value={reason}
              autoFocus
              onChange={(event) => {
                setReason(event.target.value)
                if (error) setError(null)
              }}
              rows={4}
              maxLength={500}
              placeholder="e.g. Customer changed their mind"
              className={`mt-1.5 w-full resize-y rounded-md border bg-card px-3 py-2 text-sm font-normal text-ink outline-none placeholder:text-muted focus:border-primary ${
                error ? 'border-primary' : 'border-line'
              }`}
            />
          </label>
          {error ? <p className="text-xs text-primary">{error}</p> : null}
          <p className="text-xs text-muted">
            The order is marked Cancelled and the cancelled bill is printed.
          </p>
        </div>

        <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-9 rounded-lg border border-line px-4 text-sm font-medium text-ink hover:bg-page disabled:opacity-50"
          >
            Keep order
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {loading ? 'Cancelling…' : 'Cancel order'}
          </button>
        </footer>
      </div>
    </div>
  )
}
