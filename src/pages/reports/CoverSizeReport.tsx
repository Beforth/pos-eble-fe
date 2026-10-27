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

const BUTTON_CLASS =
  'inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary'

export default function CoverSizeReport() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [from, setFrom] = useState(() => dayIso(-5))
  const [to, setTo] = useState(() => dayIso())
  const [search, setSearch] = useState('')
  const [data, setData] = useState<ReportResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hideOrders, setHideOrders] = useState(false)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const columnsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!encryptedOutletId || !from || !to) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchReportApi(encryptedOutletId, 'cover-size', { from, to })
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

  const rows = useMemo(() => {
    const q = search.trim()
    const all = data?.rows ?? []
    return q ? all.filter((row) => String(row.date).includes(q)) : all
  }, [data, search])
  const totals = data?.totals ?? {}

  function exportCsv() {
    if (rows.length === 0) {
      showToast('Nothing to export')
      return
    }
    const headers = ['Date', 'No. of Persons (Success Orders)', ...(hideOrders ? [] : ['Orders'])]
    downloadCsv(
      `cover-size-report_${from}_${to}.csv`,
      headers,
      rows.map((row) => [row.date, row.persons, ...(hideOrders ? [] : [row.orders])]),
    )
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
        <h1 className="text-lg font-bold text-ink">Cover Size Report</h1>
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
              placeholder="Search date (2026-10-21)"
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
              <div className="absolute left-0 top-12 z-20 w-64 rounded-lg border border-line bg-card shadow-lg">
                <label className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm text-ink hover:bg-page">
                  <input
                    type="checkbox"
                    checked={!hideOrders}
                    onChange={() => setHideOrders((hidden) => !hidden)}
                    className="size-4 accent-primary"
                  />
                  Orders
                </label>
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

          <div className="ml-auto flex items-center gap-3">
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
            Cover Size Report : From {displayDate(from)} to {displayDate(to)}
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
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-page text-ink">
                  <th className="px-4 py-4 text-left font-medium">Date</th>
                  <th className="px-4 py-4 text-right font-medium">
                    No. of Persons (Success Orders)
                  </th>
                  {!hideOrders && <th className="px-4 py-4 text-right font-medium">Orders</th>}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-page font-bold text-ink">
                  <td className="border border-line px-4 py-4">Total</td>
                  <td className="border border-line px-4 py-4 text-right tabular-nums">
                    {totals.persons ?? 0}
                  </td>
                  {!hideOrders && (
                    <td className="border border-line px-4 py-4 text-right tabular-nums">
                      {totals.orders ?? 0}
                    </td>
                  )}
                </tr>
                {rows.map((row) => (
                  <tr key={String(row.date)} className="hover:bg-page/60">
                    <td className="border border-line px-4 py-4 text-ink">{row.date}</td>
                    <td className="border border-line px-4 py-4 text-right tabular-nums text-ink">
                      {row.persons}
                    </td>
                    {!hideOrders && (
                      <td className="border border-line px-4 py-4 text-right tabular-nums text-ink">
                        {row.orders}
                      </td>
                    )}
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
