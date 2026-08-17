import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Home } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

const RECORD_TYPE_OPTIONS = [
  'Latest current days records',
  'Last 7 days records',
  'Last 30 days records',
  'Custom date range records',
]

export default function OnlineOrderReport() {
  const navigate = useNavigate()
  const [recordType, setRecordType] = useState(RECORD_TYPE_OPTIONS[0])
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
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
            Online Order Report: All Restaurants
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
          Record Type
          <select
            value={recordType}
            onChange={(event) => setRecordType(event.target.value)}
            className="mt-1 block h-9 min-w-[240px] max-w-full rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
          >
            {RECORD_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <OutlineButton onClick={() => showToast(`Exporting ${recordType}…`)}>
          Export
        </OutlineButton>
      </div>
    </ReportsPageShell>
  )
}
