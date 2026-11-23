import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/exportCsv'
import { ChevronDown, FileText } from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { OutlineButton } from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { useInventoryMasters } from '../../state/InventoryMastersContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_REPORT_PERMISSION,
  getConsumptionSummaryReportApi,
  type ConsumptionSummaryReport as ConsumptionData,
} from '../../services/inventoryService'

interface CategoryOption {
  id: string
  name: string
}

const PAGE_SIZE = 10

const todayIso = () => new Date().toISOString().slice(0, 10)

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
  options,
  selectedIds,
  onChange,
}: {
  options: CategoryOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const CATEGORY_OPTIONS = options
  const CATEGORY_IDS = options.map((option) => option.id)
  const CATEGORY_IDS_WITHOUT_ALL = CATEGORY_IDS.filter((id) => id !== 'all')
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
  const { encryptedOutletId, hasPermission } = useAuth()
  const canRead = hasPermission(INV_REPORT_PERMISSION)
  const { categories: masterCategories, loadMasters } = useInventoryMasters()
  const [rawMaterial, setRawMaterial] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [fromDate, setFromDate] = useState(todayIso)
  const [toDate, setToDate] = useState(todayIso)
  const [applied, setApplied] = useState({
    query: '',
    categories: [] as string[],
    fromDate: todayIso(),
    toDate: todayIso(),
  })
  const [data, setData] = useState<ConsumptionData>({ days: [], rows: [] })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    void loadMasters()
  }, [loadMasters])

  const categoryOptions = useMemo<CategoryOption[]>(
    () => [
      { id: 'all', name: 'All' },
      { id: 'no-category', name: 'No Category' },
      ...masterCategories.map((row) => ({ id: row.id, name: row.name })),
    ],
    [masterCategories],
  )

  const load = useCallback(async () => {
    if (!encryptedOutletId || !canRead) return
    setLoading(true)
    try {
      setData(
        await getConsumptionSummaryReportApi(encryptedOutletId, {
          search: applied.query.trim() || undefined,
          categoryIds: applied.categories.includes('all')
            ? undefined
            : applied.categories,
          dateFrom: applied.fromDate,
          dateTo: applied.toDate,
        }),
      )
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : 'Unable to load consumption summary',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, canRead, applied])

  useEffect(() => {
    void load()
  }, [load])

  const filteredRows = data.rows
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

  function exportRows(rows: ConsumptionData['rows'], suffix: 'page' | 'all') {
    const date = new Date().toISOString().slice(0, 10)
    downloadCsv(
      `consumption-summary-${suffix}-${date}.csv`,
      [
        'Raw Material',
        'Unit',
        ...data.days.map(formatDayLabel),
        'Avg Purchase Price (₹)',
        'Total Consumption Qty',
        'Total Consumption Cost (₹)',
      ],
      rows.map((row) => [
        row.raw_material_name,
        row.unit_name,
        ...row.days.map((day) => `${day.qty} / ${day.cost}`),
        row.avg_price,
        row.total_qty,
        row.total_cost,
      ]),
    )
    showToast(`Exported ${rows.length} rows`)
  }

  function handleSearch() {
    setApplied({ query: rawMaterial, categories, fromDate, toDate })
    setPage(1)
  }

  function handleClear() {
    setRawMaterial('')
    setCategories([])
    setFromDate(todayIso())
    setToDate(todayIso())
    setApplied({
      query: '',
      categories: [],
      fromDate: todayIso(),
      toDate: todayIso(),
    })
    setPage(1)
  }

  return (
    <InventoryPageShell activeItem="other-reports">

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">Consumption Summary</h1>
        <ExportMenu
          onExportPage={() => exportRows(pageRows, 'page')}
          onExportAll={() => exportRows(filteredRows, 'all')}
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
            options={categoryOptions}
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
                {data.days.map((day) => (
                  <th key={day} className="min-w-[180px] px-3 py-2.5">
                    {formatDayLabel(day)}
                  </th>
                ))}
                <th className="px-3 py-2.5">Total Consumption Qty</th>
                <th className="px-3 py-2.5">Total Consumption Cost (₹)</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={data.days.length + 3}
                    className="px-3 py-16 text-center text-sm text-muted"
                  >
                    {loading ? 'Loading report…' : 'No consumption found'}
                  </td>
                </tr>
              ) : null}
              {pageRows.map((row, index) => (
                <tr
                  key={row.raw_material_id}
                  className={`border-b border-line last:border-b-0 ${
                    index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                  }`}
                >
                  <td className="whitespace-nowrap px-3 py-2 align-middle text-ink">
                    {`${row.raw_material_name} [${row.unit_name}]`}
                  </td>
                  {row.days.map((day, dayIndex) => (
                    <td
                      key={data.days[dayIndex]}
                      className="px-3 py-2 align-middle"
                    >
                      <MetricBars
                        consumption={day.qty}
                        avgPurchasePrice={row.avg_price}
                        consumptionCost={day.cost}
                      />
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-3 py-2 align-middle text-ink">
                    {`${row.total_qty} / ${row.unit_name}`}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-middle text-ink">
                    {row.total_cost}
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
