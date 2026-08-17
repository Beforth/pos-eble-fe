import { useEffect, useMemo, useRef, useState } from 'react'
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
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  QuickAddRawMaterialModal,
  resolveQuickAddCategory,
} from '../../components/inventory/QuickAddRawMaterialModal'
import {
  buildRawMaterialDetails,
  RawMaterialDetailsModal,
  type RawMaterialDetails,
} from '../../components/inventory/RawMaterialDetailsModal'
import { RawMaterialModificationLogModal } from '../../components/inventory/RawMaterialModificationLogModal'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import {
  ActionDropdown,
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../../components/menu/MenuActionButtons'
import {
  RAW_MATERIAL_CATEGORIES,
  RAW_MATERIALS,
  type RawMaterialRow,
} from '../../mocks/rawMaterialsData'

const PAGE_SIZE = 100
const FILTER_CATEGORY_OPTIONS = ['All', ...RAW_MATERIAL_CATEGORIES]

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

function FilesMenu({
  onAction,
}: {
  onAction: (label: string) => void
}) {
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

  function item(label: string) {
    return (
      <li key={label}>
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
              Import
            </p>
            <ul>
              {item('Download')}
              {item('Upload')}
            </ul>
          </li>
          <li>
            <div className="my-1 border-t border-line" />
            <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Export
            </p>
            <ul>
              {item('Export Current Page')}
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
    <div className="relative z-20 mb-4 flex items-center gap-1">
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
        aria-label="Raw material categories"
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

export default function RawMaterials() {
  const navigate = useNavigate()
  const [nameInput, setNameInput] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [appliedName, setAppliedName] = useState('')
  const [appliedCategory, setAppliedCategory] = useState('All')
  const [cardCategory, setCardCategory] = useState('all')
  const [rows, setRows] = useState<RawMaterialRow[]>(() => [...RAW_MATERIALS])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [details, setDetails] = useState<RawMaterialDetails | null>(null)
  const [logMaterialName, setLogMaterialName] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState(false)

  const categoryTabs = useMemo(
    () => [
      { id: 'all', label: 'All categories' },
      ...RAW_MATERIAL_CATEGORIES.map((category) => ({
        id: category,
        label: category,
      })),
    ],
    [],
  )

  const filteredRows = useMemo(() => {
    const q = appliedName.trim().toLowerCase()
    return rows.filter((row) => {
      if (cardCategory !== 'all' && row.category !== cardCategory) return false
      if (appliedCategory !== 'All' && row.category !== appliedCategory) {
        return false
      }
      if (q && !row.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [rows, cardCategory, appliedCategory, appliedName])

  const totalRecords = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )
  const pageIds = pageRows.map((row) => row.id)
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function applySearch() {
    setAppliedName(nameInput)
    setAppliedCategory(categoryFilter)
    setPage(1)
    if (categoryFilter !== 'All') {
      setCardCategory(categoryFilter)
    }
    showToast('Search applied')
  }

  function clearFilters() {
    setNameInput('')
    setCategoryFilter('All')
    setAppliedName('')
    setAppliedCategory('All')
    setCardCategory('all')
    setPage(1)
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id))
      } else {
        pageIds.forEach((id) => next.add(id))
      }
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

  function updateRow(id: string, patch: Partial<RawMaterialRow>) {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
    setDirty(true)
  }

  function applyBulk(
    patch: Partial<Pick<RawMaterialRow, 'active' | 'favourite'>>,
    message: string,
  ) {
    if (selectedIds.size === 0) {
      showToast('Select at least one raw material')
      return
    }
    setRows((prev) =>
      prev.map((row) =>
        selectedIds.has(row.id) ? { ...row, ...patch } : row,
      ),
    )
    setDirty(true)
    showToast(message)
  }

  function requestDeleteSelected() {
    if (selectedIds.size === 0) {
      showToast('Select at least one raw material')
      return
    }
    setPendingDelete(true)
  }

  function confirmDeleteSelected() {
    setRows((prev) => prev.filter((row) => !selectedIds.has(row.id)))
    setSelectedIds(new Set())
    setDirty(true)
    showToast('Selected raw materials deleted')
  }

  return (
    <InventoryPageShell activeItem="raw-materials">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Raw Materials Management</h1>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton
            onClick={() => navigate('/inventory/raw-materials/new')}
          >
            <Plus size={15} />
            Create New
          </PrimaryButton>
          <OutlineButton onClick={() => setQuickAddOpen(true)}>
            <Plus size={15} />
            Quick Add
          </OutlineButton>
          <ActionDropdown
            options={[
              {
                label: 'Active',
                onClick: () => applyBulk({ active: true }, 'Marked as active'),
              },
              {
                label: 'Inactive',
                onClick: () =>
                  applyBulk({ active: false }, 'Marked as inactive'),
              },
              {
                label: 'Set as Favorite',
                onClick: () =>
                  applyBulk({ favourite: true }, 'Set as favorite'),
              },
              {
                label: 'Remove From Favorite',
                onClick: () =>
                  applyBulk({ favourite: false }, 'Removed from favorite'),
              },
              {
                label: 'Delete',
                danger: true,
                onClick: requestDeleteSelected,
              },
              {
                label: 'Raw material deleted logs',
                onClick: () => showToast('Opening deleted logs'),
              },
            ]}
          />
          <FilesMenu onAction={showToast} />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Name
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') applySearch()
            }}
            className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[220px]">
          <SearchableSelect
            label="Category"
            value={categoryFilter}
            options={FILTER_CATEGORY_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            compact
            onChange={setCategoryFilter}
          />
        </div>
        <OutlineButton onClick={applySearch}>Search</OutlineButton>
        <OutlineButton variant="gray" onClick={clearFilters}>
          Clear
        </OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            if (!dirty) {
              showToast('No changes to apply')
              return
            }
            setDirty(false)
            showToast('Changes applied')
          }}
        >
          Apply Changes
        </OutlineButton>
      </div>

      <CategoryTabBar
        tabs={categoryTabs}
        selected={cardCategory}
        onSelect={(id) => {
          setCardCategory(id)
          setCategoryFilter(id === 'all' ? 'All' : id)
          setAppliedCategory(id === 'all' ? 'All' : id)
          setPage(1)
        }}
      />

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-ink">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all on page"
                    className="size-4 accent-primary"
                  />
                </th>
                <th className="px-3 py-2.5">Name</th>
                <th className="min-w-[220px] px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5 text-center">Set As Favourite</th>
                <th className="px-3 py-2.5 text-center">Active</th>
                <th className="px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-16 text-center text-sm text-muted"
                  >
                    No raw materials found
                  </td>
                </tr>
              ) : (
                pageRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-line last:border-b-0 ${
                      index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                    }`}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        aria-label={`Select ${row.name}`}
                        className="size-4 accent-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(event) =>
                          updateRow(row.id, { name: event.target.value })
                        }
                        className="h-9 w-full min-w-[160px] rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <SearchableSelect
                        value={row.category}
                        options={[...RAW_MATERIAL_CATEGORIES]}
                        placeholder="Select category"
                        searchPlaceholder="Search"
                        includePlaceholderOption={false}
                        compact
                        dropdownPlacement={
                          index > pageRows.length - 4 ? 'above' : 'below'
                        }
                        onChange={(value) =>
                          updateRow(row.id, {
                            category: value as RawMaterialRow['category'],
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.favourite}
                        onChange={(event) =>
                          updateRow(row.id, {
                            favourite: event.target.checked,
                          })
                        }
                        aria-label={`Favourite ${row.name}`}
                        className="size-4 accent-primary"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.active}
                        onChange={(event) =>
                          updateRow(row.id, { active: event.target.checked })
                        }
                        aria-label={`Active ${row.name}`}
                        className="size-4 accent-primary"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1.5">
                        <RowActionButton
                          boxed
                          label="View Raw Material"
                          onClick={() =>
                            setDetails(buildRawMaterialDetails(row))
                          }
                        >
                          <ClipboardList size={15} strokeWidth={1.75} />
                        </RowActionButton>
                        <RowActionButton
                          boxed
                          label="Edit"
                          onClick={() =>
                            navigate(`/inventory/raw-materials/${row.id}/edit`, {
                              state: { row },
                            })
                          }
                        >
                          <Pencil size={15} strokeWidth={1.75} />
                        </RowActionButton>
                        <RowActionButton
                          boxed
                          label="View Log"
                          onClick={() => setLogMaterialName(row.name)}
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-sm text-muted">
            {totalRecords === 0
              ? 'Showing 0 records'
              : `Showing ${(currentPage - 1) * PAGE_SIZE + 1} to ${Math.min(
                  currentPage * PAGE_SIZE,
                  totalRecords,
                )} of ${totalRecords} records`}
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`flex size-8 items-center justify-center rounded-lg border text-sm font-medium ${
                  currentPage === n
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-card text-ink hover:bg-page'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
              className="h-8 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-page disabled:opacity-40"
            >
              Next
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(totalPages)}
              className="h-8 rounded-lg border border-line px-3 text-sm font-medium text-ink hover:bg-page disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      <QuickAddRawMaterialModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSave={(values) => {
          const next: RawMaterialRow = {
            id: `quick-${Date.now()}`,
            name: values.name,
            category: resolveQuickAddCategory(values.category),
            favourite: false,
            active: true,
          }
          setRows((prev) => [next, ...prev])
          setPage(1)
          setDirty(true)
          showToast(`${values.name} added`)
        }}
      />
      <RawMaterialDetailsModal
        open={Boolean(details)}
        details={details}
        onClose={() => setDetails(null)}
      />
      <RawMaterialModificationLogModal
        open={Boolean(logMaterialName)}
        materialName={logMaterialName}
        onClose={() => setLogMaterialName(null)}
      />
      <ConfirmDeleteModal
        open={pendingDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${selectedIds.size} selected raw material${selectedIds.size === 1 ? '' : 's'}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDeleteSelected}
        onClose={() => setPendingDelete(false)}
      />
    </InventoryPageShell>
  )
}
