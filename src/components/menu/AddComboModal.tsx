import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Plus, Trash2, X } from 'lucide-react'
import type { MenuItemRow } from '../../mocks/menuItemsData'
import { menuItems } from '../../mocks/menuItemsData'

interface ComboItemDraft {
  key: string
  itemId: string
  quantity: number
}

interface AddComboModalProps {
  open: boolean
  onClose: () => void
  onSave: (item: MenuItemRow) => void
}

function emptyComboItem(): ComboItemDraft {
  return {
    key: `combo-${Date.now()}-${Math.random()}`,
    itemId: '',
    quantity: 1,
  }
}

const COMBO_CATEGORY_ID = 'c21'

export function AddComboModal({ open, onClose, onSave }: AddComboModalProps) {
  const [name, setName] = useState('')
  const [shortCode, setShortCode] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [comboItems, setComboItems] = useState<ComboItemDraft[]>([
    emptyComboItem(),
  ])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setShortCode('')
    setPrice('')
    setDescription('')
    setComboItems([emptyComboItem()])
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

  function updateItem(key: string, patch: Partial<ComboItemDraft>) {
    setComboItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    )
  }

  function removeItem(key: string) {
    setComboItems((prev) => prev.filter((item) => item.key !== key))
  }

  function handleSave() {
    if (!name.trim()) {
      setError('Combo name is required')
      return
    }
    if (!shortCode.trim()) {
      setError('Short code is required')
      return
    }
    if (Number.isNaN(Number(price)) || Number(price) <= 0) {
      setError('Enter a valid price')
      return
    }
    const filled = comboItems.filter((item) => item.itemId)
    if (filled.length === 0) {
      setError('Add at least one item to the combo')
      return
    }
    const itemNames = filled
      .map((ci) => {
        const found = menuItems.find((m) => m.id === ci.itemId)
        return found ? `${found.name} x${ci.quantity}` : ''
      })
      .filter(Boolean)

    const combo: MenuItemRow = {
      id: `combo-${Date.now()}`,
      categoryId: COMBO_CATEGORY_ID,
      name: name.trim(),
      shortCode: shortCode.trim(),
      onlineDisplayName: name.trim(),
      price: Number(price) || 0,
      description: description.trim() || itemNames.join(', '),
      available: false,
      tags: ['set-as-combo'],
      hasImage: false,
    }
    onSave(combo)
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
        aria-labelledby="add-combo-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2
            id="add-combo-title"
            className="text-base font-semibold text-ink"
          >
            Create Combo Item
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

        <div className="min-h-0 flex-1 overflow-auto p-5">
          {/* ── Combo Details ── */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Combo Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Sandwich & Burger Combo"
                className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Short Code <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={shortCode}
                onChange={(event) => setShortCode(event.target.value)}
                placeholder="e.g. SBC01"
                className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Price <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0"
                className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional description"
                className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* ── Combo Items ── */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">Combo Items</h3>
              <span className="text-xs text-muted">
                {comboItems.filter((i) => i.itemId).length} item(s) selected
              </span>
            </div>

            <div className="rounded-lg border border-line">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">Item</th>
                    <th className="w-24 px-3 py-2.5">Qty</th>
                    <th className="w-10 px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {comboItems.map((row, index) => (
                    <ComboItemRow
                      key={row.key}
                      row={row}
                      index={index}
                      selectedIds={comboItems
                        .filter((i) => i.key !== row.key && i.itemId)
                        .map((i) => i.itemId)}
                      onChange={(patch) => updateItem(row.key, patch)}
                      onRemove={() => removeItem(row.key)}
                      canRemove={comboItems.length > 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() =>
                setComboItems((prev) => [...prev, emptyComboItem()])
              }
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-sm font-medium text-ink hover:bg-page"
            >
              <Plus size={15} />
              Add Item
            </button>
          </div>

          {error ? (
            <p className="mt-3 text-xs text-primary">{error}</p>
          ) : null}
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
            Save Combo
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ── Single combo-item row with searchable dropdown ── */

function ComboItemRow({
  row,
  index,
  selectedIds,
  onChange,
  onRemove,
  canRemove,
}: {
  row: ComboItemDraft
  index: number
  selectedIds: string[]
  onChange: (patch: Partial<ComboItemDraft>) => void
  onRemove: () => void
  canRemove: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 })

  const selectedItem = useMemo(
    () => menuItems.find((m) => m.id === row.itemId),
    [row.itemId],
  )

  const available = useMemo(() => {
    const q = query.trim().toLowerCase()
    return menuItems.filter((item) => {
      if (selectedIds.includes(item.id)) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.shortCode.toLowerCase().includes(q)
      )
    })
  }, [query, selectedIds])

  const measure = useCallback(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    measure()
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, measure])

  return (
    <tr className="border-b border-line last:border-b-0">
      <td className="px-3 py-2.5 text-xs font-medium text-muted">
        {index + 1}
      </td>
      <td className="px-3 py-2.5">
        <div ref={rootRef} className="relative">
          <button
            type="button"
            ref={btnRef}
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-9 w-full items-center justify-between gap-2 rounded-md border border-line bg-card px-2.5 text-left text-sm outline-none hover:bg-page focus:border-primary"
          >
            <span className={selectedItem ? 'text-ink' : 'text-muted'}>
              {selectedItem
                ? `${selectedItem.name} (${selectedItem.shortCode})`
                : 'Select item'}
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>
          {open
            ? createPortal(
                <div
                  className="fixed z-[70] overflow-hidden rounded-md border border-line bg-card shadow-lg"
                  style={{ top: dropPos.top, left: dropPos.left, width: dropPos.width }}
                >
                  <div className="border-b border-line p-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search items..."
                      className="h-9 w-full rounded-md border border-line px-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
                    {available.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-muted">
                        No items found
                      </li>
                    ) : (
                      available.map((item) => {
                        const selected = row.itemId === item.id
                        return (
                          <li key={item.id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={selected}
                              onClick={() => {
                                onChange({ itemId: item.id })
                                setOpen(false)
                              }}
                              className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-page ${
                                selected ? 'font-semibold text-ink' : 'text-ink'
                              }`}
                            >
                              <span className="min-w-0">
                                <span className="block truncate">{item.name}</span>
                                <span className="block text-xs text-muted">
                                  {item.shortCode} · ₹{item.price}
                                </span>
                              </span>
                              {selected ? (
                                <Check
                                  size={15}
                                  className="shrink-0 text-success"
                                />
                              ) : (
                                <span className="size-[15px]" />
                              )}
                            </button>
                          </li>
                        )
                      })
                    )}
                  </ul>
                </div>,
                document.body,
              )
            : null}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <input
          type="number"
          min={1}
          value={row.quantity}
          onChange={(event) =>
            onChange({ quantity: Math.max(1, Number(event.target.value) || 1) })
          }
          className="h-9 w-full rounded-md border border-line bg-card px-2 text-center text-sm outline-none focus:border-primary"
        />
      </td>
      <td className="px-3 py-2.5">
        <button
          type="button"
          aria-label="Remove item"
          disabled={!canRemove}
          onClick={onRemove}
          className="rounded p-1.5 text-muted hover:bg-primary/10 hover:text-primary disabled:opacity-30"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  )
}
