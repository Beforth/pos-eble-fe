import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface OpenItemModalProps {
  open: boolean
  onClose: () => void
  onSave: (item: { name: string; price: number }) => void
}

export function OpenItemModal({ open, onClose, onSave }: OpenItemModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({})

  useEffect(() => {
    if (!open) return
    setName('')
    setPrice('')
    setErrors({})
  }, [open])

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

  function handleSave() {
    const trimmedName = name.trim()
    const parsedPrice = Number(price)
    const nextErrors: { name?: string; price?: string } = {}

    if (!trimmedName) nextErrors.name = 'Item name is required'
    if (price.trim() === '' || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      nextErrors.price = 'Enter a valid price'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSave({ name: trimmedName, price: parsedPrice })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close open item"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Open Item"
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">Open Item</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <label className="block text-sm font-semibold text-ink">
            Item Name <span className="text-primary">*</span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
              }}
              autoFocus
              placeholder="Item Name"
              className={`mt-1.5 h-10 w-full rounded-md border bg-white px-3 text-sm font-normal text-ink outline-none placeholder:text-muted focus:border-primary ${
                errors.name ? 'border-primary' : 'border-line'
              }`}
            />
            {errors.name ? (
              <span className="mt-1 block text-xs font-normal text-primary">
                {errors.name}
              </span>
            ) : null}
          </label>

          <label className="block text-sm font-semibold text-ink">
            Price <span className="text-primary">*</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value)
                if (errors.price)
                  setErrors((prev) => ({ ...prev, price: undefined }))
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSave()
                }
              }}
              placeholder="Price"
              className={`mt-1.5 h-10 w-full rounded-md border bg-white px-3 text-sm font-normal text-ink outline-none placeholder:text-muted focus:border-primary ${
                errors.price ? 'border-primary' : 'border-line'
              }`}
            />
            {errors.price ? (
              <span className="mt-1 block text-xs font-normal text-primary">
                {errors.price}
              </span>
            ) : null}
          </label>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-ink/80 bg-white px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  )
}
