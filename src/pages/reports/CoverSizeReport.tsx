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
import { TD, TH, reportSubtitle } from '../../components/reports/reportStyles'
import { fetchReportApi, type ReportResult } from '../../services/reportService'
import { downloadCsv } from '../../utils/exportCsv'
import { isoOffset, todayIso } from '../../utils/reportDates'
import { showToast } from '../../utils/toast'

export default function CoverSizeReport() {
  const { encryptedOutletId } = useAuth()
  // A cover-size trend reads better over several days, so it opens on the last six.
  const [from, setFrom] = useState(() => isoOffset(-5))
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

  const rows = useMemo(() => {
    const q = search.trim()
    const all = data?.rows ?? []
    return q ? all.filter((row) => String(row.date).includes(q)) : all
  }, [data, search])
  const totals = data?.totals ?? {}
  const showOrders = !hidden.has('orders')
  const persons = Number(totals.persons) || 0
  const orders = Number(totals.orders) || 0
  const busiest = Math.max(0, ...rows.map((row) => Number(row.persons) || 0))

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
    const headers = ['Date', 'No. of Persons (Success Orders)', ...(showOrders ? ['Orders'] : [])]
    downloadCsv(
      `cover-size-report_${from}_${to}.csv`,
      headers,
      rows.map((row) => [row.date, row.persons, ...(showOrders ? [row.orders] : [])]),
    )
  }

  return (
    <ReportShell
      title="Cover Size Report"
      subtitle={reportSubtitle(from, to, data ? `${rows.length} day${rows.length === 1 ? '' : 's'}` : undefined)}
    >
      <ReportFilterBar from={from} to={to} onRange={setRange} onExport={exportCsv}>
        <SearchField value={search} onChange={setSearch} placeholder="Search date (2026-10-21)" />
        <ColumnsMenu
          options={[{ key: 'orders', label: 'Orders' }]}
          hidden={hidden}
          onToggle={toggleHidden}
        />
      </ReportFilterBar>

      {data && rows.length > 0 ? (
        <StatGrid>
          <StatTile primary label="Total persons" value={persons} hint="Success orders" />
          <StatTile label="Orders" value={orders} />
          <StatTile
            label="Avg persons per order"
            value={orders > 0 ? (persons / orders).toFixed(1) : '—'}
          />
          <StatTile label="Days" value={rows.length} />
        </StatGrid>
      ) : null}

      <ReportCard title="Persons served per day" flush>
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
                  <th className={TH}>Date</th>
                  <th className={`${TH} text-right`}>No. of Persons (Success Orders)</th>
                  {showOrders && <th className={`${TH} text-right`}>Orders</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const people = Number(row.persons) || 0
                  return (
                    <tr key={String(row.date)} className="border-t border-line hover:bg-page/60">
                      <td className={`${TD} font-medium`}>{row.date}</td>
                      <td className={`${TD} text-right`}>
                        <span className="inline-flex items-center justify-end gap-3">
                          <span className="h-1.5 w-28 overflow-hidden rounded-full bg-line">
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{
                                width: `${busiest > 0 ? Math.min(100, (people / busiest) * 100) : 0}%`,
                              }}
                            />
                          </span>
                          <span className="w-12 tabular-nums">{row.persons}</span>
                        </span>
                      </td>
                      {showOrders && (
                        <td className={`${TD} text-right tabular-nums`}>{row.orders}</td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary/30 bg-primary/5 font-bold">
                  <td className={TD}>Total</td>
                  <td className={`${TD} text-right tabular-nums`}>{persons}</td>
                  {showOrders && <td className={`${TD} text-right tabular-nums`}>{orders}</td>}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </ReportCard>
    </ReportShell>
  )
}
