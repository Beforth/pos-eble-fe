import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Trash2, X } from 'lucide-react'
import type { MenuItemRow } from '../../mocks/menuItemsData'

interface DraftRow {
  key: string
  name: string
  shortCode: string
  onlineDisplayName: string
  price: string
  description: string
}

interface AddItemsGridModalProps {
  open: boolean
  categoryId: string
  onClose: () => void
  onSave: (items: MenuItemRow[]) => void
}

function emptyDraft(): DraftRow {
  return {
    key: `draft-${Date.now()}-${Math.random()}`,
    name: '',
    shortCode: '',
    onlineDisplayName: '',
    price: '',
    description: '',
  }
}

export function AddItemsGridModal({
  open,
  categoryId,
  onClose,
  onSave,
}: AddItemsGridModalProps) {
  const [rows, setRows] = useState<DraftRow[]>([emptyDraft(), emptyDraft()])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setRows([emptyDraft(), emptyDraft()])
    setError('')
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

  function updateRow(key: string, patch: Partial<DraftRow>) {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    )
  }

  function handleSave() {
    const filled = rows.filter((row) => row.name.trim())
    if (filled.length === 0) {
      setError('Enter at least one item name')
      return
    }
    const invalid = filled.find(
      (row) => !row.shortCode.trim() || Number.isNaN(Number(row.price)),
    )
    if (invalid) {
      setError('Each item needs a short code and a valid price')
      return
    }
    const items: MenuItemRow[] = filled.map((row, index) => ({
      id: `new-${Date.now()}-${index}`,
      categoryId,
      name: row.name.trim(),
      shortCode: row.shortCode.trim(),
      onlineDisplayName: row.onlineDisplayName.trim() || row.name.trim(),
      price: Number(row.price) || 0,
      description: row.description.trim(),
      available: false,
      tags: ['V+'],
      hasImage: false,
    }))
    onSave(items)
    onClose()
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
        aria-labelledby="add-items-grid-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2
            id="add-items-grid-title"
            className="text-base font-semibold text-ink"
          >
            Add New Item(S) — Grid
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

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-2 py-2">Name *</th>
                  <th className="px-2 py-2">Short Code *</th>
                  <th className="px-2 py-2">Online Display Name</th>
                  <th className="px-2 py-2">Price *</th>
                  <th className="px-2 py-2">Description</th>
                  <th className="w-10 px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="border-b border-line">
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(event) =>
                          updateRow(row.key, { name: event.target.value })
                        }
                        className="h-9 w-full min-w-[140px] rounded-md border border-line px-2 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={row.shortCode}
                        onChange={(event) =>
                          updateRow(row.key, { shortCode: event.target.value })
                        }
                        className="h-9 w-24 rounded-md border border-line px-2 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={row.onlineDisplayName}
                        onChange={(event) =>
                          updateRow(row.key, {
                            onlineDisplayName: event.target.value,
                          })
                        }
                        className="h-9 w-full min-w-[140px] rounded-md border border-line px-2 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={row.price}
                        onChange={(event) =>
                          updateRow(row.key, { price: event.target.value })
                        }
                        className="h-9 w-24 rounded-md border border-line px-2 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(event) =>
                          updateRow(row.key, {
                            description: event.target.value,
                          })
                        }
                        className="h-9 w-full min-w-[160px] rounded-md border border-line px-2 outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        aria-label="Remove row"
                        disabled={rows.length <= 1}
                        onClick={() =>
                          setRows((prev) =>
                            prev.filter((r) => r.key !== row.key),
                          )
                        }
                        className="rounded p-1.5 text-muted hover:bg-primary/10 hover:text-primary disabled:opacity-30"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error ? (
            <p className="mt-2 text-xs text-primary">{error}</p>
          ) : null}
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, emptyDraft()])}
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <Plus size={15} />
            Add row
          </button>
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
            Save Items
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
