import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
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
import { formatINR } from '../../utils/format'
import { datePresets, displayDate, todayIso } from '../../utils/reportDates'
import { showToast } from '../../utils/toast'

function decimal(value: ReportCell | undefined): string {
  const n = Number(value)
  return Number.isFinite(n)
    ? n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(value ?? '')
}

interface CategoryGroup {
  category: string
  rows: Record<string, ReportCell>[]
  qty: number
  amount: number
}

const BUTTON_CLASS =
  'inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary'

const TOGGLEABLE = [
  { key: 'code', label: 'Code' },
  { key: 'qty', label: 'Qty.' },
  { key: 'amount', label: 'Total (₹)' },
]

export default function ItemSummaryReport() {
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
    fetchReportApi(encryptedOutletId, 'item-wise', { from, to })
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

  const groups = useMemo<CategoryGroup[]>(() => {
    const q = search.trim().toLowerCase()
    const byCategory = new Map<string, CategoryGroup>()
    for (const row of data?.rows ?? []) {
      const category = String(row.category)
      if (
        q &&
        !String(row.item).toLowerCase().includes(q) &&
        !category.toLowerCase().includes(q)
      ) {
        continue
      }
      let group = byCategory.get(category)
      if (!group) {
        group = { category, rows: [], qty: 0, amount: 0 }
        byCategory.set(category, group)
      }
      group.rows.push(row)
      group.qty += Number(row.qty) || 0
      group.amount += Number(row.amount) || 0
    }
    return [...byCategory.values()]
  }, [data, search])

  const show = (key: string) => !hidden.has(key)
  const colCount = 2 + TOGGLEABLE.filter((col) => show(col.key)).length

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
    const keys = ['category', 'item', ...TOGGLEABLE.filter((c) => show(c.key)).map((c) => c.key)]
    const labels = (data?.columns ?? [])
      .filter((col) => keys.includes(col.key))
      .map((col) => col.label)
    const body = groups.flatMap((group) => group.rows.map((row) => keys.map((k) => row[k] ?? '')))
    downloadCsv(`item-report_${from}_${to}.csv`, labels, body)
  }

  const totals = data?.totals ?? {}
  const presets = datePresets()
  const itemCount = groups.reduce((sum, group) => sum + group.rows.length, 0)
  const topAmount = groups.reduce(
    (max, group) =>
      group.rows.reduce((m, row) => Math.max(m, Number(row.amount) || 0), max),
    0,
  )

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-card px-5 py-3">
        <div>
          <h1 className="text-lg font-bold text-ink">Item Report</h1>
          <p className="text-xs text-muted">
            {displayDate(from)} – {displayDate(to)}
            {data ? ` · ${itemCount} item${itemCount === 1 ? '' : 's'} in ${groups.length} categor${groups.length === 1 ? 'y' : 'ies'}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/reports')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      </div>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-5">
        <section
          aria-label="Report filters"
          className="flex shrink-0 flex-wrap items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-sm"
        >
          <div
            className="inline-flex overflow-x-auto rounded-xl border border-line bg-page p-1"
            role="group"
            aria-label="Date range"
          >
            {presets.map((preset) => {
              const active = from === preset.from && to === preset.to
              return (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setFrom(preset.from)
                    setTo(preset.to)
                  }}
                  className={`h-8 shrink-0 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors ${
                    active ? 'bg-primary text-white shadow-sm' : 'text-ink hover:bg-card'
                  }`}
                >
                  {preset.label}
                </button>
              )
            })}
          </div>

          <label className="flex items-center gap-2 text-sm text-muted">
            <CalendarDays size={15} />
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
              aria-label="From date"
              className="h-10 rounded-xl border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
            />
            <span>to</span>
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
              aria-label="To date"
              className="h-10 rounded-xl border border-line bg-card px-2 text-sm text-ink outline-none focus:border-primary"
            />
          </label>

          <div className="relative w-60">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search item or category"
              aria-label="Search item or category"
              className="h-10 w-full rounded-xl border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
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
              Columns
              <ChevronDown
                size={14}
                className={`transition-transform ${columnsOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {columnsOpen && (
              <div className="absolute left-0 top-12 z-20 w-64 overflow-hidden rounded-xl border border-line bg-card shadow-lg">
                {TOGGLEABLE.map((col) => (
                  <label
                    key={col.key}
                    className="flex cursor-pointer items-center gap-2 border-b border-line px-4 py-3 text-sm text-ink last:border-b-0 hover:bg-page"
                  >
                    <input
                      type="checkbox"
                      checked={show(col.key)}
                      onChange={() => toggleIn(setHidden, col.key)}
                      className="size-4 accent-primary"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => window.print()} className={BUTTON_CLASS}>
              <Printer size={16} />
              Print
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Download size={16} />
              Export CSV
            </button>
          </div>
        </section>

        {data && groups.length > 0 ? (
          <section aria-label="Totals" className="grid shrink-0 grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Total sales</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-primary">
                {formatINR(Number(totals.amount), 2)}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Quantity sold</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{decimal(totals.qty)}</p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Items sold</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{itemCount}</p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Categories</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-ink">{groups.length}</p>
            </div>
          </section>
        ) : null}

        <section className="shrink-0 overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
          {loading && !data ? (
            <p className="p-10 text-center text-sm text-muted">Loading…</p>
          ) : error ? (
            <p className="p-10 text-center text-sm text-danger">{error}</p>
          ) : groups.length === 0 ? (
            <p className="p-10 text-center text-sm text-muted">
              No sales found for this date range.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="bg-primary/5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 text-left">Item</th>
                    {show('code') && <th className="px-4 py-3 text-left">Code</th>}
                    {show('qty') && <th className="px-4 py-3 text-right">Qty.</th>}
                    {show('amount') && <th className="px-4 py-3 text-right">Total (₹)</th>}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <GroupRows
                      key={group.category}
                      group={group}
                      collapsed={collapsed.has(group.category)}
                      colCount={colCount - 1}
                      topAmount={topAmount}
                      showCode={show('code')}
                      showQty={show('qty')}
                      showAmount={show('amount')}
                      onToggle={() => toggleIn(setCollapsed, group.category)}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-primary/30 bg-primary/5 font-bold text-ink">
                    <td className="px-4 py-3.5">Total</td>
                    {show('code') && <td className="px-4 py-3.5" />}
                    {show('qty') && (
                      <td className="px-4 py-3.5 text-right tabular-nums">{decimal(totals.qty)}</td>
                    )}
                    {show('amount') && (
                      <td className="px-4 py-3.5 text-right tabular-nums">
                        {decimal(totals.amount)}
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

interface GroupRowsProps {
  group: CategoryGroup
  collapsed: boolean
  colCount: number
  /** Best-selling item's amount in the report; the bar on every row is relative to it. */
  topAmount: number
  showCode: boolean
  showQty: boolean
  showAmount: boolean
  onToggle: () => void
}

function GroupRows({
  group,
  collapsed,
  colCount,
  topAmount,
  showCode,
  showQty,
  showAmount,
  onToggle,
}: GroupRowsProps) {
  return (
    <>
      <tr className="border-t border-line bg-page">
        <td colSpan={colCount} className="px-4 py-3">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            className="flex w-full items-center gap-2 text-left font-semibold text-ink"
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            {group.category}
            <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted">
              {group.rows.length} item{group.rows.length === 1 ? '' : 's'}
            </span>
            <span className="ml-auto flex items-center gap-4 text-sm font-semibold tabular-nums">
              {showQty ? (
                <span className="text-muted">
                  Qty <span className="text-ink">{decimal(group.qty)}</span>
                </span>
              ) : null}
              {showAmount ? <span className="text-ink">₹{decimal(group.amount)}</span> : null}
            </span>
          </button>
        </td>
      </tr>
      {!collapsed &&
        group.rows.map((row, index) => {
          const amount = Number(row.amount) || 0
          return (
            <tr key={index} className="border-t border-line hover:bg-page/60">
              <td className="px-4 py-3 pl-10 text-ink">
                <span className="block">{row.item}</span>
                {showAmount && topAmount > 0 ? (
                  <span className="mt-1.5 block h-1 w-40 max-w-full overflow-hidden rounded-full bg-line">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, (amount / topAmount) * 100)}%` }}
                    />
                  </span>
                ) : null}
              </td>
              {showCode && <td className="px-4 py-3 text-muted">{row.code}</td>}
              {showQty && (
                <td className="px-4 py-3 text-right tabular-nums text-ink">{decimal(row.qty)}</td>
              )}
              {showAmount && (
                <td className="px-4 py-3 text-right font-medium tabular-nums text-ink">
                  {decimal(row.amount)}
                </td>
              )}
            </tr>
          )
        })}
    </>
  )
}
