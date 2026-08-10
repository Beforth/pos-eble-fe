import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface AddNewItemsModalProps {
  open: boolean
  onClose: () => void
  onGrid?: () => void
  onSheet?: () => void
  onAddCombo?: () => void
}

export function AddNewItemsModal({
  open,
  onClose,
  onGrid,
  onSheet,
  onAddCombo,
}: AddNewItemsModalProps) {
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
        aria-labelledby="add-new-items-title"
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2
            id="add-new-items-title"
            className="text-base font-semibold text-ink"
          >
            Add New Items
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

        <div className="space-y-6 px-5 py-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="min-w-[160px] text-sm font-medium text-ink">
              Add New Item(S) Using
            </p>
            <button
              type="button"
              onClick={() => {
                onGrid?.()
                onClose()
              }}
              className="inline-flex h-9 min-w-[88px] cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Grid
            </button>
            <span className="text-sm font-medium text-ink">OR</span>
            <button
              type="button"
              onClick={() => {
                onSheet?.()
                onClose()
              }}
              className="inline-flex h-9 min-w-[88px] cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Sheet
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="min-w-[160px] text-sm font-medium text-ink sm:min-w-[200px]">
              Add Combo Item(S) To Your Menu
            </p>
            <button
              type="button"
              onClick={() => {
                onAddCombo?.()
                onClose()
              }}
              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Add New Combo
            </button>
          </div>

          <p className="text-sm leading-relaxed text-primary">
            The Item(S) Will Be Added To The Basemenu And Will Be In Inactive
            Status In All Areas Until You Mark Them Activated.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
