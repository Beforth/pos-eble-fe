import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import {
  LoadState,
  PairList,
  ReportCard,
  ReportFilterBar,
  ReportShell,
  StatGrid,
  StatTile,
} from '../../components/reports/ReportShell'
import { TD, TH, reportSubtitle } from '../../components/reports/reportStyles'
import {
  fetchOrderSummaryApi,
  type OrderSummaryResult,
} from '../../services/reportService'
import { downloadCsv } from '../../utils/exportCsv'
import { formatINR } from '../../utils/format'
import { todayIso } from '../../utils/reportDates'
import { showToast } from '../../utils/toast'

function money(value: string | number): string {
  const n = Number(value)
  return Number.isFinite(n) ? formatINR(n, 2) : String(value)
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-6 text-center text-sm text-muted">
        Records not available
      </td>
    </tr>
  )
}

export default function OrderSummaryReport() {
  const { encryptedOutletId, user } = useAuth()
  const [from, setFrom] = useState(todayIso)
  const [to, setTo] = useState(todayIso)
  const [data, setData] = useState<OrderSummaryResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!encryptedOutletId || !from || !to) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchOrderSummaryApi(encryptedOutletId, { from, to })
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
    const rows: (string | number)[][] = []
    const add = (section: string, ...cells: (string | number)[]) =>
      rows.push([section, ...cells])
    data.status.forEach((r) => add('Order Status', r.status, r.my_amount, r.total, r.orders))
    add('Order Status', 'Total', data.status_total.my_amount, data.status_total.total, data.status_total.orders)
    data.success.lines.forEach((l) => add('Success Orders', l.label, l.amount))
    add('Cancelled Orders', 'Count', data.cancelled.count)
    add('Cancelled Orders', 'Amount', data.cancelled.amount)
    add('Performance Indicator', 'Average Per Bill', data.performance.avg_per_bill)
    add('Performance Indicator', 'Average Discount Per Order', data.performance.avg_discount_per_order)
    data.order_types.forEach((r) => add('Order Type', r.type, r.count, r.total, r.net))
    data.payments.forEach((r) => add('Payment Mode', r.mode, r.total))
    data.online.rows.forEach((r) => add('Online Orders', r.source, r.my_amount, r.total, r.orders))
    downloadCsv(`order-report_${from}_${to}.csv`, ['Section', 'Label', 'Value 1', 'Value 2', 'Value 3'], rows)
  }

  const grandTotal = data?.success.lines.find((line) => line.label === 'Grand Total')?.amount
  const paymentsMax = Math.max(0, ...(data?.payments ?? []).map((row) => Number(row.total) || 0))

  return (
    <ReportShell
      title="Order Report"
      subtitle={reportSubtitle(from, to, user?.outlet || undefined)}
    >
      <ReportFilterBar from={from} to={to} onRange={setRange} onExport={exportCsv} />

      {loading && !data ? (
        <LoadState loading error="" />
      ) : error ? (
        <LoadState loading={false} error={error} />
      ) : data ? (
        <>
          <StatGrid>
            <StatTile
              primary
              label="Grand total"
              value={grandTotal !== undefined ? money(grandTotal) : '—'}
              hint={`${data.success.orders} successful order${data.success.orders === 1 ? '' : 's'}`}
            />
            <StatTile
              label="Average per bill"
              value={money(data.performance.avg_per_bill)}
              hint={`Avg discount ${money(data.performance.avg_discount_per_order)}`}
            />
            <StatTile
              label="Orders"
              value={data.status_total.orders}
              hint={`Total ${money(data.status_total.total)}`}
            />
            <StatTile
              label="Cancelled"
              value={data.cancelled.count}
              hint={money(data.cancelled.amount)}
            />
          </StatGrid>

          <div className="grid gap-4 xl:grid-cols-2">
            <ReportCard title="Order Status" flush>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-primary/5 text-left">
                      <th className={TH}>Status</th>
                      <th className={`${TH} text-right`}>My Amount (₹)</th>
                      <th className={`${TH} text-right`}>Total (₹)</th>
                      <th className={`${TH} text-right`}>Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.status.map((row) => (
                      <tr key={row.status} className="border-t border-line">
                        <td className={`${TD} font-medium`}>{row.status}</td>
                        <td className={`${TD} text-right tabular-nums`}>{money(row.my_amount)}</td>
                        <td className={`${TD} text-right tabular-nums`}>{money(row.total)}</td>
                        <td className={`${TD} text-right tabular-nums`}>{row.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-primary/30 bg-primary/5 font-bold">
                      <td className={TD}>Total</td>
                      <td className={`${TD} text-right tabular-nums`}>
                        {money(data.status_total.my_amount)}
                      </td>
                      <td className={`${TD} text-right tabular-nums`}>
                        {money(data.status_total.total)}
                      </td>
                      <td className={`${TD} text-right tabular-nums`}>{data.status_total.orders}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </ReportCard>

            <ReportCard title="Success Orders" aside={`${data.success.orders} orders`}>
              <PairList
                rows={data.success.lines.map((line) => ({
                  label: line.label,
                  value: money(line.amount),
                  bold: line.label === 'Grand Total',
                }))}
              />
            </ReportCard>

            <ReportCard title="Order Type" flush>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-primary/5 text-left">
                      <th className={TH}>Type</th>
                      <th className={`${TH} text-right`}>Count</th>
                      <th className={`${TH} text-right`}>Total (₹)</th>
                      <th className={`${TH} text-right`}>Net Sales (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.order_types.length === 0 ? (
                      <EmptyRow cols={4} />
                    ) : (
                      data.order_types.map((row) => (
                        <tr key={row.type} className="border-t border-line">
                          <td className={`${TD} font-medium`}>{row.type}</td>
                          <td className={`${TD} text-right tabular-nums`}>{row.count}</td>
                          <td className={`${TD} text-right tabular-nums`}>{money(row.total)}</td>
                          <td className={`${TD} text-right tabular-nums`}>{money(row.net)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ReportCard>

            <ReportCard title="Payment Mode">
              {data.payments.length === 0 ? (
                <p className="py-2 text-center text-sm text-muted">Records not available</p>
              ) : (
                <ul className="space-y-3">
                  {data.payments.map((row) => (
                    <li key={row.mode}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-ink">{row.mode}</span>
                        <span className="tabular-nums text-ink">{money(row.total)}</span>
                      </div>
                      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{
                            width: `${paymentsMax > 0 ? Math.min(100, ((Number(row.total) || 0) / paymentsMax) * 100) : 0}%`,
                          }}
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </ReportCard>

            <ReportCard title="Online Orders" flush>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-primary/5 text-left">
                      <th className={TH}>Source</th>
                      <th className={`${TH} text-right`}>My Amount (₹)</th>
                      <th className={`${TH} text-right`}>Total (₹)</th>
                      <th className={`${TH} text-right`}>Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.online.rows.length === 0 ? (
                      <EmptyRow cols={4} />
                    ) : (
                      data.online.rows.map((row) => (
                        <tr key={row.source} className="border-t border-line">
                          <td className={`${TD} font-medium`}>{row.source}</td>
                          <td className={`${TD} text-right tabular-nums`}>{money(row.my_amount)}</td>
                          <td className={`${TD} text-right tabular-nums`}>{money(row.total)}</td>
                          <td className={`${TD} text-right tabular-nums`}>{row.orders}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {data.online.rows.length > 0 ? (
                    <tfoot>
                      <tr className="border-t-2 border-primary/30 bg-primary/5 font-bold">
                        <td className={TD}>Total</td>
                        <td className={`${TD} text-right tabular-nums`}>
                          {money(data.online.total.my_amount)}
                        </td>
                        <td className={`${TD} text-right tabular-nums`}>
                          {money(data.online.total.total)}
                        </td>
                        <td className={`${TD} text-right tabular-nums`}>{data.online.total.orders}</td>
                      </tr>
                    </tfoot>
                  ) : null}
                </table>
              </div>
            </ReportCard>
          </div>
        </>
      ) : null}
    </ReportShell>
  )
}
