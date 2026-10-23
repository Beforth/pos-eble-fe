import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Download, Printer } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  fetchOrderSummaryApi,
  type OrderSummaryResult,
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

const CELL = 'border border-line px-3 py-3.5'

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="px-3 pb-2 pt-4 text-sm font-bold text-ink">{children}</h2>
}

function Head({ cols }: { cols: { label: string; right?: boolean }[] }) {
  return (
    <thead>
      <tr className="bg-page text-ink">
        {cols.map((col, index) => (
          <th
            key={index}
            className={`${CELL} font-semibold ${col.right ? 'text-right' : 'text-left'}`}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  )
}

/** A two-column "label : value" table, as used by the summary blocks. */
function PairTable({ rows }: { rows: { label: string; value: string; bold?: boolean }[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td className={`${CELL} text-ink ${row.bold ? 'font-bold' : ''}`}>{row.label} :</td>
            <td className={`${CELL} w-1/2 text-right tabular-nums text-ink ${row.bold ? 'font-bold' : ''}`}>
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function OrderSummaryReport() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId, user } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [from, setFrom] = useState(() => dayIso())
  const [to, setTo] = useState(() => dayIso())
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

  function pickDay(offset: number) {
    setFrom(dayIso(offset))
    setTo(dayIso(offset))
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

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3">
        <h1 className="text-lg font-bold text-ink">Order Report</h1>
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
              Yesterday Orders
            </button>
            <button type="button" onClick={() => pickDay(0)} className={BUTTON_CLASS}>
              Today Orders
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
            <span className="font-bold">Order Summary Report</span> : {displayDate(from)} to{' '}
            {displayDate(to)}
          </p>

          {loading && !data ? (
            <p className="p-10 text-center text-sm text-muted">Loading…</p>
          ) : error ? (
            <p className="p-10 text-center text-sm text-danger">{error}</p>
          ) : data ? (
            <div className="pb-4">
              <SectionTitle>Order Status</SectionTitle>
              <table className="w-full border-collapse text-sm">
                <Head
                  cols={[
                    { label: 'Order Status' },
                    { label: 'My Amount (₹)', right: true },
                    { label: 'Total (₹)', right: true },
                    { label: 'Orders', right: true },
                  ]}
                />
                <tbody>
                  {data.status.map((row) => (
                    <tr key={row.status}>
                      <td className={`${CELL} text-ink`}>{row.status}:</td>
                      <td className={`${CELL} text-right tabular-nums text-ink`}>{num(row.my_amount)}</td>
                      <td className={`${CELL} text-right tabular-nums text-ink`}>{num(row.total)}</td>
                      <td className={`${CELL} text-right tabular-nums text-ink`}>{row.orders}</td>
                    </tr>
                  ))}
                  <tr className="bg-page font-bold text-ink">
                    <td className={CELL}>Total:</td>
                    <td className={`${CELL} text-right tabular-nums`}>{num(data.status_total.my_amount)}</td>
                    <td className={`${CELL} text-right tabular-nums`}>{num(data.status_total.total)}</td>
                    <td className={`${CELL} text-right tabular-nums`}>{data.status_total.orders}</td>
                  </tr>
                </tbody>
              </table>

              <SectionTitle>Success Orders ({data.success.orders})</SectionTitle>
              <PairTable
                rows={data.success.lines.map((line) => ({
                  label: line.label,
                  value: `₹ ${num(line.amount)}`,
                  bold: line.label === 'Grand Total',
                }))}
              />

              <SectionTitle>Cancelled Orders</SectionTitle>
              <PairTable
                rows={[
                  { label: 'Count', value: String(data.cancelled.count) },
                  { label: 'Amount', value: `₹ ${num(data.cancelled.amount)}` },
                ]}
              />

              <SectionTitle>Performance Indicator</SectionTitle>
              <PairTable
                rows={[
                  { label: 'Average Per Bill', value: `₹ ${num(data.performance.avg_per_bill)}` },
                  {
                    label: 'Average Discount Per Order',
                    value: `₹ ${num(data.performance.avg_discount_per_order)}`,
                  },
                ]}
              />

              <SectionTitle>Order Type</SectionTitle>
              <table className="w-full border-collapse text-sm">
                <Head
                  cols={[
                    { label: '' },
                    { label: 'Count', right: true },
                    { label: 'Total (₹)', right: true },
                    { label: 'Net Sales (₹)', right: true },
                  ]}
                />
                <tbody>
                  {data.order_types.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={`${CELL} text-muted`}>Records not available</td>
                    </tr>
                  ) : (
                    data.order_types.map((row) => (
                      <tr key={row.type}>
                        <td className={`${CELL} text-ink`}>{row.type}</td>
                        <td className={`${CELL} text-right tabular-nums text-ink`}>{row.count}</td>
                        <td className={`${CELL} text-right tabular-nums text-ink`}>{num(row.total)}</td>
                        <td className={`${CELL} text-right tabular-nums text-ink`}>{num(row.net)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <SectionTitle>Payment Mode</SectionTitle>
              <table className="w-full border-collapse text-sm">
                <Head cols={[{ label: '' }, { label: 'Total (₹)', right: true }]} />
                <tbody>
                  {data.payments.length === 0 ? (
                    <tr>
                      <td colSpan={2} className={`${CELL} text-muted`}>Records not available</td>
                    </tr>
                  ) : (
                    data.payments.map((row) => (
                      <tr key={row.mode}>
                        <td className={`${CELL} text-ink`}>{row.mode}</td>
                        <td className={`${CELL} w-1/2 text-right tabular-nums text-ink`}>{num(row.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <SectionTitle>Online Orders</SectionTitle>
              <table className="w-full border-collapse text-sm">
                <Head
                  cols={[
                    { label: 'Source' },
                    { label: 'My Amount (₹)', right: true },
                    { label: 'Total (₹)', right: true },
                    { label: 'Orders', right: true },
                  ]}
                />
                <tbody>
                  {data.online.rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={`${CELL} text-muted`}>Records not available</td>
                    </tr>
                  ) : (
                    <>
                      {data.online.rows.map((row) => (
                        <tr key={row.source}>
                          <td className={`${CELL} font-semibold text-ink`}>{row.source}</td>
                          <td className={`${CELL} text-right tabular-nums text-ink`}>{num(row.my_amount)}</td>
                          <td className={`${CELL} text-right tabular-nums text-ink`}>{num(row.total)}</td>
                          <td className={`${CELL} text-right tabular-nums text-ink`}>{row.orders}</td>
                        </tr>
                      ))}
                      <tr className="bg-page font-bold text-ink">
                        <td className={CELL}>Total:</td>
                        <td className={`${CELL} text-right tabular-nums`}>{num(data.online.total.my_amount)}</td>
                        <td className={`${CELL} text-right tabular-nums`}>{num(data.online.total.total)}</td>
                        <td className={`${CELL} text-right tabular-nums`}>{data.online.total.orders}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
