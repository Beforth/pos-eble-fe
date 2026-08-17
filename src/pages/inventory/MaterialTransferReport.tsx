import { useEffect, useRef, useState } from 'react'
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const TO_OPTIONS = [
  'All',
  'Main Kitchen',
  'Storage Room',
  'Dadar Outlet',
  'Other Restaurant',
]

function ExportMenu({
  onExportReport,
  onExportSummary,
  onExportOld,
}: {
  onExportReport?: () => void
  onExportSummary?: () => void
  onExportOld?: () => void
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

  const items = [
    {
      label: 'Export Material Transfer Report',
      onClick: onExportReport,
    },
    {
      label: 'Export Material Transfer Summary Report',
      onClick: onExportSummary,
    },
    {
      label: 'Export Material Transfer (Old)',
      onClick: onExportOld,
    },
  ]

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
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[280px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => {
                  item.onClick?.()
                  setOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export default function MaterialTransferReport() {
  const [to, setTo] = useState('All')
  const [rawMaterial, setRawMaterial] = useState('')
  const [fromDate, setFromDate] = useState('2026-08-04')
  const [toDate, setToDate] = useState('2026-08-11')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleClear() {
    setTo('All')
    setRawMaterial('')
    setFromDate('2026-08-04')
    setToDate('2026-08-11')
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Material Transfer Report</h1>
        <ExportMenu
          onExportReport={() => showToast('Exported Material Transfer Report')}
          onExportSummary={() =>
            showToast('Exported Material Transfer Summary Report')
          }
          onExportOld={() => showToast('Exported Material Transfer (Old)')}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[140px]">
          <SearchableSelect
            label="To"
            value={to}
            options={TO_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setTo}
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Raw Material
          </label>
          <input
            type="text"
            value={rawMaterial}
            onChange={(event) => setRawMaterial(event.target.value)}
            className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>
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
        <OutlineButton
          variant="gray"
          onClick={() => showToast('More filters')}
        >
          More Filters
        </OutlineButton>
        <OutlineButton onClick={() => showToast('Search applied')}>
          Search
        </OutlineButton>
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
          Material Transfer Report Record Not Found
        </p>
      </div>
    </InventoryPageShell>
  )
}
