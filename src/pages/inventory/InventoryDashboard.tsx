import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Calendar,
  CheckCircle2,
  Lightbulb,
  Package,
  RefreshCw,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  getDashboardSummaryApi,
  type DashboardSummary,
} from '../../services/inventoryService'
import { showToast } from '../../utils/toast'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const PIE_COLORS = [
  '#ff0917',
  '#f67d00',
  '#0d9488',
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ca8a04',
  '#64748b',
]

function money(value: string | number) {
  const n = typeof value === 'string' ? Number(value) : value
  return Number.isFinite(n)
    ? n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : '0'
}

function toDateKey(year: number, monthIndex: number, day: number) {
  const m = String(monthIndex + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

export default function InventoryDashboard() {
  const navigate = useNavigate()
  const { encryptedOutletId } = useAuth()
  const today = new Date()
  const [monthIndex, setMonthIndex] = useState(today.getMonth())
  const year = today.getFullYear()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const todayDate = today.getDate()
  const [selectedDay, setSelectedDay] = useState(
    monthIndex === today.getMonth() ? todayDate : 1,
  )
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(false)

  const calendarDays = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  )

  const dateKey = toDateKey(year, monthIndex, selectedDay)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    setLoading(true)
    try {
      const data = await getDashboardSummaryApi(encryptedOutletId, dateKey)
      setSummary(data)
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : 'Unable to load dashboard summary',
      )
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, dateKey])

  useEffect(() => {
    void load()
  }, [load])

  const pieData =
    summary?.top_materials.map((row, index) => ({
      name: row.name,
      value: row.share_pct || Number(row.worth) || 0,
      fill: PIE_COLORS[index % PIE_COLORS.length],
    })) ?? []

  const supplierBars =
    summary?.purchase_by_supplier.map((row) => ({
      name: row.name.length > 12 ? `${row.name.slice(0, 12)}…` : row.name,
      current: Number(row.current) || 0,
      pending: Number(row.pending) || 0,
    })) ?? []

  return (
    <InventoryPageShell activeItem="dashboard">
      <section className="mb-6 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-ink">
                Daily Stock Closing Tracker
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Calendar size={12} />
                Selected: {MONTHS[monthIndex]} {selectedDay}, {year}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              Click any date to inspect inventory progress and purchase metrics
              for that day.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/inventory/old')}
            className="h-9 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            Old Dashboard
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col justify-between rounded-xl border border-line bg-page/50 p-4">
            <div>
              <p className="text-2xl font-bold text-ink">
                {summary?.accuracy_pct ?? 0}% Update Accuracy
              </p>
              <p className="mt-2 text-sm font-medium text-primary">
                Days with stock activity this month (up to selected day)
              </p>
              <p className="mt-1 text-sm text-muted">
                Viewing data for{' '}
                <span className="font-semibold text-ink">
                  Day {selectedDay} of {daysInMonth}
                </span>
                {loading ? ' · Loading…' : ''}.
              </p>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>Day {selectedDay}</span>
                <span>{daysInMonth} Days Total</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (selectedDay / daysInMonth) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-ink">
                {MONTHS[monthIndex]}&apos;s {year} Progress
              </h2>
              <select
                value={monthIndex}
                onChange={(event) => {
                  const m = Number(event.target.value)
                  setMonthIndex(m)
                  setSelectedDay(1)
                }}
                className="h-8 rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:grid-cols-10 lg:grid-cols-11">
              {calendarDays.map((day) => {
                const isSelected = day === selectedDay
                const isToday =
                  day === todayDate && monthIndex === today.getMonth()
                const isFuture =
                  year > today.getFullYear() ||
                  (year === today.getFullYear() &&
                    monthIndex > today.getMonth()) ||
                  (year === today.getFullYear() &&
                    monthIndex === today.getMonth() &&
                    day > todayDate)

                return (
                  <button
                    type="button"
                    key={day}
                    disabled={isFuture}
                    onClick={() => {
                      if (!isFuture) setSelectedDay(day)
                    }}
                    className={`flex h-9 items-center justify-center rounded-md border text-sm font-medium transition-all ${
                      isFuture
                        ? 'cursor-not-allowed border-line/40 bg-page/30 text-muted/40 opacity-50'
                        : isSelected
                          ? 'cursor-pointer border-primary bg-primary font-bold text-white shadow-sm ring-2 ring-primary/30'
                          : isToday
                            ? 'cursor-pointer border-dashed border-primary text-primary hover:bg-primary/5'
                            : 'cursor-pointer border-line text-ink hover:border-primary/40 hover:bg-page'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line/60 pt-3">
              <p className="text-xs text-muted">
                Showing inventory data for:{' '}
                <span className="font-semibold text-ink">
                  {MONTHS[monthIndex]} {selectedDay}, {year}
                </span>
              </p>
              <button
                type="button"
                onClick={() => navigate('/inventory/closing-stock')}
                className="h-9 rounded-lg border border-line bg-card px-4 text-xs font-semibold text-ink transition-colors hover:bg-page"
              >
                Update Closing for {MONTHS[monthIndex]} {selectedDay}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink">Current Inventory</h2>
            <p className="mt-1 text-sm text-muted">
              Live stock balances and restock alerts
              {summary ? ` · ${summary.date}` : ''}.
            </p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[220px_1fr_280px]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">Worth of Stocks</p>
              <p className="mt-2 text-xl font-bold text-ink">
                ₹ {money(summary?.stock_worth ?? 0)}
              </p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">Wastage (day)</p>
              <p className="mt-2 text-sm font-semibold text-primary">
                ₹ {money(summary?.wastage_total ?? 0)} ·{' '}
                {summary?.wastage_count ?? 0} docs
              </p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">
                Raw Materials Below Par Level
              </p>
              <p className="mt-2 text-xl font-bold text-ink">
                {summary?.below_par_count ?? 0}
              </p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">
                Raw Materials Below Min. Level
              </p>
              <p className="mt-2 text-xl font-bold text-ink">
                {summary?.below_min_count ?? 0}
              </p>
            </article>
          </div>

          <div className="rounded-xl border border-line p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">Low Stock Alert</h3>
            </div>
            {!summary?.low_stock.length ? (
              <p className="py-8 text-center text-sm text-muted">
                No materials below min / at-par
              </p>
            ) : (
              <ul className="space-y-2.5">
                {summary.low_stock.map((item) => (
                  <li
                    key={item.raw_material_id}
                    className="flex items-center gap-3"
                  >
                    <span className="w-28 shrink-0 truncate text-sm font-medium text-ink">
                      {item.name}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-300"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right text-xs text-muted">
                      {item.stock_qty} {item.unit_name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-line p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">
                Top Raw Materials
              </h3>
            </div>
            <div className="h-48">
              {pieData.length === 0 ? (
                <p className="flex h-full items-center justify-center text-sm text-muted">
                  No stock value yet
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink">COGS Breakdown</h2>
            <p className="mt-1 text-sm text-muted">
              Food costing is not available yet — recipe/sales cost engine
              pending.
            </p>
          </div>
          <span className="rounded-lg bg-page px-2.5 py-1 text-xs font-medium text-muted">
            COGS unavailable
          </span>
        </div>
        <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-line text-sm text-muted">
          Item margins and ingredient COGS will appear here once costing is
          implemented.
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-ink">Purchase Insights</h2>
          <p className="mt-1 text-sm text-muted">
            Selected-day purchase totals and month supplier breakdown.
          </p>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-line bg-page/40 p-4">
            <p className="text-xs text-muted">Total Purchase (day)</p>
            <p className="mt-1 text-xl font-bold text-ink">
              ₹ {money(summary?.purchase_total ?? 0)}
            </p>
          </article>
          <article className="rounded-xl border border-line bg-page/40 p-4">
            <p className="text-xs text-muted">Pending Payment (day)</p>
            <p className="mt-1 text-xl font-bold text-ink">
              ₹ {money(summary?.pending_payment ?? 0)}
            </p>
          </article>
        </div>

        <div className="h-72 rounded-xl border border-line p-3">
          {supplierBars.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted">
              No purchases this month
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierBars}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="current" name="Current Purchase" fill="#ff0917" />
                <Bar dataKey="pending" name="Pending Purchase" fill="#f67d00" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Pending Tasks</h2>
            <p className="mt-1 text-sm text-muted">
              Purchase orders with delivery on or after the selected day.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/inventory/purchase-order')}
              className="h-8 rounded-md border border-line bg-card px-2.5 text-xs font-semibold text-ink hover:bg-page"
            >
              + Create PO
            </button>
            <button
              type="button"
              aria-label="Refresh"
              onClick={() => void load()}
              className="inline-flex size-8 items-center justify-center rounded-md border border-line text-muted hover:bg-page hover:text-ink"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {summary?.pending_tasks && summary.pending_tasks.length > 0 ? (
          <div className="divide-y divide-line rounded-xl border border-line">
            {summary.pending_tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 hover:bg-page/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Package size={17} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink">
                        {task.supplier || '—'}
                      </p>
                      <span className="font-mono text-xs text-muted">
                        ({task.po_number})
                      </span>
                    </div>
                    <p className="text-xs text-muted">{task.items}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink">
                      ₹{money(task.amount)}
                    </p>
                    <p className="text-xs text-muted">
                      Due {task.delivery_date}
                    </p>
                  </div>
                  <span className="rounded-md bg-accent/15 px-2 py-1 text-xs font-semibold text-accent">
                    {task.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-dashed border-line p-6 text-center">
            <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 size={24} />
            </span>
            <p className="text-sm font-semibold text-ink">
              No pending POs from {MONTHS[monthIndex]} {selectedDay}
            </p>
            <p className="mt-1 text-xs text-muted">
              Create a purchase order to see it here.
            </p>
          </div>
        )}
      </section>

      <div className="mb-2 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-sm text-ink">
            Dashboard KPIs use live stock and documents. COGS widgets stay empty
            until costing is built.
          </p>
        </div>
      </div>
    </InventoryPageShell>
  )
}
