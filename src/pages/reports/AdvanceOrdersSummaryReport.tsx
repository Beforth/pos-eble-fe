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

interface GeneratedReport {
  id: string
  dateLabel: string
  downloadLabel: string
}

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`
}

export default function AdvanceOrdersSummaryReport() {
  const navigate = useNavigate()
  const [fromDate, setFromDate] = useState('2026-08-12')
  const [toDate, setToDate] = useState('2026-08-12')
  const [restaurant, setRestaurant] = useState('')
  const [reports, setReports] = useState<GeneratedReport[]>([])
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleExport() {
    const id = `adv-${Date.now()}`
    const label =
      fromDate === toDate
        ? formatDisplayDate(fromDate)
        : `${formatDisplayDate(fromDate)} - ${formatDisplayDate(toDate)}`

    setReports((prev) => [
      {
        id,
        dateLabel: label,
        downloadLabel: restaurant
          ? `${restaurant} · Advance Orders`
          : 'All Restaurants · Advance Orders',
      },
      ...prev,
    ])
    showToast('Report generated')
  }

  function handleClearAll() {
    setReports([])
    showToast('All reports cleared')
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
            Advance Orders Summary Report
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

      <div className="mb-4 flex flex-wrap items-end gap-3">
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
            placeholder="Choose restaurant"
            searchPlaceholder="Search restaurant"
            includePlaceholderOption
            onChange={setRestaurant}
          />
        </div>
        <OutlineButton onClick={handleExport}>Export</OutlineButton>
        <button
          type="button"
          onClick={handleClearAll}
          className="inline-flex h-9 items-center rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          Clear All Reports
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-page">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink">
                  Date
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-ink">
                  Download Link
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-14 text-center text-base font-semibold text-ink"
                  >
                    No Record Found
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="px-4 py-3 text-ink">{report.dateLabel}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          showToast(`Downloading ${report.downloadLabel}…`)
                        }
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {report.downloadLabel}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ReportsPageShell>
  )
}
