import { useEffect, useMemo, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  ClipboardList,
  Eye,
  FileText,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  RecipeViewModal,
} from '../../components/inventory/RecipeViewModal'
import { RecipeModificationLogModal } from '../../components/inventory/RecipeModificationLogModal'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import {
  ActionDropdown,
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_WRITE_PERMISSION,
  deleteRecipeApi,
  listAllRecipesApi,
  type ItemRecipe,
} from '../../services/inventoryService'

function ClipboardEyeIcon({ size = 15 }: { size?: number }) {
  return (
    <span className="relative inline-flex size-[15px] items-center justify-center">
      <Clipboard size={size} strokeWidth={1.75} />
      <Eye
        size={8}
        strokeWidth={2.25}
        className="absolute -bottom-0.5 -right-0.5 rounded-full bg-page"
      />
    </span>
  )
}

function FilesMenu({ onAction }: { onAction: (label: string) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function item(label: string, key?: string) {
    return (
      <li key={key ?? label}>
        <button
          type="button"
          onClick={() => {
            onAction(label)
            setOpen(false)
          }}
          className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
        >
          {label}
        </button>
      </li>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
      >
        <FileText size={15} className="text-muted" />
        Files
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open ? (
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[220px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg [background-color:var(--color-card)]">
          <li>
            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Import Recipe
            </p>
            <ul>
              {item('Download', 'import-recipe-download')}
              {item('Upload', 'import-recipe-upload')}
            </ul>
          </li>
          <li>
            <div className="my-1 border-t border-line" />
            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Import Self Item Recipe
            </p>
            <ul>
              {item('Download', 'import-self-download')}
              {item('Upload', 'import-self-upload')}
            </ul>
          </li>
          <li>
            <div className="my-1 border-t border-line" />
            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Export Excel
            </p>
            <ul>
              {item('Active Menu Recipe')}
              {item('For Branch Copy')}
              {item('Export All')}
            </ul>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

function CategoryTabBar({
  tabs,
  selected,
  onSelect,
}: {
  tabs: { id: string; label: string }[]
  selected: string
  onSelect: (id: string) => void
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateScrollState() {
    const el = scrollerRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < maxScroll - 2)
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateScrollState()
    const onScroll = () => updateScrollState()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [tabs])

  function scrollBy(direction: -1 | 1) {
    scrollerRef.current?.scrollBy({
      left: direction * 220,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative z-10 mb-4 flex items-center gap-1">
      <button
        type="button"
        aria-label="Scroll categories left"
        disabled={!canScrollLeft}
        onClick={() => scrollBy(-1)}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-page hover:text-ink disabled:cursor-default disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>

      <div
        ref={scrollerRef}
        role="tablist"
        aria-label="Recipe categories"
        className="category-tab-scroller flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden py-0.5"
      >
        {tabs.map((tab) => {
          const active = selected === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(tab.id)}
              className={`inline-flex shrink-0 cursor-pointer items-center rounded-lg px-3.5 py-2 text-sm transition-colors ${
                active
                  ? 'bg-primary font-semibold text-white'
                  : 'font-medium text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        aria-label="Scroll categories right"
        disabled={!canScrollRight}
        onClick={() => scrollBy(1)}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-page hover:text-ink disabled:cursor-default disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

export default function ItemRecipes() {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_WRITE_PERMISSION)
  const [itemFilter, setItemFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [createdFilter, setCreatedFilter] = useState('All')
  const [appliedItem, setAppliedItem] = useState('All')
  const [appliedCategory, setAppliedCategory] = useState('All')
  const [appliedCreated, setAppliedCreated] = useState('All')
  const [cardCategory, setCardCategory] = useState('all')
  const [autoConsumption, setAutoConsumption] = useState(false)
  const [rows, setRows] = useState<ItemRecipe[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [viewRecipe, setViewRecipe] = useState<ItemRecipe | null>(null)
  const [logRecipeName, setLogRecipeName] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{
    type: 'single' | 'multiple'
    id?: string
    name?: string
  } | null>(null)

  useEffect(() => {
    if (!encryptedOutletId) {
      setRows([])
      return
    }
    listAllRecipesApi(encryptedOutletId)
      .then(setRows)
      .catch((err) => {
        showToast(
          err instanceof ApiError ? err.message : 'Unable to load recipes',
        )
      })
  }, [encryptedOutletId])

  const categoryNames = useMemo(() => {
    const names = new Set(
      rows.map((row) => row.item_category_name).filter(Boolean),
    )
    return [...names]
  }, [rows])

  const itemNames = useMemo(
    () => ['All', ...rows.map((row) => row.item_name)],
    [rows],
  )

  const categoryTabs = useMemo(
    () => [
      { id: 'all', label: 'All categories' },
      ...categoryNames.map((category) => ({
        id: category,
        label: category,
      })),
    ],
    [categoryNames],
  )

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (cardCategory !== 'all' && row.item_category_name !== cardCategory) {
        return false
      }
      if (
        appliedCategory !== 'All' &&
        row.item_category_name !== appliedCategory
      ) {
        return false
      }
      if (appliedItem !== 'All' && row.item_name !== appliedItem) return false
      if (appliedCreated === 'Not Created') return false
      return true
    })
  }, [rows, cardCategory, appliedCategory, appliedItem, appliedCreated])

  const { sortKey, sortDir, toggleSort, visible } = useListQuery(
    filteredRows,
    (row) => [row.item_name, row.item_category_name],
    (row, key) =>
      key === 'category' ? row.item_category_name : row.item_name,
  )

  const pageIds = visible.map((row) => row.id)
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))


  function applySearch() {
    setAppliedItem(itemFilter)
    setAppliedCategory(categoryFilter)
    setAppliedCreated(createdFilter)
    if (categoryFilter !== 'All') setCardCategory(categoryFilter)
    showToast('Search applied')
  }

  function clearFilters() {
    setItemFilter('All')
    setCategoryFilter('All')
    setCreatedFilter('All')
    setAppliedItem('All')
    setAppliedCategory('All')
    setAppliedCreated('All')
    setCardCategory('all')
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function confirmDelete() {
    if (!pendingDelete || !encryptedOutletId) return
    try {
      if (pendingDelete.type === 'single' && pendingDelete.id) {
        await deleteRecipeApi(encryptedOutletId, pendingDelete.id)
        const deletedId = pendingDelete.id
        setRows((prev) => prev.filter((row) => row.id !== deletedId))
        setSelectedIds((prev) => {
          const next = new Set(prev)
          next.delete(deletedId)
          return next
        })
        showToast('Recipe deleted')
        return
      }
      if (pendingDelete.type === 'multiple') {
        for (const id of selectedIds) {
          await deleteRecipeApi(encryptedOutletId, id)
        }
        setRows((prev) => prev.filter((row) => !selectedIds.has(row.id)))
        setSelectedIds(new Set())
        showToast('Selected recipes deleted')
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to delete recipe')
    }
  }

  return (
    <InventoryPageShell activeItem="item-recipes">

      <div className="relative z-40 mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Recipe Management</h1>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <PrimaryButton
              onClick={() => navigate('/inventory/item-recipes/new')}
            >
              <Plus size={15} />
              Create New
            </PrimaryButton>
          ) : null}
          <ActionDropdown
            label="More Actions"
            options={[
              {
                label: 'Recipe Customizer',
                onClick: () => showToast('Recipe Customizer'),
              },
              {
                label: 'Area Recipe',
                onClick: () => showToast('Area Recipe'),
              },
              {
                label: 'Bulk recipe editor',
                onClick: () => showToast('Bulk recipe editor'),
              },
              {
                label: 'Replicate Recipe',
                onClick: () => showToast('Replicate Recipe'),
              },
              ...(canWrite
                ? [
                    {
                      label: 'Delete Multiple Recipe',
                      danger: true,
                      onClick: () => {
                        if (selectedIds.size === 0) {
                          showToast('Select at least one recipe')
                          return
                        }
                        setPendingDelete({ type: 'multiple' })
                      },
                    },
                  ]
                : []),
            ]}
          />
          <FilesMenu
            onAction={(label) => {
              const recipeHeaders = [
                'name',
                'category',
                'ingredients',
              ] as const
              const toCsvRows = (list: ItemRecipe[]) =>
                list.map((row) => [
                  row.item_name,
                  row.item_category_name || '',
                  row.lines.length,
                ])
              if (
                label === 'Active Menu Recipe' ||
                label === 'For Branch Copy' ||
                label === 'Export All'
              ) {
                const source =
                  label === 'Export All' ? filteredRows : visible
                const filename =
                  label === 'Active Menu Recipe'
                    ? 'active-menu-recipes.csv'
                    : label === 'For Branch Copy'
                      ? 'branch-copy-recipes.csv'
                      : 'recipes-all.csv'
                downloadCsv(
                  [...recipeHeaders],
                  toCsvRows(source),
                  filename,
                )
                showToast(`Exported ${label}`)
                return
              }
              if (label === 'Download' || label.startsWith('Download')) {
                downloadCsv(
                  [...recipeHeaders],
                  [],
                  'recipe-import-template.csv',
                )
                showToast('Template downloaded')
                return
              }
              showToast(label)
            }}
          />
        </div>
      </div>

      <div className="relative z-30 mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[180px] flex-1">
          <SearchableSelect
            label="Select Item"
            value={itemFilter}
            options={itemNames}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            compact
            onChange={setItemFilter}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <SearchableSelect
            label="Select Category"
            value={categoryFilter}
            options={['All', ...categoryNames]}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            compact
            onChange={setCategoryFilter}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <SearchableSelect
            label="Created Recipes"
            value={createdFilter}
            options={['All', 'Created', 'Not Created']}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            compact
            onChange={setCreatedFilter}
          />
        </div>
        <OutlineButton onClick={applySearch}>Search</OutlineButton>
        <OutlineButton variant="gray" onClick={clearFilters}>
          Clear
        </OutlineButton>
        <div className="ml-auto flex items-center gap-2 pb-1">
          <span className="text-sm font-medium text-ink">Auto Consumption</span>
          <button
            type="button"
            role="switch"
            aria-checked={autoConsumption}
            onClick={() => {
              setAutoConsumption((prev) => !prev)
              showToast(
                autoConsumption
                  ? 'Auto Consumption disabled'
                  : 'Auto Consumption enabled',
              )
            }}
            className={`relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors ${
              autoConsumption ? 'bg-primary' : 'bg-line'
            }`}
          >
            <span
              className={`inline-block size-3.5 rounded-full bg-card transition-transform ${
                autoConsumption ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <CategoryTabBar
        tabs={categoryTabs}
        selected={cardCategory}
        onSelect={(id) => {
          setCardCategory(id)
          setCategoryFilter(id === 'all' ? 'All' : id)
          setAppliedCategory(id === 'all' ? 'All' : id)
        }}
      />

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-ink">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all recipes"
                    className="size-4 accent-primary"
                  />
                </th>
                <SortableTh
                  columnKey="name"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="px-3 py-2.5"
                >
                  Name
                </SortableTh>
                <SortableTh
                  columnKey="category"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="px-3 py-2.5"
                >
                  Category
                </SortableTh>
                <th className="px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-16 text-center">
                    <span className="relative mx-auto mb-4 inline-flex text-muted">
                      <FileText
                        size={56}
                        strokeWidth={1.25}
                        className="text-muted/50"
                      />
                    </span>
                    <p className="text-base font-semibold text-ink">
                      Recipe Management Record Not Found
                    </p>
                  </td>
                </tr>
              ) : (
                visible.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-line last:border-b-0 ${
                      index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        aria-label={`Select ${row.item_name}`}
                        className="size-4 accent-primary"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-ink">{row.item_name}</td>
                    <td className="px-3 py-2.5 text-ink">
                      {row.item_category_name || '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <RowActionButton
                          boxed
                          label="View Recipe"
                          onClick={() => setViewRecipe(row)}
                        >
                          <ClipboardList size={15} strokeWidth={1.75} />
                        </RowActionButton>
                        {canWrite ? (
                          <RowActionButton
                            boxed
                            label="Edit"
                            onClick={() =>
                              navigate(`/inventory/item-recipes/${row.id}/edit`)
                            }
                          >
                            <Pencil size={15} strokeWidth={1.75} />
                          </RowActionButton>
                        ) : null}
                        {canWrite ? (
                          <RowActionButton
                            boxed
                            label="Delete"
                            onClick={() =>
                              setPendingDelete({
                                type: 'single',
                                id: row.id,
                                name: row.item_name,
                              })
                            }
                          >
                            <Trash2 size={15} strokeWidth={1.75} />
                          </RowActionButton>
                        ) : null}
                        <RowActionButton
                          boxed
                          label="View Log"
                          onClick={() => setLogRecipeName(row.item_name)}
                        >
                          <ClipboardEyeIcon />
                        </RowActionButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-3">
          <p className="text-sm text-muted">
            {visible.length === 0
              ? 'Showing 0 records'
              : `Showing 1 to ${visible.length} of ${visible.length} records`}
          </p>
        </div>
      </div>

      <RecipeViewModal
        open={Boolean(viewRecipe)}
        recipeName={viewRecipe?.item_name ?? null}
        ingredients={
          viewRecipe
            ? viewRecipe.lines.map((line) => ({
                name: line.raw_material_name,
                quantity: line.qty,
                unit: line.unit_name,
                area: line.area,
              }))
            : []
        }
        onClose={() => setViewRecipe(null)}
      />
      <RecipeModificationLogModal
        open={Boolean(logRecipeName)}
        recipeName={logRecipeName}
        onClose={() => setLogRecipeName(null)}
        onDownload={() => showToast('File downloaded')}
      />
      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Confirm Delete"
        message={
          pendingDelete?.type === 'multiple'
            ? `Are you sure you want to delete ${selectedIds.size} selected recipe${selectedIds.size === 1 ? '' : 's'}? This action cannot be undone.`
            : `Are you sure you want to delete "${pendingDelete?.name ?? 'this recipe'}"? This action cannot be undone.`
        }
        confirmLabel="Delete"
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </InventoryPageShell>
  )
}
