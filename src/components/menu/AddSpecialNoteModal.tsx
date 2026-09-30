import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { showToast } from '../../utils/toast'
import { useAuth } from '../../auth/AuthContext'
import { createSpecialNoteApi } from '../../services/menuService'

interface AddSpecialNoteModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
}

export function AddSpecialNoteModal({
  open,
  onClose,
  onSave,
}: AddSpecialNoteModalProps) {
  const { encryptedOutletId } = useAuth()
  const titleId = useId()
  const nameId = useId()
  const noteTextId = useId()
  const [name, setName] = useState('')
  const [noteText, setNoteText] = useState('')
  const [available, setAvailable] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName('')
    setNoteText('')
    setAvailable(true)
    setError('')
    setSaving(false)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required')
      return
    }
    if (!encryptedOutletId) {
      showToast('No outlet selected')
      return
    }
    setSaving(true)
    try {
      await createSpecialNoteApi(encryptedOutletId, {
        title: trimmed,
        note_text: noteText.trim() || undefined,
        is_active: available,
      })
      showToast('Special note added successfully')
      onSave()
      onClose()
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save note',
      )
    } finally {
      setSaving(false)
    }
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
            data-tooltip="Close dialog"
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

          <div>
            <label
              htmlFor={noteTextId}
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Note Text
            </label>
            <textarea
              id={noteTextId}
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              rows={3}
              className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
            />
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
            disabled={saving}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
