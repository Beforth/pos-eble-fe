import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, FileCog, FileText, Plus, ScanLine, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { ScanPurchaseModal } from '../../components/inventory/ScanPurchaseModal'
import { PurchaseOrderSettingsDrawer } from '../../components/inventory/PurchaseOrderSettingsDrawer'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

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

interface PurchaseListPageProps {
  title: string
  activeItem: string
  emptyLabel?: string
  createPath?: string
  showScanPurchase?: boolean
  showSettings?: boolean
  settingsTitle?: string
  settingsApprovalExtra?: string
}

function PurchaseListPage({
  title,
  activeItem,
  emptyLabel = 'No Purchase Found',
  createPath = '/inventory/purchase/new',
  showScanPurchase = true,
  showSettings = false,
  settingsTitle = 'Purchase Settings',
  settingsApprovalExtra,
}: PurchaseListPageProps) {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState('2026-08-03')
  const [endDate, setEndDate] = useState('2026-08-10')
  const [from, setFrom] = useState('all')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [scanOpen, setScanOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  return (
    <InventoryPageShell activeItem={activeItem}>
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">{title}</h1>
        <div className="flex flex-wrap gap-2">
          <PrimaryButton onClick={() => navigate(createPath)}>
            <Plus size={15} />
            Create New
          </PrimaryButton>
          {showScanPurchase ? (
            <OutlineButton onClick={() => setScanOpen(true)}>
              <ScanLine size={15} />
              Scan &amp; Purchase
            </OutlineButton>
          ) : null}
          <ExportMenu
            onExportPage={() => {
              setToast('Exported current page')
              window.setTimeout(() => setToast(null), 2400)
            }}
            onExportAll={() => {
              setToast('Exported all')
              window.setTimeout(() => setToast(null), 2400)
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
            <option value="manual">Manual</option>
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
        <OutlineButton variant="gray">More Filters</OutlineButton>
        <OutlineButton>Search</OutlineButton>
        <OutlineButton
          variant="gray"
          onClick={() => {
            setFrom('all')
            setInvoiceNo('')
            setStartDate('2026-08-03')
            setEndDate('2026-08-10')
          }}
        >
          Clear
        </OutlineButton>
      </div>

      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
        <span className="relative mb-4 text-muted">
          <FileText size={56} strokeWidth={1.25} className="text-muted/50" />
          <Search
            size={24}
            className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
          />
        </span>
        <p className="text-base font-semibold text-ink">{emptyLabel}</p>
      </div>

      <ScanPurchaseModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onSave={() => {
          setToast('Purchase added')
          window.setTimeout(() => setToast(null), 2400)
        }}
      />
      {showSettings ? (
        <PurchaseOrderSettingsDrawer
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          title={settingsTitle}
          approvalExtra={settingsApprovalExtra}
          onSave={() => {
            setToast('Settings saved')
            window.setTimeout(() => setToast(null), 2400)
          }}
        />
      ) : null}
    </InventoryPageShell>
  )
}

export default function StockPurchase() {
  return (
    <PurchaseListPage
      title="Purchase List"
      activeItem="stock-purchase"
      createPath="/inventory/purchase/new"
      showSettings
      settingsTitle="Purchase Settings"
    />
  )
}

export function PurchaseOrder() {
  return (
    <PurchaseListPage
      title="Purchase Order List"
      activeItem="purchase-order"
      emptyLabel="No Purchase Order Found"
      createPath="/inventory/purchase-order/new"
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
      title="Purchase Return List"
      activeItem="purchase-return"
      emptyLabel="No Purchase Found"
      createPath="/inventory/purchase-return/new"
      showScanPurchase={false}
      showSettings
      settingsTitle="Purchase Return Settings"
      settingsApprovalExtra="Once approval is completed, the user is unable to edit that purchase return."
    />
  )
}
