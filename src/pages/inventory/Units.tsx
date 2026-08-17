import { useEffect, useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { FileText, Pencil, Plus, X } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import {
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../../components/menu/MenuActionButtons'
import { UNITS, type UnitRow } from '../../mocks/unitsData'

const PAGE_SIZE = 10

function UnitNameModal({
  open,
  unit,
  onClose,
}: {
  open: boolean
  unit: UnitRow | null
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
  const [rows, setRows] = useState<UnitRow[]>(() => [...UNITS])
  const [nameInput, setNameInput] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<string | null>(null)
  const [viewUnit, setViewUnit] = useState<UnitRow | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UnitRow | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
  }

  const filteredRows = useMemo(() => {
    const q = appliedName.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => row.name.toLowerCase().includes(q))
  }, [rows, appliedName])

  const totalRecords = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filteredRows.slice(
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

  function confirmDelete() {
    if (!pendingDelete) return
    setRows((prev) => prev.filter((row) => row.id !== pendingDelete.id))
    showToast('Unit deleted')
  }

  return (
    <InventoryPageShell activeItem="units">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Unit Management</h1>
        <PrimaryButton onClick={() => navigate('/inventory/units/new')}>
          <Plus size={15} />
          Create New
        </PrimaryButton>
      </div>

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
                <th className="px-3 py-2.5">Name</th>
                <th className="px-3 py-2.5">Created</th>
                <th className="px-3 py-2.5">Modified</th>
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
                    Unit Management Record Not Found
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
                    <td className="px-3 py-2.5 text-ink">{row.created}</td>
                    <td className="px-3 py-2.5 text-ink">{row.modified}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <RowActionButton
                          boxed
                          label="View"
                          onClick={() => setViewUnit(row)}
                        >
                          <FileText size={15} strokeWidth={1.75} />
                        </RowActionButton>
                        <RowActionButton
                          boxed
                          label="Edit"
                          onClick={() =>
                            navigate(`/inventory/units/${row.id}/edit`, {
                              state: { row },
                            })
                          }
                        >
                          <Pencil size={15} strokeWidth={1.75} />
                        </RowActionButton>
                        {row.canDelete ? (
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
        onConfirm={confirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </InventoryPageShell>
  )
}
