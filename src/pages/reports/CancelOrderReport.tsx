import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronLeft, Home } from 'lucide-react'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

const RESTAURANT_OPTIONS = [
  brand.shopName,
  'Rajubhai Express — Andheri',
  'Rajubhai Cafe — Borivali',
]

interface CancelDayRow {
  dateLabel: string
  dateKey: string
  qtyByRestaurant: Record<string, number>
  amountByRestaurant: Record<string, number>
}

const CANCEL_ROWS: CancelDayRow[] = [
  {
    dateLabel: '12 Aug 2026',
    dateKey: '2026-08-12',
    qtyByRestaurant: {
      [brand.shopName]: 0,
      'Rajubhai Express — Andheri': 0,
      'Rajubhai Cafe — Borivali': 0,
    },
    amountByRestaurant: {
      [brand.shopName]: 0,
      'Rajubhai Express — Andheri': 0,
      'Rajubhai Cafe — Borivali': 0,
    },
  },
]

function ExportMenu({
  onExport,
}: {
  onExport?: (mode: 'page' | 'all') => void
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
        <ul className="absolute right-0 z-40 mt-1.5 w-48 overflow-hidden rounded-lg border border-line bg-card py-1 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                onExport?.('page')
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
                onExport?.('all')
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

function formatAmount(value: number) {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function CancelOrderReport() {
  const navigate = useNavigate()
  const [fromDate, setFromDate] = useState('2026-08-12')
  const [toDate, setToDate] = useState('2026-08-12')
  const [restaurant, setRestaurant] = useState('')
  const [applied, setApplied] = useState({
    fromDate: '2026-08-12',
    toDate: '2026-08-12',
    restaurant: '',
  })
  const [toast, setToast] = useState<string | null>(null)

  const restaurantColumns = useMemo(() => {
    if (applied.restaurant) return [applied.restaurant]
    return [brand.shopName]
  }, [applied.restaurant])

  const rows = useMemo(() => {
    return CANCEL_ROWS.filter(
      (row) =>
        row.dateKey >= applied.fromDate && row.dateKey <= applied.toDate,
    )
  }, [applied.fromDate, applied.toDate])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setApplied({ fromDate, toDate, restaurant })
    showToast('Search applied')
  }

  function handleShowAll() {
    setFromDate('2026-08-12')
    setToDate('2026-08-12')
    setRestaurant('')
    setApplied({
      fromDate: '2026-08-12',
      toDate: '2026-08-12',
      restaurant: '',
    })
    showToast('Showing all records')
  }

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
          <span className="font-semibold text-primary">
            Cancel Order Report: All Restaurants
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
          <ExportMenu
            onExport={(mode) =>
              showToast(
                mode === 'page'
                  ? 'Exporting current page…'
                  : 'Exporting all records…',
              )
            }
          />
        </div>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="text-xs text-muted">
          From Date
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="mt-1 block h-9 min-w-[150px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <label className="text-xs text-muted">
          To Date
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="mt-1 block h-9 min-w-[150px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <div className="min-w-[200px]">
          <SearchableSelect
            value={restaurant}
            options={RESTAURANT_OPTIONS}
            placeholder="Choose Restaurant"
            searchPlaceholder="Search restaurant"
            includePlaceholderOption
            onChange={setRestaurant}
          />
        </div>
        <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
        <button
          type="button"
          onClick={handleShowAll}
          className="inline-flex h-9 items-center rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          Show All
        </button>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-base font-bold text-ink">
            Cancellation Report (Quantity)
          </h2>
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-page">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink">
                      Date
                    </th>
                    {restaurantColumns.map((name) => (
                      <th
                        key={name}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-ink"
                      >
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={1 + restaurantColumns.length}
                        className="px-4 py-10 text-center text-muted"
                      >
                        No Record Found
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={`qty-${row.dateKey}`}
                        className="border-b border-line last:border-b-0"
                      >
                        <td className="px-4 py-2.5 text-ink">{row.dateLabel}</td>
                        {restaurantColumns.map((name) => (
                          <td
                            key={name}
                            className="px-4 py-2.5 tabular-nums text-ink"
                          >
                            {row.qtyByRestaurant[name] ?? 0}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-bold text-ink">
            Cancellation Report (Amount) (₹)
          </h2>
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-page">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink">
                      Date
                    </th>
                    {restaurantColumns.map((name) => (
                      <th
                        key={name}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-ink"
                      >
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={1 + restaurantColumns.length}
                        className="px-4 py-10 text-center text-muted"
                      >
                        No Record Found
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={`amt-${row.dateKey}`}
                        className="border-b border-line last:border-b-0"
                      >
                        <td className="px-4 py-2.5 text-ink">{row.dateLabel}</td>
                        {restaurantColumns.map((name) => (
                          <td
                            key={name}
                            className="px-4 py-2.5 tabular-nums text-ink"
                          >
                            {formatAmount(row.amountByRestaurant[name] ?? 0)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </ReportsPageShell>
  )
}
