import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Home } from 'lucide-react'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { OutlineButton } from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

const RESTAURANT_OPTIONS = [
  brand.shopName,
  'Rajubhai Express — Andheri',
  'Rajubhai Cafe — Borivali',
]

export default function LocalityWiseReport() {
  const navigate = useNavigate()
  const [fromDate, setFromDate] = useState('2026-08-12')
  const [toDate, setToDate] = useState('2026-08-12')
  const [restaurant, setRestaurant] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleExport() {
    showToast(
      restaurant
        ? `Exporting locality report for ${restaurant}…`
        : 'Exporting locality report for all restaurants…',
    )
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
            Locality Wise Report: All Restaurants
          </span>
        </nav>
      }
      activeItem="other-reports"
      actions={
        <button
          type="button"
          onClick={() => navigate('/reports/other-reports')}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ChevronLeft size={15} />
          Back
        </button>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
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
        <OutlineButton onClick={handleExport}>Export</OutlineButton>
      </div>
    </ReportsPageShell>
  )
}
