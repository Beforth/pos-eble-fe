import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronLeft, Home, Printer } from 'lucide-react'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import {
  OUTLET_ITEM_RESTAURANT_OPTIONS,
  OUTLET_ITEM_WISE_COLUMNS,
  OUTLET_ITEM_WISE_ROWS,
  summarizeOutletItemWise,
  type OutletItemWiseColumnKey,
  type OutletItemWiseRow,
} from '../../mocks/outletItemWiseData'

function formatAmount(value: number) {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function ColumnsMenu({
  visible,
  onToggle,
}: {
  visible: Record<OutletItemWiseColumnKey, boolean>
  onToggle: (key: OutletItemWiseColumnKey) => void
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
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-primary bg-card px-3 text-sm font-medium text-primary hover:bg-primary/5"
      >
        Columns
        <ChevronDown size={14} />
      </button>
      {open ? (
        <ul className="absolute left-0 z-40 mt-1.5 max-h-72 w-56 overflow-y-auto rounded-lg border border-line bg-card py-1 shadow-lg">
          {OUTLET_ITEM_WISE_COLUMNS.map((column) => (
            <li key={column.key}>
              <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-page">
                <input
                  type="checkbox"
                  checked={visible[column.key]}
                  disabled={column.key === 'item'}
                  onChange={() => onToggle(column.key)}
                  className="accent-primary"
                />
                <span className="min-w-0 truncate">{column.label}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function cellValue(row: OutletItemWiseRow, key: OutletItemWiseColumnKey) {
  switch (key) {
    case 'taxable':
    case 'restaurant':
    case 'category':
    case 'item':
      return row[key]
    case 'qty':
      return formatAmount(row.qty)
    default:
      return formatAmount(row[key])
  }
}

function summaryCell(
  stats: Record<string, number> | null,
  key: OutletItemWiseColumnKey,
) {
  if (!stats) return '—'
  if (
    key === 'taxable' ||
    key === 'restaurant' ||
    key === 'category' ||
    key === 'item'
  ) {
    return ''
  }
  return formatAmount(stats[key] ?? 0)
}

export default function OutletItemWiseReport() {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState('2026-08-12')
  const [endDate, setEndDate] = useState('2026-08-12')
  const [category, setCategory] = useState('')
  const [item, setItem] = useState('')
  const [restaurant, setRestaurant] = useState('')
  const [applied, setApplied] = useState({
    category: '',
    item: '',
    restaurant: '',
  })
  const [toast, setToast] = useState<string | null>(null)
  const [visible, setVisible] = useState<
    Record<OutletItemWiseColumnKey, boolean>
  >(() =>
    Object.fromEntries(
      OUTLET_ITEM_WISE_COLUMNS.map((column) => [column.key, true]),
    ) as Record<OutletItemWiseColumnKey, boolean>,
  )

  const columns = useMemo(
    () => OUTLET_ITEM_WISE_COLUMNS.filter((column) => visible[column.key]),
    [visible],
  )

  const rows = useMemo(() => {
    return OUTLET_ITEM_WISE_ROWS.filter((row) => {
      const categoryOk =
        !applied.category.trim() ||
        row.category.toLowerCase().includes(applied.category.trim().toLowerCase())
      const itemOk =
        !applied.item.trim() ||
        row.item.toLowerCase().includes(applied.item.trim().toLowerCase())
      const restaurantOk =
        !applied.restaurant || row.restaurant === applied.restaurant
      return categoryOk && itemOk && restaurantOk
    })
  }, [applied])

  const summary = useMemo(() => summarizeOutletItemWise(rows), [rows])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setApplied({ category, item, restaurant })
    showToast('Report updated')
  }

  function toggleColumn(key: OutletItemWiseColumnKey) {
    if (key === 'item') return
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const summaryRows = [
    { label: 'Total', stats: summary.total },
    { label: 'Min.', stats: summary.min },
    { label: 'Max.', stats: summary.max },
    { label: 'Avg.', stats: summary.avg },
  ]

  return (
    <ReportsPageShell
      title={
        <nav className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-muted">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-primary hover:underline"
            aria-label="Home"
          >
            <Home size={15} />
          </Link>
          <span>/</span>
          <Link
            to="/reports/other-reports"
            className="text-primary hover:underline"
          >
            Reports
          </Link>
          <span>/</span>
          <span className="font-semibold text-ink">
            Outlet-Item Wise Report (Row)
          </span>
        </nav>
      }
      activeItem="other-reports"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/reports/other-reports')}
            className="inline-flex h-9 items-center gap-1 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <ChevronLeft size={15} />
            Back
          </button>
          <button
            type="button"
            onClick={() => showToast('Time Wise view coming soon')}
            className="inline-flex h-9 items-center rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            Time Wise
          </button>
        </div>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-3">
        <label className="text-xs text-muted">
          Order Date
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-9 rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
            />
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-9 rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
        </label>

        <label className="text-xs text-muted">
          Category
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Category"
            className="mt-1 block h-9 min-w-[140px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
          />
        </label>

        <label className="text-xs text-muted">
          Item
          <input
            value={item}
            onChange={(event) => setItem(event.target.value)}
            placeholder="Item"
            className="mt-1 block h-9 min-w-[140px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
          />
        </label>

        <div className="min-w-[220px] flex-1">
          <SearchableSelect
            label="Restaurants"
            value={restaurant}
            options={OUTLET_ITEM_RESTAURANT_OPTIONS}
            placeholder="Choose Restaurant"
            searchPlaceholder="Search restaurant"
            includePlaceholderOption
            onChange={setRestaurant}
          />
        </div>

        <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <ColumnsMenu visible={visible} onToggle={toggleColumn} />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('Exporting Excel…')}
            className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Excel
          </button>
          <button
            type="button"
            onClick={() => {
              window.print()
              showToast('Print dialog opened')
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-3 text-sm font-semibold text-white hover:bg-ink/90"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-page">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-ink ${
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-line bg-[#fff8e8] text-ink"
                >
                  {columns.map((column, index) => (
                    <td
                      key={column.key}
                      className={`whitespace-nowrap px-3 py-2 tabular-nums ${
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {index === 0
                        ? row.label
                        : summaryCell(row.stats, column.key)}
                    </td>
                  ))}
                </tr>
              ))}

              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-10 text-center text-muted"
                  >
                    No item sales found for the selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`border-b border-line ${
                      index % 2 === 1 ? 'bg-page/40' : 'bg-card'
                    }`}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`whitespace-nowrap px-3 py-2.5 text-ink tabular-nums ${
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {cellValue(row, column.key)}
                      </td>
                    ))}
                  </tr>
                ))
              )}

              {rows.length > 0 && summary.total ? (
                <tr className="border-t border-line bg-page font-semibold text-ink">
                  {columns.map((column, index) => (
                    <td
                      key={column.key}
                      className={`whitespace-nowrap px-3 py-2.5 tabular-nums ${
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {index === 0
                        ? 'Sub Total'
                        : summaryCell(summary.total, column.key)}
                    </td>
                  ))}
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-2.5 text-xs text-muted">
          Showing {rows.length === 0 ? 0 : 1} to {rows.length} of {rows.length}{' '}
          entries
        </div>
      </div>
    </ReportsPageShell>
  )
}
