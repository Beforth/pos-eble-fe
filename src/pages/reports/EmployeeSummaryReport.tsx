import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Download, Printer } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  fetchEmployeeSummaryApi,
  type EmployeeSummaryResult,
} from '../../services/reportService'
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

const COUNTS: { key: 'punched' | 'success' | 'cancelled' | 'discounted' | 'modified' | 'reprinted'; label: string }[] = [
  { key: 'punched', label: 'Orders Punched' },
  { key: 'success', label: 'Orders Success' },
  { key: 'cancelled', label: 'Orders Cancelled' },
  { key: 'discounted', label: 'Orders Discounted' },
  { key: 'modified', label: 'Orders Modified' },
  { key: 'reprinted', label: 'Orders Reprinted' },
]

export default function EmployeeSummaryReport() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId, user } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [from, setFrom] = useState(() => dayIso())
  const [to, setTo] = useState(() => dayIso())
  const [data, setData] = useState<EmployeeSummaryResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!encryptedOutletId || !from || !to) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchEmployeeSummaryApi(encryptedOutletId, { from, to })
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
    if (!data || data.billers.length === 0) {
      showToast('Nothing to export')
      return
    }
    const rows: (string | number)[][] = []
    for (const biller of data.billers) {
      for (const count of COUNTS) rows.push([biller.name, count.label, biller[count.key]])
      for (const payment of biller.payments) rows.push([biller.name, payment.mode, payment.total])
      rows.push([biller.name, 'Total', biller.total])
    }
    downloadCsv(`employee-report_${from}_${to}.csv`, ['Billing User', 'Label', 'Value'], rows)
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
        <h1 className="text-lg font-bold text-ink">Employee Report</h1>
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

        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-line bg-card shadow-sm">
          <p className="border-b border-line px-4 py-4 text-center text-sm font-bold text-ink">
            {user?.outlet}
          </p>
          <p className="bg-page px-4 py-3 text-sm text-ink">
            <span className="font-bold">Employee Report</span> : {displayDate(from)} to{' '}
            {displayDate(to)}
          </p>
          <h2 className="px-3 pb-2 pt-4 text-sm font-bold text-ink">Biller Report</h2>

          {loading && !data ? (
            <p className="p-10 text-center text-sm text-muted">Loading…</p>
          ) : error ? (
            <p className="p-10 text-center text-sm text-danger">{error}</p>
          ) : data && data.billers.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted">
              No billing activity for this date range.
            </p>
          ) : data ? (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-page text-ink">
                  <th className="w-1/4 border border-line px-3 py-3.5 text-left font-semibold">
                    Billing User
                  </th>
                  <th className="border border-line px-3 py-3.5 text-left font-semibold">
                    Payment Type
                  </th>
                  <th className="border border-line px-3 py-3.5 text-right font-semibold">
                    Total (₹)
                  </th>
                </tr>
              </thead>
              {data.billers.map((biller) => (
                <tbody key={biller.name}>
                  <tr>
                    <td colSpan={3} className="border border-line px-3 py-4 font-bold text-ink">
                      {biller.name}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-line p-3 align-top">
                      <ul className="divide-y divide-line rounded bg-page">
                        {COUNTS.map((count) => (
                          <li key={count.key} className="px-4 py-3.5 text-ink">
                            {count.label}: {biller[count.key]}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td colSpan={2} className="border border-line p-0 align-top">
                      <table className="w-full border-collapse">
                        <tbody>
                          {biller.payments.length === 0 ? (
                            <tr>
                              <td className="px-3 py-4 text-muted">No payments collected</td>
                            </tr>
                          ) : (
                            biller.payments.map((payment) => (
                              <tr key={payment.mode} className="border-b border-line last:border-b-0">
                                <td className="px-3 py-4 text-ink">{payment.mode}</td>
                                <td className="w-1/3 border-l border-line px-3 py-4 text-right tabular-nums text-ink">
                                  {num(payment.total)}
                                </td>
                              </tr>
                            ))
                          )}
                          <tr className="border-t border-line bg-page font-bold text-ink">
                            <td className="px-3 py-4">Total</td>
                            <td className="w-1/3 border-l border-line px-3 py-4 text-right tabular-nums">
                              {num(biller.total)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              ))}
            </table>
          ) : null}
        </div>
      </main>
    </div>
  )
}
