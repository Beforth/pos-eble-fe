import { useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Tag } from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { PrimaryButton } from '../components/menu/MenuActionButtons'
import { SearchableSelect } from '../components/inventory/SearchableSelect'
import { addMenuItem, baseMenuCategories, type MenuItemRow } from '../mocks/menuItemsData'

const TAG_OPTIONS = ['V+', 'NV', 'F', 'D', 'O', 'E']

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-ink">
      {children}
      {required ? <span className="text-primary"> *</span> : null}
    </label>
  )
}

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

export default function AddMenuItem() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultCategoryId = searchParams.get('categoryId') || baseMenuCategories[0].id

  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [shortCode, setShortCode] = useState('')
  const [onlineDisplayName, setOnlineDisplayName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState(defaultCategoryId)
  const [tags, setTags] = useState<string[]>([])

  const categoryNames = baseMenuCategories.map((c) => c.name)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  function handleSave() {
    if (!name.trim()) {
      setError('Item name is required')
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

    const item: MenuItemRow = {
      id: `item-${Date.now()}`,
      categoryId,
      name: name.trim(),
      shortCode: shortCode.trim(),
      onlineDisplayName: onlineDisplayName.trim() || name.trim(),
      price: Number(price) || 0,
      description: description.trim(),
      available: false,
      tags,
      hasImage: false,
    }
    addMenuItem(item)
    setError('')
    showToast('Item created successfully')
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
          <span className="font-semibold text-ink">Add Item</span>
        </span>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      {/* ── Item Details ── */}
      <section className="relative z-0 mb-4 rounded-xl border border-line bg-card [&:has([aria-expanded=true])]:z-30">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Plus size={16} />
          </span>
          <h2 className="text-sm font-semibold text-ink">Item Details</h2>
        </div>
        <div className="border-t border-line px-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel required>Item Name</FieldLabel>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Masala Dabeli"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel required>Short Code</FieldLabel>
              <input
                type="text"
                value={shortCode}
                onChange={(event) => setShortCode(event.target.value)}
                placeholder="e.g. MD01"
                className={inputClass}
              />
            </div>
            <div>
              <FieldLabel>Online Display Name</FieldLabel>
              <input
                type="text"
                value={onlineDisplayName}
                onChange={(event) => setOnlineDisplayName(event.target.value)}
                placeholder="Defaults to item name"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-muted">
                If left blank, the item name will be used.
              </p>
            </div>
            <div>
              <FieldLabel required>Price</FieldLabel>
              <input
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="Optional description for the item..."
                className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Category & Tags ── */}
      <section className="relative z-0 mb-4 rounded-xl border border-line bg-card [&:has([aria-expanded=true])]:z-30">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Tag size={16} />
          </span>
          <h2 className="text-sm font-semibold text-ink">Category & Tags</h2>
        </div>
        <div className="border-t border-line px-4 py-4">
          <div className="mb-4">
            <SearchableSelect
              label="Category"
              required
              value={categoryNames.find((_, i) => baseMenuCategories[i].id === categoryId) || ''}
              options={categoryNames}
              placeholder="Select a category"
              searchPlaceholder="Search categories..."
              dropdownPlacement="above"
              onChange={(name) => {
                const cat = baseMenuCategories.find((c) => c.name === name)
                if (cat) setCategoryId(cat.id)
              }}
            />
          </div>
          <div>
            <FieldLabel>Tags</FieldLabel>
            <div className="flex flex-wrap gap-2 pt-1">
              {TAG_OPTIONS.map((tag) => {
                const active = tags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-xs font-medium transition-colors ${
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-line bg-card text-muted hover:border-muted'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
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
        <PrimaryButton onClick={handleSave}>Save Item</PrimaryButton>
      </div>
    </MenuPageShell>
  )
}
