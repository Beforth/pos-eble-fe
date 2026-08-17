import { X } from 'lucide-react'

interface AlertDialogProps {
  open: boolean
  title?: string
  message: string
  onClose: () => void
  onOk: () => void
}

export function AlertDialog({
  open,
  title = 'Alert',
  message,
  onClose,
  onOk,
}: AlertDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close alert"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-title"
        aria-describedby="alert-message"
        className="relative z-10 w-full max-w-md overflow-hidden rounded border border-line bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id="alert-title" className="text-base font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>
        <div id="alert-message" className="border-b border-line px-4 py-6 text-sm text-ink">
          {message}
        </div>
        <footer className="flex justify-end px-4 py-3">
          <button
            type="button"
            onClick={onOk}
            className="h-9 min-w-[72px] rounded border border-ink/80 bg-white px-4 text-sm font-medium text-ink hover:bg-page"
          >
            OK
          </button>
        </footer>
      </div>
    </div>
  )
}
