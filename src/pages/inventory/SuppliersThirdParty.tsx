import { useEffect, useMemo, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
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
  INV_SUPPLIER_WRITE_PERMISSION,
  deleteSupplierApi,
  listSuppliersApi,
  updateSupplierApi,
  type Supplier,
} from '../../services/inventoryService'

const PAGE_SIZE = 10

function FilesMenu({ onAction }: { onAction: (label: string) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function item(label: string, onClick?: () => void) {
    return (
      <li key={label}>
        <button
          type="button"
          onClick={() => {
            if (onClick) onClick()
            else onAction(label)
            setOpen(false)
          }}
          className="w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-page"
        >
          {label}
        </button>
      </li>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onAction(`Uploaded: ${file.name}`)
          event.target.value = ''
        }}
      />
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
        <div className="absolute right-0 z-40 mt-1.5 min-w-[200px] overflow-hidden rounded-md border border-line bg-card py-1.5 shadow-lg [background-color:var(--color-card)]">
          <p className="px-3 py-1.5 text-sm font-bold text-ink">Import</p>
          <ul>
            {item('Download', () => onAction('Template downloaded'))}
            {item('Upload', () => fileInputRef.current?.click())}
          </ul>
          <p className="mt-1 px-3 py-1.5 text-sm font-bold text-ink">Export</p>
          <ul>
            {item('Export Current Page')}
            {item('Export All')}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default function SuppliersThirdParty() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canWrite = hasPermission(INV_SUPPLIER_WRITE_PERMISSION)
  const [rows, setRows] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [nameInput, setNameInput] = useState('')
  const [companyInput, setCompanyInput] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [appliedCompany, setAppliedCompany] = useState('')
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Supplier | null>(null)
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false)

  async function loadRows() {
    setLoading(true)
    try {
      setRows(await listSuppliersApi())
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to load suppliers',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRows()
  }, [])

  function handleSearch() {
    setAppliedName(nameInput.trim())
    setAppliedCompany(companyInput.trim())
    setPage(1)
  }

  function handleClear() {
    setNameInput('')
    setCompanyInput('')
    setAppliedName('')
    setAppliedCompany('')
    setPage(1)
  }

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const nameOk =
        !appliedName ||
        row.name.toLowerCase().includes(appliedName.toLowerCase())
      const companyOk =
        !appliedCompany ||
        row.company.toLowerCase().includes(appliedCompany.toLowerCase())
      return nameOk && companyOk
    })
  }, [rows, appliedName, appliedCompany])

  const { sortKey, sortDir, toggleSort, visible } = useListQuery(
    filteredRows,
    (row) => [row.name, row.company, row.is_active],
    (row, key) => {
      if (key === 'company') return row.company
      if (key === 'active') return row.is_active
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
  const pageIds = pageRows.map((row) => row.id)
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id))

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allPageSelected) pageIds.forEach((id) => next.delete(id))
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

  async function applyBulk(active: boolean, message: string) {
    if (selectedIds.size === 0) {
      showToast('Select at least one supplier')
      return
    }
    try {
      for (const id of selectedIds) {
        await updateSupplierApi(id, { is_active: active })
      }
      setRows((prev) =>
        prev.map((row) =>
          selectedIds.has(row.id) ? { ...row, is_active: active } : row,
        ),
      )
      showToast(message)
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to update suppliers',
      )
    }
  }

  async function confirmDelete() {
    if (pendingDelete) {
      try {
        await deleteSupplierApi(pendingDelete.id)
        setRows((prev) => prev.filter((row) => row.id !== pendingDelete.id))
        showToast('Supplier deleted')
      } catch (err) {
        showToast(
          err instanceof ApiError ? err.message : 'Unable to delete supplier',
        )
      }
      return
    }
    if (!pendingBulkDelete) return
    try {
      for (const id of selectedIds) {
        await deleteSupplierApi(id)
      }
      setRows((prev) => prev.filter((row) => !selectedIds.has(row.id)))
      setSelectedIds(new Set())
      showToast('Selected suppliers deleted')
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to delete suppliers',
      )
    }
  }

  return (
    <InventoryPageShell activeItem="suppliers">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          Supplier/Third Party Management
        </h1>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <PrimaryButton onClick={() => navigate('/inventory/suppliers/new')}>
              <Plus size={15} />
              Create New
            </PrimaryButton>
          ) : null}
          {canWrite ? (
            <ActionDropdown
              options={[
                {
                  label: 'Active',
                  onClick: () => void applyBulk(true, 'Marked as active'),
                },
                {
                  label: 'Inactive',
                  onClick: () => void applyBulk(false, 'Marked as inactive'),
                },
                {
                  label: 'Delete',
                  onClick: () => {
                    if (selectedIds.size === 0) {
                      showToast('Select at least one supplier')
                      return
                    }
                    setPendingBulkDelete(true)
                  },
                },
              ]}
            />
          ) : null}
          <FilesMenu
            onAction={(label) => {
              const headers = ['name', 'company', 'active']
              const toCsv = (list: Supplier[]) =>
                list.map((row) => [
                  row.name,
                  row.company,
                  row.is_active ? 'Yes' : 'No',
                ])
              if (label === 'Export Current Page') {
                downloadCsv(headers, toCsv(pageRows), 'suppliers-page.csv')
                showToast('Exported current page')
                return
              }
              if (label === 'Export All') {
                downloadCsv(headers, toCsv(visible), 'suppliers-all.csv')
                showToast('Exported all')
                return
              }
              if (label === 'Template downloaded') {
                downloadCsv(headers, [], 'suppliers-import-template.csv')
                showToast('Template downloaded')
                return
              }
              showToast(label)
            }}
          />
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
              if (event.key === 'Enter') handleSearch()
            }}
            className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Company
          </label>
          <input
            type="text"
            value={companyInput}
            onChange={(event) => setCompanyInput(event.target.value)}
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
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all on page"
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
                  columnKey="company"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  className="px-3 py-2.5"
                >
                  Company
                </SortableTh>
                <SortableTh
                  columnKey="active"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  align="center"
                  className="px-3 py-2.5"
                >
                  Active
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
                    {loading
                      ? 'Loading suppliers…'
                      : 'Supplier/Third Party Management Record Not Found'}
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
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleSelect(row.id)}
                        aria-label={`Select ${row.name}`}
                        className="size-4 accent-primary"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-ink">{row.name}</td>
                    <td className="px-3 py-2.5 text-ink">{row.company}</td>
                    <td className="px-3 py-2.5 text-center text-ink">
                      {row.is_active ? 'Yes' : 'No'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {canWrite ? (
                          <RowActionButton
                            boxed
                            label="Edit"
                            onClick={() =>
                              navigate(`/inventory/suppliers/${row.id}/edit`)
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
<<<<<<< HEAD
        open={Boolean(pendingDelete) || pendingBulkDelete}
        title="Confirm Delete"
        message={
          pendingDelete
            ? `Are you sure you want to delete "${pendingDelete.name}"? This action cannot be undone.`
            : `Are you sure you want to delete ${selectedIds.size} selected supplier${selectedIds.size === 1 ? '' : 's'}? This action cannot be undone.`
        }
=======
        open={pendingDelete}
        title="Delete suppliers"
        target={`${selectedIds.size} selected`}
        message={`${selectedIds.size} selected supplier${selectedIds.size === 1 ? '' : 's'} will be removed.`}
        consequences={[
          'They stop appearing when you raise purchases for raw materials.',
        ]}
>>>>>>> origin/main
        confirmLabel="Delete"
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          setPendingDelete(null)
          setPendingBulkDelete(false)
        }}
      />
    </InventoryPageShell>
  )
}
