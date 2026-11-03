import { useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate } from '../../utils/inventoryRouter'
import { ChevronDown, FileText, Pencil, Plus, Search } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { PaginationControls } from '../../components/common/PaginationControls'
import { downloadCsv } from '../../utils/downloadFile'
import { parseCsvLine } from '../../components/inventory/stockCountShared'
import { ApiError } from '../../services/apiClient'
import {
  INV_SUPPLIER_WRITE_PERMISSION,
  createSupplierApi,
  deleteSupplierApi,
  listSuppliersApi,
  updateSupplierApi,
  type Supplier,
} from '../../services/inventoryService'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import { SelectRecordAlert } from '../../components/menu/SelectRecordAlert'
import {
  ActionDropdown,
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

type SupplierRow = Supplier

const CSV_HEADERS = [
  'name',
  'company',
  'email',
  'phone',
  'gst_no',
  'type',
  'state',
  'city',
  'pin_code',
]

const SUPPLIER_TYPES = ['both', 'purchase', 'sale']

function FilesMenu({
  onTemplate,
  onUpload,
  onExportPage,
  onExportAll,
  canWrite,
}: {
  onTemplate: () => void
  onUpload: (file: File) => void
  onExportPage: () => void
  onExportAll: () => void
  canWrite: boolean
}) {
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

  function item(label: string, onClick: () => void) {
    return (
      <li key={label}>
        <button
          type="button"
          onClick={() => {
            onClick()
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
          if (file) onUpload(file)
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
          {canWrite ? (
            <>
              <p className="px-3 py-1.5 text-sm font-bold text-ink">Import</p>
              <ul>
                {item('Download', onTemplate)}
                {item('Upload', () => fileInputRef.current?.click())}
              </ul>
            </>
          ) : null}
          <p className="mt-1 px-3 py-1.5 text-sm font-bold text-ink">Export</p>
          <ul>
            {item('Export Current Page', onExportPage)}
            {item('Export All', onExportAll)}
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
  const [rows, setRows] = useState<SupplierRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [nameInput, setNameInput] = useState('')
  const [companyInput, setCompanyInput] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [appliedCompany, setAppliedCompany] = useState('')
  const [selectAlertOpen, setSelectAlertOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)

  async function loadSuppliers() {
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
    void loadSuppliers()
  }, [])

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSearch() {
    setAppliedName(nameInput.trim())
    setAppliedCompany(companyInput.trim())
  }

  function handleClear() {
    setNameInput('')
    setCompanyInput('')
    setAppliedName('')
    setAppliedCompany('')
  }

  const filteredRows = rows.filter((row) => {
    const nameOk =
      !appliedName ||
      row.name.toLowerCase().includes(appliedName.toLowerCase())
    const companyOk =
      !appliedCompany ||
      row.company.toLowerCase().includes(appliedCompany.toLowerCase())
    return nameOk && companyOk
  })

  const allSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selectedIds.has(row.id))

  function toggleSelectAll() {
    setSelectedIds(
      allSelected ? new Set() : new Set(filteredRows.map((row) => row.id)),
    )
  }

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const activePage = Math.min(page, totalPages)
  const pageRows = filteredRows.slice(
    (activePage - 1) * pageSize,
    activePage * pageSize,
  )

  function exportRows(list: SupplierRow[], filename: string) {
    if (list.length === 0) {
      showToast('No suppliers to export')
      return
    }
    downloadCsv(
      CSV_HEADERS,
      list.map((row) =>
        CSV_HEADERS.map((key) => String(row[key as keyof Supplier] ?? '')),
      ),
      filename,
    )
  }

  async function importFile(file: File) {
    const lines = (await file.text())
      .replace(/^﻿/, '')
      .split(/\r?\n/)
      .filter((line) => line.trim())
    if (lines.length < 2) {
      showToast('The file has no supplier rows')
      return
    }
    const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
    if (!header.includes('name') || !header.includes('company')) {
      showToast('The file needs "name" and "company" columns')
      return
    }
    let created = 0
    const problems: string[] = []
    for (const [index, line] of lines.slice(1).entries()) {
      const cells = parseCsvLine(line)
      const get = (key: string) => (cells[header.indexOf(key)] ?? '').trim()
      const type = get('type').toLowerCase() || 'both'
      if (!get('name') || !get('company')) {
        problems.push(`Row ${index + 2}: name and company are required`)
        continue
      }
      if (!SUPPLIER_TYPES.includes(type)) {
        problems.push(`Row ${index + 2}: type must be both, purchase or sale`)
        continue
      }
      try {
        await createSupplierApi({
          name: get('name'),
          company: get('company'),
          email: get('email'),
          phone: get('phone'),
          gst_no: get('gst_no'),
          state: get('state'),
          city: get('city'),
          pin_code: get('pin_code'),
          type,
        })
        created += 1
      } catch (err) {
        problems.push(
          `Row ${index + 2}: ${err instanceof ApiError ? err.message : 'failed'}`,
        )
      }
    }
    await loadSuppliers()
    showToast(
      problems.length
        ? `${created} imported, ${problems.length} skipped. ${problems[0]}`
        : `${created} supplier(s) imported`,
    )
  }

  function requireSelection(action: () => void) {
    if (selectedIds.size === 0) {
      setSelectAlertOpen(true)
      return
    }
    action()
  }

  function applyBulk(active: boolean, message: string) {
    requireSelection(() => {
      void (async () => {
        const results = await Promise.allSettled(
          [...selectedIds].map((id) =>
            updateSupplierApi(id, { is_active: active }),
          ),
        )
        const failed = results.filter((r) => r.status === 'rejected').length
        await loadSuppliers()
        showToast(
          failed ? `${failed} supplier(s) could not be updated` : message,
        )
      })()
    })
  }

  function requestDeleteSelected() {
    requireSelection(() => setPendingDelete(true))
  }

  async function confirmDeleteSelected() {
    const results = await Promise.allSettled(
      [...selectedIds].map((id) => deleteSupplierApi(id)),
    )
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    )
    setSelectedIds(new Set())
    await loadSuppliers()
    if (rejected.length === 0) {
      showToast('Selected suppliers deleted')
      return
    }
    const reason = rejected[0].reason
    showToast(
      reason instanceof ApiError
        ? `${rejected.length} not deleted: ${reason.message}`
        : `${rejected.length} supplier(s) could not be deleted`,
    )
  }

  return (
    <InventoryPageShell activeItem="suppliers-third-party">

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          Supplier/Third Party Management
        </h1>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton onClick={() => navigate('/inventory/suppliers/new')}>
            <Plus size={15} />
            Create New
          </PrimaryButton>
          <ActionDropdown
            options={[
              {
                label: 'Active',
                onClick: () => applyBulk(true, 'Marked as active'),
              },
              {
                label: 'Inactive',
                onClick: () => applyBulk(false, 'Marked as inactive'),
              },
              {
                label: 'Delete',
                onClick: requestDeleteSelected,
              },
            ]}
          />
          <FilesMenu
            canWrite={canWrite}
            onTemplate={() =>
              downloadCsv(
                CSV_HEADERS,
                [
                  [
                    'Ramesh Patel',
                    'Patel Traders',
                    'ramesh@example.com',
                    '9825000000',
                    '',
                    'both',
                    'Gujarat',
                    'Surat',
                    '395001',
                  ],
                ],
                'suppliers-import-template.csv',
              )
            }
            onUpload={(file) => void importFile(file)}
            onExportPage={() => exportRows(pageRows, 'suppliers-page.csv')}
            onExportAll={() => exportRows(filteredRows, 'suppliers.csv')}
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
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-ink">
              <tr>
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                    className="size-4 accent-primary"
                  />
                </th>
                <th className="px-3 py-2.5">Name</th>
                <th className="px-3 py-2.5">Company</th>
                <th className="px-3 py-2.5">Phone</th>
                <th className="px-3 py-2.5">Email</th>
                <th className="px-3 py-2.5">Type</th>
                <th className="px-3 py-2.5 text-center">Active</th>
                <th className="px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-16 text-center">
                    {loading ? (
                      <span className="text-sm text-muted">
                        Loading suppliers…
                      </span>
                    ) : (
                      <span className="flex flex-col items-center">
                        <span className="relative mb-4 text-muted">
                          <FileText
                            size={56}
                            strokeWidth={1.25}
                            className="text-muted/50"
                          />
                          <Search
                            size={24}
                            className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
                          />
                        </span>
                        <span className="text-base font-semibold text-ink">
                          Supplier/Third Party Management Record Not Found
                        </span>
                      </span>
                    )}
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
                    <td className="px-3 py-2 font-medium text-ink">
                      {row.name}
                    </td>
                    <td className="px-3 py-2">{row.company}</td>
                    <td className="px-3 py-2">{row.phone || '-'}</td>
                    <td className="px-3 py-2">{row.email || '-'}</td>
                    <td className="px-3 py-2 capitalize">{row.type}</td>
                    <td className="px-3 py-2 text-center">
                      {row.is_active ? 'Yes' : 'No'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {canWrite ? (
                        <button
                          type="button"
                          aria-label={`Edit ${row.name}`}
                          title="Edit"
                          onClick={() =>
                            navigate(`/inventory/suppliers/${row.id}/edit`)
                          }
                          className="inline-flex size-8 items-center justify-center rounded-md border border-line text-ink hover:bg-page"
                        >
                          <Pencil size={15} strokeWidth={1.75} />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          totalRecords={filteredRows.length}
          currentPage={activePage}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <SelectRecordAlert
        open={selectAlertOpen}
        onClose={() => setSelectAlertOpen(false)}
      />
      <ConfirmDeleteModal
        open={pendingDelete}
        title="Delete suppliers"
        target={`${selectedIds.size} selected`}
        message={`${selectedIds.size} selected supplier${selectedIds.size === 1 ? '' : 's'} will be removed.`}
        consequences={[
          'They stop appearing when you raise purchases for raw materials.',
        ]}
        confirmLabel="Delete"
        onConfirm={confirmDeleteSelected}
        onClose={() => setPendingDelete(false)}
      />
    </InventoryPageShell>
  )
}
