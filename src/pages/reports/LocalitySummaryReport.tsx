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

export default function LocalitySummaryReport() {
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
    fetchReportApi(encryptedOutletId, 'locality-wise', { from, to })
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

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const all = data?.rows ?? []
    return q ? all.filter((row) => String(row.locality).toLowerCase().includes(q)) : all
  }, [data, search])
  const totals = data?.totals ?? {}
  const show = (key: string) => !hidden.has(key)
  const topTotal = Math.max(0, ...rows.map((row) => Number(row.total) || 0))
  const topLocality = rows.reduce<(typeof rows)[number] | null>(
    (best, row) => (!best || Number(row.total) > Number(best.total) ? row : best),
    null,
  )

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
    if (rows.length === 0) {
      showToast('Nothing to export')
      return
    }
    const headers = [
      'Locality',
      ...(show('orders') ? ['Orders'] : []),
      ...(show('total') ? ['Total (₹)'] : []),
    ]
    downloadCsv(
      `locality-wise-summary_${from}_${to}.csv`,
      headers,
      rows.map((row) => [
        row.locality,
        ...(show('orders') ? [row.orders] : []),
        ...(show('total') ? [row.total] : []),
      ]),
    )
  }

  return (
    <ReportShell
      title="Locality Wise Summary"
      subtitle={reportSubtitle(
        from,
        to,
        data ? `${rows.length} localit${rows.length === 1 ? 'y' : 'ies'}` : undefined,
      )}
    >
      <ReportFilterBar from={from} to={to} onRange={setRange} onExport={exportCsv}>
        <SearchField value={search} onChange={setSearch} placeholder="Search locality" />
        <ColumnsMenu
          options={[
            { key: 'orders', label: 'Orders' },
            { key: 'total', label: 'Total (₹)' },
          ]}
          hidden={hidden}
          onToggle={toggleHidden}
        />
      </ReportFilterBar>

      {data && rows.length > 0 ? (
        <StatGrid>
          <StatTile primary label="Total sales" value={formatINR(Number(totals.total) || 0, 2)} />
          <StatTile label="Orders" value={Number(totals.orders) || 0} />
          <StatTile label="Localities" value={rows.length} />
          <StatTile
            label="Top locality"
            value={topLocality ? String(topLocality.locality) : '—'}
            hint={topLocality ? formatINR(Number(topLocality.total) || 0, 2) : undefined}
          />
        </StatGrid>
      ) : null}

      <ReportCard title="Sales by locality" flush>
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
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-primary/5 text-left">
                  <th className={TH}>Locality</th>
                  {show('orders') && <th className={`${TH} text-right`}>Orders</th>}
                  {show('total') && <th className={`${TH} text-right`}>Total (₹)</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.locality)} className="border-t border-line hover:bg-page/60">
                    <td className={TD}>
                      <span className="block font-medium">{row.locality}</span>
                      {show('total') && topTotal > 0 ? (
                        <span className="mt-1.5 block h-1 w-40 max-w-full overflow-hidden rounded-full bg-line">
                          <span
                            className="block h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.min(100, ((Number(row.total) || 0) / topTotal) * 100)}%`,
                            }}
                          />
                        </span>
                      ) : null}
                    </td>
                    {show('orders') && (
                      <td className={`${TD} text-right tabular-nums`}>{row.orders}</td>
                    )}
                    {show('total') && (
                      <td className={`${TD} text-right font-medium tabular-nums`}>
                        {decimal(row.total)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary/30 bg-primary/5 font-bold">
                  <td className={TD}>Total</td>
                  {show('orders') && (
                    <td className={`${TD} text-right tabular-nums`}>{totals.orders ?? 0}</td>
                  )}
                  {show('total') && (
                    <td className={`${TD} text-right tabular-nums`}>{decimal(totals.total)}</td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </ReportCard>
    </ReportShell>
  )
}
