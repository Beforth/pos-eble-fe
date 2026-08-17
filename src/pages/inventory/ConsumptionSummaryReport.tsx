import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, FileText } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const CATEGORY_OPTIONS = [
  { id: 'all', name: 'All' },
  { id: 'no-category', name: 'No Category' },
  { id: 'rice-pulses-flours', name: 'Rice/pulses/flours' },
  { id: 'bread-dairy', name: 'Bread/dairy' },
  { id: 'oils-masala', name: 'Oils/masala/salt/sugar' },
  { id: 'ready-to-cook', name: 'Ready To Cook/ready To Eat' },
  { id: 'sauces', name: 'Sauces/dressings/marinades' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'packaging', name: 'Packaging/storage' },
  { id: 'fruits-vegetables', name: 'Fruits/vegetables' },
]

const CATEGORY_IDS = CATEGORY_OPTIONS.map((option) => option.id)
const CATEGORY_IDS_WITHOUT_ALL = CATEGORY_IDS.filter((id) => id !== 'all')

const PAGE_SIZE = 10
const TOTAL_RECORDS = 58

const MATERIAL_NAMES = [
  'Instant Mix Gota Flour [pkt]',
  'Instant Mix Gota Flour [carton]',
  'Instant Mix Gota Flour [Bag]',
  'Instant Mix Gota Flour [Kg]',
  'Dalda Ghee [carton]',
  'Dalda Ghee [pkt]',
  'Refined Oil [ltr]',
  'Besan Flour [kg]',
  'Wheat Flour [kg]',
  'Onion [kg]',
]

interface ConsumptionRow {
  id: string
  rawMaterial: string
  unit: string
  consumption: string
  avgPurchasePrice: string
  consumptionCost: string
  totalQty: string
  totalCost: string
}

function buildRows(): ConsumptionRow[] {
  return Array.from({ length: TOTAL_RECORDS }, (_, index) => {
    const name = MATERIAL_NAMES[index % MATERIAL_NAMES.length]
    const unitMatch = name.match(/\[([^\]]+)\]/)
    const unit = unitMatch?.[1] ?? 'pcs'
    return {
      id: `row-${index + 1}`,
      rawMaterial: name,
      unit,
      consumption: '0',
      avgPurchasePrice: '0.000',
      consumptionCost: '0.000',
      totalQty: `0 / ${unit}`,
      totalCost: '0.000',
    }
  })
}

const ALL_ROWS = buildRows()

function formatDayLabel(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateValue
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'long',
  })
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

function CategoryMultiSelect({
  selectedIds,
  onChange,
}: {
  selectedIds: string[]
  onChange: (ids: string[]) => void
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

  const display =
    selectedIds.length === 0
      ? 'Select Category'
      : selectedIds.includes('all') ||
          selectedIds.length === CATEGORY_IDS_WITHOUT_ALL.length
        ? 'All'
        : selectedIds.length === 1
          ? (CATEGORY_OPTIONS.find((o) => o.id === selectedIds[0])?.name ??
            '1 selected')
          : `${selectedIds.length} selected`

  function toggle(id: string) {
    if (id === 'all') {
      const selectingAll =
        !selectedIds.includes('all') &&
        selectedIds.length !== CATEGORY_IDS_WITHOUT_ALL.length
      onChange(selectingAll ? [...CATEGORY_IDS] : [])
      return
    }
    const withoutAll = selectedIds.filter((value) => value !== 'all')
    const next = withoutAll.includes(id)
      ? withoutAll.filter((value) => value !== id)
      : [...withoutAll, id]
    if (next.length === CATEGORY_IDS_WITHOUT_ALL.length) {
      onChange([...CATEGORY_IDS])
      return
    }
    onChange(next)
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-ink">
        Category
      </label>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-line bg-card px-3 text-left text-sm outline-none hover:bg-page focus:border-primary"
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            selectedIds.length ? 'text-ink' : 'text-muted'
          }`}
        >
          {display}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-muted transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 right-0 z-40 mt-1 max-h-56 overflow-y-auto rounded-md border border-line bg-card py-1 shadow-lg [scrollbar-width:thin]"
        >
          {CATEGORY_OPTIONS.map((option) => {
            const checked =
              option.id === 'all'
                ? selectedIds.includes('all') ||
                  selectedIds.length === CATEGORY_IDS_WITHOUT_ALL.length
                : selectedIds.includes(option.id) || selectedIds.includes('all')
            return (
              <li key={option.id} role="option" aria-selected={checked}>
                <label className="flex cursor-pointer items-start gap-2.5 px-3 py-2 text-sm text-ink hover:bg-page">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(option.id)}
                    className="mt-0.5 size-4 shrink-0 accent-primary"
                  />
                  <span className="leading-snug">{option.name}</span>
                </label>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function MetricBars({
  consumption,
  avgPurchasePrice,
  consumptionCost,
}: {
  consumption: string
  avgPurchasePrice: string
  consumptionCost: string
}) {
  return (
    <div className="space-y-1.5 py-1">
      <div className="flex h-6 items-center rounded bg-surface-tint px-2 text-xs font-medium text-deep">
        {consumption}
      </div>
      <div className="flex h-6 items-center rounded bg-secondary/50 px-2 text-xs font-medium text-deep">
        {avgPurchasePrice}
      </div>
      <div className="flex h-6 items-center rounded bg-success/15 px-2 text-xs font-medium text-success">
        {consumptionCost}
      </div>
    </div>
  )
}

export default function ConsumptionSummaryReport() {
  const [rawMaterial, setRawMaterial] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [fromDate, setFromDate] = useState('2026-08-11')
  const [toDate, setToDate] = useState('2026-08-11')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<string | null>(null)

  const filteredRows = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    if (!q) return ALL_ROWS
    return ALL_ROWS.filter((row) => row.rawMaterial.toLowerCase().includes(q))
  }, [appliedQuery])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  const pageButtons = useMemo(() => {
    const maxButtons = 6
    const start = Math.min(
      Math.max(1, currentPage - 2),
      Math.max(1, totalPages - maxButtons + 1),
    )
    return Array.from(
      { length: Math.min(maxButtons, totalPages) },
      (_, index) => start + index,
    )
  }, [currentPage, totalPages])

  const dayLabel = formatDayLabel(fromDate)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setAppliedQuery(rawMaterial)
    setPage(1)
    showToast('Search applied')
  }

  function handleClear() {
    setRawMaterial('')
    setCategories([])
    setFromDate('2026-08-11')
    setToDate('2026-08-11')
    setAppliedQuery('')
    setPage(1)
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Consumption Summary</h1>
        <ExportMenu
          onExportPage={() => showToast('Exported current page')}
          onExportAll={() => showToast('Exported all')}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
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
        <div className="min-w-[180px] flex-1">
          <CategoryMultiSelect
            selectedIds={categories}
            onChange={setCategories}
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
        <OutlineButton onClick={handleSearch}>Search</OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-surface-tint" />
          Consumption
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-secondary" />
          Avg Purchase Price (₹)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-success" />
          Consumption Cost (₹)
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs font-semibold text-muted">
              <tr>
                <th className="px-3 py-2.5">Raw Material</th>
                <th className="min-w-[180px] px-3 py-2.5">{dayLabel}</th>
                <th className="px-3 py-2.5">Total Consumption Qty</th>
                <th className="px-3 py-2.5">Total Consumption Cost (₹)</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-line last:border-b-0 ${
                    index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                  }`}
                >
                  <td className="whitespace-nowrap px-3 py-2 align-middle text-ink">
                    {row.rawMaterial}
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <MetricBars
                      consumption={row.consumption}
                      avgPurchasePrice={row.avgPurchasePrice}
                      consumptionCost={row.consumptionCost}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-middle text-ink">
                    {row.totalQty}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-middle text-ink">
                    {row.totalCost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-line px-4 py-3">
          {pageButtons.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium ${
                pageNumber === currentPage
                  ? 'bg-primary text-white'
                  : 'border border-line bg-card text-ink hover:bg-page'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="inline-flex h-8 items-center justify-center rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(totalPages)}
            className="inline-flex h-8 items-center justify-center rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page disabled:cursor-not-allowed disabled:opacity-50"
          >
            Last
          </button>
        </div>
      </div>
    </InventoryPageShell>
  )
}
