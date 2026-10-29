import { useEffect, useMemo, useRef, useState } from 'react'
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
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { fetchReportApi, type ReportResult } from '../../services/reportService'
import { useNewOrder } from '../../state/useNewOrder'
import { downloadCsv } from '../../utils/exportCsv'
import { formatINR } from '../../utils/format'
import { datePresets, displayDate, todayIso } from '../../utils/reportDates'
import { showToast } from '../../utils/toast'

function formatCell(value: string | number | undefined, type: string): string {
  if (value === undefined || value === '') return ''
  if (type === 'money') {
    const n = Number(value)
    return Number.isFinite(n)
      ? n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : String(value)
  }
  return String(value)
}

const BUTTON_CLASS =
  'inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary'

export default function SalesSummaryReport() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [from, setFrom] = useState(todayIso)
  const [to, setTo] = useState(todayIso)
  const [search, setSearch] = useState('')
  const [data, setData] = useState<ReportResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [columnsOpen, setColumnsOpen] = useState(false)
  const columnsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!encryptedOutletId || !from || !to) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchReportApi(encryptedOutletId, 'sales-report', { from, to })
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setData(null)
        setError(err instanceof Error ? err.message : 'Could not load the report')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, from, to])

  useEffect(() => {
    if (!columnsOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (!columnsRef.current?.contains(event.target as Node)) setColumnsOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [columnsOpen])

  const columns = useMemo(
    () => (data?.columns ?? []).filter((col) => !hidden.has(col.key)),
    [data, hidden],
  )
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const all = data?.rows ?? []
    if (!q) return all
    return all.filter((row) =>
      ['order_no', 'payment', 'type', 'area'].some((key) =>
        String(row[key] ?? '').toLowerCase().includes(q),
      ),
    )
  }, [data, search])
  const hasTotals = data != null && Object.keys(data.totals).length > 0

  function toggleColumn(key: string) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function exportCsv() {
    if (rows.length === 0) {
      showToast('Nothing to export')
      return
    }
    const body = rows.map((row) => columns.map((col) => row[col.key] ?? ''))
    if (hasTotals && data) body.unshift(columns.map((col) => data.totals[col.key] ?? ''))
    downloadCsv(
      `sales-report_${from}_${to}.csv`,
      columns.map((col) => col.label),
      body,
    )
  }

  const presets = datePresets()
  const orderCount = rows.length
  const salesTotal = Number(data?.totals.total) || 0
  const averageBill = orderCount > 0 ? salesTotal / orderCount : 0

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
          <h1 className="text-lg font-bold text-ink">Sales Report</h1>
          <p className="text-xs text-muted">
            {displayDate(from)} – {displayDate(to)}
            {data ? ` · ${orderCount} bill${orderCount === 1 ? '' : 's'}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/reports')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      </div>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5">
        <section
          aria-label="Report filters"
          className="flex shrink-0 flex-wrap items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-sm"
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
                  onClick={() => {
                    setFrom(preset.from)
                    setTo(preset.to)
                  }}
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
              onChange={(event) => setFrom(event.target.value)}
              aria-label="From date"
              className="h-10 rounded-xl border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
            />
            <span>to</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
              aria-label="To date"
              className="h-10 rounded-xl border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
            />
          </label>

          <div className="relative w-56">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, payment"
              aria-label="Search order or payment"
              className="h-10 w-full rounded-xl border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
          </div>

          <div ref={columnsRef} className="relative">
            <button
              type="button"
              onClick={() => setColumnsOpen((open) => !open)}
              aria-expanded={columnsOpen}
              className={BUTTON_CLASS}
            >
              <Columns3 size={16} />
              Columns
              <ChevronDown
                size={14}
                className={`transition-transform ${columnsOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {columnsOpen && (
              <div className="absolute left-0 top-12 z-20 max-h-80 w-64 overflow-y-auto rounded-xl border border-line bg-card shadow-lg">
                {(data?.columns ?? [])
                  .filter((col) => col.key !== 'order_no')
                  .map((col) => (
                    <label
                      key={col.key}
                      className="flex cursor-pointer items-center gap-2 border-b border-line px-4 py-3 text-sm text-ink last:border-b-0 hover:bg-page"
                    >
                      <input
                        type="checkbox"
                        checked={!hidden.has(col.key)}
                        onChange={() => toggleColumn(col.key)}
                        className="size-4 accent-primary"
                      />
                      {col.label}
                    </label>
                  ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => window.print()} className={BUTTON_CLASS}>
              <Printer size={16} />
              Print
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </section>

        {hasTotals && data ? (
          <section aria-label="Totals" className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Total sales</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                {formatINR(salesTotal, 2)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Bills</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
                {orderCount}
                <span className="text-sm font-medium text-muted">
                  {' '}
                  · avg {formatINR(averageBill, 2)}
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Tax collected</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
                {formatINR(Number(data.totals.tax) || 0, 2)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Discounts</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-ink">
                {formatINR(Number(data.totals.discount) || 0, 2)}
              </p>
            </div>
          </section>
        ) : null}

        <section className="shrink-0 overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          {loading && !data ? (
            <p className="p-10 text-center text-sm text-muted">Loading…</p>
          ) : error ? (
            <p className="p-10 text-center text-sm text-danger">{error}</p>
          ) : rows.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted">
              No sales found for this date range.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse text-sm">
                <thead>
                  <tr className="bg-primary/5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={`whitespace-nowrap px-4 py-3 ${col.type === 'text' ? 'text-left' : 'text-right'}`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={index} className="border-t border-line hover:bg-page/60">
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`whitespace-nowrap px-4 py-3.5 text-ink ${
                            col.type === 'text' ? '' : 'text-right tabular-nums'
                          }`}
                        >
                          {col.key === 'order_no' ? (
                            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                              #{formatCell(row[col.key], col.type)}
                            </span>
                          ) : col.key === 'payment' ? (
                            <span className="rounded-md bg-page px-2 py-0.5 text-xs font-medium text-ink">
                              {formatCell(row[col.key], col.type)}
                            </span>
                          ) : col.key === 'total' ? (
                            <span className="font-semibold">{formatCell(row[col.key], col.type)}</span>
                          ) : (
                            formatCell(row[col.key], col.type)
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                {hasTotals && data ? (
                  <tfoot>
                    <tr className="border-t-2 border-primary/30 bg-primary/5 font-bold text-ink">
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`whitespace-nowrap px-4 py-3.5 ${
                            col.type === 'text' ? '' : 'text-right tabular-nums'
                          }`}
                        >
                          {formatCell(data.totals[col.key], col.type)}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                ) : null}
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
