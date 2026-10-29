import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Columns3,
  Download,
  Printer,
  Search,
} from 'lucide-react'
import { BillingHeader } from '../billing/BillingHeader'
import { useNewOrder } from '../../state/useNewOrder'
import { datePresets } from '../../utils/reportDates'

/** Page frame shared by the report screens: billing header, title strip, scrolling body. */
export function ReportShell({
  title,
  subtitle,
  backTo = '/reports',
  children,
}: {
  title: string
  subtitle?: string
  /** Where Back goes; `null` hides the button (pages reached from the billing menu). */
  backTo?: string | null
  children: ReactNode
}) {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card px-5 py-3">
        <div>
          <h1 className="text-lg font-bold text-ink">{title}</h1>
          {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
        </div>
        {backTo !== null ? (
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        ) : null}
      </div>

      {/* Children never shrink: the body scrolls instead of clipping a card. */}
      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5 [&>*]:shrink-0">
        {children}
      </main>
    </div>
  )
}

const OUTLINE_BUTTON =
  'inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary'

/** Quick ranges, From / To dates, Print and Export CSV in one bar. */
export function ReportFilterBar({
  from,
  to,
  onRange,
  onExport,
  children,
}: {
  from: string
  to: string
  onRange: (from: string, to: string) => void
  onExport: () => void
  /** Extra controls (search box, columns menu) shown before Print. */
  children?: ReactNode
}) {
  const presets = datePresets()
  return (
    <section
      aria-label="Report filters"
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-sm"
    >
      <div
        className="inline-flex overflow-x-auto rounded-xl border border-line bg-page p-1"
        role="group"
        aria-label="Date range"
      >
        {presets.map((preset) => {
          const active = from === preset.from && to === preset.to
          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={active}
              onClick={() => onRange(preset.from, preset.to)}
              className={`h-8 shrink-0 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors ${
                active ? 'bg-primary text-white shadow-sm' : 'text-ink hover:bg-card'
              }`}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <CalendarDays size={15} />
        <input
          type="date"
          value={from}
          max={to || undefined}
          onChange={(event) => onRange(event.target.value, to)}
          aria-label="From date"
          className="h-10 rounded-xl border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
        />
        <span>to</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => onRange(from, event.target.value)}
          aria-label="To date"
          className="h-10 rounded-xl border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
        />
      </label>

      {children}

      <div className="ml-auto flex items-center gap-2">
        <button type="button" onClick={() => window.print()} className={OUTLINE_BUTTON}>
          <Printer size={16} />
          Print
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
    </section>
  )
}

/** A headline number. `primary` tints it in the brand colour. */
export function StatTile({
  label,
  value,
  hint,
  primary,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  primary?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        primary ? 'border-primary/20 bg-primary/5' : 'border-line bg-card'
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold tabular-nums ${
          primary ? 'text-primary' : 'text-ink'
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Totals" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {children}
    </section>
  )
}

/** A titled white card; `flush` drops the body padding for full-bleed tables. */
export function ReportCard({
  title,
  aside,
  flush,
  children,
}: {
  title: string
  aside?: ReactNode
  flush?: boolean
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        {aside ? <div className="text-xs text-muted">{aside}</div> : null}
      </header>
      <div className={flush ? '' : 'p-4'}>{children}</div>
    </section>
  )
}

/** Label / value lines inside a card; `bold` marks the closing total line. */
export function PairList({
  rows,
}: {
  rows: { label: string; value: ReactNode; bold?: boolean }[]
}) {
  return (
    <dl className="divide-y divide-line text-sm">
      {rows.map((row) => (
        <div
          key={row.label}
          className={`flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0 ${
            row.bold ? 'font-bold text-ink' : 'text-ink'
          }`}
        >
          <dt className={row.bold ? '' : 'text-muted'}>{row.label}</dt>
          <dd className="tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function LoadState({
  loading,
  error,
}: {
  loading: boolean
  error: string
}): ReactNode {
  if (loading) return <p className="p-10 text-center text-sm text-muted">Loading…</p>
  if (error) return <p className="p-10 text-center text-sm text-danger">{error}</p>
  return null
}

/** Rounded search box for the filter bar. */
export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="relative w-56">
      <Search
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-xl border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
      />
    </div>
  )
}

/** "Columns" dropdown: a checkbox per column; `hidden` holds the keys switched off. */
export function ColumnsMenu({
  options,
  hidden,
  onToggle,
}: {
  options: { key: string; label: string }[]
  hidden: Set<string>
  onToggle: (key: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={OUTLINE_BUTTON}
      >
        <Columns3 size={16} />
        Columns
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-20 max-h-80 w-72 overflow-y-auto rounded-xl border border-line bg-card shadow-lg">
          {options.map((option) => (
            <label
              key={option.key}
              className="flex cursor-pointer items-center gap-2 border-b border-line px-4 py-3 text-sm text-ink last:border-b-0 hover:bg-page"
            >
              <input
                type="checkbox"
                checked={!hidden.has(option.key)}
                onChange={() => onToggle(option.key)}
                className="size-4 accent-primary"
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
