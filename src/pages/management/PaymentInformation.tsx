import { useCallback, useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/exportCsv'
import { CircleDollarSign, Receipt, Search, Wallet } from 'lucide-react'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import { Badge } from '../../components/common/Badge'
import { DateTimeField } from '../../components/common/DateTimeField'
import { Pagination } from '../../components/common/Pagination'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { OutlineButton } from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import {
  formatOrderListTimestamp,
  listPaymentsApi,
  type PaymentRow,
  type PaymentRowStatus,
  type PaymentsPage,
} from '../../services/orderService'
import { formatINR } from '../../utils/format'

const PAGE_SIZE = 20

const STATUS_OPTIONS: { value: '' | PaymentRowStatus; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'due', label: 'Due' },
  { value: 'cancelled', label: 'Cancelled' },
]
const METHOD_OPTIONS = ['All', 'Cash', 'Card', 'UPI', 'Due', 'Part Payment', 'Wallet', 'Other']

const STATUS_BADGE: Record<PaymentRowStatus, { label: string; variant: 'success' | 'accent' | 'neutral' }> = {
  paid: { label: 'Paid', variant: 'success' },
  due: { label: 'Due', variant: 'accent' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
}

const selectClass =
  'mt-1 block h-9 min-w-[140px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary'

/** `YYYY-MM-DD` of a local date, the format the API takes. */
function isoDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
}

function endOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
}

interface Applied {
  from: string
  to: string
  status: '' | PaymentRowStatus
  method: string
  search: string
}

const money = (value: number | string) => formatINR(Number(value) || 0, 2)

export default function PaymentInformation() {
  const { encryptedOutletId } = useAuth()
  const [fromDate, setFromDate] = useState(startOfToday)
  const [toDate, setToDate] = useState(endOfToday)
  const [status, setStatus] = useState<'' | PaymentRowStatus>('')
  const [method, setMethod] = useState('All')
  const [orderId, setOrderId] = useState('')

  const [applied, setApplied] = useState<Applied>(() => ({
    from: isoDay(startOfToday()),
    to: isoDay(endOfToday()),
    status: '',
    method: '',
    search: '',
  }))
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaymentsPage | null>(null)
  const [loading, setLoading] = useState(true)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    const mine = ++requestId.current
    setLoading(true)
    try {
      const result = await listPaymentsApi(encryptedOutletId, {
        ...applied,
        status: applied.status || undefined,
        method: applied.method || undefined,
        page,
        page_size: PAGE_SIZE,
      })
      if (mine === requestId.current) setData(result)
    } catch (error) {
      if (mine === requestId.current) {
        showToast(error instanceof Error ? error.message : 'Failed to load payments')
      }
    } finally {
      if (mine === requestId.current) setLoading(false)
    }
  }, [encryptedOutletId, applied, page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch when the filters or page change
    void load()
  }, [load])

  function handleSearch() {
    setApplied({
      from: isoDay(fromDate),
      to: isoDay(toDate),
      status,
      method: method === 'All' ? '' : method,
      search: orderId,
    })
    setPage(1)
  }

  function handleShowAll() {
    setFromDate(startOfToday())
    setToDate(endOfToday())
    setStatus('')
    setMethod('All')
    setOrderId('')
    setApplied({
      from: isoDay(startOfToday()),
      to: isoDay(endOfToday()),
      status: '',
      method: '',
      search: '',
    })
    setPage(1)
    showToast('Filters cleared')
  }

  function toCsvRow(row: PaymentRow): (string | number)[] {
    return [
      formatOrderListTimestamp(row.paid_at),
      row.order_no,
      row.bill_no,
      row.detail ? `${row.method} - ${row.detail}` : row.method,
      STATUS_BADGE[row.status].label,
      Number(row.grand_total) || 0,
      Number(row.received_amount) || 0,
      Number(row.balance_due) || 0,
    ]
  }

  const csvHead = ['Date', 'Order No', 'Bill No', 'Method', 'Status', 'Total', 'Received', 'Due']

  function exportPage() {
    const rows = (data?.results ?? []).map(toCsvRow)
    downloadCsv(`payment-information-page-${isoDay(new Date())}.csv`, csvHead, rows)
    showToast(`Exported ${rows.length} rows`)
  }

  async function exportAll() {
    if (!encryptedOutletId) return
    try {
      const rows: (string | number)[][] = []
      for (let next = 1; ; next += 1) {
        const chunk = await listPaymentsApi(encryptedOutletId, {
          ...applied,
          status: applied.status || undefined,
          method: applied.method || undefined,
          page: next,
          page_size: 100,
        })
        rows.push(...chunk.results.map(toCsvRow))
        if (rows.length >= chunk.count || chunk.results.length === 0) break
      }
      downloadCsv(`payment-information-all-${isoDay(new Date())}.csv`, csvHead, rows)
      showToast(`Exported ${rows.length} rows`)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Export failed')
    }
  }

  const rows = data?.results ?? []
  const totals = data?.totals
  const summary = [
    {
      label: 'Orders',
      value: String(totals?.orders ?? 0),
      tone: 'bg-primary/10 text-primary',
      icon: <Receipt size={18} />,
    },
    {
      label: 'Collected',
      value: money(totals?.collected ?? 0),
      tone: 'bg-success/10 text-success',
      icon: <CircleDollarSign size={18} />,
    },
    {
      label: 'Due',
      value: money(totals?.due ?? 0),
      tone: 'bg-accent/15 text-accent',
      icon: <Wallet size={18} />,
    },
  ]

  return (
    <ReportsPageShell
      title="Payment Information"
      activeItem="acct-payment-information"
      actions={<ExportExcelMenu onExportPage={exportPage} onExportAll={() => void exportAll()} />}
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {summary.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-3 rounded-xl border border-line bg-card p-4"
          >
            <span
              className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg ${card.tone}`}
            >
              {card.icon}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xl font-bold tabular-nums text-ink">
                {card.value}
              </span>
              <span className="block text-xs font-medium text-muted">{card.label}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="border-b border-line p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-3">
            <DateTimeField
              label="From Date"
              value={fromDate}
              onChange={setFromDate}
              defaultTime={{ hours: 0, minutes: 0, seconds: 0 }}
            />
            <DateTimeField
              label="To Date"
              value={toDate}
              onChange={setToDate}
              defaultTime={{ hours: 23, minutes: 59, seconds: 59 }}
            />
            <label className="text-xs text-muted">
              Select Status
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as '' | PaymentRowStatus)}
                className={selectClass}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted">
              Select Method
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value)}
                className={selectClass}
              >
                {METHOD_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="min-w-[160px] flex-1 text-xs text-muted sm:max-w-[220px]">
              Order / Bill No
              <input
                type="text"
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSearch()
                }}
                className="mt-1 block h-9 w-full rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <OutlineButton onClick={handleSearch}>Search</OutlineButton>
            <OutlineButton variant="gray" onClick={handleShowAll}>
              Clear Filter
            </OutlineButton>
          </div>
        </div>

        {loading && !data ? (
          <div className="px-6 py-16 text-center text-sm text-muted">Loading payments…</div>
        ) : rows.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-4 flex size-20 items-center justify-center rounded-full bg-page">
              <Search size={48} strokeWidth={1.25} className="text-muted/45" />
            </span>
            <p className="text-base font-semibold text-ink">No Results Found.</p>
            <p className="mt-1 text-sm text-muted">
              No payments match these filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Received</th>
                  <th className="px-4 py-3 text-right">Due</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const badge = STATUS_BADGE[row.status]
                  const due = Number(row.balance_due) || 0
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-line last:border-0 hover:bg-page/60"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-muted">
                        {formatOrderListTimestamp(row.paid_at)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">#{row.order_no}</p>
                        {row.bill_no ? (
                          <p className="text-xs text-muted">Bill {row.bill_no}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{row.method || '—'}</p>
                        {row.detail ? <p className="text-xs text-muted">{row.detail}</p> : null}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">
                        {money(row.grand_total)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-ink">
                        {money(row.received_amount)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right tabular-nums ${
                          due > 0 ? 'font-semibold text-accent' : 'text-muted'
                        }`}
                      >
                        {due > 0 ? money(due) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={badge.variant} size="md" dot>
                          {badge.label}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.count ?? 0}
        onPageChange={setPage}
      />
    </ReportsPageShell>
  )
}
