import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronLeft, Columns3, Download, Printer, Search } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { fetchReportApi, type ReportResult } from '../../services/reportService'
import { useNewOrder } from '../../state/useNewOrder'
import { downloadCsv } from '../../utils/exportCsv'
import { showToast } from '../../utils/toast'

/** Local calendar day as YYYY-MM-DD, `offset` days from today. */
function dayIso(offset = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function displayDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}-${m}-${y}` : iso
}

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
  'inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary'

export default function SalesSummaryReport() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [from, setFrom] = useState(() => dayIso())
  const [to, setTo] = useState(() => dayIso())
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

  function pickDay(offset: number) {
    setFrom(dayIso(offset))
    setTo(dayIso(offset))
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3">
        <h1 className="text-lg font-bold text-ink">Sales Report</h1>
        <button
          type="button"
          onClick={() => navigate('/reports')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      </div>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-56">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, payment"
              className="h-10 w-full rounded-lg border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
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
              Configure Column
              <ChevronDown
                size={14}
                className={`transition-transform ${columnsOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {columnsOpen && (
              <div className="absolute left-0 top-12 z-20 max-h-80 w-64 overflow-y-auto rounded-lg border border-line bg-card shadow-lg">
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

          <label className="flex items-center gap-2 text-sm text-muted">
            From
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
              className="h-10 rounded-lg border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            To
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
              className="h-10 rounded-lg border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
            />
          </label>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => pickDay(-1)} className={BUTTON_CLASS}>
              Yesterday Sales
            </button>
            <button type="button" onClick={() => pickDay(0)} className={BUTTON_CLASS}>
              Today Sales
            </button>
            <button type="button" onClick={() => window.print()} className={BUTTON_CLASS}>
              <Printer size={16} />
              Print
            </button>
            <button type="button" onClick={exportCsv} className={BUTTON_CLASS}>
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-line bg-card shadow-sm">
          <p className="bg-primary/5 px-4 py-3 text-sm text-muted">
            Sales Report : From {displayDate(from)} to {displayDate(to)}
          </p>
          {loading && !data ? (
            <p className="p-10 text-center text-sm text-muted">Loading…</p>
          ) : error ? (
            <p className="p-10 text-center text-sm text-danger">{error}</p>
          ) : rows.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted">
              No sales found for this date range.
            </p>
          ) : (
            <table className="w-full min-w-[1000px] border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-page text-ink">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`whitespace-nowrap px-4 py-4 font-medium ${col.type === 'text' ? 'text-left' : 'text-right'}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hasTotals && data && (
                  <tr className="bg-page font-bold text-ink">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-5 ${col.type === 'text' ? '' : 'text-right tabular-nums'}`}
                      >
                        {formatCell(data.totals[col.key], col.type)}
                      </td>
                    ))}
                  </tr>
                )}
                {rows.map((row, index) => (
                  <tr key={index} className="border-t border-line hover:bg-page/60">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`whitespace-nowrap px-4 py-5 text-ink ${col.type === 'text' ? '' : 'text-right tabular-nums'}`}
                      >
                        {formatCell(row[col.key], col.type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
