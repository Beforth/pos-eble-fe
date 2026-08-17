import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

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

function HelpText({ children }: { children: string }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-primary/90">{children}</p>
}

function MutedHelp({ children }: { children: string }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>
}

function SectionTitle({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="border-b border-line pb-3">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-muted">{description}</p>
      ) : null}
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
                <td className="px-3 py-2.5 text-ink">{row.name}</td>
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
        to
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

  const timeBifurcationHelp = useMemo(
    () =>
      'Add the time bifurcation to see the sales in various time categories. Ex. to see the sales of Breakfast (07 to 10:00), Lunch (11:00 to 15:00) and Dinner(18:00 to 24:00), create three sections along with their timings.',
    [],
  )

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
    <ReportsPageShell title="Outlet Configuration" activeItem="config-outlet">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        Configure outlet timings. Based on the same, Sales and other day end
        activities is going to calculate.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-10 p-5 sm:p-6">
          <section className="space-y-4">
            <SectionTitle title="Closing Timings" />
            <div className="grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-start sm:gap-4">
              <label className="text-sm font-medium text-ink sm:pt-2.5">
                Closing Hours
              </label>
              <div>
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
                <HelpText>
                  Provide outlet closing hours to define the auto closing of an
                  outlet. Based on this sales and day end activities will be
                  calculated. Based on the same sales and other notification to
                  the owner is being sent.
                </HelpText>
              </div>
            </div>

            <div className="space-y-3 sm:pl-[216px]">
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
          </section>

          <section className="space-y-4">
            <SectionTitle
              title="Customise Time Reports"
              description={timeBifurcationHelp}
            />
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
          </section>

          <section className="space-y-4">
            <SectionTitle
              title="Online Restaurant Timings"
              description={timeBifurcationHelp}
            />
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
          </section>

          <section className="space-y-4">
            <SectionTitle
              title="Other Information"
              description="This information is used to display timing related information on various places."
            />
            <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-start sm:gap-4">
              <label className="text-sm font-medium text-ink sm:pt-2.5">
                Delivery Hours :
              </label>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted">From</span>
                  <TimeSelect
                    value={deliveryFrom1}
                    onChange={setDeliveryFrom1}
                    ariaLabel="Delivery slot 1 from"
                  />
                  <span className="text-sm text-muted">To</span>
                  <TimeSelect
                    value={deliveryTo1}
                    onChange={setDeliveryTo1}
                    ariaLabel="Delivery slot 1 to"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted">From</span>
                  <TimeSelect
                    value={deliveryFrom2}
                    onChange={setDeliveryFrom2}
                    ariaLabel="Delivery slot 2 from"
                  />
                  <span className="text-sm text-muted">To</span>
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
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle
              title="Dashboard Chart Timing"
              description="Add the time bifurcation to see the total sales, discount and online sales on dashboard chart in various time categories. Ex. to see the sales of Breakfast (07 to 10:00), Lunch (11:00 to 15:00) and Dinner(18:00 to 24:00), create sections along with their timings."
            />
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
          </section>
        </div>

        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-line bg-card/95 px-5 py-4 backdrop-blur sm:px-6">
          <OutlineButton variant="gray" onClick={goBack}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </div>
    </ReportsPageShell>
  )
}
