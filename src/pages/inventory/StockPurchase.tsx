import { useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileCog, FileText, Pencil, Plus, ScanLine, X } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { ScanPurchaseModal } from '../../components/inventory/ScanPurchaseModal'
import { PurchaseOrderSettingsDrawer } from '../../components/inventory/PurchaseOrderSettingsDrawer'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import {
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_PURCHASE_WRITE_PERMISSION,
  deletePurchaseApi,
  deletePurchaseOrderApi,
  deletePurchaseReturnApi,
  listAllPurchaseOrdersApi,
  listAllPurchaseReturnsApi,
  listAllPurchasesApi,
  type Purchase,
  type PurchaseOrder,
} from '../../services/inventoryService'

import { downloadCsv } from '../../utils/downloadFile'

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

type Kind = 'purchase' | 'order' | 'return'

type ListRow = {
  id: string
  date: string
  counterparty: string
  number: string
  total: string
  paymentStatus?: string
  updateStock?: boolean
  sourceType?: string
}

function toPurchaseRow(row: Purchase): ListRow {
  return {
    id: row.id,
    date: row.invoice_date,
    counterparty: row.supplier_name || row.restaurant_name || '—',
    number: row.invoice_number || '—',
    total: row.grand_total,
    paymentStatus: row.payment_status,
    updateStock: row.update_inventory_stock,
    sourceType: row.source_type,
  }
}

function toOrderRow(row: PurchaseOrder): ListRow {
  return {
    id: row.id,
    date: row.delivery_date,
    counterparty: row.supplier_name || row.restaurant_name || '—',
    number: row.po_number || '—',
    total: row.grand_total,
    sourceType: row.source_type,
  }
}

interface PurchaseListPageProps {
  kind: Kind
  title: string
  activeItem: string
  emptyLabel?: string
  createPath: string
  editPath: (id: string) => string
  showScanPurchase?: boolean
  showSettings?: boolean
  settingsTitle?: string
  settingsApprovalExtra?: string
}

function PurchaseListPage({
  kind,
  title,
  activeItem,
  emptyLabel = 'No Purchase Found',
  createPath,
  editPath,
  showScanPurchase = true,
  showSettings = false,
  settingsTitle = 'Purchase Settings',
  settingsApprovalExtra,
}: PurchaseListPageProps) {
  const navigate = useNavigate()
  const { encryptedOutletId, hasPermission } = useAuth()
  const canWrite = hasPermission(INV_PURCHASE_WRITE_PERMISSION)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [from, setFrom] = useState('all')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('all')
  const [updateStockFilter, setUpdateStockFilter] = useState('all')
  const [applied, setApplied] = useState({
    startDate: '',
    endDate: '',
    from: 'all',
    invoiceNo: '',
    paymentStatus: 'all',
    updateStockFilter: 'all',
  })
  const [rows, setRows] = useState<ListRow[]>([])
  const [loading, setLoading] = useState(false)
  const [scanOpen, setScanOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<ListRow | null>(null)

  useEffect(() => {
    if (!encryptedOutletId) {
      setRows([])
      return
    }
    let cancelled = false
    setLoading(true)
    const params = {
      search: applied.invoiceNo || undefined,
      dateFrom: applied.startDate || undefined,
      dateTo: applied.endDate || undefined,
      sourceType: applied.from,
    }
    const loader =
      kind === 'purchase'
        ? listAllPurchasesApi(encryptedOutletId, params).then((items) =>
            items.map(toPurchaseRow),
          )
        : kind === 'order'
          ? listAllPurchaseOrdersApi(encryptedOutletId, params).then((items) =>
              items.map(toOrderRow),
            )
          : listAllPurchaseReturnsApi(encryptedOutletId, params).then((items) =>
              items.map(toOrderRow),
            )
    loader
      .then((items) => {
        if (cancelled) return
        const filtered = items.filter((row) => {
          if (
            applied.paymentStatus !== 'all' &&
            row.paymentStatus &&
            row.paymentStatus !== applied.paymentStatus
          ) {
            return false
          }
          if (applied.updateStockFilter === 'yes' && row.updateStock === false) {
            return false
          }
          if (applied.updateStockFilter === 'no' && row.updateStock === true) {
            return false
          }
          return true
        })
        setRows(filtered)
      })
      .catch((err) => {
        if (!cancelled) {
          showToast(
            err instanceof ApiError ? err.message : 'Unable to load documents',
          )
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, kind, applied])

  async function confirmDelete() {
    if (!pendingDelete || !encryptedOutletId) return
    try {
      if (kind === 'purchase') {
        await deletePurchaseApi(encryptedOutletId, pendingDelete.id)
      } else if (kind === 'order') {
        await deletePurchaseOrderApi(encryptedOutletId, pendingDelete.id)
      } else {
        await deletePurchaseReturnApi(encryptedOutletId, pendingDelete.id)
      }
      setRows((prev) => prev.filter((row) => row.id !== pendingDelete.id))
      showToast('Deleted')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Unable to delete')
    }
  }

  return (
    <InventoryPageShell activeItem={activeItem}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">{title}</h1>
        <div className="flex flex-wrap gap-2">
          {canWrite ? (
            <PrimaryButton onClick={() => navigate(createPath)}>
              <Plus size={15} />
              Create New
            </PrimaryButton>
          ) : null}
          {showScanPurchase ? (
            <OutlineButton onClick={() => setScanOpen(true)}>
              <ScanLine size={15} />
              Scan &amp; Purchase
            </OutlineButton>
          ) : null}
          <ExportMenu
            onExportPage={() => {
              downloadCsv(
                ['date', 'party', 'number', 'total'],
                rows.map((row) => [row.date, row.counterparty, row.number, row.total]),
                `${kind}-page.csv`,
              )
              showToast('Exported current page')
            }}
            onExportAll={() => {
              downloadCsv(
                ['date', 'party', 'number', 'total'],
                rows.map((row) => [row.date, row.counterparty, row.number, row.total]),
                `${kind}-all.csv`,
              )
              showToast('Exported all')
            }}
          />
          {showSettings ? (
            <button
              type="button"
              aria-label={settingsTitle}
              title={settingsTitle}
              onClick={() => setSettingsOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink"
            >
              <FileCog size={16} />
            </button>
          ) : null}
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
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink">
            From
          </label>
          <select
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="h-9 min-w-[120px] rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="all">All</option>
            <option value="supplier">Supplier</option>
            <option value="restaurant">Restaurant</option>
          </select>
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
          variant="gray"
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
            setFrom('all')
            setInvoiceNo('')
            setStartDate('')
            setEndDate('')
            setPaymentStatus('all')
            setUpdateStockFilter('all')
            setMoreFiltersOpen(false)
            setApplied({
              startDate: '',
              endDate: '',
              from: 'all',
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
                <th className="px-3 py-2.5">
                  {kind === 'purchase' ? 'Invoice No' : 'PO No'}
                </th>
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
                      {loading ? 'Loading…' : emptyLabel}
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
                            onClick={() => navigate(editPath(row.id))}
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

      <ScanPurchaseModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onSave={() => {
          showToast('Purchase added')
        }}
      />
      {showSettings ? (
        <PurchaseOrderSettingsDrawer
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          title={settingsTitle}
          approvalExtra={settingsApprovalExtra}
          onSave={() => {
            showToast('Settings saved')
          }}
        />
      ) : null}
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

export default function StockPurchase() {
  return (
    <PurchaseListPage
      kind="purchase"
      title="Purchase List"
      activeItem="stock-purchase"
      createPath="/inventory/purchase/new"
      editPath={(id) => `/inventory/purchase/${id}/edit`}
      showSettings
      settingsTitle="Purchase Settings"
    />
  )
}

export function PurchaseOrder() {
  return (
    <PurchaseListPage
      kind="order"
      title="Purchase Order List"
      activeItem="purchase-order"
      emptyLabel="No Purchase Order Found"
      createPath="/inventory/purchase-order/new"
      editPath={(id) => `/inventory/purchase-order/${id}/edit`}
      showScanPurchase={false}
      showSettings
      settingsTitle="Purchase Order Settings"
      settingsApprovalExtra="Once approval is completed, the user is unable to edit that purchase order."
    />
  )
}

export function PurchaseReturn() {
  return (
    <PurchaseListPage
      kind="return"
      title="Purchase Return List"
      activeItem="purchase-return"
      emptyLabel="No Purchase Found"
      createPath="/inventory/purchase-return/new"
      editPath={(id) => `/inventory/purchase-return/${id}/edit`}
      showScanPurchase={false}
      showSettings
      settingsTitle="Purchase Return Settings"
      settingsApprovalExtra="Once approval is completed, the user is unable to edit that purchase return."
    />
  )
}
