import { useEffect, useRef, useState } from 'react'
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const FROM_OPTIONS = [
  'All',
  'Local Suppliers',
  'Wholesale Market',
  'Dairy Vendors',
  'Other Restaurant',
]

const STATUS_OPTIONS = [
  'All',
  'Saved & Approved',
  'Approved',
  'Sent & Email',
  'Processed',
  'Cancelled',
  'Pending for Approval',
  'Payment Pending',
]

function ExportMenu({
  onExportList,
  onExportDetail,
}: {
  onExportList?: () => void
  onExportDetail?: () => void
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
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[200px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onExportList?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export Report List
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                onExportDetail?.()
                setOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
            >
              Export Detail Report
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}

export default function PurchaseOrderReceivedReport() {
  const [from, setFrom] = useState('All')
  const [poNumber, setPoNumber] = useState('')
  const [status, setStatus] = useState('Saved & Approved')
  const [startDate, setStartDate] = useState('2026-08-11')
  const [endDate, setEndDate] = useState('2026-08-11')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleShowAll() {
    setFrom('All')
    setPoNumber('')
    setStatus('Saved & Approved')
    setStartDate('2026-08-11')
    setEndDate('2026-08-11')
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          Purchase Order Received Report
        </h1>
        <ExportMenu
          onExportList={() => showToast('Exported report list')}
          onExportDetail={() => showToast('Exported detail report')}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[140px]">
          <SearchableSelect
            label="From"
            value={from}
            options={FROM_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setFrom}
          />
        </div>
        <div className="min-w-[140px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            PO Number
          </label>
          <input
            type="text"
            value={poNumber}
            onChange={(event) => setPoNumber(event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[160px]">
          <SearchableSelect
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            placeholder="Saved & Approved"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setStatus}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <OutlineButton onClick={() => showToast('Search applied')}>
          Search
        </OutlineButton>
        <OutlineButton variant="gray" onClick={handleShowAll}>
          Show All
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
        <p className="text-base font-semibold text-ink">No Record Found</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          We could not find what you searched for Try searching again
        </p>
      </div>
    </InventoryPageShell>
  )
}
