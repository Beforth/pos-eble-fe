import { useEffect, useState } from 'react'
import { ListPlus, Loader2, MonitorSmartphone, Search, X } from 'lucide-react'
import { Input } from '../common/Input'
import {
  categoryName,
  type KotScreen,
  type ScreenCategory,
} from '../../mocks/screensData'
import { getMenuItemById } from '../../mocks/menuItemsData'
import { createScreen, fetchCategories } from '../../services/screenService'
import { AddSingleItemModal } from './AddSingleItemModal'

interface CreateScreenModalProps {
  open: boolean
  onClose: () => void
  onCreated: (screen: KotScreen) => void
}

export function CreateScreenModal({
  open,
  onClose,
  onCreated,
}: CreateScreenModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [screenName, setScreenName] = useState('')
  const [categories, setCategories] = useState<ScreenCategory[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([])
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setStep(1)
    setScreenName('')
    setSelectedIds([])
    setSelectedItemIds([])
    setAddItemOpen(false)
    setQuery('')
    setError(null)
    setLoading(false)
  }, [open])

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

  if (!open) return null

  function goToCategories() {
    setError(null)
    setLoading(true)
    fetchCategories()
      .then(setCategories)
      .catch(() => {
        setCategories([])
        setError('Could not load categories. Try again.')
      })
      .finally(() => {
        setLoading(false)
        setStep(2)
      })
  }

  function toggleCategory(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((entry) => entry !== id)
        : [...prev, id],
    )
  }

  async function handleCreate() {
    setCreating(true)
    setError(null)
    try {
      const screen = await createScreen({
        categoryIds: selectedIds,
        itemIds: selectedItemIds,
        name: screenName.trim() || 'Kitchen Display Screen',
      })
      onCreated(screen)
    } catch {
      setError('Could not create the screen. Try again.')
    } finally {
      setCreating(false)
    }
  }

  const normalizedQuery = query.trim().toLowerCase()
  const visibleCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(normalizedQuery),
  )

  const isAllSelected =
    categories.length > 0 && selectedIds.length === categories.length
  const isMasterScreen = selectedIds.length === 0 && selectedItemIds.length === 0

  function handleSelectAll() {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(categories.map((c) => c.id))
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
        <button
          type="button"
          aria-label="Close create screen"
          onClick={onClose}
          className="absolute inset-0 bg-black/45"
        />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create KOT screen"
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex items-center gap-2">
            <MonitorSmartphone size={18} className="text-primary" />
            <h2 className="text-base font-semibold text-ink">
              Create KOT Screen
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
          {step === 1 ? (
            <div>
              <p className="mb-3 text-sm font-medium text-ink">Screen name</p>
              <p className="mb-4 text-xs text-muted">
                Give this KOT screen a name so you can tell it apart later.
              </p>
              <Input
                value={screenName}
                onChange={(event) => setScreenName(event.target.value)}
                placeholder="e.g. Kitchen Display Screen"
                autoFocus
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && screenName.trim()) {
                    goToCategories()
                  }
                }}
              />
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">
                    Select categories for this screen
                  </p>
                  <p className="text-xs text-muted">
                    {isMasterScreen
                      ? 'No categories selected = All KOTs will show on this screen.'
                      : 'This decides which KOTs appear on this screen.'}
                  </p>
                </div>
                {categories.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="rounded-lg border border-line bg-page px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/5"
                  >
                    {isAllSelected ? 'Deselect All' : 'Select All'}
                  </button>
                ) : null}
              </div>

              {!loading && categories.length > 0 ? (
                <div className="mb-4">
                  <Input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search categories"
                    leftIcon={<Search size={16} />}
                  />
                </div>
              ) : null}

              {loading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
                  <Loader2 size={16} className="animate-spin" />
                  Loading categories…
                </div>
              ) : categories.length === 0 ? (
                <div className="rounded-xl border border-line bg-page px-4 py-8 text-center text-sm text-muted">
                  No menu categories found. Add matching items to the menu
                  first.
                </div>
              ) : visibleCategories.length === 0 ? (
                <div className="rounded-xl border border-line bg-page px-4 py-8 text-center text-sm text-muted">
                  No categories match &ldquo;{query.trim()}&rdquo;.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAddItemOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/60 px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <ListPlus size={15} />
                    Add Single Item
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
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                          active
                            ? 'border-primary bg-primary text-white'
                            : 'border-line bg-page text-ink hover:border-primary/40 hover:bg-primary/5'
                        }`}
                      >
                        <span
                          className={`flex size-4 items-center justify-center rounded border text-[10px] font-bold ${
                            active
                              ? 'border-white/40 bg-white/20'
                              : 'border-line bg-card text-muted'
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

              {selectedIds.length > 0 || selectedItemIds.length > 0 ? (
                <div className="mt-4 rounded-xl border border-line bg-page px-4 py-3">
                  <p className="text-xs text-muted">Screen preview</p>
                  <p className="truncate text-sm font-semibold text-ink">
                    {screenName.trim()}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedIds.map((id) => (
                      <span
                        key={id}
                        className="rounded-md border border-line bg-card px-2 py-0.5 text-xs text-muted"
                      >
                        {categoryName(id)}
                      </span>
                    ))}
                    {selectedItemIds.map((id) => {
                      const item = getMenuItemById(id)
                      if (!item) return null
                      return (
                        <span
                          key={id}
                          className="rounded-md border border-primary/40 bg-primary/5 px-2 py-0.5 text-xs text-ink"
                        >
                          {item.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-success/40 bg-success/5 px-4 py-3">
                  <p className="text-xs font-semibold text-success">
                    Master Screen (All Categories)
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    This screen will receive and display all incoming KOTs.
                  </p>
                </div>
              )}

              {error ? <p className="mt-3 text-xs text-primary">{error}</p> : null}
            </div>
          )}
        </div>

        <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          {step === 1 ? (
            <button
              type="button"
              onClick={goToCategories}
              disabled={!screenName.trim()}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-9 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <MonitorSmartphone size={15} />
                )}
                Create Screen
              </button>
            </>
          )}
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
