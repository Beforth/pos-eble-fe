import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Mail } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-ink">
      {children}
      {required ? <span className="text-primary"> *</span> : null}
    </label>
  )
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children?: ReactNode
}) {
  return (
    <section className="relative z-0 mb-4 rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] [&:has([aria-expanded=true])]:z-30">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      {children ? (
        <div className="border-t border-line px-4 py-4">{children}</div>
      ) : null}
    </section>
  )
}

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

const selectClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

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
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/reports/report-notification')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/reports/report-notification')
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Report Notification
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">
            Add Report Notification
          </span>
        </span>
      }
      activeItem="report-notification"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <SectionCard icon={<Bell size={16} />} title="Notification Settings">
        <div className="space-y-4">
          <div>
            <SearchableSelect
              label="Report"
              required
              value={report}
              options={REPORT_OPTIONS}
              placeholder="Select a report"
              searchPlaceholder="Search reports..."
              compact
              dropdownPlacement="auto"
              onChange={setReport}
            />
          </div>

          <div>
            <FieldLabel required>Time (24-hour)</FieldLabel>
            <select
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className={selectClass}
            >
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-muted">
              You will receive the email on{' '}
              <span className="font-medium text-ink">
                {formatExampleDate(tomorrow)} at {time}
              </span>{' '}
              for{' '}
              <span className="font-medium text-ink">
                {formatExampleDate(today)}
              </span>{' '}
              sales data.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={<Mail size={16} />} title="Recipient">
        <div className="space-y-4">
          <div>
            <FieldLabel required>Email Address</FieldLabel>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (errors.email) setErrors({})
              }}
              placeholder="Enter email address"
              className={`${selectClass} ${errors.email ? 'border-primary' : ''}`}
            />
            {errors.email ? (
              <p className="mt-1 text-xs text-primary">{errors.email}</p>
            ) : null}
          </div>

          <div>
            <FieldLabel>Status</FieldLabel>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={selectClass}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={() => navigate('/reports/report-notification')}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave}>Save Notification</PrimaryButton>
      </div>
    </ReportsPageShell>
  )
}
