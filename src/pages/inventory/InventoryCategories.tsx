import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import {
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_WRITE_PERMISSION,
  deleteCategoryApi,
  formatInventoryStamp,
  type InventoryCategory,
} from '../../services/inventoryService'

const PAGE_SIZE = 10

export default function InventoryCategories() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canWrite = hasPermission(INV_WRITE_PERMISSION)
  const { categories, status, error, loadMasters, removeCategory } =
    useInventoryMasters()
  const [nameInput, setNameInput] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<InventoryCategory | null>(
    null,
  )

  useEffect(() => {
    void loadMasters({ force: true })
  }, [loadMasters])

  const filteredRows = useMemo(() => {
    const q = appliedName.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((row) => row.name.toLowerCase().includes(q))
  }, [categories, appliedName])

  const { sortKey, sortDir, toggleSort, visible } = useListQuery(
    filteredRows,
    (row) => [row.name, row.parent_name, row.created_at, row.updated_at],
    (row, key) => {
      if (key === 'parent') return row.parent_name ?? ''
      if (key === 'created') return row.created_at
      if (key === 'modified') return row.updated_at
      return row.name
    },
  )

  const totalRecords = visible.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = visible.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteCategoryApi(pendingDelete.id)
      removeCategory(pendingDelete.id)
      showToast('Category deleted')
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to delete category',
      )
    }
  }

  return (
    <InventoryPageShell activeItem="categories">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Inventory Categories</h1>
        {canWrite ? (
          <PrimaryButton onClick={() => navigate('/inventory/categories/new')}>
            <Plus size={15} />
            Create New
          </PrimaryButton>
        ) : null}
      </div>

      {status === 'error' && error ? (
        <p className="mb-3 text-sm text-primary">{error}</p>
      ) : null}

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[220px] flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Name
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(event) => setNameInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setAppliedName(nameInput.trim())
                setPage(1)
              }
            }}
            className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <OutlineButton
          onClick={() => {
            setAppliedName(nameInput.trim())
            setPage(1)
          }}
        >
          Search
        </OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setNameInput('')
            setAppliedName('')
            setPage(1)
          }}
        >
          Clear
        </OutlineButton>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-ink">
              <tr>
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
                  columnKey="parent"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="px-3 py-2.5"
                >
                  Parent
                </SortableTh>
                <SortableTh
                  columnKey="created"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="px-3 py-2.5"
                >
                  Created
                </SortableTh>
                <SortableTh
                  columnKey="modified"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="px-3 py-2.5"
                >
                  Modified
                </SortableTh>
                <th className="px-3 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-16 text-center text-sm font-semibold text-ink"
                  >
                    {status === 'loading'
                      ? 'Loading categories…'
                      : 'Category Record Not Found'}
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
                    <td className="px-3 py-2.5 text-ink">{row.name}</td>
                    <td className="px-3 py-2.5 text-ink">
                      {row.parent_name || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-ink">
                      {formatInventoryStamp(row.created_at)}
                    </td>
                    <td className="px-3 py-2.5 text-ink">
                      {formatInventoryStamp(row.updated_at)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {canWrite ? (
                          <RowActionButton
                            boxed
                            label="Edit"
                            onClick={() =>
                              navigate(`/inventory/categories/${row.id}/edit`)
                            }
                          >
                            <Pencil size={15} strokeWidth={1.75} />
                          </RowActionButton>
                        ) : null}
                        {canWrite ? (
                          <RowActionButton
                            boxed
                            label="Delete"
                            onClick={() => setPendingDelete(row)}
                          >
                            <Trash2 size={15} strokeWidth={1.75} />
                          </RowActionButton>
                        ) : null}
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
        </div>
      </div>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${pendingDelete?.name ?? 'this category'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </InventoryPageShell>
  )
}
