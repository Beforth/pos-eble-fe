import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface AddSpecialNoteModalProps {
  open: boolean
  onClose: () => void
  onSave: (note: { name: string; available: boolean }) => void
}

export function AddSpecialNoteModal({
  open,
  onClose,
  onSave,
}: AddSpecialNoteModalProps) {
  const titleId = useId()
  const nameId = useId()
  const [name, setName] = useState('')
  const [available, setAvailable] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setAvailable(true)
    setError('')
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required')
      return
    }
    onSave({ name: trimmed, available })
    onClose()
  }

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
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            Add Special Note
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div>
            <label
              htmlFor={nameId}
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Name <span className="text-primary">*</span>
            </label>
            <input
              id={nameId}
              type="text"
              autoFocus
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (error) setError('')
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSave()
              }}
              className={`h-10 w-full rounded-md border bg-card px-3 text-sm text-ink outline-none focus:border-primary ${
                error ? 'border-primary' : 'border-line'
              }`}
            />
            {error ? (
              <p className="mt-1.5 text-xs text-primary">{error}</p>
            ) : null}
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={available}
              onChange={(event) => setAvailable(event.target.checked)}
              className="size-4 rounded border-line accent-primary"
            />
            Available
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
