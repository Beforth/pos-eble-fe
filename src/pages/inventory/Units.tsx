import { useEffect, useId, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { FileText, Pencil, Plus, X } from 'lucide-react'
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
  deleteUnitApi,
  formatInventoryStamp,
  type InventoryUnit,
} from '../../services/inventoryService'

const PAGE_SIZE = 10

function UnitNameModal({
  open,
  unit,
  onClose,
}: {
  open: boolean
  unit: InventoryUnit | null
  onClose: () => void
}) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
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

  if (!open || !unit) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-sm overflow-hidden rounded-lg border border-line bg-card shadow-xl [background-color:var(--color-card)]"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            Unit Name
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded p-1 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="px-4 py-5">
          <p className="text-sm text-ink">
            Name : <span className="font-medium">{unit.name}</span>
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default function Units() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canWrite = hasPermission(INV_WRITE_PERMISSION)
  const { units, status, error, loadMasters, removeUnit } = useInventoryMasters()
  const [nameInput, setNameInput] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [page, setPage] = useState(1)
  const [viewUnit, setViewUnit] = useState<InventoryUnit | null>(null)
  const [pendingDelete, setPendingDelete] = useState<InventoryUnit | null>(null)

  useEffect(() => {
    void loadMasters({ force: true })
  }, [loadMasters])

  const filteredRows = useMemo(() => {
    const q = appliedName.trim().toLowerCase()
    if (!q) return units
    return units.filter((row) => row.name.toLowerCase().includes(q))
  }, [units, appliedName])

  const { sortKey, sortDir, toggleSort, visible } = useListQuery(
    filteredRows,
    (row) => [row.name, row.created_at, row.updated_at],
    (row, key) => {
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

  function handleSearch() {
    setAppliedName(nameInput.trim())
    setPage(1)
  }

  function handleClear() {
    setNameInput('')
    setAppliedName('')
    setPage(1)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    try {
      await deleteUnitApi(pendingDelete.id)
      removeUnit(pendingDelete.id)
      showToast('Unit deleted')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to delete unit')
    }
  }

  return (
    <InventoryPageShell activeItem="units">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Unit Management</h1>
        {canWrite ? (
          <PrimaryButton onClick={() => navigate('/inventory/units/new')}>
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
              if (event.key === 'Enter') handleSearch()
            }}
            className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <OutlineButton onClick={handleSearch}>Search</OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
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
                    colSpan={4}
                    className="px-3 py-16 text-center text-sm font-semibold text-ink"
                  >
                    {status === 'loading'
                      ? 'Loading units…'
                      : 'Unit Management Record Not Found'}
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
                      {formatInventoryStamp(row.created_at)}
                    </td>
                    <td className="px-3 py-2.5 text-ink">
                      {formatInventoryStamp(row.updated_at)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <RowActionButton
                          boxed
                          label="View"
                          onClick={() => setViewUnit(row)}
                        >
                          <FileText size={15} strokeWidth={1.75} />
                        </RowActionButton>
                        {canWrite ? (
                          <RowActionButton
                            boxed
                            label="Edit"
                            onClick={() =>
                              navigate(`/inventory/units/${row.id}/edit`)
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
                            <X size={15} strokeWidth={1.75} />
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
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 8)
              .map((n) => (
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

      <UnitNameModal
        open={Boolean(viewUnit)}
        unit={viewUnit}
        onClose={() => setViewUnit(null)}
      />
      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${pendingDelete?.name ?? 'this unit'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </InventoryPageShell>
  )
}
