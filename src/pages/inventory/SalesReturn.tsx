import { useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import {
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_SALES_WRITE_PERMISSION,
  deleteSalesReturnApi,
  listAllSalesReturnsApi,
  type SalesReturnDoc,
} from '../../services/inventoryService'

const FROM_OPTIONS = ['All', 'Restaurant', 'Supplier / Third Party'] as const

function fromToSource(value: string): string {
  if (value === 'Restaurant') return 'restaurant'
  if (value === 'Supplier / Third Party') return 'supplier'
  return 'all'
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
  counterparty: string
  number: string
  total: string
  paymentStatus: string
  updateStock: boolean
}

function toRow(row: SalesReturnDoc): ListRow {
  return {
    id: row.id,
    date: row.invoice_date,
    counterparty: row.supplier_name || row.restaurant_name || '—',
    number: row.credit_note_number || '—',
    total: row.grand_total,
    paymentStatus: row.payment_status,
    updateStock: row.update_inventory_stock,
  }
}

const EXPORT_HEADERS = ['date', 'party', 'number', 'total', 'payment_status']

function exportRows(rows: ListRow[]) {
  return rows.map((row) => [
    row.date,
    row.counterparty,
    row.number,
    row.total,
    row.paymentStatus,
  ])
}

export default function SalesReturn() {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_SALES_WRITE_PERMISSION)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [from, setFrom] = useState<string>('All')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [updateStockFilter, setUpdateStockFilter] = useState('all')
  const [applied, setApplied] = useState({
    startDate: '',
    endDate: '',
    from: 'All',
    invoiceNo: '',
    paymentStatus: 'all',
    updateStockFilter: 'all',
  })
  const [rows, setRows] = useState<ListRow[]>([])
  const [loading, setLoading] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ListRow | null>(null)

  useEffect(() => {
    if (!encryptedOutletId) {
      setRows([])
      return
    }
    let cancelled = false
    setLoading(true)
    listAllSalesReturnsApi(encryptedOutletId, {
      search: applied.invoiceNo || undefined,
      dateFrom: applied.startDate || undefined,
      dateTo: applied.endDate || undefined,
      sourceType: fromToSource(applied.from),
      paymentStatus: applied.paymentStatus,
      updateInventoryStock: applied.updateStockFilter,
    })
      .then((items) => {
        if (cancelled) return
        const filtered = items.map(toRow).filter((row) => {
          if (
            applied.paymentStatus !== 'all' &&
            row.paymentStatus !== applied.paymentStatus
          ) {
            return false
          }
          if (applied.updateStockFilter === 'yes' && !row.updateStock) {
            return false
          }
          if (applied.updateStockFilter === 'no' && row.updateStock) {
            return false
          }
          return true
        })
        setRows(filtered)
      })
      .catch((err) => {
        if (!cancelled) {
          showToast(
            err instanceof ApiError
              ? err.message
              : 'Unable to load sales returns',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, applied])

  async function confirmDelete() {
    if (!pendingDelete || !encryptedOutletId) return
    try {
      await deleteSalesReturnApi(encryptedOutletId, pendingDelete.id)
      setRows((prev) => prev.filter((row) => row.id !== pendingDelete.id))
      showToast('Deleted')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to delete')
    }
  }

  return (
    <InventoryPageShell activeItem="sales-return">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Sales Return List</h1>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <PrimaryButton
              onClick={() => navigate('/inventory/sales-return/new')}
            >
              <Plus size={15} />
              Create New
            </PrimaryButton>
          ) : null}
          <ExportMenu
            onExportPage={() => {
              downloadCsv(
                EXPORT_HEADERS,
                exportRows(rows),
                'sales-return-page.csv',
              )
              showToast('Exported current page')
            }}
            onExportAll={() => {
              downloadCsv(
                EXPORT_HEADERS,
                exportRows(rows),
                'sales-return-all.csv',
              )
              showToast('Exported all')
            }}
          />
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
            label="From"
            value={from}
            options={[...FROM_OPTIONS]}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setFrom}
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            Invoice No.
          </label>
          <input
            type="text"
            value={invoiceNo}
            onChange={(event) => setInvoiceNo(event.target.value)}
            className="h-9 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <OutlineButton
          onClick={() => setMoreFiltersOpen((prev) => !prev)}
        >
          {moreFiltersOpen ? 'Hide Filters' : 'More Filters'}
        </OutlineButton>
        <OutlineButton
          onClick={() =>
            setApplied({
              startDate,
              endDate,
              from,
              invoiceNo: invoiceNo.trim(),
              paymentStatus,
              updateStockFilter,
            })
          }
        >
          Search
        </OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setFrom('All')
            setInvoiceNo('')
            setStartDate('')
            setEndDate('')
            setPaymentStatus('all')
            setUpdateStockFilter('all')
            setMoreFiltersOpen(false)
            setApplied({
              startDate: '',
              endDate: '',
              from: 'All',
              invoiceNo: '',
              paymentStatus: 'all',
              updateStockFilter: 'all',
            })
          }}
        >
          Clear
        </OutlineButton>
      </div>

      {moreFiltersOpen ? (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-line bg-page/40 p-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className="h-9 min-w-[140px] rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink">
              Update Stock
            </label>
            <select
              value={updateStockFilter}
              onChange={(event) => setUpdateStockFilter(event.target.value)}
              className="h-9 min-w-[140px] rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="all">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-ink">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Counterparty</th>
                <th className="px-3 py-2.5">Credit Note No</th>
                <th className="px-3 py-2.5">Total</th>
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
                      {loading
                        ? 'Loading…'
                        : 'Purchases Return Record Not Found'}
                    </p>
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
                    <td className="px-3 py-2.5 text-ink">{row.counterparty}</td>
                    <td className="px-3 py-2.5 text-ink">{row.number}</td>
                    <td className="px-3 py-2.5 text-ink">{row.total}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {canWrite ? (
                          <RowActionButton
                            boxed
                            label="Edit"
                            onClick={() =>
                              navigate(
                                `/inventory/sales-return/${row.id}/edit`,
                              )
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
      </div>

      <ConfirmDeleteModal
        open={Boolean(pendingDelete)}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${pendingDelete?.number ?? 'this document'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </InventoryPageShell>
  )
}
