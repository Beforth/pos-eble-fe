import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import {
  OutlineButton,
  PrimaryButton,
} from '../menu/MenuActionButtons'

interface QuickAddCategoryModalProps {
  open: boolean
  onClose: () => void
  onSave: (name: string) => Promise<boolean>
  saving?: boolean
}

export function QuickAddCategoryModal({
  open,
  onClose,
  onSave,
  saving = false,
}: QuickAddCategoryModalProps) {
  const titleId = useId()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setError('')
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  async function handleSave() {
    if (saving) return
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required')
      return
    }
    setError('')
    const ok = await onSave(trimmed)
    if (ok) onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            Add Category
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
        <div className="space-y-3 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          {error ? <p className="text-sm text-primary">{error}</p> : null}
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <OutlineButton variant="gray" onClick={onClose}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}
