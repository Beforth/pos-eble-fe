import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { showToast } from '../../utils/toast'

interface AddTagDrawerProps {
  open: boolean
  onClose: () => void
  onSaved?: (tag: { name: string; is_active: boolean }) => void
}

export function AddTagDrawer({ open, onClose, onSaved }: AddTagDrawerProps) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName('')
    setStatus(true)
    setSaving(false)
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
    const trimmed = name.trim()
    if (!trimmed) {
      showToast('Tag name is required')
      return
    }
    setSaving(true)
    window.setTimeout(() => {
      onSaved?.({ name: trimmed, is_active: status })
      showToast('Tag saved')
      setSaving(false)
      onClose()
    }, 250)
  }

  const fieldClass =
    'h-9 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'
  const labelClass = 'mb-1.5 block text-sm font-medium text-ink'

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close add tag"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-tag-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 id="add-tag-title" className="text-base font-semibold text-ink">
            Add Tag
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="cursor-pointer rounded-md p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <label htmlFor="tag-name" className={labelClass}>
              Tag Name <span className="text-primary">*</span>
            </label>
            <input
              id="tag-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSave()
              }}
              className={fieldClass}
              autoFocus={open}
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={status}
              onChange={(event) => setStatus(event.target.checked)}
              className="size-4 cursor-pointer accent-primary"
            />
            Status
          </label>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-line bg-primary/5 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
