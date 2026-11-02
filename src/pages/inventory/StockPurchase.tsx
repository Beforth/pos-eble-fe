import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { showToast } from '../../utils/toast'
import {
  ChevronDown,
  Eye,
  FileCog,
  FileText,
  Hourglass,
  Pencil,
  Plus,
  Receipt,
  ScanLine,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useNavigate } from '../../utils/inventoryRouter'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { ScanPurchaseModal } from '../../components/inventory/ScanPurchaseModal'
import { PurchaseOrderSettingsDrawer } from '../../components/inventory/PurchaseOrderSettingsDrawer'
import { ConfirmDeleteModal } from '../../components/common/ConfirmDeleteModal'
import {
  OutlineButton,
  PrimaryButton,
  RowActionButton,
} from '../../components/menu/MenuActionButtons'
import { PaginationControls } from '../../components/common/PaginationControls'
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

function toReturnRow(row: PurchaseOrder): ListRow {
  return {
    ...toOrderRow(row),
    number: row.invoice_number || row.po_number || '—',
    paymentStatus: row.payment_status,
  }
}

const SOURCE_OPTIONS = [
  { value: 'all', label: 'All sources' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'restaurant', label: 'Restaurant' },
]

const UPDATE_STOCK_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'yes', label: 'Stock updated' },
  { value: 'no', label: 'Stock not updated' },
]

function paymentOptions(kind: Kind) {
  const returns = kind === 'return'
  return [
    { value: 'all', label: 'All' },
    { value: 'paid', label: returns ? 'Refunded' : 'Paid' },
    { value: 'partial', label: returns ? 'Partially refunded' : 'Partially paid' },
    { value: 'unpaid', label: returns ? 'Pending' : 'Unpaid' },
  ]
}

function labelOf(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label ?? options[0].label
}

function valueOf(options: { value: string; label: string }[], label: string) {
  return options.find((option) => option.label === label)?.value ?? options[0].value
}

function formatMoney(value: number) {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function StatCard({
  icon,
  label,
  value,
  hint,
  tone = 'default',
}: {
  icon: ReactNode
  label: string
  value: string
  hint?: string
  tone?: 'default' | 'warn'
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3">
      <span
        className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
          tone === 'warn' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="truncate text-lg font-bold text-ink">{value}</p>
        {hint ? <p className="truncate text-xs text-muted">{hint}</p> : null}
      </div>
    </div>
  )
}

function Badge({
  tone,
  children,
}: {
  tone: 'success' | 'warn' | 'danger' | 'neutral'
  children: ReactNode
}) {
  const toneClass = {
    success: 'bg-success/10 text-success',
    warn: 'bg-accent/10 text-accent',
    danger: 'bg-danger/10 text-danger',
    neutral: 'bg-page text-muted',
  }[tone]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass}`}
    >
      {children}
    </span>
  )
}

function PaymentBadge({ status, kind }: { status?: string; kind: Kind }) {
  if (!status) return <span className="text-muted">—</span>
  const returns = kind === 'return'
  if (status === 'paid') return <Badge tone="success">{returns ? 'Refunded' : 'Paid'}</Badge>
  if (status === 'partial')
    return <Badge tone="warn">{returns ? 'Partially refunded' : 'Partially paid'}</Badge>
  return <Badge tone="danger">{returns ? 'Pending' : 'Unpaid'}</Badge>
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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  useEffect(() => {
    setPage(1)
  }, [applied, rows])

  const pagedRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize],
  )

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
      paymentStatus:
        kind !== 'order' ? applied.paymentStatus : undefined,
      updateInventoryStock:
        kind === 'purchase' ? applied.updateStockFilter : undefined,
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
              items.map(toReturnRow),
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

  const stats = useMemo(() => {
    let total = 0
    let outstandingCount = 0
    let outstandingValue = 0
    for (const row of rows) {
      const amount = Number(row.total) || 0
      total += amount
      if (row.paymentStatus && row.paymentStatus !== 'paid') {
        outstandingCount += 1
        outstandingValue += amount
      }
    }
    return { total, outstandingCount, outstandingValue }
  }, [rows])

  const showPayment = kind !== 'order'
  const showStock = kind === 'purchase'
  const columnCount = 5 + (showPayment ? 1 : 0) + (showStock ? 1 : 0)
  const [singular, plural] =
    kind === 'order'
      ? ['purchase order', 'purchase orders']
      : kind === 'return'
        ? ['return', 'returns']
        : ['purchase', 'purchases']
  const noun = rows.length === 1 ? singular : plural
  const today = new Date().toISOString().slice(0, 10)
  const upcomingDeliveries = rows.filter((row) => row.date >= today).length
  const numberLabel =
    kind === 'purchase' ? 'Invoice no' : kind === 'return' ? 'Return no' : 'PO no'
  const dateLabel =
    kind === 'order' ? 'Delivery date' : kind === 'return' ? 'Return date' : 'Invoice date'

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
        <div>
          <h1 className="text-lg font-bold text-ink">{title}</h1>
          <p className="text-sm text-muted">
            {loading ? 'Loading…' : `${rows.length} ${noun} found`}
          </p>
        </div>
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
              data-tooltip={settingsTitle}
              onClick={() => setSettingsOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-card text-muted hover:bg-page hover:text-ink"
            >
              <FileCog size={16} />
            </button>
          ) : null}
        </div>
      </div>

      <div
        className={`mb-4 grid gap-3 sm:grid-cols-2 ${
          'xl:grid-cols-3'
        }`}
      >
        <StatCard
          icon={<Receipt size={20} />}
          label={kind === 'order' ? 'Purchase orders' : kind === 'return' ? 'Returns' : 'Purchases'}
          value={String(rows.length)}
          hint="Matching the current filters"
        />
        <StatCard
          icon={<Wallet size={20} />}
          label="Total value"
          value={formatMoney(stats.total)}
          hint="Sum of all listed documents"
        />
        {showPayment ? (
          <StatCard
            icon={<Hourglass size={20} />}
            label={kind === 'return' ? 'Refund pending' : 'Payment pending'}
            value={formatMoney(stats.outstandingValue)}
            hint={`${stats.outstandingCount} document${stats.outstandingCount === 1 ? '' : 's'} not fully settled`}
            tone="warn"
          />
        ) : (
          <StatCard
            icon={<Hourglass size={20} />}
            label="Upcoming deliveries"
            value={String(upcomingDeliveries)}
            hint="Delivery date is today or later"
            tone="warn"
          />
        )}
      </div>

      <div className="mb-4 rounded-xl border border-line bg-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-10 rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              End date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-10 rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="w-44">
            <SearchableSelect
              label={<span className="text-xs font-semibold uppercase tracking-wide text-muted">From</span>}
              value={labelOf(SOURCE_OPTIONS, from)}
              options={SOURCE_OPTIONS.map((option) => option.label)}
              onChange={(label) => setFrom(valueOf(SOURCE_OPTIONS, label))}
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
              {kind === 'order'
                ? 'PO No.'
                : kind === 'return'
                  ? 'Return / Debit Note No.'
                  : 'Invoice No.'}
            </label>
            <input
              type="text"
              value={invoiceNo}
              onChange={(event) => setInvoiceNo(event.target.value)}
              placeholder="Search by number"
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
          {kind !== 'order' ? (
            <OutlineButton
              variant="gray"
              onClick={() => setMoreFiltersOpen((prev) => !prev)}
            >
              {moreFiltersOpen ? 'Hide filters' : 'More filters'}
            </OutlineButton>
          ) : null}
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

        {kind !== 'order' && moreFiltersOpen ? (
          <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
            <div className="w-52">
              <SearchableSelect
                label={<span className="text-xs font-semibold uppercase tracking-wide text-muted">Payment status</span>}
                value={labelOf(paymentOptions(kind), paymentStatus)}
                options={paymentOptions(kind).map((option) => option.label)}
                onChange={(label) => setPaymentStatus(valueOf(paymentOptions(kind), label))}
              />
            </div>
            {kind === 'purchase' ? (
              <div className="w-52">
                <SearchableSelect
                  label={<span className="text-xs font-semibold uppercase tracking-wide text-muted">Stock update</span>}
                  value={labelOf(UPDATE_STOCK_OPTIONS, updateStockFilter)}
                  options={UPDATE_STOCK_OPTIONS.map((option) => option.label)}
                  onChange={(label) =>
                    setUpdateStockFilter(valueOf(UPDATE_STOCK_OPTIONS, label))
                  }
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">{dateLabel}</th>
                <th className="px-4 py-3">Counterparty</th>
                <th className="px-4 py-3">{numberLabel}</th>
                <th className="px-4 py-3 text-right">Total</th>
                {showPayment ? <th className="px-4 py-3">Payment</th> : null}
                {showStock ? <th className="px-4 py-3">Stock</th> : null}
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-16 text-center">
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
                pagedRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line transition-colors last:border-b-0 hover:bg-surface-tint/20"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-ink">{row.date}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{row.counterparty}</p>
                      {row.sourceType ? (
                        <p className="text-xs capitalize text-muted">{row.sourceType}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-ink">{row.number}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">
                      {formatMoney(Number(row.total) || 0)}
                    </td>
                    {showPayment ? (
                      <td className="px-4 py-3">
                        <PaymentBadge status={row.paymentStatus} kind={kind} />
                      </td>
                    ) : null}
                    {showStock ? (
                      <td className="px-4 py-3">
                        <Badge tone={row.updateStock ? 'success' : 'neutral'}>
                          {row.updateStock ? 'Updated' : 'Not updated'}
                        </Badge>
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <RowActionButton
                          boxed
                          label="View Details"
                          onClick={() => navigate(editPath(row.id).replace(/\/edit$/, '/view'))}
                        >
                          <Eye size={15} strokeWidth={1.75} />
                        </RowActionButton>
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
        <PaginationControls
          totalRecords={rows.length}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
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
