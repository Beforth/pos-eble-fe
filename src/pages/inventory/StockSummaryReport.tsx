import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  FileText,
  Info,
  Package,
  TrendingDown,
} from 'lucide-react'
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

const UNIT_TYPE_OPTIONS = ['Purchase Unit', 'Consumption Unit']

const PAGE_SIZE = 100
const TOTAL_RECORDS = 492

const RAW_MATERIAL_NAMES = [
  'Instant Mix Gota Flour [pkt]',
  'Dalda Ghee [carton]',
  'Refined Oil [ltr]',
  'Besan Flour [kg]',
  'Wheat Flour [kg]',
  'Sugar [kg]',
  'Salt [kg]',
  'Butter [kg]',
  'Milk [ltr]',
  'Paneer [kg]',
  'Onion [kg]',
  'Tomato [kg]',
  'Potato [kg]',
  'Green Chilli [kg]',
  'Coriander [kg]',
  'Lemon [kg]',
  'Paper Bag Large [pcs]',
  'Paper Bag Small [pcs]',
  'Tissue Paper [pkt]',
  'Disposable Glass [pcs]',
]

interface StockSummaryRow {
  id: string
  rawMaterial: string
  opening: string
  purchase: string
  excess: string
  totalIn: string
  consumed: string
  wastage: string
  normalLoss: string
  transfer: string
  shortage: string
  production: string
  totalOut: string
  closingStock: string
  closingSummary: string
  difference: string
}

function buildRows(): StockSummaryRow[] {
  return Array.from({ length: TOTAL_RECORDS }, (_, index) => {
    const name = RAW_MATERIAL_NAMES[index % RAW_MATERIAL_NAMES.length]
    const suffix =
      index >= RAW_MATERIAL_NAMES.length
        ? ` #${Math.floor(index / RAW_MATERIAL_NAMES.length) + 1}`
        : ''
    return {
      id: `row-${index + 1}`,
      rawMaterial: `${name}${suffix}`,
      opening: '0.000',
      purchase: '0.000',
      excess: '0.000',
      totalIn: '0.000',
      consumed: '0.000',
      wastage: '0.000',
      normalLoss: '0.000',
      transfer: '0.000',
      shortage: '0.000',
      production: '0.000',
      totalOut: '0.000',
      closingStock: '0.000',
      closingSummary: '0.000',
      difference: '0.000',
    }
  })
}

const ALL_ROWS = buildRows()

function ExportMenu({
  onExportPage,
  onExportAll,
  onExportPagePdf,
  onExportAllPdf,
}: {
  onExportPage?: () => void
  onExportAll?: () => void
  onExportPagePdf?: () => void
  onExportAllPdf?: () => void
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
    { label: 'Export Current Page', onClick: onExportPage },
    { label: 'Export All', onClick: onExportAll },
    { label: 'Export Current Page to PDF', onClick: onExportPagePdf },
    { label: 'Export All to PDF', onClick: onExportAllPdf },
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
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[220px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
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

function HeaderWithInfo({
  children,
  title,
  highlight,
}: {
  children: string
  title: string
  highlight?: boolean
}) {
  return (
    <th
      className={`whitespace-nowrap px-2.5 py-2.5 font-semibold ${
        highlight ? 'bg-primary/10 text-ink' : 'text-muted'
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <span title={title}>
          <Info size={12} className="text-muted" />
        </span>
      </span>
    </th>
  )
}

export default function StockSummaryReport() {
  const [rawMaterial, setRawMaterial] = useState('')
  const [category, setCategory] = useState('All')
  const [unitType, setUnitType] = useState('Purchase Unit')
  const [fromDate, setFromDate] = useState('2026-08-11')
  const [toDate, setToDate] = useState('2026-08-11')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<string | null>(null)
  const [appliedQuery, setAppliedQuery] = useState('')

  const filteredRows = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    if (!q) return ALL_ROWS
    return ALL_ROWS.filter((row) => row.rawMaterial.toLowerCase().includes(q))
  }, [appliedQuery])

  const summary = useMemo(() => {
    let totalIn = 0
    let totalOut = 0
    let closingStock = 0
    let difference = 0
    for (const row of filteredRows) {
      totalIn += Number.parseFloat(row.totalIn) || 0
      totalOut += Number.parseFloat(row.totalOut) || 0
      closingStock += Number.parseFloat(row.closingStock) || 0
      difference += Number.parseFloat(row.difference) || 0
    }
    return { totalIn, totalOut, closingStock, difference }
  }, [filteredRows])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageRows = filteredRows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )
  const fromRecord =
    filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const toRecord = Math.min(currentPage * PAGE_SIZE, filteredRows.length)

  const pageButtons = useMemo(() => {
    const maxButtons = 5
    const start = Math.min(
      Math.max(1, currentPage - 2),
      Math.max(1, totalPages - maxButtons + 1),
    )
    return Array.from(
      { length: Math.min(maxButtons, totalPages) },
      (_, index) => start + index,
    )
  }, [currentPage, totalPages])

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
    setCategory('All')
    setUnitType('Purchase Unit')
    setFromDate('2026-08-11')
    setToDate('2026-08-11')
    setAppliedQuery('')
    setPage(1)
  }

  return (
    <InventoryPageShell activeItem="stock-summary">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <h1 className="mb-5 text-lg font-bold text-ink">Stock Summary Report</h1>

      {/* KPI Summary */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-success/10">
              <ArrowDownToLine size={16} className="text-success" />
            </span>
            <p className="text-xs font-medium text-muted">Total Inbound</p>
          </div>
          <p className="mt-3 text-xl font-bold text-ink">{summary.totalIn.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</p>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <ArrowUpFromLine size={16} className="text-primary" />
            </span>
            <p className="text-xs font-medium text-muted">Total Outbound</p>
          </div>
          <p className="mt-3 text-xl font-bold text-ink">{summary.totalOut.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</p>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-accent/10">
              <Package size={16} className="text-accent" />
            </span>
            <p className="text-xs font-medium text-muted">Closing Stock</p>
          </div>
          <p className="mt-3 text-xl font-bold text-ink">{summary.closingStock.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</p>
        </article>
        <article className="rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-secondary/30">
              <TrendingDown size={16} className="text-deep" />
            </span>
            <p className="text-xs font-medium text-muted">Difference</p>
          </div>
          <p className="mt-3 text-xl font-bold text-ink">{summary.difference.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</p>
        </article>
      </div>

      {/* Filters */}
      <section className="mb-5 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-ink">Filters</h2>
          <p className="mt-0.5 text-xs text-muted">Filter by raw material, category, unit type, or date range.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
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
          <div className="min-w-[150px]">
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
          <div className="min-w-[150px]">
            <SearchableSelect
              label="Unit Type"
              value={unitType}
              options={UNIT_TYPE_OPTIONS}
              placeholder="Purchase Unit"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={setUnitType}
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
      </section>

      {/* Table */}
      <section className="rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-ink">Stock Summary</h2>
            <p className="mt-0.5 text-xs text-muted">
              {filteredRows.length} raw materials &middot; {fromRecord}–{toRecord} shown
            </p>
          </div>
          <ExportMenu
            onExportPage={() => showToast('Exported current page')}
            onExportAll={() => showToast('Exported all')}
            onExportPagePdf={() => showToast('Exported current page to PDF')}
            onExportAllPdf={() => showToast('Exported all to PDF')}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1400px] w-full text-left text-sm">
            <thead className="border-b border-line bg-page text-xs">
              <tr>
                <th className="whitespace-nowrap px-2.5 py-2.5 font-semibold text-muted">
                  Raw Material
                </th>
                <th className="whitespace-nowrap px-2.5 py-2.5 font-semibold text-muted">
                  Opening (A)
                </th>
                <HeaderWithInfo title="Purchase quantity in selected period">
                  Purchase (B)
                </HeaderWithInfo>
                <th className="whitespace-nowrap px-2.5 py-2.5 font-semibold text-muted">
                  Excess (C)
                </th>
                <HeaderWithInfo
                  title="Total inbound = Opening + Purchase + Excess"
                  highlight
                >
                  Total (i)
                </HeaderWithInfo>
                <th className="whitespace-nowrap px-2.5 py-2.5 font-semibold text-muted">
                  Consumed (D)
                </th>
                <th className="whitespace-nowrap px-2.5 py-2.5 font-semibold text-muted">
                  Wastage (E)
                </th>
                <th className="whitespace-nowrap px-2.5 py-2.5 font-semibold text-muted">
                  Normal Loss (F)
                </th>
                <HeaderWithInfo title="Transferred quantity">
                  Transfer (G)
                </HeaderWithInfo>
                <th className="whitespace-nowrap px-2.5 py-2.5 font-semibold text-muted">
                  Shortage (H)
                </th>
                <th className="whitespace-nowrap px-2.5 py-2.5 font-semibold text-muted">
                  Production (I)
                </th>
                <HeaderWithInfo
                  title="Total outbound = Consumed + Wastage + Normal Loss + Transfer + Shortage + Production"
                  highlight
                >
                  Total (i)
                </HeaderWithInfo>
                <HeaderWithInfo title="Closing stock for the period">
                  Closing Stock
                </HeaderWithInfo>
                <HeaderWithInfo title="Closing summary for the period">
                  Closing Summary
                </HeaderWithInfo>
                <th className="whitespace-nowrap px-2.5 py-2.5 font-semibold text-muted">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-line last:border-b-0 ${
                    index % 2 === 1 ? 'bg-page/60' : 'bg-card'
                  }`}
                >
                  <td className="whitespace-nowrap px-2.5 py-2.5 text-ink">
                    {row.rawMaterial}
                  </td>
                  <td className="px-2.5 py-2.5 text-ink">{row.opening}</td>
                  <td className="px-2.5 py-2.5 text-ink">{row.purchase}</td>
                  <td className="px-2.5 py-2.5 text-ink">{row.excess}</td>
                  <td className="bg-primary/5 px-2.5 py-2.5 text-ink">
                    {row.totalIn}
                  </td>
                  <td className="px-2.5 py-2.5 text-ink">{row.consumed}</td>
                  <td className="px-2.5 py-2.5 text-ink">{row.wastage}</td>
                  <td className="px-2.5 py-2.5 text-ink">{row.normalLoss}</td>
                  <td className="px-2.5 py-2.5 text-ink">{row.transfer}</td>
                  <td className="px-2.5 py-2.5 text-ink">{row.shortage}</td>
                  <td className="px-2.5 py-2.5 text-ink">{row.production}</td>
                  <td className="bg-primary/5 px-2.5 py-2.5 text-ink">
                    {row.totalOut}
                  </td>
                  <td className="px-2.5 py-2.5 text-ink">{row.closingStock}</td>
                  <td className="px-2.5 py-2.5 text-ink">{row.closingSummary}</td>
                  <td className="px-2.5 py-2.5 text-ink">{row.difference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-sm text-muted">
            Showing {fromRecord} to {toRecord} of {filteredRows.length} records
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
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
      </section>
    </InventoryPageShell>
  )
}
