import { useEffect, useState } from 'react'
import { CheckCheck, ListPlus, Loader2, MonitorSmartphone, Search, X } from 'lucide-react'
import { Input } from '../common/Input'
import {
  categoryName,
  type KotScreen,
  type ScreenCategory,
} from '../../mocks/screensData'
import { getMenuItemById } from '../../mocks/menuItemsData'
import { fetchCategories } from '../../services/screenService'
import { upsertScreen } from '../../utils/screenStore'
import { AddSingleItemModal } from './AddSingleItemModal'

interface EditScreenModalProps {
  open: boolean
  screen: KotScreen | null
  onClose: () => void
  onSaved: (updated: KotScreen) => void
}

export function EditScreenModal({
  open,
  screen,
  onClose,
  onSaved,
}: EditScreenModalProps) {
  const [screenName, setScreenName] = useState('')
  const [categories, setCategories] = useState<ScreenCategory[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !screen) return
    setScreenName(screen.name)
    setSelectedIds(screen.categoryIds ?? [])
    setSelectedItemIds(screen.itemIds ?? [])
    setAddItemOpen(false)
    setQuery('')
    setError(null)
    setLoading(true)

    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [open, screen])

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

  if (!open || !screen) return null

  function toggleCategory(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
    )
  }

  function handleSelectAllCategories() {
    if (selectedIds.length === categories.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(categories.map((c) => c.id))
    }
  }

  function handleSave() {
    if (!screen) return
    setSaving(true)
    setError(null)

    try {
      const updated = upsertScreen({
        id: screen.id,
        name: screenName.trim() || screen.name,
        categoryIds: selectedIds,
        itemIds: selectedItemIds,
      })
      onSaved(updated)
    } catch {
      setError('Could not update screen. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const normalizedQuery = query.trim().toLowerCase()
  const visibleCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(normalizedQuery),
  )

  const isAllSelected =
    categories.length > 0 && selectedIds.length === categories.length
  const isMasterScreen = selectedIds.length === 0 && selectedItemIds.length === 0

  return (
    <>
      <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close edit screen"
          onClick={onClose}
          className="absolute inset-0 bg-black/45"
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit KOT screen"
          className="relative z-10 flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
        >
          <header className="flex items-center justify-between border-b border-line px-5 py-3">
            <div className="flex items-center gap-2">
              <MonitorSmartphone size={18} className="text-primary" />
              <h2 className="text-base font-semibold text-ink">
                Screen Settings & Filters
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
            >
              <X size={18} />
            </button>
          </header>

          <div className="overflow-y-auto px-5 py-4">
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-semibold text-ink">
                Screen Name
              </label>
              <Input
                value={screenName}
                onChange={(event) => setScreenName(event.target.value)}
                placeholder="e.g. Kitchen Display Screen"
              />
            </div>

            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ink">
                  Category Filters
                </p>
                <p className="text-[11px] text-muted">
                  {isMasterScreen
                    ? 'No filters selected = All categories will display.'
                    : `${selectedIds.length} categories active.`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllCategories}
                  className="inline-flex items-center gap-1 rounded-lg border border-line bg-page px-2.5 py-1 text-xs font-medium text-ink hover:bg-primary/5 hover:text-primary"
                >
                  <CheckCheck size={13} />
                  {isAllSelected ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIds([])
                    setSelectedItemIds([])
                  }}
                  className="rounded-lg border border-line bg-page px-2.5 py-1 text-xs font-medium text-muted hover:text-ink"
                >
                  Show Everything (No Filters)
                </button>
              </div>
            </div>

            {!loading && categories.length > 0 ? (
              <div className="mb-3">
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search categories..."
                  leftIcon={<Search size={15} />}
                />
              </div>
            ) : null}

            {loading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted">
                <Loader2 size={16} className="animate-spin" />
                Loading categories…
              </div>
            ) : visibleCategories.length === 0 ? (
              <div className="rounded-xl border border-line bg-page px-4 py-6 text-center text-xs text-muted">
                No categories match &ldquo;{query.trim()}&rdquo;.
              </div>
            ) : (
              <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto rounded-lg border border-line bg-page/50 p-2">
                <button
                  type="button"
                  onClick={() => setAddItemOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/60 bg-card px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
                >
                  <ListPlus size={13} />
                  Specific Items
                  {selectedItemIds.length > 0
                    ? ` (${selectedItemIds.length})`
                    : ''}
                </button>
                {visibleCategories.map((category) => {
                  const active = selectedIds.includes(category.id)
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'border-primary bg-primary text-white shadow-xs'
                          : 'border-line bg-card text-ink hover:border-primary/40 hover:bg-primary/5'
                      }`}
                    >
                      <span
                        className={`flex size-3.5 items-center justify-center rounded text-[9px] font-bold ${
                          active
                            ? 'bg-white/25 text-white'
                            : 'bg-page text-muted'
                        }`}
                      >
                        {active ? '✓' : category.itemCount}
                      </span>
                      {category.name}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Selection Summary */}
            <div className="mt-3 rounded-lg border border-line bg-page p-3 text-xs">
              <p className="font-semibold text-ink">Active Screen Rules:</p>
              {isMasterScreen ? (
                <p className="mt-1 text-success">
                  ✓ Master Screen: All KOT tickets from all categories and items will appear on this screen.
                </p>
              ) : (
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedIds.map((id) => (
                    <span
                      key={id}
                      className="rounded border border-line bg-card px-1.5 py-0.5 text-[11px] text-ink"
                    >
                      {categoryName(id)}
                    </span>
                  ))}
                  {selectedItemIds.map((id) => {
                    const item = getMenuItemById(id)
                    return (
                      <span
                        key={id}
                        className="rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary"
                      >
                        {item?.name ?? id}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {error ? <p className="mt-2 text-xs text-primary">{error}</p> : null}
          </div>

          <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              Save Changes
            </button>
          </footer>
        </div>
      </div>

      <AddSingleItemModal
        open={addItemOpen}
        initialSelectedIds={selectedItemIds}
        onClose={() => setAddItemOpen(false)}
        onConfirm={(ids) => {
          setSelectedItemIds(ids)
          setAddItemOpen(false)
        }}
      />
    </>
  )
}
