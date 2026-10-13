import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, X } from 'lucide-react'
import { showToast } from '../../utils/toast'
import { updateDiningTableApi } from '../../services/menuService'
import type { DiningTable } from '../../types/menu'

interface EditTableModalProps {
  open: boolean
  table: DiningTable | null
  outletId: string
  onClose: () => void
  onUpdate: (table: DiningTable) => void
}

export function EditTableModal({
  open,
  table,
  outletId,
  onClose,
  onUpdate,
}: EditTableModalProps) {
  const [tableNo, setTableNo] = useState('')
  const [editingTableNo, setEditingTableNo] = useState(false)
  const [persons, setPersons] = useState('')
  const [isOn, setIsOn] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !table) return
    setTableNo(table.table_no)
    setPersons(table.persons ? String(table.persons) : '')
    setIsOn(table.is_on)
    setEditingTableNo(false)
  }, [open, table])

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

  if (!open || !table) return null

  async function handleUpdate() {
    if (!outletId) return
    setSaving(true)
    try {
      const updated = await updateDiningTableApi(outletId, table!.id, {
        table_no: tableNo.trim() || table!.table_no,
        persons: Number(persons) || 0,
        is_on: isOn,
      })
      onUpdate(updated)
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update table',
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
        aria-labelledby="edit-table-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2
            id="edit-table-title"
            className="text-base font-semibold text-ink"
          >
            Table No - {table.table_no}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-page hover:text-ink"
            aria-label="Close"
            data-tooltip="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Table No
            </label>
            {editingTableNo ? (
              <input
                type="text"
                value={tableNo}
                autoFocus
                onChange={(event) => setTableNo(event.target.value)}
                onBlur={() => setEditingTableNo(false)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setEditingTableNo(false)
                }}
                className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-primary"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-ink">
                <span>{tableNo}</span>
                <button
                  type="button"
                  onClick={() => setEditingTableNo(true)}
                  className="inline-flex cursor-pointer text-muted hover:text-primary"
                  aria-label="Edit table number"
                  data-tooltip="Edit table number"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              No. of Persons
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={persons}
              onChange={(event) => setPersons(event.target.value)}
              placeholder="Enter No of person per table"
              className="h-9 w-full rounded-md border border-line px-3 text-sm outline-none placeholder:text-muted focus:border-primary"
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={isOn}
              onChange={(event) => setIsOn(event.target.checked)}
              className="size-4 cursor-pointer accent-primary"
            />
            Available for reservation
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 cursor-pointer items-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={saving}
            className="inline-flex h-9 cursor-pointer items-center rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Update'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}