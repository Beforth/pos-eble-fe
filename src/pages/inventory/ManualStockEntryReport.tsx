import { useEffect, useRef, useState } from 'react'
import { ChevronDown, FileText, Search } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const CATEGORY_OPTIONS = [
  'All',
  'Rice/pulses/flours',
  'Bread/dairy',
  'Oils/masala/salt/sugar',
  'Ready To Cook/ready To Eat',
  'Sauces/dressings/marinades',
  'Snacks',
  'Packaging/storage',
  'Fruits/vegetables',
  'No Category',
]

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

export default function ManualStockEntryReport() {
  const [startDate, setStartDate] = useState('2026-08-04')
  const [endDate, setEndDate] = useState('2026-08-11')
  const [rawMaterial, setRawMaterial] = useState('')
  const [category, setCategory] = useState('All')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleClear() {
    setStartDate('2026-08-04')
    setEndDate('2026-08-11')
    setRawMaterial('')
    setCategory('All')
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Manual Adjustment List</h1>
        <ExportMenu
          onExportPage={() => showToast('Exported current page')}
          onExportAll={() => showToast('Exported all')}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
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
        <div className="min-w-[160px]">
          <SearchableSelect
            label="Category"
            value={category}
            options={CATEGORY_OPTIONS}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setCategory}
          />
        </div>
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
          Manual Adjustment Report Record Not Found
        </p>
      </div>
    </InventoryPageShell>
  )
}
