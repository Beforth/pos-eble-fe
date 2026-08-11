import { useMemo, useState } from 'react'
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
  Lightbulb,
  RefreshCw,
  Search,
  TrendingUp,
} from 'lucide-react'
import { InventoryPageShell } from '../../components/layout/InventoryPageShell'
import {
  inventoryLowStock,
  inventoryPurchaseBySupplier,
  inventoryRawMaterials,
  inventorySupplierPrices,
  inventoryTopRawShare,
} from '../../mocks/inventoryDashboardData'

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

type InsightKey = 'stock' | 'cogs' | 'purchase' | null

function InsightModal({
  open,
  title,
  body,
  onClose,
}: {
  open: boolean
  title: string
  body: string
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4">
      <div className="pointer-events-auto w-full max-w-md rounded-xl border border-primary/20 bg-primary/5 p-5 text-center shadow-lg backdrop-blur-sm">
        <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-card text-primary shadow-sm">
          <TrendingUp size={18} />
        </span>
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted">{body}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 h-9 rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink hover:bg-page"
        >
          Update Now
        </button>
      </div>
    </div>
  )
}

export default function InventoryDashboard() {
  const navigate = useNavigate()
  const today = new Date()
  const [monthIndex, setMonthIndex] = useState(today.getMonth())
  const [insight, setInsight] = useState<InsightKey>('stock')
  const year = today.getFullYear()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const missedDays = Math.min(9, today.getDate() - 1)
  const todayDate = today.getDate()

  const calendarDays = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  )

  return (
    <InventoryPageShell activeItem="dashboard">
      {/* Daily Stock Closing Tracker */}
      <section className="mb-6 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-ink">
              Daily Stock Closing Tracker
            </h1>
            <p className="mt-1 text-sm text-muted">
              Monitor how consistently closing stock is updated across the month.
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
          <div className="rounded-xl border border-line bg-page/50 p-4">
            <p className="text-2xl font-bold text-ink">0% Update Accuracy</p>
            <p className="mt-2 text-sm font-medium text-primary">
              Stock records are not up to date.
            </p>
            <p className="mt-1 text-sm text-muted">
              Closing stock has been updated on{' '}
              <span className="font-semibold text-ink">0 days</span> this month.
            </p>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>{missedDays} days missed</span>
                <span>{daysInMonth} days</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${Math.min(100, (missedDays / daysInMonth) * 100)}%`,
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
                onChange={(event) => setMonthIndex(Number(event.target.value))}
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
                const missed = day <= missedDays
                const isToday =
                  day === todayDate && monthIndex === today.getMonth()
                const future = day > todayDate && monthIndex === today.getMonth()
                return (
                  <span
                    key={day}
                    className={`flex h-9 items-center justify-center rounded-md border text-sm font-medium ${
                      missed
                        ? 'border-primary/50 text-primary'
                        : isToday
                          ? 'border-dashed border-ink text-ink'
                          : future
                            ? 'border-line text-muted/50'
                            : 'border-line text-ink'
                    }`}
                  >
                    {day}
                  </span>
                )
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="h-10 rounded-lg border border-line bg-card px-4 text-sm font-semibold text-ink hover:bg-page"
              >
                Update Today&apos;s Closing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Current Inventory */}
      <section className="relative mb-6 overflow-hidden rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-ink">Current Inventory</h2>
          <p className="mt-1 text-sm text-muted">
            Track your current inventory and identify items that need restocking.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[220px_1fr_280px]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">Worth of Stocks</p>
              <p className="mt-2 text-xl font-bold text-ink">₹ 2,60,500</p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">Wastage Alert</p>
              <p className="mt-2 text-sm font-semibold text-primary">
                40% Stock is getting wasted if not used
              </p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">
                Raw Materials Below Par Level
              </p>
              <p className="mt-2 text-xl font-bold text-ink">8</p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">
                Raw Materials Below Min. Level
              </p>
              <p className="mt-2 text-xl font-bold text-ink">12</p>
            </article>
          </div>

          <div className="rounded-xl border border-line p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">Low Stock Alert</h3>
              <select className="h-8 rounded-md border border-line bg-card px-2 text-xs outline-none">
                <option>All Categories</option>
              </select>
            </div>
            <ul className="space-y-2.5">
              {inventoryLowStock.map((item) => (
                <li key={item.name} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-sm font-medium text-ink">
                    {item.name}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right text-xs text-muted">
                    {item.days} Days
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-line p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">
                Top 10 Raw Materials
              </h3>
              <select className="h-8 rounded-md border border-line bg-card px-2 text-xs outline-none">
                <option>All Categories</option>
              </select>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryTopRawShare}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                  >
                    {inventoryTopRawShare.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <InsightModal
          open={insight === 'stock'}
          title="Get Your Current Stock Insights"
          body="To View Current Stock Insights, Including Inventory Value, Low Stock Information & Min Or At Par Level, Please Update Your Stock And Purchase Details."
          onClose={() => setInsight(null)}
        />
      </section>

      {/* COGS */}
      <section className="relative mb-6 overflow-hidden rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-ink">COGS Breakdown</h2>
          <p className="mt-1 text-sm text-muted">
            Track your current inventory and identify items that need restocking.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="space-y-3">
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs text-muted">COGS</p>
              <p className="mt-1 text-xl font-bold text-ink">₹ 1,10,500</p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-sm font-semibold text-ink">Matar Paneer</p>
              <p className="mt-1 text-xs text-muted">
                Highest Profit Generating Item
              </p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-sm font-semibold text-ink">Bhindi Masala</p>
              <p className="mt-1 text-xs text-muted">
                Least Profit Generating Item
              </p>
            </article>
          </div>
          <div className="h-64 rounded-xl border border-line p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inventoryRawMaterials}
                layout="vertical"
                margin={{ left: 16, right: 16 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="value" fill="#ff0917" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <InsightModal
          open={insight === 'cogs'}
          title="Want To See What's Driving Your Costs?"
          body="To View Ingredient-Level COGS Breakdown And Identify Profit Or Loss Drivers, Please Update Your Raw Material And Recipe Master."
          onClose={() => setInsight(null)}
        />
      </section>

      {/* Purchase Insights */}
      <section className="relative mb-6 overflow-hidden rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Purchase Insights</h2>
            <p className="mt-1 text-sm text-muted">
              Get a complete picture of your purchase history, pricing patterns,
              and supplier-wise breakdown.
            </p>
          </div>
          <div className="flex gap-2">
            <select className="h-8 rounded-md border border-line bg-card px-2 text-xs">
              <option>Top 10</option>
            </select>
            <select className="h-8 rounded-md border border-line bg-card px-2 text-xs">
              <option>Last 15 Days</option>
            </select>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-line bg-page/40 p-4">
            <p className="text-xs text-muted">Total Purchase</p>
            <p className="mt-1 text-xl font-bold text-ink">₹ 10,10,500</p>
          </article>
          <article className="rounded-xl border border-line bg-page/40 p-4">
            <p className="text-xs text-muted">Pending Payment</p>
            <p className="mt-1 text-xl font-bold text-ink">₹ 10,105</p>
          </article>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="overflow-x-auto rounded-xl border border-line">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <p className="text-sm font-semibold text-ink">
                Supplier Price Comparison
              </p>
              <select className="h-8 rounded-md border border-line bg-card px-2 text-xs">
                <option>Last 5 purchase</option>
              </select>
            </div>
            <table className="min-w-full text-left text-sm">
              <thead className="bg-page text-xs text-muted">
                <tr>
                  <th className="px-3 py-2">Item</th>
                  {['A', 'B', 'C', 'D', 'E'].map((s) => (
                    <th key={s} className="px-3 py-2">
                      Supplier {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventorySupplierPrices.map((row) => (
                  <tr key={row.item} className="border-t border-line">
                    <td className="px-3 py-2.5 font-medium text-ink">
                      {row.item}
                    </td>
                    {row.prices.map((price, index) => (
                      <td key={`${row.item}-${index}`} className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                            index === 0
                              ? 'bg-primary/10 text-primary'
                              : 'bg-page text-ink'
                          }`}
                        >
                          ₹{price}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-4 border-t border-line px-3 py-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full border border-primary" />
                Current Purchase
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-accent" />
                Pending Purchase
              </span>
            </div>
          </div>

          <div className="h-72 rounded-xl border border-line p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryPurchaseBySupplier}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="current" name="Current Purchase" fill="#ff0917" />
                <Bar dataKey="pending" name="Pending Purchase" fill="#f67d00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <InsightModal
          open={insight === 'purchase'}
          title="Get Insights Into Your Purchase Trends"
          body="To View Detailed Purchase Analytics And Supplier Breakdowns, Please Update Your Purchase Records."
          onClose={() => setInsight(null)}
        />
      </section>

      {/* Pending Tasks */}
      <section className="mb-6 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Pending Tasks</h2>
            <p className="mt-1 text-sm text-muted">
              Get a complete view of your purchase orders, showing which POs are
              pending and their current stage.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select className="h-8 rounded-md border border-line bg-card px-2 text-xs">
              <option>Last 7 days</option>
            </select>
            <button
              type="button"
              aria-label="Refresh"
              className="inline-flex size-8 items-center justify-center rounded-md border border-line text-muted hover:bg-page hover:text-ink"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
        <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
          <span className="mb-3 flex size-14 items-center justify-center rounded-full bg-page text-muted">
            <Search size={24} />
          </span>
          <p className="text-sm font-semibold text-ink">
            No Pending Order Data Found.
          </p>
        </div>
      </section>

      {/* Customize banner */}
      <div className="mb-2 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-sm text-ink">
            Here, You can customise the inventory dashboard, view the necessary
            widgets, and adjust the widget&apos;s priority.
          </p>
        </div>
        <button
          type="button"
          className="h-9 shrink-0 rounded-lg border border-primary bg-card px-4 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Customize
        </button>
      </div>

      {/* Re-open insight chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            ['stock', 'Stock Insights'],
            ['cogs', 'COGS Insights'],
            ['purchase', 'Purchase Insights'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setInsight(key)}
            className="rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-muted hover:border-primary/30 hover:text-primary"
          >
            Show {label}
          </button>
        ))}
      </div>
    </InventoryPageShell>
  )
}
