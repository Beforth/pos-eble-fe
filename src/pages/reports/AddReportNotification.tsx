import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const REPORT_OPTIONS = [
  'Item Wise Report With Bill No.',
  'Day End Summary',
  'All Restaurant Sales Report',
  'Outlet-Item Wise Report (Row)',
  'Invoice Report: All Restaurants',
  'Pax Sales Report: Biller Wise',
  'Order Report: Sub-Order Wise',
  'Cancel Order Report: All Restaurants',
  'Online Order Report: All Restaurants',
  'Discounted Orders: All Restaurants (With Reason)',
]

const STATUS_OPTIONS = ['Active', 'Inactive']

function buildTimeOptions() {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 30]) {
      options.push(
        `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      )
    }
  }
  return options
}

function formatExampleDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function AddReportNotification() {
  const navigate = useNavigate()
  const timeOptions = useMemo(() => buildTimeOptions(), [])
  const [report, setReport] = useState(REPORT_OPTIONS[0])
  const [time, setTime] = useState('00:00')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('Active')
  const [errors, setErrors] = useState<{ email?: string }>({})
  const [toast, setToast] = useState<string | null>(null)

  const today = useMemo(() => new Date(2026, 7, 12), [])
  const tomorrow = useMemo(() => {
    const next = new Date(today)
    next.setDate(today.getDate() + 1)
    return next
  }, [today])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSave() {
    const nextErrors: { email?: string } = {}
    if (!email.trim()) {
      nextErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email'
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    showToast('Report notification saved')
    window.setTimeout(() => {
      navigate('/reports/report-notification')
    }, 700)
  }

  return (
    <ReportsPageShell
      title="Add Report Notification"
      activeItem="report-notification"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="rounded-xl border border-line bg-card p-5 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-5">
          <label className="block text-sm font-medium text-ink">
            Reports <span className="text-primary">*</span>
            <select
              value={report}
              onChange={(event) => setReport(event.target.value)}
              className="mt-1.5 block h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            >
              {REPORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-ink">
            Time (In 24 hours) <span className="text-primary">*</span>
            <select
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-1.5 block h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            >
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted">
              Ex. you will get email on next day(
              {formatExampleDate(tomorrow)} {time}) for today(
              {formatExampleDate(today)}) sales.
            </p>
          </label>

          <label className="block text-sm font-medium text-ink">
            Email <span className="text-primary">*</span>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (errors.email) setErrors({})
              }}
              placeholder="Enter email"
              className={`mt-1.5 block h-10 w-full rounded-md border bg-card px-3 text-sm text-ink outline-none focus:border-primary ${
                errors.email ? 'border-primary' : 'border-line'
              }`}
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-primary">{errors.email}</p>
            ) : null}
          </label>

          <label className="block text-sm font-medium text-ink">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1.5 block h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <OutlineButton
              variant="gray"
              onClick={() => navigate('/reports/report-notification')}
            >
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
          </div>
        </div>
      </div>
    </ReportsPageShell>
  )
}
