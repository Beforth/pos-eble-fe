import { useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileCog, FileText, Info, Pencil, Plus, X } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { WastageSettingsDrawer } from '../../components/inventory/WastageSettingsDrawer'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import {
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_WASTAGE_WRITE_PERMISSION,
  deleteWastageApi,
  listAllWastageApi,
  listCategoriesApi,
  type InventoryCategory,
  type Wastage,
} from '../../services/inventoryService'

const VIEW_OPTIONS = ['Date wise', 'Category wise'] as const
const STATUS_OPTIONS = [
  'All',
  'Saved',
  'Cancelled',
  'Pending For Approval',
] as const

function statusToApi(value: string): string | undefined {
  if (value === 'All') return undefined
  if (value === 'Pending For Approval') return 'pending_for_approval'
  return value.toLowerCase()
}

function ExportMenu({
  onExportPage,
  onExportAll,
}: {
  onExportPage?: () => void
  onExportAll?: () => void
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
      >
        <FileText size={15} className="text-muted" />
        Export
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open ? (
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[180px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onExportPage?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export Current Page
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onExportAll?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export All
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

type ListRow = {
  id: string
  date: string
  kind: string
  amount: string
  status: string
}

function toRow(row: Wastage): ListRow {
  return {
    id: row.id,
    date: row.wastage_date,
    kind: row.wastage_for === 'item' ? 'Item' : 'Raw Material',
    amount: row.total_amount,
    status: row.status.replaceAll('_', ' '),
  }
}

export default function Wastage() {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_WASTAGE_WRITE_PERMISSION)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [status, setStatus] = useState<string>('All')
  const [category, setCategory] = useState<string>('All')
  const [view, setView] = useState<string>('Date wise')
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [applied, setApplied] = useState({
    startDate: '',
    endDate: '',
    status: 'All',
    category: 'All',
  })
  const [rows, setRows] = useState<ListRow[]>([])
  const [loading, setLoading] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ListRow | null>(null)

  const categoryOptions = ['All', ...categories.map((row) => row.name)]

  useEffect(() => {
    void listCategoriesApi()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!encryptedOutletId) {
      setRows([])
      return
    }
    let cancelled = false
    setLoading(true)
    const categoryId =
      applied.category === 'All'
        ? undefined
        : categories.find((row) => row.name === applied.category)?.id
    listAllWastageApi(encryptedOutletId, {
      dateFrom: applied.startDate || undefined,
      dateTo: applied.endDate || undefined,
      status: statusToApi(applied.status),
      categoryId,
    })
      .then((items) => {
        if (!cancelled) setRows(items.map(toRow))
      })
      .catch((err) => {
        if (!cancelled) {
          showToast(
            err instanceof ApiError ? err.message : 'Unable to load wastage',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, applied, categories])

  async function confirmDelete() {
    if (!pendingDelete || !encryptedOutletId) return
    try {
      await deleteWastageApi(encryptedOutletId, pendingDelete.id)
      setRows((prev) => prev.filter((row) => row.id !== pendingDelete.id))
      showToast('Deleted')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to delete')
    }
  }

  return (
    <InventoryPageShell activeItem="wastage">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Wastage List</h1>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <PrimaryButton onClick={() => navigate('/inventory/wastage/new')}>
              <Plus size={15} />
              Create New
            </PrimaryButton>
          ) : null}
          <ExportMenu
            onExportPage={() => {
              downloadCsv(
                ['date', 'wastage_for', 'amount', 'status'],
                rows.map((row) => [row.date, row.kind, row.amount, row.status]),
                'wastage-page.csv',
              )
              showToast('Exported current page')
            }}
            onExportAll={() => {
              downloadCsv(
                ['date', 'wastage_for', 'amount', 'status'],
                rows.map((row) => [row.date, row.kind, row.amount, row.status]),
                'wastage-all.csv',
              )
              showToast('Exported all')
            }}
          />
          <button
            type="button"
            aria-label="Wastage settings"
            title="Wastage settings"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink"
          >
            <FileCog size={16} />
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-9 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="h-9 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[180px]">
          <SearchableSelect
            label="Status"
            value={status}
            options={[...STATUS_OPTIONS]}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setStatus}
          />
        </div>
        <div className="min-w-[220px]">
          <SearchableSelect
            label="Category"
            value={category}
            options={categoryOptions}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setCategory}
          />
        </div>
        <div className="min-w-[160px]">
          <SearchableSelect
            label={
              <>
                View
                <span title="Choose how wastage records are grouped in the list">
                  <Info size={13} className="text-muted" />
                </span>
              </>
            }
            value={view}
            options={[...VIEW_OPTIONS]}
            placeholder="Select view"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setView}
          />
        </div>
        <OutlineButton
          onClick={() =>
            setApplied({
              startDate,
              endDate,
              status,
              category,
            })
          }
        >
          Search
        </OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setStatus('All')
            setCategory('All')
            setView('Date wise')
            setStartDate('')
            setEndDate('')
            setApplied({
              startDate: '',
              endDate: '',
              status: 'All',
              category: 'All',
            })
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
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Wastage for</th>
                <th className="px-3 py-2.5">Amount</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-16 text-center">
                    <span className="relative mb-4 inline-flex text-muted">
                      <FileText
                        size={56}
                        strokeWidth={1.25}
                        className="text-muted/50"
                      />
                    </span>
                    <p className="text-base font-semibold text-ink">
                      {loading ? 'Loading…' : 'No Record Found'}
                    </p>
                    {!loading ? (
                      <p className="mt-1 text-sm text-muted">
                        We could not find what you searched for. Try searching
                        again.
                      </p>
                    ) : null}
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-line last:border-b-0 ${
                      index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                    }`}
                  >
                    <td className="px-3 py-2.5 text-ink">{row.date}</td>
                    <td className="px-3 py-2.5 text-ink">{row.kind}</td>
                    <td className="px-3 py-2.5 text-ink">{row.amount}</td>
                    <td className="px-3 py-2.5 capitalize text-ink">
                      {row.status}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {canWrite ? (
                          <RowActionButton
                            boxed
                            label="Edit"
                            onClick={() =>
                              navigate(`/inventory/wastage/${row.id}/edit`)
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
      </div>

      <WastageSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Confirm Delete"
        message="Are you sure you want to delete this wastage record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </InventoryPageShell>
  )
}
