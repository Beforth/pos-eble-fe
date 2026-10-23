import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Download, Inbox } from 'lucide-react'

import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  BILLING_REPORTS,
  BILLING_REPORTS_PATH,
} from '../../config/billingReports'
import {
  fetchReportApi,
  type ReportCell,
  type ReportResult,
  type ReportSlug,
} from '../../services/reportService'
import { downloadCsv } from '../../utils/exportCsv'
import { showToast } from '../../utils/toast'
import { useNewOrder } from '../../state/useNewOrder'

/** Local calendar day as YYYY-MM-DD (the server reads it in the outlet's zone). */
function todayIso(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatCell(value: ReportCell | undefined, type: string): string {
  if (value === undefined || value === '') return ''
  if (type === 'money') {
    const n = Number(value)
    return Number.isFinite(n)
      ? `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : String(value)
  }
  return String(value)
}

export default function BillingReports() {
  const { slug: slugParam } = useParams()
  const report = BILLING_REPORTS.find((r) => r.slug === slugParam)
  if (!report) {
    return (
      <Navigate
        to={`${BILLING_REPORTS_PATH}/${BILLING_REPORTS[0].slug}`}
        replace
      />
    )
  }
  return <ReportPage slug={report.slug} label={report.label} />
}

function ReportPage({ slug, label }: { slug: ReportSlug; label: string }) {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [from, setFrom] = useState(todayIso)
  const [to, setTo] = useState(todayIso)
  const [data, setData] = useState<ReportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!encryptedOutletId || !from || !to) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchReportApi(encryptedOutletId, slug, { from, to })
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
  }, [encryptedOutletId, slug, from, to])

  const shown = data && data.slug === slug ? data : null
  const hasTotals = useMemo(
    () => shown != null && Object.keys(shown.totals).length > 0,
    [shown],
  )

  function exportCsv() {
    if (!shown || shown.rows.length === 0) {
      showToast('Nothing to export')
      return
    }
    const body = shown.rows.map((row) =>
      shown.columns.map((col) => row[col.key] ?? ''),
    )
    if (hasTotals) {
      body.push(shown.columns.map((col) => shown.totals[col.key] ?? ''))
    }
    downloadCsv(
      `${slug}_${from}_${to}.csv`,
      shown.columns.map((col) => col.label),
      body,
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

      <main className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <h1 className="mr-auto text-lg font-bold text-ink">{label}</h1>
          <label className="text-xs font-medium text-muted">
            From
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-1 block h-9 rounded-lg border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
            />
          </label>
          <label className="text-xs font-medium text-muted">
            To
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
              className="mt-1 block h-9 rounded-lg border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              setFrom(todayIso())
              setTo(todayIso())
            }}
            className="h-9 rounded-lg border border-line bg-card px-3 text-sm font-semibold text-ink hover:bg-page"
          >
            Today
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-line bg-card">
          {loading && !shown ? (
            <p className="flex h-full min-h-[320px] items-center justify-center p-6 text-sm text-muted">
              Loading…
            </p>
          ) : error ? (
            <p className="flex h-full min-h-[320px] items-center justify-center p-6 text-center text-sm text-danger">
              {error}
            </p>
          ) : shown && shown.rows.length === 0 ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-page text-muted">
                <Inbox size={26} />
              </span>
              <p className="text-base font-semibold text-ink">No data found</p>
              <p className="text-sm text-muted">
                There is nothing to show for this date range. Try a different one.
              </p>
            </div>
          ) : shown ? (
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  {shown.columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-2.5 ${col.type === 'text' ? '' : 'text-right'}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.rows.map((row, index) => (
                  <tr key={index} className="hover:bg-page/60">
                    {shown.columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-3 py-2 text-ink ${col.type === 'text' ? '' : 'text-right tabular-nums'}`}
                      >
                        {formatCell(row[col.key], col.type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {hasTotals ? (
                <tfoot className="sticky bottom-0 border-t-2 border-line bg-page font-bold">
                  <tr>
                    {shown.columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-3 py-2.5 text-ink ${col.type === 'text' ? '' : 'text-right tabular-nums'}`}
                      >
                        {formatCell(shown.totals[col.key], col.type)}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              ) : null}
            </table>
          ) : null}
        </div>

        {shown?.truncated ? (
          <p className="mt-2 text-xs text-muted">
            Showing the first 5,000 rows. Narrow the date range to see the rest.
          </p>
        ) : null}
      </main>
    </div>
  )
}
