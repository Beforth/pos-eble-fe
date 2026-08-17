import { useEffect, useState } from 'react'
import { ListPlus, X } from 'lucide-react'
import { CategoryMultiSelect } from '../menu/CategoryMultiSelect'
import { menuItems } from '../../mocks/menuItemsData'

interface AddSingleItemModalProps {
  open: boolean
  initialSelectedIds: string[]
  onClose: () => void
  onConfirm: (ids: string[]) => void
}

const ITEM_OPTIONS = menuItems.map((item) => ({
  id: item.id,
  name: item.name,
}))

export function AddSingleItemModal({
  open,
  initialSelectedIds,
  onClose,
  onConfirm,
}: AddSingleItemModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds)

  useEffect(() => {
    if (open) setSelectedIds(initialSelectedIds)
  }, [open, initialSelectedIds])

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

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close add item"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Add items to screen"
        className="relative z-10 flex w-full max-w-md flex-col overflow-visible rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex items-center gap-2">
            <ListPlus size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-ink">Add items</h2>
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
          <p className="mb-3 text-sm font-medium text-ink">
            Select items for this screen
          </p>
          <p className="mb-4 text-xs text-muted">
            Pick one or more items (e.g. Paani Puri, Dahi Puri, Cheese Dabeli).
            KOTs containing them will show on this screen.
          </p>
          <CategoryMultiSelect
            options={ITEM_OPTIONS}
            selectedIds={selectedIds}
            onChange={setSelectedIds}
          />
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
            onClick={() => onConfirm(selectedIds)}
            disabled={selectedIds.length === 0}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ListPlus size={15} />
            {selectedIds.length === 0
              ? 'Add Item'
              : `Add ${selectedIds.length} Item${selectedIds.length === 1 ? '' : 's'}`}
          </button>
        </footer>
      </div>
    </div>
  )
}
