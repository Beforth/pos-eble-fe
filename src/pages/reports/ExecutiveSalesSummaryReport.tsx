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
import { reportSubtitle } from '../../components/reports/reportStyles'
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

interface Pair {
  label: string
  value: string
  bold?: boolean
}

export default function ExecutiveSalesSummaryReport() {
  const { encryptedOutletId } = useAuth()
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

  const invoiceRange =
    data && (data.success.invoice_from || data.success.invoice_to)
      ? `${data.success.invoice_from} - ${data.success.invoice_to}`
      : '-'

  const successRows: Pair[] = data
    ? [
        { label: 'Count', value: String(data.success.orders) },
        { label: 'Invoice Nos.', value: invoiceRange },
        ...data.success.lines.map((line) => ({
          label: line.label,
          value: money(line.amount),
          bold: line.label === 'Grand Total',
        })),
      ]
    : []
  const cancelledRows: Pair[] = data
    ? [
        { label: 'Count', value: String(data.cancelled.count) },
        { label: 'Amount', value: money(data.cancelled.amount) },
      ]
    : []
  const performanceRows: Pair[] = data
    ? [
        { label: 'Average Per Bill', value: money(data.performance.avg_per_bill) },
        {
          label: 'Average Discount Per Order',
          value: money(data.performance.avg_discount_per_order),
        },
      ]
    : []

  function exportCsv() {
    if (!data) {
      showToast('Nothing to export')
      return
    }
    const rows = [
      ...successRows.map((r) => ['Success Orders', r.label, r.value]),
      ...cancelledRows.map((r) => ['Cancelled Orders', r.label, r.value]),
      ...performanceRows.map((r) => ['Performance Indicator', r.label, r.value]),
    ]
    downloadCsv(`executive-sales_${from}_${to}.csv`, ['Section', 'Label', 'Value'], rows)
  }

  const grandTotal = data?.success.lines.find((line) => line.label === 'Grand Total')?.amount

  return (
    <ReportShell title="Executive Sales Summary" subtitle={reportSubtitle(from, to)}>
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
            />
            <StatTile
              label="Cancelled"
              value={data.cancelled.count}
              hint={money(data.cancelled.amount)}
            />
            <StatTile label="Invoice Nos." value={invoiceRange} />
          </StatGrid>

          <div className="grid gap-4 lg:grid-cols-2">
            <ReportCard title="Success Orders">
              <PairList rows={successRows} />
            </ReportCard>
            <div className="flex flex-col gap-4">
              <ReportCard title="Cancelled Orders">
                <PairList rows={cancelledRows} />
              </ReportCard>
              <ReportCard title="Performance Indicator">
                <PairList rows={performanceRows} />
              </ReportCard>
            </div>
          </div>
        </>
      ) : null}
    </ReportShell>
  )
}
