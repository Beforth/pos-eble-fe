import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import {
  LoadState,
  ReportCard,
  ReportFilterBar,
  ReportShell,
  StatGrid,
  StatTile,
} from '../../components/reports/ReportShell'
import { reportSubtitle } from '../../components/reports/reportStyles'
import {
  fetchEmployeeSummaryApi,
  type EmployeeSummaryResult,
} from '../../services/reportService'
import { downloadCsv } from '../../utils/exportCsv'
import { formatINR } from '../../utils/format'
import { todayIso } from '../../utils/reportDates'
import { showToast } from '../../utils/toast'

function money(value: string | number): string {
  const n = Number(value)
  return Number.isFinite(n) ? formatINR(n, 2) : String(value)
}

const COUNTS: {
  key: 'punched' | 'success' | 'cancelled' | 'discounted' | 'modified' | 'reprinted'
  label: string
}[] = [
  { key: 'punched', label: 'Orders Punched' },
  { key: 'success', label: 'Orders Success' },
  { key: 'cancelled', label: 'Orders Cancelled' },
  { key: 'discounted', label: 'Orders Discounted' },
  { key: 'modified', label: 'Orders Modified' },
  { key: 'reprinted', label: 'Orders Reprinted' },
]

export default function EmployeeSummaryReport() {
  const { encryptedOutletId, user } = useAuth()
  const [from, setFrom] = useState(todayIso)
  const [to, setTo] = useState(todayIso)
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

  function setRange(nextFrom: string, nextTo: string) {
    setFrom(nextFrom)
    setTo(nextTo)
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

  const billers = data?.billers ?? []
  const topTotal = Math.max(0, ...billers.map((biller) => Number(biller.total) || 0))

  return (
    <ReportShell
      title="Employee Report"
      subtitle={reportSubtitle(
        from,
        to,
        [user?.outlet, data ? `${billers.length} billing user${billers.length === 1 ? '' : 's'}` : '']
          .filter(Boolean)
          .join(' · ') || undefined,
      )}
    >
      <ReportFilterBar from={from} to={to} onRange={setRange} onExport={exportCsv} />

      {loading && !data ? (
        <LoadState loading error="" />
      ) : error ? (
        <LoadState loading={false} error={error} />
      ) : data && billers.length === 0 ? (
        <p className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-muted">
          No billing activity for this date range.
        </p>
      ) : data ? (
        <>
          <StatGrid>
            <StatTile primary label="Total collected" value={money(data.grand_total)} />
            <StatTile label="Billing users" value={billers.length} />
            <StatTile
              label="Orders punched"
              value={billers.reduce((sum, b) => sum + b.punched, 0)}
              hint={`${billers.reduce((sum, b) => sum + b.success, 0)} successful`}
            />
            <StatTile
              label="Cancelled"
              value={billers.reduce((sum, b) => sum + b.cancelled, 0)}
              hint={`${billers.reduce((sum, b) => sum + b.reprinted, 0)} reprinted`}
            />
          </StatGrid>

          <div className="grid gap-4 xl:grid-cols-2">
            {billers.map((biller) => (
              <ReportCard
                key={biller.name}
                title={biller.name}
                aside={<span className="font-semibold text-primary">{money(biller.total)}</span>}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <ul className="space-y-1.5 text-sm">
                    {COUNTS.map((count) => (
                      <li key={count.key} className="flex items-center justify-between gap-3">
                        <span className="text-muted">{count.label}</span>
                        <span className="rounded-md bg-page px-2 py-0.5 font-semibold tabular-nums text-ink">
                          {biller[count.key]}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Payments collected
                    </p>
                    {biller.payments.length === 0 ? (
                      <p className="text-sm text-muted">No payments collected</p>
                    ) : (
                      <ul className="space-y-1.5 text-sm">
                        {biller.payments.map((payment) => (
                          <li
                            key={payment.mode}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="text-ink">{payment.mode}</span>
                            <span className="tabular-nums text-ink">{money(payment.total)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-3 border-t border-line pt-2.5">
                      <div className="flex items-center justify-between text-sm font-bold text-ink">
                        <span>Total</span>
                        <span className="tabular-nums">{money(biller.total)}</span>
                      </div>
                      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{
                            width: `${topTotal > 0 ? Math.min(100, ((Number(biller.total) || 0) / topTotal) * 100) : 0}%`,
                          }}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </ReportCard>
            ))}
          </div>
        </>
      ) : null}
    </ReportShell>
  )
}
