import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Lightbulb, X } from 'lucide-react'

interface WastageSettingsDrawerProps {
  open: boolean
  onClose: () => void
}

export function WastageSettingsDrawer({
  open,
  onClose,
}: WastageSettingsDrawerProps) {
  const [amountBasedApproval, setAmountBasedApproval] = useState(false)

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
        aria-labelledby="wastage-settings-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2
            id="wastage-settings-title"
            className="text-base font-semibold text-ink"
          >
            Wastage Settings
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

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section>
            <h3 className="mb-3 text-sm font-bold text-ink">
              Inventory approval flow
            </h3>
            <p className="mb-3 text-sm text-ink">
              Below are the individuals who has authority to approve :
            </p>
            <div className="mb-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm font-medium text-ink">
              No Approval Authority Added
            </div>
            <div className="flex gap-2.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-ink">
              <Lightbulb
                size={16}
                className="mt-0.5 shrink-0 text-amber-600"
              />
              <p>
                For approval, this user right must be assigned. &quot;Allow
                inventory user to edit and cancel transactional data in Purchase
                order, Purchase, Sales, Transfer and Returns.&quot;
              </p>
            </div>
          </section>

          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={amountBasedApproval}
              onChange={(event) =>
                setAmountBasedApproval(event.target.checked)
              }
              className="mt-0.5 size-4 shrink-0 accent-primary"
            />
            <span>
              Would you like to set up an amount-based approval flow instead of
              the standard approval process?
            </span>
          </label>
        </div>

        <div className="shrink-0 border-t border-line px-5 py-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Cancel
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
