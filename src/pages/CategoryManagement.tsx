import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronDown,
  ClipboardList,
  Pencil,
  Plus,
  Upload,
} from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { MenuSectionNav } from '../components/menu/MenuSectionNav'
import { NoRecordFound } from '../components/menu/NoRecordFound'
import { ShowChangesModal } from '../components/menu/ShowChangesModal'
import { menuCategories } from '../mocks/menuCategoriesData'
import { parentCategories } from '../mocks/parentCategoriesData'

type CategorySubTab =
  | 'parent'
  | 'category'
  | 'grouping'
  | 'menu-config'
  | 'tags'

const SUB_TABS: { id: CategorySubTab; label: string }[] = [
  { id: 'parent', label: 'Parent Category' },
  { id: 'category', label: 'Category' },
  { id: 'grouping', label: 'Grouping' },
  { id: 'menu-config', label: 'Menu Configuration' },
  { id: 'tags', label: 'Tags' },
]

const SEARCH_LABEL: Record<CategorySubTab, string> = {
  parent: 'Parent Category name',
  category: 'Category name',
  grouping: 'Department name',
  'menu-config': 'Menu Type name',
  tags: 'Tag Name',
}

function OutlineButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'gray'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border bg-card px-4 text-sm font-medium hover:bg-page ${
        variant === 'primary'
          ? 'border-primary text-primary hover:bg-primary/5'
          : 'border-line text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function RowActionButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick?: () => void
  children: ReactNode
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  function updatePosition() {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    setPos({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    })
  }

  function handleEnter() {
    updatePosition()
    setOpen(true)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        onClick={onClick}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setOpen(false)}
        onFocus={handleEnter}
        onBlur={() => setOpen(false)}
        className="inline-flex cursor-pointer rounded p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
      >
        {children}
      </button>
      {open
        ? createPortal(
            <span
              role="tooltip"
              style={{ top: pos.top, left: pos.left }}
              className="pointer-events-none fixed z-[200] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-2.5 py-1 text-[11px] font-medium text-white shadow-sm"
            >
              {label}
            </span>,
            document.body,
          )
        : null}
    </>
  )
}

export default function CategoryManagement() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as CategorySubTab | null) ?? 'category'
  const [subTab, setSubTab] = useState<CategorySubTab>(
    SUB_TABS.some((tab) => tab.id === initialTab) ? initialTab : 'category',
  )
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [changesName, setChangesName] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

function showToast(message: string) {
  setToast(message)
  window.setTimeout(() => setToast(null), 2200)
}

  useEffect(() => {
    const tab = searchParams.get('tab') as CategorySubTab | null
    if (tab && SUB_TABS.some((item) => item.id === tab)) {
      setSubTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    setQuery('')
    setAppliedQuery('')
    setSelected(new Set())
  }, [subTab])

  const categoryRows = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    if (!q) return menuCategories
    return menuCategories.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.onlineDisplayName.toLowerCase().includes(q) ||
        (row.parentCategory?.toLowerCase().includes(q) ?? false),
    )
  }, [appliedQuery])

  const parentRows = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    if (!q) return parentCategories
    return parentCategories.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.onlineDisplayName.toLowerCase().includes(q) ||
        row.categories.toLowerCase().includes(q),
    )
  }, [appliedQuery])

  const showEmpty =
    subTab === 'grouping' || subTab === 'menu-config' || subTab === 'tags'

  const listForSelect =
    subTab === 'parent'
      ? parentRows
      : subTab === 'category'
        ? categoryRows
        : []

  const allSelected =
    listForSelect.length > 0 &&
    listForSelect.every((row) => selected.has(row.id))

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set())
      return
    }
    setSelected(new Set(listForSelect.map((row) => row.id)))
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSearch() {
    setAppliedQuery(query)
  }

  function handleShowAll() {
    setQuery('')
    setAppliedQuery('')
    showToast('Filters cleared')
  }

  function renderHeaderActions() {
    if (subTab === 'category') {
      return (
        <>
          <button
            type="button"
            onClick={() => navigate('/menu/categories/new')}
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-white hover:brightness-95"
          >
            <Plus size={15} />
            Add Category
          </button>
          <OutlineButton variant="gray">
            Action
            <ChevronDown size={14} className="text-muted" />
          </OutlineButton>
          <OutlineButton variant="gray">
            Export/Import
            <ChevronDown size={14} className="text-muted" />
          </OutlineButton>
        </>
      )
    }

    if (subTab === 'grouping') {
      return (
        <button
          type="button"
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-white hover:brightness-95"
        >
          <Plus size={15} />
          Add Group
        </button>
      )
    }

    if (subTab === 'tags') {
      return (
        <>
          <button
            type="button"
            className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-white hover:brightness-95"
          >
            <Plus size={15} />
            Add Tag
          </button>
          <OutlineButton variant="gray">
            Action
            <ChevronDown size={14} className="text-muted" />
          </OutlineButton>
        </>
      )
    }

    if (subTab === 'menu-config') {
      return (
        <OutlineButton variant="gray">
          Action
          <ChevronDown size={14} className="text-muted" />
        </OutlineButton>
      )
    }

    return null
  }

  return (
    <MenuPageShell
      backTo="/menu"
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link
            to="/menu"
            className="text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Menu Management
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Category Management</span>
        </span>
      }
    >
      <MenuSectionNav activeTab="categories" />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Category sections"
          className="flex flex-wrap items-center gap-4 sm:gap-6"
        >
          {SUB_TABS.map((tab) => {
            const active = subTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSubTab(tab.id)}
                className={`cursor-pointer border-b-2 pb-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-ink hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {renderHeaderActions()}
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-line bg-card p-4">
        <label
          htmlFor="category-search"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          {SEARCH_LABEL[subTab]}
        </label>
        <div className="flex flex-wrap items-end gap-2">
          <input
            id="category-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSearch()
            }}
            className="h-9 min-w-[220px] flex-1 rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
          />
          <OutlineButton onClick={handleSearch}>Search</OutlineButton>
          <OutlineButton onClick={handleShowAll} variant="gray">
            Clear Filter
          </OutlineButton>
          {subTab === 'category' ? (
            <OutlineButton>Update Rank</OutlineButton>
          ) : null}
        </div>
        {subTab === 'category' ? (
          <p className="mt-2 text-xs text-muted">
            Note: Please arrange category sequence/rank from the category
            section using import/export sheet.
          </p>
        ) : null}
      </div>

      {showEmpty ? <NoRecordFound /> : null}

      {subTab === 'parent' ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-line bg-card">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-sm font-semibold text-ink">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all parent categories"
                      className="cursor-pointer accent-primary"
                    />
                  </th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Online Display Name</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parentRows.map((row) => {
                  const checked = selected.has(row.id)
                  return (
                    <tr
                      key={row.id}
                      className="cursor-grab border-b border-line last:border-b-0 hover:bg-page/80"
                    >
                      <td className="px-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(row.id)}
                          aria-label={`Select ${row.name}`}
                          className="cursor-pointer accent-primary"
                        />
                      </td>
                      <td className="px-3 py-3.5 font-medium text-ink">
                        {row.name}
                      </td>
                      <td className="px-3 py-3.5 text-ink">
                        {row.onlineDisplayName}
                      </td>
                      <td className="max-w-md px-3 py-3.5 text-ink">
                        {row.categories}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-muted">{row.created}</td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1">
                          <RowActionButton
                            label="Edit"
                            onClick={() =>
                              navigate(`/menu/categories/parent/${row.id}/edit`)
                            }
                          >
                            <Pencil size={16} />
                          </RowActionButton>
                          <RowActionButton
                            label="Show Changes"
                            onClick={() => setChangesName(row.name)}
                          >
                            <ClipboardList size={16} />
                          </RowActionButton>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">
            Note :{' '}
            <span className="font-medium text-primary">Drag row</span> to
            change order/rank.
          </p>
        </>
      ) : null}

      {subTab === 'category' ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-line bg-card">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-sm font-semibold text-ink">
                <tr>
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all categories"
                      className="cursor-pointer accent-primary"
                    />
                  </th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Online Display Name</th>
                  <th className="px-3 py-3">Rank</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Modified</th>
                  <th className="px-3 py-3">Image</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((row) => {
                  const checked = selected.has(row.id)
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-line last:border-b-0 hover:bg-page/80"
                    >
                      <td className="px-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOne(row.id)}
                          aria-label={`Select ${row.name}`}
                          className="cursor-pointer accent-primary"
                        />
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-semibold text-ink">{row.name}</p>
                        {row.parentCategory ? (
                          <p className="mt-0.5 text-xs text-primary">
                            [Parent Category : {row.parentCategory}]
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3.5 text-ink">
                        {row.onlineDisplayName}
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-ink">
                        {row.rank}
                      </td>
                      <td className="px-3 py-3.5 font-medium text-success">
                        {row.status}
                      </td>
                      <td className="px-3 py-3.5 text-muted">{row.created}</td>
                      <td className="px-3 py-3.5 text-muted">{row.modified}</td>
                      <td className="px-3 py-3.5">
                        <button
                          type="button"
                          aria-label={`Upload image for ${row.name}`}
                          className="cursor-pointer rounded p-1.5 text-muted hover:bg-page hover:text-ink"
                        >
                          <Upload size={16} />
                        </button>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1">
                          <RowActionButton
                            label="Edit"
                            onClick={() =>
                              navigate(`/menu/categories/${row.id}/edit`)
                            }
                          >
                            <Pencil size={16} />
                          </RowActionButton>
                          <RowActionButton
                            label="Show Changes"
                            onClick={() => setChangesName(row.name)}
                          >
                            <ClipboardList size={16} />
                          </RowActionButton>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">
            Showing 1 to {categoryRows.length} of {categoryRows.length} records
          </p>
        </>
      ) : null}

      <ShowChangesModal
        open={Boolean(changesName)}
        name={changesName}
        onClose={() => setChangesName(null)}
      />
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}
    </MenuPageShell>
  )
}
