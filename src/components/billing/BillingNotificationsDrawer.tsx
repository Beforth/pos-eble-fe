import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Bell, BellOff, X } from 'lucide-react'

interface BillingNotificationsDrawerProps {
  open: boolean
  onClose: () => void
}

/** The empty state's picture: a silenced bell in the theme colour. */
function QuietBellArt() {
  return (
    <span className="flex size-28 items-center justify-center rounded-full bg-primary/10 text-primary">
      <BellOff size={56} strokeWidth={1.5} />
    </span>
  )
}

/**
 * Opens from the header's Notifications icon. Notifications have no backend feed
 * yet (the Alerts page is empty too), so it always shows the quiet state.
 */
export function BillingNotificationsDrawer({ open, onClose }: BillingNotificationsDrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close notifications"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="billing-notifications-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col rounded-l-2xl bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2
            id="billing-notifications-title"
            className="flex items-center gap-2.5 text-base font-medium text-ink"
          >
            <Bell size={20} />
            Notifications
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-md p-1.5 text-ink hover:bg-page"
          >
            <X size={22} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <QuietBellArt />
          <p className="text-base font-medium text-ink">No Notification</p>
          <p className="text-sm text-muted">All Quiet on the Notification Front.</p>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
