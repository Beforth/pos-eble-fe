import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Download, Printer } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { fetchTipSummaryApi, type TipSummaryResult } from '../../services/reportService'
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

function num(value: string | number): string {
  const n = Number(value)
  return Number.isFinite(n)
    ? n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(value)
}

const BUTTON_CLASS =
  'inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary'

function TipTable({
  title,
  label,
  rows,
}: {
  title: string
  label: string
  rows: { name: string; amount: string }[]
}) {
  return (
    <section>
      <h2 className="px-3 pb-2 pt-4 text-sm font-bold text-ink">{title}</h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-page text-muted">
            <th className="border border-line px-3 py-3.5 text-left font-medium">{label}</th>
            <th className="w-1/2 border border-line px-3 py-3.5 text-left font-medium">
              Amount (₹)
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2} className="border border-line px-3 py-4 text-muted">
                No tips recorded
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.name}>
                <td className="border border-line px-3 py-4 text-ink">{row.name}</td>
                <td className="border border-line px-3 py-4 tabular-nums text-ink">
                  {num(row.amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  )
}

export default function TipSummaryReport() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [from, setFrom] = useState(() => dayIso())
  const [to, setTo] = useState(() => dayIso())
  const [data, setData] = useState<TipSummaryResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!encryptedOutletId || !from || !to) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchTipSummaryApi(encryptedOutletId, { from, to })
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

  function pickDay(offset: number) {
    setFrom(dayIso(offset))
    setTo(dayIso(offset))
  }

  function exportCsv() {
    if (!data) {
      showToast('Nothing to export')
      return
    }
    downloadCsv(`tip-summary_${from}_${to}.csv`, ['Section', 'Name', 'Amount'], [
      ['Total Tip', '', data.total_tip],
      ...data.employees.map((row) => ['Employee Wise Tip', row.employee, row.amount]),
      ...data.tables.map((row) => ['Table Wise Tip', row.table, row.amount]),
    ])
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
        <h1 className="text-lg font-bold text-ink">Tip Summary</h1>
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
              Yesterday
            </button>
            <button type="button" onClick={() => pickDay(0)} className={BUTTON_CLASS}>
              Today
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

        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-line bg-card pb-4 shadow-sm">
          <p className="bg-primary/5 px-4 py-3 text-sm text-muted">
            Tip Summary : From {displayDate(from)} to {displayDate(to)}
          </p>
          {loading && !data ? (
            <p className="p-10 text-center text-sm text-muted">Loading…</p>
          ) : error ? (
            <p className="p-10 text-center text-sm text-danger">{error}</p>
          ) : data ? (
            <>
              <p className="bg-page px-4 py-3.5 text-sm text-ink">
                Total Tip: ₹ {Number(data.total_tip) === 0 ? '0' : num(data.total_tip)}
              </p>
              <TipTable
                title="Employee Wise Tip"
                label="Employee"
                rows={data.employees.map((row) => ({ name: row.employee, amount: row.amount }))}
              />
              <TipTable
                title="Table Wise Tip"
                label="Table"
                rows={data.tables.map((row) => ({ name: row.table, amount: row.amount }))}
              />
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}
