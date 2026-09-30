import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { listSpecialNotesApi } from '../../services/menuService'
import type { SpecialNote } from '../../types/menu'
import { SelectDropdown } from '../common/SelectDropdown'
import {
  matchSpecialNoteId,
  specialNoteOptions,
  specialNoteText,
} from '../../utils/specialNotes'

interface OrderNotesModalProps {
  open: boolean
  value: string
  onClose: () => void
  onSave: (comment: string) => void
}

export function OrderNotesModal({
  open,
  value,
  onClose,
  onSave,
}: OrderNotesModalProps) {
  const { encryptedOutletId } = useAuth()
  const [comment, setComment] = useState(value)
  const [notes, setNotes] = useState<SpecialNote[]>([])

  useEffect(() => {
    if (open) setComment(value)
  }, [open, value])

  useEffect(() => {
    if (!open || !encryptedOutletId) return
    let cancelled = false
    listSpecialNotesApi(encryptedOutletId)
      .then((rows) => {
        if (!cancelled) setNotes(rows)
      })
      .catch(() => {
        // Dropdown stays empty; the textarea still works for custom notes.
      })
    return () => {
      cancelled = true
    }
  }, [open, encryptedOutletId])

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

  const options = useMemo(() => specialNoteOptions(notes), [notes])

  const selectedNoteId = useMemo(
    () => matchSpecialNoteId(notes, comment),
    [notes, comment],
  )

  function handleSelectNote(id: string) {
    const note = notes.find((n) => n.id === id)
    if (note) setComment(specialNoteText(note))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close order comments"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order Wise Comments"
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">Order Wise Comments</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-4 px-5 py-4">
          <div>
            <SelectDropdown
              value={selectedNoteId}
              options={options}
              onChange={handleSelectNote}
              caption="Special notes"
              placeholder="Select a note"
              searchable
              triggerClassName="w-full"
            />
          </div>

          <label className="block text-sm font-semibold text-ink">
            Comment:
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              autoFocus
              placeholder="Write notes about this order…"
              className="mt-2 w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
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
            onClick={() => onSave(comment.trim())}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  )
}
