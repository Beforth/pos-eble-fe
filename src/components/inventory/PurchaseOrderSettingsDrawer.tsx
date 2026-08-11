import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, Lightbulb, X } from 'lucide-react'
import { PrimaryButton } from '../menu/MenuActionButtons'

interface PurchaseOrderSettingsDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  /** Extra tip line after the shared approval rights message */
  approvalExtra?: string
  onSave?: () => void
}

export function PurchaseOrderSettingsDrawer({
  open,
  onClose,
  title = 'Purchase Order Settings',
  approvalExtra,
  onSave,
}: PurchaseOrderSettingsDrawerProps) {
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

  function handleSave() {
    onSave?.()
    onClose()
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="po-settings-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2
            id="po-settings-title"
            className="text-base font-semibold text-ink"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section>
            <h3 className="mb-3 text-sm font-bold text-ink">
              Inventory approval flow
            </h3>
            <p className="mb-3 text-sm text-ink">
              Below are the individuals who has authority to approve :{' '}
              <span className="font-medium">No Approval Authority Added</span>
            </p>

            <div className="flex gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-ink">
              <Lightbulb
                size={16}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <p>
                For approval, this user right must be assigned. &quot;Allow
                inventory user to edit and cancel transactional data in Purchase
                order, Purchase, Sales, Transfer and Returns.&quot;
                {approvalExtra ? ` ${approvalExtra}` : null}
              </p>
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-ink">
              Email Template Setting
            </h3>
            <div className="flex items-start gap-3 rounded-md border border-line bg-page px-3 py-3">
              <p className="flex-1 text-sm text-ink">
                You can add default email addresses with a custom header colour
                and icon by clicking here.
              </p>
              <button
                type="button"
                aria-label="Open email template settings"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-card text-muted hover:text-ink"
              >
                <ExternalLink size={14} />
              </button>
            </div>
          </section>
        </div>

        <div className="shrink-0 border-t border-line px-5 py-3">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Cancel
            </button>
            <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
