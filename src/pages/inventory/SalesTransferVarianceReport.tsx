import { useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/downloadFile'
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const TYPE_OPTIONS = [
  'With Purchase Order',
  'With Direct Sales / Transfer',
]

const FROM_OPTIONS = [
  'All',
  'Local Suppliers',
  'Wholesale Market',
  'Dairy Vendors',
  'Other Restaurant',
]

const DEFAULT_DATE = '2026-08-11'

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

export default function SalesTransferVarianceReport() {
  const [fromDate, setFromDate] = useState(DEFAULT_DATE)
  const [toDate, setToDate] = useState(DEFAULT_DATE)
  const [type, setType] = useState('With Purchase Order')
  const [from, setFrom] = useState('All')
  const [applied, setApplied] = useState({
    fromDate: DEFAULT_DATE,
    toDate: DEFAULT_DATE,
    type: 'With Purchase Order',
    from: 'All',
  })

  function handleSearch() {
    setApplied({ fromDate, toDate, type, from })
    showToast('Search applied')
  }

  function handleClear() {
    setFromDate(DEFAULT_DATE)
    setToDate(DEFAULT_DATE)
    setType('With Purchase Order')
    setFrom('All')
    setApplied({
      fromDate: DEFAULT_DATE,
      toDate: DEFAULT_DATE,
      type: 'With Purchase Order',
      from: 'All',
    })
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">
          Sales And Transfer Variance Report
        </h1>
        <ExportMenu
          onExportPage={() => {
            downloadCsv(
              ['from_date', 'to_date', 'type', 'from'],
              [[applied.fromDate, applied.toDate, applied.type, applied.from]],
              'sales-transfer-variance-page.csv',
            )
            showToast('Exported current page')
          }}
          onExportAll={() => {
            downloadCsv(
              ['from_date', 'to_date', 'type', 'from'],
              [[applied.fromDate, applied.toDate, applied.type, applied.from]],
              'sales-transfer-variance-all.csv',
            )
            showToast('Exported all')
          }}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="min-w-[220px]">
          <SearchableSelect
            label="Type"
            value={type}
            options={TYPE_OPTIONS}
            placeholder="With Purchase Order"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setType}
          />
        </div>
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
        <OutlineButton onClick={handleSearch}>Search</OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
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
        <p className="text-base font-semibold text-ink">
          Sales And Transfer Variance Report Record Not Found
        </p>
        <p className="mt-2 max-w-lg text-sm text-muted">
          Filters: start={applied.fromDate} · end={applied.toDate} · type=
          {applied.type} · from={applied.from}
        </p>
      </div>
    </InventoryPageShell>
  )
}
