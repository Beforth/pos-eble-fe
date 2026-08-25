import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FileSpreadsheet, Grid3x3, Plus, X } from 'lucide-react'

interface AddNewItemsModalProps {
  open: boolean
  onClose: () => void
  onSingleItem?: () => void
  onGrid?: () => void
  onSheet?: () => void
  onAddCombo?: () => void
}

export function AddNewItemsModal({
  open,
  onClose,
  onSingleItem,
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
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-line bg-card shadow-xl"
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

        <div className="space-y-3 px-5 py-5">
          <button
            type="button"
            onClick={() => {
              onSingleItem?.()
              onClose()
            }}
            className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-4 text-left transition-colors hover:border-primary/35 hover:bg-page/50"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Plus size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">
                Single Item
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                Add one item with full details — name, price, tags &amp; more
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onGrid?.()
              onClose()
            }}
            className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-4 text-left transition-colors hover:border-primary/35 hover:bg-page/50"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Grid3x3 size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">
                Grid
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                Add items in a spreadsheet-style table with inline editing
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSheet?.()
              onClose()
            }}
            className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-4 text-left transition-colors hover:border-primary/35 hover:bg-page/50"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileSpreadsheet size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">
                Import via Sheet (CSV)
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                Download a CSV template, fill it in, and upload to bulk-add
                items
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAddCombo?.()
              onClose()
            }}
            className="flex w-full cursor-pointer items-start gap-3 rounded-xl border border-line bg-card p-4 text-left transition-colors hover:border-primary/35 hover:bg-page/50"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Grid3x3 size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">
                Create Combo
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                Bundle multiple items into a combo with a single price
              </span>
            </span>
          </button>
        </div>

        <div className="border-t border-line px-5 py-3.5">
          <p className="text-xs leading-relaxed text-muted">
            Items will be added to the base menu in{' '}
            <span className="font-semibold text-ink">inactive</span> status
            until you mark them activated.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
