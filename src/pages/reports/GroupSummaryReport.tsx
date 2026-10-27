import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Columns3,
  Download,
  Printer,
  Search,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  fetchReportApi,
  type ReportCell,
  type ReportResult,
} from '../../services/reportService'
import { useNewOrder } from '../../state/useNewOrder'
import { downloadCsv } from '../../utils/exportCsv'
import { showToast } from '../../utils/toast'

/** Local calendar day as YYYY-MM-DD (the server reads it in the outlet's zone). */
function todayIso(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function displayDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}-${m}-${y}` : iso
}

function decimal(value: ReportCell | undefined): string {
  const n = Number(value)
  return Number.isFinite(n)
    ? n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(value ?? '')
}

/** The numeric columns, in screen order. `key` matches the report row keys. */
const NUMERIC = [
  { key: 'qty', label: 'Qty.' },
  { key: 'my_amount', label: 'My Amount (₹)' },
  { key: 'discount', label: 'Total Discount (₹)' },
  { key: 'net', label: 'Net Amount (₹) (M.A - T.D)' },
  { key: 'tax', label: 'Total Tax (₹)' },
  { key: 'total', label: 'Total Sales (₹)' },
] as const

type NumericKey = (typeof NUMERIC)[number]['key']

interface GroupBlock {
  group: string
  rows: Record<string, ReportCell>[]
  sums: Record<NumericKey, number>
}

const BUTTON_CLASS =
  'inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary'

const CELL = 'border border-line px-3 py-4'

export default function GroupSummaryReport() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const { encryptedOutletId } = useAuth()
  const [billNo, setBillNo] = useState('')
  const [from, setFrom] = useState(todayIso)
  const [to, setTo] = useState(todayIso)
  const [search, setSearch] = useState('')
  const [data, setData] = useState<ReportResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [columnsOpen, setColumnsOpen] = useState(false)
  const columnsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!encryptedOutletId || !from || !to) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetchReportApi(encryptedOutletId, 'group-wise', { from, to })
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

  useEffect(() => {
    if (!columnsOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (!columnsRef.current?.contains(event.target as Node)) setColumnsOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [columnsOpen])

  const groups = useMemo<GroupBlock[]>(() => {
    const q = search.trim().toLowerCase()
    const byGroup = new Map<string, GroupBlock>()
    for (const row of data?.rows ?? []) {
      const group = String(row.group)
      if (q && !String(row.item).toLowerCase().includes(q) && !group.toLowerCase().includes(q)) {
        continue
      }
      let block = byGroup.get(group)
      if (!block) {
        block = {
          group,
          rows: [],
          sums: { qty: 0, my_amount: 0, discount: 0, net: 0, tax: 0, total: 0 },
        }
        byGroup.set(group, block)
      }
      block.rows.push(row)
      for (const col of NUMERIC) block.sums[col.key] += Number(row[col.key]) || 0
    }
    return [...byGroup.values()]
  }, [data, search])

  const shown = NUMERIC.filter((col) => !hidden.has(col.key))
  const colCount = 2 + shown.length
  const totals = data?.totals ?? {}
  const roundOff = Number(totals.round_off) || 0

  function toggleIn(setter: typeof setHidden, key: string) {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function exportCsv() {
    if (groups.length === 0) {
      showToast('Nothing to export')
      return
    }
    const keys = ['group', 'item', ...shown.map((col) => col.key)]
    const labels = ['Group', 'Item', ...shown.map((col) => col.label)]
    const body = groups.flatMap((block) =>
      block.rows.map((row) => keys.map((key) => row[key] ?? '')),
    )
    downloadCsv(`group-report_${from}_${to}.csv`, labels, body)
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
        <h1 className="text-lg font-bold text-ink">Group Report</h1>
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
          <div className="relative w-56">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search item or group"
              className="h-10 w-full rounded-lg border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
          </div>

          <div ref={columnsRef} className="relative">
            <button
              type="button"
              onClick={() => setColumnsOpen((open) => !open)}
              aria-expanded={columnsOpen}
              className={BUTTON_CLASS}
            >
              <Columns3 size={16} />
              Configure Column
              <ChevronDown
                size={14}
                className={`transition-transform ${columnsOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {columnsOpen && (
              <div className="absolute left-0 top-12 z-20 w-72 rounded-lg border border-line bg-card shadow-lg">
                {NUMERIC.map((col) => (
                  <label
                    key={col.key}
                    className="flex cursor-pointer items-center gap-2 border-b border-line px-4 py-3 text-sm text-ink last:border-b-0 hover:bg-page"
                  >
                    <input
                      type="checkbox"
                      checked={!hidden.has(col.key)}
                      onChange={() => toggleIn(setHidden, col.key)}
                      className="size-4 accent-primary"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>

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

          <div className="ml-auto flex items-center gap-3">
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
          <p className="bg-primary/5 px-4 py-3 text-sm text-muted">
            Group Report : From {displayDate(from)} to {displayDate(to)}
          </p>
          {loading && !data ? (
            <p className="p-10 text-center text-sm text-muted">Loading…</p>
          ) : error ? (
            <p className="p-10 text-center text-sm text-danger">{error}</p>
          ) : groups.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted">
              No sales found for this date range.
            </p>
          ) : (
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-page text-ink">
                  <th className="px-3 py-4 text-left font-medium">Group</th>
                  <th className="px-3 py-4 text-left font-medium">Item</th>
                  {shown.map((col) => (
                    <th key={col.key} className="px-3 py-4 text-right font-medium">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-page font-bold text-ink">
                  <td className={CELL}>Total</td>
                  <td className={CELL}>-</td>
                  {shown.map((col) => (
                    <td key={col.key} className={`${CELL} text-right tabular-nums`}>
                      {decimal(totals[col.key])}
                    </td>
                  ))}
                </tr>
                {groups.map((block) => {
                  const isCollapsed = collapsed.has(block.group)
                  return (
                    <GroupRows
                      key={block.group}
                      block={block}
                      collapsed={isCollapsed}
                      colCount={colCount}
                      shown={shown.map((col) => col.key)}
                      onToggle={() => toggleIn(setCollapsed, block.group)}
                    />
                  )
                })}
                {roundOff !== 0 && (
                  <tr className="text-ink">
                    <td className={CELL}>Round off</td>
                    <td className={CELL} />
                    {shown.map((col) => (
                      <td key={col.key} className={`${CELL} text-right tabular-nums`}>
                        {col.key === 'total' ? decimal(roundOff) : ''}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

interface GroupRowsProps {
  block: GroupBlock
  collapsed: boolean
  colCount: number
  shown: NumericKey[]
  onToggle: () => void
}

function GroupRows({ block, collapsed, colCount, shown, onToggle }: GroupRowsProps) {
  return (
    <>
      <tr className="border-t border-line bg-primary/5">
        <td colSpan={colCount} className="px-3 py-4">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            className="inline-flex items-center gap-3 text-ink"
          >
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            {block.group}
          </button>
        </td>
      </tr>
      {!collapsed && (
        <>
          {block.rows.map((row, index) => (
            <tr key={index} className="hover:bg-page/60">
              <td className={CELL} />
              <td className={`${CELL} text-ink`}>{row.item}</td>
              {shown.map((key) => (
                <td key={key} className={`${CELL} text-right tabular-nums text-ink`}>
                  {decimal(row[key])}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-page font-bold text-ink">
            <td className={CELL}>Sub Total</td>
            <td className={CELL} />
            {shown.map((key) => (
              <td key={key} className={`${CELL} text-right tabular-nums`}>
                {decimal(block.sums[key])}
              </td>
            ))}
          </tr>
        </>
      )}
    </>
  )
}
