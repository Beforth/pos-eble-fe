import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface SelectRecordAlertProps {
  open: boolean
  message?: string
  onClose: () => void
}

export function SelectRecordAlert({
  open,
  message = 'Please select at least one record to perform this action.',
  onClose,
}: SelectRecordAlertProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="select-record-alert-title"
        className="relative z-10 w-full max-w-md rounded-lg border border-line bg-card p-6 shadow-xl"
      >
        <p
          id="select-record-alert-title"
          className="text-center text-sm text-ink"
        >
          {message}
        </p>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 min-w-[88px] cursor-pointer items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Ok
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
