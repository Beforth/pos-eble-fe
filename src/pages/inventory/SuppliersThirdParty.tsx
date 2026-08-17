import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, Plus, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import { SelectRecordAlert } from '../../components/menu/SelectRecordAlert'
import {
  ActionDropdown,
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

interface SupplierRow {
  id: string
  name: string
  company: string
  active: boolean
}

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
  const [rows, setRows] = useState<SupplierRow[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [nameInput, setNameInput] = useState('')
  const [companyInput, setCompanyInput] = useState('')
  const [appliedName, setAppliedName] = useState('')
  const [appliedCompany, setAppliedCompany] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [selectAlertOpen, setSelectAlertOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2400)
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

  function requireSelection(action: () => void) {
    if (selectedIds.size === 0) {
      setSelectAlertOpen(true)
      return
    }
    action()
  }

  function applyBulk(active: boolean, message: string) {
    requireSelection(() => {
      setRows((prev) =>
        prev.map((row) =>
          selectedIds.has(row.id) ? { ...row, active } : row,
        ),
      )
      showToast(message)
    })
  }

  function requestDeleteSelected() {
    requireSelection(() => setPendingDelete(true))
  }

  function confirmDeleteSelected() {
    setRows((prev) => prev.filter((row) => !selectedIds.has(row.id)))
    setSelectedIds(new Set())
    showToast('Selected suppliers deleted')
  }

  return (
    <InventoryPageShell activeItem="suppliers-third-party">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

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

      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
        {filteredRows.length === 0 ? (
          <>
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
            <p className="text-base font-semibold text-ink">
              Supplier/Third Party Management Record Not Found
            </p>
          </>
        ) : null}
      </div>

      <SelectRecordAlert
        open={selectAlertOpen}
        onClose={() => setSelectAlertOpen(false)}
      />
      <ConfirmDeleteModal
        open={pendingDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete ${selectedIds.size} selected supplier${selectedIds.size === 1 ? '' : 's'}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDeleteSelected}
        onClose={() => setPendingDelete(false)}
      />
    </InventoryPageShell>
  )
}
