import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Trash2, X } from 'lucide-react'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { useAuth } from '../../auth/AuthContext'
import { createItemApi } from '../../services/menuService'
import { SearchableSelect } from '../inventory/SearchableSelect'
import type { Category, ItemPayload } from '../../types/menu'
import { showToast } from '../../utils/toast'

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
  categories: Category[]
  initialCategoryId: string
  onClose: () => void
  onSaved: () => void
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
  categories,
  initialCategoryId,
  onClose,
  onSaved,
}: AddItemsGridModalProps) {
  const { encryptedOutletId } = useAuth()
  const [rows, setRows] = useState<DraftRow[]>([emptyDraft(), emptyDraft()])
  const [selectedCategoryId, setSelectedCategoryId] =
    useState(initialCategoryId)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pendingRemove, setPendingRemove] = useState<DraftRow | null>(null)

  const categoryNames = useMemo(
    () => categories.map((category) => category.name),
    [categories],
  )
  const categoryLabel = useMemo(
    () =>
      categories.find((category) => category.id === selectedCategoryId)?.name ??
      '',
    [categories, selectedCategoryId],
  )

  useEffect(() => {
    if (!open) return
    setRows([emptyDraft(), emptyDraft()])
    setSelectedCategoryId(initialCategoryId)
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
  }, [open, onClose, initialCategoryId])

  if (!open) return null

  function updateRow(key: string, patch: Partial<DraftRow>) {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    )
  }

  async function handleSave() {
    if (!selectedCategoryId) {
      setError('Select a category')
      return
    }
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
    if (!encryptedOutletId) return
    setSaving(true)
    try {
      await Promise.all(
        filled.map((row) => {
          const payload: ItemPayload = {
            category_id: selectedCategoryId,
            name: row.name.trim(),
            short_code: row.shortCode.trim(),
            online_display_name:
              row.onlineDisplayName.trim() || row.name.trim(),
            base_price: Number(row.price) || 0,
            description: row.description.trim(),
            is_active: true,
          }
          return createItemApi(encryptedOutletId!, payload)
        }),
      )
      showToast('Items created')
      onSaved()
      onClose()
    } catch {
      showToast('Failed to create some items')
    } finally {
      setSaving(false)
    }
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
            data-tooltip="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <div className="mb-4 max-w-sm">
            <SearchableSelect
              label="Category"
              required
              value={categoryLabel}
              options={categoryNames}
              placeholder="Select a category"
              searchPlaceholder="Search categories..."
              dropdownPlacement="below"
              onChange={(nameValue) => {
                const category = categories.find(
                  (item) => item.name === nameValue,
                )
                setSelectedCategoryId(category?.id ?? '')
              }}
            />
          </div>
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
                        data-tooltip="Remove row"
                        disabled={rows.length <= 1}
                        onClick={() =>
                          rows.length > 1 && setPendingRemove(row)
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
            {saving ? 'Saving...' : 'Save Items'}
          </button>
        </div>

        <ConfirmDialog
          open={Boolean(pendingRemove)}
          compact
          title="Remove item"
          target={pendingRemove?.name?.trim() || undefined}
          message="This item row will be removed from the list being added."
          note="Nothing is saved until you confirm — the row can be re-added."
          confirmLabel="Remove"
          onConfirm={() => {
            if (pendingRemove)
              setRows((prev) =>
                prev.filter((r) => r.key !== pendingRemove.key),
              )
            setPendingRemove(null)
          }}
          onClose={() => setPendingRemove(null)}
        />
      </div>
    </div>,
    document.body,
  )
}
