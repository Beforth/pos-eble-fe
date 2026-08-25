import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { PrimaryButton } from '../components/menu/MenuActionButtons'
import { addComboItem } from '../mocks/comboStore'
import { menuItems, type MenuItemRow } from '../mocks/menuItemsData'

const COMBO_CATEGORY_ID = 'c21'

interface ComboItemDraft {
  key: string
  itemId: string
  quantity: number
}

function emptyComboItem(): ComboItemDraft {
  return {
    key: `combo-${Date.now()}-${Math.random()}`,
    itemId: '',
    quantity: 1,
  }
}

export default function AddCombo() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [shortCode, setShortCode] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [comboItems, setComboItems] = useState<ComboItemDraft[]>([
    emptyComboItem(),
  ])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

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

    const combo: MenuItemRow = {
      id: `combo-${Date.now()}`,
      categoryId: COMBO_CATEGORY_ID,
      name: name.trim(),
      shortCode: shortCode.trim(),
      onlineDisplayName: name.trim(),
      price: Number(price) || 0,
      description: description.trim(),
      available: false,
      tags: ['set-as-combo'],
      hasImage: false,
    }
    addComboItem(combo)
    setError('')
    showToast('Combo created successfully')
    window.setTimeout(() => navigate('/menu/base-menu'), 800)
  }

  return (
    <MenuPageShell
      backTo="/menu/base-menu"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/menu/base-menu')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/menu/base-menu')
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Menu Management
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Add Combo</span>
        </span>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {/* ── Combo Details ── */}
      <section className="relative z-0 mb-4 rounded-xl border border-line bg-card [&:has([aria-expanded=true])]:z-30">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Plus size={16} />
          </span>
          <h2 className="text-sm font-semibold text-ink">Combo Details</h2>
        </div>
        <div className="border-t border-line px-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
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
        </div>
      </section>

      {/* ── Combo Items ── */}
      <section className="relative z-0 mb-4 rounded-xl border border-line bg-card [&:has([aria-expanded=true])]:z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Plus size={16} />
            </span>
            <h2 className="text-sm font-semibold text-ink">Combo Items</h2>
          </div>
          <span className="text-xs text-muted">
            {comboItems.filter((i) => i.itemId).length} item(s) selected
          </span>
        </div>
        <div className="border-t border-line px-4 py-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="w-12 px-3 py-2.5">#</th>
                  <th className="px-3 py-2.5">Item</th>
                  <th className="w-28 px-3 py-2.5">Qty</th>
                  <th className="w-12 px-3 py-2.5" />
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
      </section>

      {error ? <p className="mb-3 text-sm text-primary">{error}</p> : null}

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/menu/base-menu')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave}>Save Combo</PrimaryButton>
      </div>
    </MenuPageShell>
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
  const [dropPos, setDropPos] = useState<{
    bottom: number
    left: number
    width: number
  }>({ bottom: 0, left: 0, width: 0 })

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
      setDropPos({
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }
    measure()
    const onPointerDown = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
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
                  style={{
                    bottom: dropPos.bottom,
                    left: dropPos.left,
                    width: dropPos.width,
                  }}
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
                  <ul
                    role="listbox"
                    className="max-h-56 overflow-y-auto py-1"
                  >
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
                                selected
                                  ? 'font-semibold text-ink'
                                  : 'text-ink'
                              }`}
                            >
                              <span className="min-w-0">
                                <span className="block truncate">
                                  {item.name}
                                </span>
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
            onChange({
              quantity: Math.max(1, Number(event.target.value) || 1),
            })
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
