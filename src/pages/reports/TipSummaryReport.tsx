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
import { fetchTipSummaryApi, type TipSummaryResult } from '../../services/reportService'
import { downloadCsv } from '../../utils/exportCsv'
import { formatINR } from '../../utils/format'
import { todayIso } from '../../utils/reportDates'
import { showToast } from '../../utils/toast'

function money(value: string | number): string {
  const n = Number(value)
  return Number.isFinite(n) ? formatINR(n, 2) : String(value)
}

/** Name / amount lines, each with a bar sized against the biggest tip in the list. */
function TipList({ rows }: { rows: { name: string; amount: string }[] }) {
  if (rows.length === 0) {
    return <p className="py-2 text-center text-sm text-muted">No tips recorded</p>
  }
  const top = Math.max(0, ...rows.map((row) => Number(row.amount) || 0))
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.name}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">{row.name}</span>
            <span className="tabular-nums text-ink">{money(row.amount)}</span>
          </div>
          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line">
            <span
              className="block h-full rounded-full bg-primary"
              style={{
                width: `${top > 0 ? Math.min(100, ((Number(row.amount) || 0) / top) * 100) : 0}%`,
              }}
            />
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function TipSummaryReport() {
  const { encryptedOutletId } = useAuth()
  const [from, setFrom] = useState(todayIso)
  const [to, setTo] = useState(todayIso)
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

  function setRange(nextFrom: string, nextTo: string) {
    setFrom(nextFrom)
    setTo(nextTo)
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

  const topEmployee = data?.employees.reduce<{ employee: string; amount: string } | null>(
    (best, row) => (!best || Number(row.amount) > Number(best.amount) ? row : best),
    null,
  )

  return (
    <ReportShell title="Tip Summary" subtitle={reportSubtitle(from, to)}>
      <ReportFilterBar from={from} to={to} onRange={setRange} onExport={exportCsv} />

      {loading && !data ? (
        <LoadState loading error="" />
      ) : error ? (
        <LoadState loading={false} error={error} />
      ) : data ? (
        <>
          <StatGrid>
            <StatTile primary label="Total tip" value={money(data.total_tip)} />
            <StatTile label="Employees tipped" value={data.employees.length} />
            <StatTile label="Tables / counters" value={data.tables.length} />
            <StatTile
              label="Top earner"
              value={topEmployee ? topEmployee.employee : '—'}
              hint={topEmployee ? money(topEmployee.amount) : undefined}
            />
          </StatGrid>

          <div className="grid gap-4 lg:grid-cols-2">
            <ReportCard title="Employee Wise Tip">
              <TipList
                rows={data.employees.map((row) => ({ name: row.employee, amount: row.amount }))}
              />
            </ReportCard>
            <ReportCard title="Table Wise Tip">
              <TipList rows={data.tables.map((row) => ({ name: row.table, amount: row.amount }))} />
            </ReportCard>
          </div>
        </>
      ) : null}
    </ReportShell>
  )
}
