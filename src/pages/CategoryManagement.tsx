import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { showToast } from '../utils/toast'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ChevronDown,
  ClipboardList,
  FileSpreadsheet,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { MenuSectionNav } from '../components/menu/MenuSectionNav'
import { NoRecordFound } from '../components/menu/NoRecordFound'
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal'
import { ShowChangesModal } from '../components/menu/ShowChangesModal'
import { AddTagDrawer } from '../components/menu/AddTagDrawer'
import { RowActionButton } from '../components/menu/MenuActionButtons'
import { useAuth } from '../auth/AuthContext'
import { listParentCategoriesApi, deleteParentCategoryApi, listMenuGroupsApi, deleteMenuGroupApi } from '../services/menuService'
import type { Category, MenuGroup, ParentCategory } from '../types/menu'
import { useMenuReference } from '../state/MenuReferenceContext'

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

function SolidButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-semibold text-white hover:brightness-95"
    >
      {children}
    </button>
  )
}

function formatCreated(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
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
  const [deleteTarget, setDeleteTarget] = useState<ParentCategory | null>(null)
  const [groupDeleteTarget, setGroupDeleteTarget] = useState<MenuGroup | null>(null)
  const [addTagOpen, setAddTagOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionMenu, setActionMenu] = useState<'export' | 'action' | null>(null)
  const { encryptedOutletId } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [parents, setParents] = useState<ParentCategory[]>([])
  const [groups, setGroups] = useState<MenuGroup[]>([])

  const { categories: refCategories, reload } = useMenuReference(['categories'])

  useEffect(() => {
    if (encryptedOutletId) void reload('categories', { force: true })
  }, [encryptedOutletId, reload])

  useEffect(() => {
    setCategories(refCategories)
  }, [refCategories])

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) return
    if (subTab !== 'parent') return
    listParentCategoriesApi(encryptedOutletId, {
      search: appliedQuery || undefined,
    })
      .then((rows) => {
        if (!cancelled) setParents(rows)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error
              ? error.message
              : 'Failed to load parent categories',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, subTab, appliedQuery])

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) return
    if (subTab !== 'grouping') return
    listMenuGroupsApi(encryptedOutletId, {
      search: appliedQuery || undefined,
    })
      .then((rows) => {
        if (!cancelled) setGroups(rows)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            error instanceof Error ? error.message : 'Failed to load groups',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, subTab, appliedQuery])

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
    if (!q) return categories
    return categories.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.online_display_name.toLowerCase().includes(q) ||
        (row.parent_name?.toLowerCase().includes(q) ?? false),
    )
  }, [categories, appliedQuery])

  const parentRows = parents
  const groupRows = groups

  const showEmpty =
    (subTab === 'grouping' && groupRows.length === 0) ||
    subTab === 'menu-config' ||
    subTab === 'tags'

  const listForSelect =
    subTab === 'parent'
      ? parentRows
      : subTab === 'category'
        ? categoryRows
        : subTab === 'grouping'
          ? groupRows
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
    if (subTab === 'parent') {
      return (
        <>
          <SolidButton onClick={() => showToast('Copy parent category to another outlet is not available yet.')}>
            Copy Parent Category To Outlet
          </SolidButton>
          <SolidButton onClick={() => navigate('/menu/categories/parent/new')}>
            Add Parent Category
          </SolidButton>
          <div className="relative">
            <OutlineButton
              variant="gray"
              onClick={() =>
                setActionMenu((current) => (current === 'export' ? null : 'export'))
              }
            >
              <FileSpreadsheet size={15} className="text-success" />
              Export Excel
              <ChevronDown size={14} className="text-muted" />
            </OutlineButton>
            {actionMenu === 'export' ? (
              <div className="absolute right-0 z-20 mt-1 min-w-40 rounded-md border border-line bg-card py-1 shadow-md">
                <button
                  type="button"
                  className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-ink hover:bg-page"
                  onClick={() => {
                    setActionMenu(null)
                    showToast('Excel export is not available yet.')
                  }}
                >
                  Export Excel
                </button>
              </div>
            ) : null}
          </div>
          <div className="relative">
            <OutlineButton
              variant="gray"
              onClick={() =>
                setActionMenu((current) => (current === 'action' ? null : 'action'))
              }
            >
              Action
              <ChevronDown size={14} className="text-muted" />
            </OutlineButton>
            {actionMenu === 'action' ? (
              <div className="absolute right-0 z-20 mt-1 min-w-44 rounded-md border border-line bg-card py-1 shadow-md">
                <button
                  type="button"
                  className="block w-full cursor-pointer px-3 py-2 text-left text-sm text-ink hover:bg-page"
                  onClick={() => {
                    setActionMenu(null)
                    showToast('Bulk actions are not available yet.')
                  }}
                >
                  Bulk action
                </button>
              </div>
            ) : null}
          </div>
        </>
      )
    }

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
          onClick={() => navigate('/menu/categories/group/new')}
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
            onClick={() => setAddTagOpen(true)}
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
            {subTab === 'parent' ? 'Show All' : 'Clear Filter'}
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
                  const childNames =
                    (row.categories ?? [])
                      .map((category) => category.name)
                      .join(', ') ||
                    categories
                      .filter((category) => category.parent_id === row.id)
                      .map((category) => category.name)
                      .join(', ')
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
                      <td className="px-3 py-3.5 font-medium text-ink">
                        {row.name}
                      </td>
                      <td className="px-3 py-3.5 text-ink">
                        {row.online_display_name || row.name}
                      </td>
                      <td className="max-w-md px-3 py-3.5 text-ink">
                        {childNames || '—'}
                      </td>
                      <td className="px-3 py-3.5 font-medium text-success">
                        {row.is_active ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-3 py-3.5 text-muted">
                        {formatCreated(row.created_at)}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1">
                          <RowActionButton
                            label="Edit"
                            boxed
                            onClick={() =>
                              navigate(`/menu/categories/parent/${row.id}/edit`)
                            }
                          >
                            <Pencil size={16} />
                          </RowActionButton>
                          <RowActionButton
                            label="Delete"
                            boxed
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 size={16} />
                          </RowActionButton>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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
                        {row.parent_name ? (
                          <p className="mt-0.5 text-xs text-primary">
                            [Parent Category : {row.parent_name}]
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3.5 text-ink">
                        {row.online_display_name}
                      </td>
                      <td className="px-3 py-3.5 tabular-nums text-ink">
                        {row.rank}
                      </td>
                      <td className="px-3 py-3.5 font-medium text-success">
                        {row.is_active ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-3 py-3.5 text-muted">—</td>
                      <td className="px-3 py-3.5 text-muted">—</td>
                      <td className="px-3 py-3.5">
                        <button
                          type="button"
                          aria-label={`Upload image for ${row.name}`}
                          data-tooltip={`Upload image for ${row.name}`}
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

      {subTab === 'grouping' && groupRows.length > 0 ? (
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
                      aria-label="Select all groups"
                      className="cursor-pointer accent-primary"
                    />
                  </th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">SAC Code</th>
                  <th className="px-3 py-3">Parent Category</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Created</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupRows.map((row) => {
                  const checked = selected.has(row.id)
                  const childNames =
                    (row.categories ?? []).map((c) => c.name).join(', ') || '—'
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
                      <td className="px-3 py-3.5 font-medium text-ink">
                        {row.name}
                      </td>
                      <td className="px-3 py-3.5 text-ink">
                        {row.sac_code || '—'}
                      </td>
                      <td className="px-3 py-3.5 text-ink">
                        {row.parent_name || '—'}
                      </td>
                      <td className="max-w-md px-3 py-3.5 text-ink">
                        {childNames}
                      </td>
                      <td className="px-3 py-3.5 font-medium text-success">
                        {row.is_active ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-3 py-3.5 text-muted">
                        {formatCreated(row.created_at)}
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1">
                          <RowActionButton
                            label="Delete"
                            boxed
                            onClick={() => setGroupDeleteTarget(row)}
                          >
                            <Trash2 size={16} />
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
            Showing 1 to {groupRows.length} of {groupRows.length} records
          </p>
        </>
      ) : null}

      <ShowChangesModal
        open={Boolean(changesName)}
        name={changesName}
        onClose={() => setChangesName(null)}
      />
      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        title="Delete parent category"
        target={deleteTarget?.name}
        message="Categories under it will be unlinked."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        onConfirm={() => {
          if (!deleteTarget || !encryptedOutletId || deleting) return
          const target = deleteTarget
          setDeleting(true)
          deleteParentCategoryApi(encryptedOutletId, target.id)
            .then(() => {
              setParents((prev) => prev.filter((row) => row.id !== target.id))
              setSelected((prev) => {
                const next = new Set(prev)
                next.delete(target.id)
                return next
              })
              showToast('Parent category deleted')
              setDeleteTarget(null)
            })
            .catch((error: unknown) => {
              showToast(
                error instanceof Error
                  ? error.message
                  : 'Failed to delete parent category',
              )
            })
            .finally(() => setDeleting(false))
        }}
      />
      <ConfirmDeleteModal
        open={Boolean(groupDeleteTarget)}
        title="Delete group"
        target={groupDeleteTarget?.name}
        message="The group stops appearing in grouping."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        onClose={() => {
          if (!deleting) setGroupDeleteTarget(null)
        }}
        onConfirm={() => {
          if (!groupDeleteTarget || !encryptedOutletId || deleting) return
          const target = groupDeleteTarget
          setDeleting(true)
          deleteMenuGroupApi(encryptedOutletId, target.id)
            .then(() => {
              setGroups((prev) => prev.filter((row) => row.id !== target.id))
              setSelected((prev) => {
                const next = new Set(prev)
                next.delete(target.id)
                return next
              })
              showToast('Group deleted')
              setGroupDeleteTarget(null)
            })
            .catch((error: unknown) => {
              showToast(
                error instanceof Error
                  ? error.message
                  : 'Failed to delete group',
              )
            })
            .finally(() => setDeleting(false))
        }}
      />
      <AddTagDrawer
        open={addTagOpen}
        onClose={() => setAddTagOpen(false)}
      />
    </MenuPageShell>
  )
}
