import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { PrimaryButton } from '../menu/MenuActionButtons'

interface ProductionMoreOptionsDrawerProps {
  open: boolean
  onClose: () => void
  onSave?: (values: {
    defaultQuantity: string
    description: string
    autoProduction: boolean
  }) => void
  initialValues?: {
    defaultQuantity: string
    description: string
    autoProduction: boolean
  }
}

export function ProductionMoreOptionsDrawer({
  open,
  onClose,
  onSave,
  initialValues,
}: ProductionMoreOptionsDrawerProps) {
  const [defaultQuantity, setDefaultQuantity] = useState(
    initialValues?.defaultQuantity ?? '',
  )
  const [description, setDescription] = useState(
    initialValues?.description ?? '',
  )
  const [autoProduction, setAutoProduction] = useState(
    initialValues?.autoProduction ?? false,
  )

  useEffect(() => {
    if (!open) return
    setDefaultQuantity(initialValues?.defaultQuantity ?? '')
    setDescription(initialValues?.description ?? '')
    setAutoProduction(initialValues?.autoProduction ?? false)
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
  }, [open, onClose, initialValues])

  function handleSave() {
    onSave?.({
      defaultQuantity,
      description,
      autoProduction,
    })
    onClose()
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close more options"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="production-more-options-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2
            id="production-more-options-title"
            className="text-base font-semibold text-ink"
          >
            More Options
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
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Default Quantity
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={defaultQuantity}
              onChange={(event) => setDefaultQuantity(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="w-full resize-y rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={autoProduction}
              onChange={(event) => setAutoProduction(event.target.checked)}
              className="size-4 accent-primary"
            />
            Auto Production
          </label>
        </div>

        <div className="shrink-0 border-t border-line px-5 py-3">
          <div className="flex justify-end">
            <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
