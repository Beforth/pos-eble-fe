import { useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { BarChart3, Bike, Clock, Globe, Timer, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'

interface TimeSlot {
  id: string
  name: string
  from: string
  to: string
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0'),
)
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0'),
)

function buildTimeOptions(includeMidnightEnd = false) {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of ['00', '15', '30', '45']) {
      options.push(`${String(hour).padStart(2, '0')}:${minute}`)
    }
  }
  if (includeMidnightEnd) options.push('24:00')
  return options
}

const TIME_OPTIONS = buildTimeOptions(true)

const DEFAULT_MEAL_SLOTS: TimeSlot[] = [
  { id: 'meal-1', name: 'Breakfast', from: '08:00', to: '11:00' },
  { id: 'meal-2', name: 'Lunch', from: '11:00', to: '17:00' },
  { id: 'meal-3', name: 'Dinner', from: '17:00', to: '24:00' },
]

const selectClass =
  'h-10 rounded-md border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary'
const inputClass =
  'h-10 w-full min-w-[140px] rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function MutedHelp({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>
  )
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <section className="relative z-0 mb-4 rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] [&:has([aria-expanded=true])]:z-30">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {description ? (
            <p className="mt-0.5 max-w-3xl text-xs leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="border-t border-line px-4 py-4">{children}</div>
      ) : null}
    </section>
  )
}

function FormRow({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-start sm:gap-4">
      <label className="text-sm font-medium text-ink sm:pt-2.5">
        {label} {required ? <span className="text-primary">*</span> : null}
      </label>
      <div className="min-w-0 space-y-3">{children}</div>
    </div>
  )
}

function TimeSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${selectClass} w-[100px]`}
    >
      {TIME_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function TimeSlotTable({
  rows,
  onRemove,
}: {
  rows: TimeSlot[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-page/80">
            <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">
              Name
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">
              From
            </th>
            <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted">
              To
            </th>
            <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-3 py-6 text-center text-sm text-muted"
              >
                No timings added yet
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="px-3 py-2.5 font-medium text-ink">
                  {row.name}
                </td>
                <td className="px-3 py-2.5 text-ink">{row.from}</td>
                <td className="px-3 py-2.5 text-ink">{row.to}</td>
                <td className="px-3 py-2.5 text-right">
                  <button
                    type="button"
                    aria-label={`Delete ${row.name}`}
                    onClick={() => onRemove(row.id)}
                    className="inline-flex size-8 items-center justify-center rounded-md text-muted hover:bg-primary/10 hover:text-primary"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function TimeSlotAdder({
  name,
  from,
  to,
  onNameChange,
  onFromChange,
  onToChange,
  onAdd,
}: {
  name: string
  from: string
  to: string
  onNameChange: (value: string) => void
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onAdd: () => void
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-[160px] flex-1 text-sm font-medium text-ink">
        Name
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className={`${inputClass} mt-1.5`}
          placeholder="e.g. Breakfast"
        />
      </label>
      <label className="text-sm font-medium text-ink">
        From
        <div className="mt-1.5">
          <TimeSelect
            value={from}
            onChange={onFromChange}
            ariaLabel="From time"
          />
        </div>
      </label>
      <label className="text-sm font-medium text-ink">
        To
        <div className="mt-1.5">
          <TimeSelect value={to} onChange={onToChange} ariaLabel="To time" />
        </div>
      </label>
      <PrimaryButton onClick={onAdd}>Add</PrimaryButton>
    </div>
  )
}

function newSlotId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function OutletTimings() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const [closingHour, setClosingHour] = useState('00')
  const [closingMinute, setClosingMinute] = useState('00')
  const [extendClosingToast, setExtendClosingToast] = useState(true)
  const [open24x7, setOpen24x7] = useState(false)

  const [reportDraft, setReportDraft] = useState({
    name: '',
    from: '00:00',
    to: '00:00',
  })
  const [reportSlots, setReportSlots] = useState<TimeSlot[]>(DEFAULT_MEAL_SLOTS)

  const [allDays, setAllDays] = useState(true)
  const [onlineDraft, setOnlineDraft] = useState({
    name: '',
    from: '00:00',
    to: '00:00',
  })
  const [onlineSlots, setOnlineSlots] = useState<TimeSlot[]>(DEFAULT_MEAL_SLOTS)

  const [deliveryFrom1, setDeliveryFrom1] = useState('00:00')
  const [deliveryTo1, setDeliveryTo1] = useState('00:00')
  const [deliveryFrom2, setDeliveryFrom2] = useState('00:00')
  const [deliveryTo2, setDeliveryTo2] = useState('00:00')

  const [dashboardDraft, setDashboardDraft] = useState({
    name: '',
    from: '00:00',
    to: '00:00',
  })
  const [dashboardSlots, setDashboardSlots] = useState<TimeSlot[]>([])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function addSlot(
    draft: { name: string; from: string; to: string },
    setDraft: (next: { name: string; from: string; to: string }) => void,
    setSlots: Dispatch<SetStateAction<TimeSlot[]>>,
    prefix: string,
  ) {
    if (!draft.name.trim()) {
      showToast('Please enter a name')
      return
    }
    setSlots((prev) => [
      ...prev,
      {
        id: newSlotId(prefix),
        name: draft.name.trim(),
        from: draft.from,
        to: draft.to,
      },
    ])
    setDraft({ name: '', from: '00:00', to: '00:00' })
  }

  function handleSave() {
    showToast('Outlet timings saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <span
            role="button"
            tabIndex={0}
            onClick={() => navigate('/management/configuration/outlet')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate('/management/configuration/outlet')
            }}
            className="cursor-pointer text-primary hover:underline"
          >
            Outlet Configuration
          </span>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">Outlet Timings</span>
        </span>
      }
      activeItem="config-outlet"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        Configure outlet timings. Based on the same, Sales and other day end
        activities is going to calculate.
      </p>

      <SectionCard
        icon={<Clock size={16} />}
        title="Closing Timings"
        description="Define when the outlet auto-closes each day."
      >
        <FormRow label="Closing Hours">
          <>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Closing hour"
                value={closingHour}
                onChange={(event) => setClosingHour(event.target.value)}
                disabled={open24x7}
                className={`${selectClass} w-[72px] disabled:cursor-not-allowed disabled:bg-page`}
              >
                {HOUR_OPTIONS.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              <select
                aria-label="Closing minute"
                value={closingMinute}
                onChange={(event) => setClosingMinute(event.target.value)}
                disabled={open24x7}
                className={`${selectClass} w-[72px] disabled:cursor-not-allowed disabled:bg-page`}
              >
                {MINUTE_OPTIONS.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
            <MutedHelp>
              Provide outlet closing hours to define the auto closing of an
              outlet. Based on this sales and day end activities will be
              calculated, and sales notifications will be sent to the owner.
            </MutedHelp>
            <div className="space-y-3 pt-1">
              <label className="flex cursor-pointer items-start gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={extendClosingToast}
                  onChange={(event) =>
                    setExtendClosingToast(event.target.checked)
                  }
                  className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
                />
                Display the notification (toaster) for temporary Extend Closing
                Hours
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={open24x7}
                  onChange={(event) => setOpen24x7(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
                />
                Is the outlet open round-the-clock (24*7)?
              </label>
            </div>
          </>
        </FormRow>
      </SectionCard>

      <SectionCard
        icon={<Timer size={16} />}
        title="Customise Time Reports"
        description="Add time bifurcation to see sales in various time categories. Ex. Breakfast (07:00 to 10:00), Lunch (11:00 to 15:00) and Dinner (18:00 to 24:00)."
      >
        <div className="space-y-4">
          <TimeSlotAdder
            name={reportDraft.name}
            from={reportDraft.from}
            to={reportDraft.to}
            onNameChange={(name) =>
              setReportDraft((prev) => ({ ...prev, name }))
            }
            onFromChange={(from) =>
              setReportDraft((prev) => ({ ...prev, from }))
            }
            onToChange={(to) => setReportDraft((prev) => ({ ...prev, to }))}
            onAdd={() =>
              addSlot(reportDraft, setReportDraft, setReportSlots, 'report')
            }
          />
          <TimeSlotTable
            rows={reportSlots}
            onRemove={(id) =>
              setReportSlots((prev) => prev.filter((row) => row.id !== id))
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={<Globe size={16} />}
        title="Online Restaurant Timings"
        description="Time bifurcation applied when your outlet receives orders through online channels."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-ink">
              Days <span className="text-primary">*</span>
            </span>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={allDays}
                onChange={(event) => setAllDays(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
              />
              All Days
            </label>
          </div>
          <TimeSlotAdder
            name={onlineDraft.name}
            from={onlineDraft.from}
            to={onlineDraft.to}
            onNameChange={(name) =>
              setOnlineDraft((prev) => ({ ...prev, name }))
            }
            onFromChange={(from) =>
              setOnlineDraft((prev) => ({ ...prev, from }))
            }
            onToChange={(to) => setOnlineDraft((prev) => ({ ...prev, to }))}
            onAdd={() =>
              addSlot(onlineDraft, setOnlineDraft, setOnlineSlots, 'online')
            }
          />
          <TimeSlotTable
            rows={onlineSlots}
            onRemove={(id) =>
              setOnlineSlots((prev) => prev.filter((row) => row.id !== id))
            }
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={<Bike size={16} />}
        title="Other Information"
        description="Used to display timing related information on various places."
      >
        <FormRow label="Delivery Hours">
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-9 text-sm text-muted">From</span>
              <TimeSelect
                value={deliveryFrom1}
                onChange={setDeliveryFrom1}
                ariaLabel="Delivery slot 1 from"
              />
              <span className="w-6 text-sm text-muted">To</span>
              <TimeSelect
                value={deliveryTo1}
                onChange={setDeliveryTo1}
                ariaLabel="Delivery slot 1 to"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-9 text-sm text-muted">From</span>
              <TimeSelect
                value={deliveryFrom2}
                onChange={setDeliveryFrom2}
                ariaLabel="Delivery slot 2 from"
              />
              <span className="w-6 text-sm text-muted">To</span>
              <TimeSelect
                value={deliveryTo2}
                onChange={setDeliveryTo2}
                ariaLabel="Delivery slot 2 to"
              />
            </div>
            <MutedHelp>
              Set the delivery hours (in two time slots) to display it on
              various places.
            </MutedHelp>
          </>
        </FormRow>
      </SectionCard>

      <SectionCard
        icon={<BarChart3 size={16} />}
        title="Dashboard Chart Timing"
        description="Add time bifurcation to see total sales, discount and online sales on the dashboard chart in various time categories."
      >
        <div className="space-y-4">
          <TimeSlotAdder
            name={dashboardDraft.name}
            from={dashboardDraft.from}
            to={dashboardDraft.to}
            onNameChange={(name) =>
              setDashboardDraft((prev) => ({ ...prev, name }))
            }
            onFromChange={(from) =>
              setDashboardDraft((prev) => ({ ...prev, from }))
            }
            onToChange={(to) =>
              setDashboardDraft((prev) => ({ ...prev, to }))
            }
            onAdd={() =>
              addSlot(
                dashboardDraft,
                setDashboardDraft,
                setDashboardSlots,
                'dashboard',
              )
            }
          />
          <TimeSlotTable
            rows={dashboardSlots}
            onRemove={(id) =>
              setDashboardSlots((prev) =>
                prev.filter((row) => row.id !== id),
              )
            }
          />
        </div>
      </SectionCard>

      <div className="sticky bottom-0 z-20 -mx-1 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Cancel
        </button>
        <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
      </div>
    </ReportsPageShell>
  )
}
