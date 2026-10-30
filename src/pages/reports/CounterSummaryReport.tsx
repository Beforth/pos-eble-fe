import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import {
  ColumnsMenu,
  LoadState,
  ReportCard,
  ReportFilterBar,
  ReportShell,
  SearchField,
  StatGrid,
  StatTile,
} from '../../components/reports/ReportShell'
import { TD, TH, decimal, reportSubtitle } from '../../components/reports/reportStyles'
import { fetchReportApi, type ReportResult } from '../../services/reportService'
import { downloadCsv } from '../../utils/exportCsv'
import { formatINR } from '../../utils/format'
import { todayIso } from '../../utils/reportDates'
import { showToast } from '../../utils/toast'

function formatCell(value: string | number | undefined, type: string): string {
  if (value === undefined || value === '') return ''
  return type === 'money' ? decimal(value) : String(value)
}

export default function CounterSummaryReport() {
  const { encryptedOutletId } = useAuth()
  const [from, setFrom] = useState(todayIso)
  const [to, setTo] = useState(todayIso)
  const [search, setSearch] = useState('')
  const [data, setData] = useState<ReportResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!encryptedOutletId || !from || !to) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchReportApi(encryptedOutletId, 'counter-summary', { from, to })
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

  const columns = useMemo(
    () => (data?.columns ?? []).filter((col) => !hidden.has(col.key)),
    [data, hidden],
  )
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const all = data?.rows ?? []
    return q ? all.filter((row) => String(row.counter).toLowerCase().includes(q)) : all
  }, [data, search])
  const totals = data?.totals ?? {}
  const hasTotals = data != null && Object.keys(data.totals).length > 0
  // The payment columns carry keys `pay_0`, `pay_1`…: they feed the split card.
  const payments = (data?.columns ?? [])
    .filter((col) => col.key.startsWith('pay_'))
    .map((col) => ({
      label: col.label.replace(/ \(₹\)$/, ''),
      amount: Number(totals[col.key]) || 0,
    }))
  const topPayment = Math.max(0, ...payments.map((payment) => payment.amount))

  function toggleHidden(key: string) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function setRange(nextFrom: string, nextTo: string) {
    setFrom(nextFrom)
    setTo(nextTo)
  }

  function exportCsv() {
    if (rows.length === 0 || !data) {
      showToast('Nothing to export')
      return
    }
    const body = rows.map((row) => columns.map((col) => row[col.key] ?? ''))
    if (hasTotals) body.push(columns.map((col) => data.totals[col.key] ?? ''))
    downloadCsv(
      `counter-summary_${from}_${to}.csv`,
      columns.map((col) => col.label),
      body,
    )
  }

  return (
    <ReportShell
      title="Counter Summary"
      subtitle={reportSubtitle(
        from,
        to,
        data ? `${rows.length} counter${rows.length === 1 ? '' : 's'}` : undefined,
      )}
    >
      <ReportFilterBar from={from} to={to} onRange={setRange} onExport={exportCsv}>
        <SearchField value={search} onChange={setSearch} placeholder="Search counter" />
        <ColumnsMenu
          options={(data?.columns ?? [])
            .filter((col) => col.key !== 'counter')
            .map((col) => ({ key: col.key, label: col.label }))}
          hidden={hidden}
          onToggle={toggleHidden}
        />
      </ReportFilterBar>

      {data && rows.length > 0 ? (
        <>
          <StatGrid>
            <StatTile primary label="Total sales" value={formatINR(Number(totals.total) || 0, 2)} />
            <StatTile
              label="Success orders"
              value={Number(totals.success) || 0}
              hint={`${Number(totals.cancelled) || 0} cancelled`}
            />
            <StatTile
              label="Net amount"
              value={formatINR(Number(totals.net) || 0, 2)}
              hint={`Discount ${formatINR(Number(totals.discount) || 0, 2)}`}
            />
            <StatTile
              label="Not paid"
              value={formatINR(Number(totals.not_paid) || 0, 2)}
              hint={`Tax ${formatINR(Number(totals.tax) || 0, 2)}`}
            />
          </StatGrid>

          <ReportCard title="Collected by payment type">
            <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
              {payments.map((payment) => (
                <li key={payment.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-ink">{payment.label}</span>
                    <span className="tabular-nums text-ink">{formatINR(payment.amount, 2)}</span>
                  </div>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{
                        width: `${topPayment > 0 ? Math.min(100, (payment.amount / topPayment) * 100) : 0}%`,
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </ReportCard>
        </>
      ) : null}

      <ReportCard title="Counter-wise summary" flush>
        {loading && !data ? (
          <LoadState loading error="" />
        ) : error ? (
          <LoadState loading={false} error={error} />
        ) : rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">
            No sales found for this date range.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-primary/5">
                  {columns.map((col, index) => (
                    <th
                      key={col.key}
                      className={`${TH} ${col.type === 'text' ? 'text-left' : 'text-right'} ${
                        index === 0 ? 'sticky left-0 z-10 bg-[#fff1f2]' : ''
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="group border-t border-line hover:bg-page/60">
                    {columns.map((col, index) => (
                      <td
                        key={col.key}
                        className={`${TD} ${col.type === 'text' ? 'font-semibold' : 'text-right tabular-nums'} ${
                          index === 0 ? 'sticky left-0 z-10 bg-card group-hover:bg-page' : ''
                        } ${col.key === 'total' ? 'font-semibold' : ''}`}
                      >
                        {formatCell(row[col.key], col.type)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {hasTotals ? (
                <tfoot>
                  <tr className="border-t-2 border-primary/30 bg-primary/5 font-bold">
                    {columns.map((col, index) => (
                      <td
                        key={col.key}
                        className={`${TD} ${col.type === 'text' ? '' : 'text-right tabular-nums'} ${
                          index === 0 ? 'sticky left-0 z-10 bg-[#fff1f2]' : ''
                        }`}
                      >
                        {formatCell(totals[col.key], col.type)}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>
        )}
      </ReportCard>
    </ReportShell>
  )
}
