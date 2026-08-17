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
  Calendar,
  CheckCircle2,
  Lightbulb,
  Package,
  RefreshCw,
  TrendingDown,
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

export default function InventoryDashboard() {
  const navigate = useNavigate()
  const today = new Date()
  const [monthIndex, setMonthIndex] = useState(today.getMonth())
  const year = today.getFullYear()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const todayDate = today.getDate()
  const [selectedDay, setSelectedDay] = useState<number>(
    monthIndex === today.getMonth() ? todayDate : 1,
  )

  const calendarDays = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth],
  )

  // Dynamic values calculated based on selectedDay & month
  const dynamicStockStats = useMemo(() => {
    const worth = 240000 + selectedDay * 3150
    const wastagePct = Math.max(8, 38 - ((selectedDay * 3) % 25))
    const belowPar = Math.max(2, ((selectedDay * 3) % 9) + 3)
    const belowMin = Math.max(4, ((selectedDay * 4) % 11) + 5)

    const lowStock = inventoryLowStock.map((item, idx) => {
      const days = Math.max(1, ((item.days + selectedDay + idx) % 9) + 1)
      const pct = Math.min(
        95,
        Math.max(15, ((item.pct + selectedDay * 4 + idx * 6) % 80) + 18),
      )
      return { ...item, days, pct }
    })

    const topRaw = inventoryTopRawShare.map((item, idx) => {
      const delta = ((selectedDay * (idx + 1)) % 7) - 3
      return { ...item, value: Math.max(6, item.value + delta) }
    })

    return { worth, wastagePct, belowPar, belowMin, lowStock, topRaw }
  }, [selectedDay])

  const dynamicCogs = useMemo(() => {
    const cogsAmount = 105000 + selectedDay * 1850
    const profitItems = [
      { name: 'Matar Paneer', margin: '68% Profit Margin' },
      { name: 'Paneer Butter Masala', margin: '64% Profit Margin' },
      { name: 'Dal Makhani', margin: '71% Profit Margin' },
      { name: 'Kaju Curry', margin: '62% Profit Margin' },
    ]
    const lossItems = [
      { name: 'Bhindi Masala', margin: '22% Profit Margin' },
      { name: 'Veg Kadai', margin: '28% Profit Margin' },
      { name: 'Mix Veg', margin: '25% Profit Margin' },
      { name: 'Palak Paneer', margin: '30% Profit Margin' },
    ]

    const highestProfit = profitItems[selectedDay % profitItems.length]
    const leastProfit = lossItems[selectedDay % lossItems.length]

    const barData = inventoryRawMaterials.map((item, idx) => {
      const variance = (selectedDay * 32 * (idx % 2 === 0 ? 1 : -0.7))
      return {
        ...item,
        value: Math.max(400, Math.round(item.value + variance)),
      }
    })

    return { cogsAmount, highestProfit, leastProfit, barData }
  }, [selectedDay])

  const dynamicPurchase = useMemo(() => {
    const totalPurchase = 920000 + selectedDay * 13800
    const pendingPayment = 8400 + selectedDay * 580

    const supplierPrices = inventorySupplierPrices.map((row, rIdx) => ({
      ...row,
      prices: row.prices.map((p, cIdx) =>
        Math.round(p + ((selectedDay + rIdx + cIdx) % 7) - 3),
      ),
    }))

    const supplierPurchases = inventoryPurchaseBySupplier.map((s, idx) => ({
      ...s,
      current: Math.round(s.current + selectedDay * 2200 * (idx % 2 === 0 ? 1 : 0.7)),
      pending: Math.round(s.pending + selectedDay * 750 * (idx % 2 === 0 ? 0.8 : 1.1)),
    }))

    return { totalPurchase, pendingPayment, supplierPrices, supplierPurchases }
  }, [selectedDay])

  const dynamicPendingTasks = useMemo(() => {
    const isCurrentOrFuture =
      monthIndex === today.getMonth() ? selectedDay >= todayDate - 4 : true

    if (isCurrentOrFuture) {
      return [
        {
          id: `PO-88${selectedDay}1`,
          supplier: 'Amul Dairy Distribution',
          items: 'Milk, Butter, Paneer (50kg)',
          amount: 34200 + selectedDay * 400,
          stage: 'Pending Delivery',
          stageTone: 'bg-accent/15 text-accent',
          due: `Expected by 5:00 PM`,
        },
        {
          id: `PO-88${selectedDay}4`,
          supplier: 'Metro Wholesale Traders',
          items: 'Flour, Spices & Packaging',
          amount: 19800 + selectedDay * 300,
          stage: 'Vendor Confirmed',
          stageTone: 'bg-primary/10 text-primary',
          due: `Order placed on ${selectedDay} ${MONTHS[monthIndex]}`,
        },
      ]
    }
    return []
  }, [selectedDay, monthIndex, todayDate])

  const accuracyPct = Math.min(
    100,
    Math.max(0, Math.round(((daysInMonth - selectedDay) / daysInMonth) * 100)),
  )

  return (
    <InventoryPageShell activeItem="dashboard">
      {/* Daily Stock Closing Tracker */}
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
              Click any date to inspect inventory progress, COGS, and purchase metrics for that day.
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
                {accuracyPct}% Update Accuracy
              </p>
              <p className="mt-2 text-sm font-medium text-primary">
                {selectedDay === todayDate && monthIndex === today.getMonth()
                  ? "Today's stock record in progress"
                  : selectedDay < todayDate
                    ? `Records verified for ${MONTHS[monthIndex]} ${selectedDay}`
                    : `Upcoming scheduled cycle for ${MONTHS[monthIndex]} ${selectedDay}`}
              </p>
              <p className="mt-1 text-sm text-muted">
                Viewing data for{' '}
                <span className="font-semibold text-ink">
                  Day {selectedDay} of {daysInMonth}
                </span>
                .
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
                  (year === today.getFullYear() && monthIndex > today.getMonth()) ||
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
                    title={
                      isFuture
                        ? `Future date (${MONTHS[monthIndex]} ${day}) - unavailable`
                        : `View data for ${MONTHS[monthIndex]} ${day}`
                    }
                    className={`flex h-9 items-center justify-center rounded-md border text-sm font-medium transition-all ${
                      isFuture
                        ? 'cursor-not-allowed border-line/40 bg-page/30 text-muted/40 opacity-50'
                        : isSelected
                          ? 'cursor-pointer border-primary bg-primary font-bold text-white shadow-sm ring-2 ring-primary/30'
                          : isToday
                            ? 'cursor-pointer border-dashed border-primary text-primary hover:scale-105 hover:bg-primary/5 active:scale-95'
                            : 'cursor-pointer border-line text-ink hover:scale-105 hover:border-primary/40 hover:bg-page active:scale-95'
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

      {/* Current Inventory */}
      <section className="mb-6 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink">Current Inventory</h2>
            <p className="mt-1 text-sm text-muted">
              Inventory status and restock alerts for {MONTHS[monthIndex]} {selectedDay}, {year}.
            </p>
          </div>
          <span className="rounded-lg bg-page px-2.5 py-1 text-xs font-medium text-muted">
            Day {selectedDay} Metrics
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-[220px_1fr_280px]">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">Worth of Stocks</p>
              <p className="mt-2 text-xl font-bold text-ink">
                ₹ {dynamicStockStats.worth.toLocaleString('en-IN')}
              </p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">Wastage Alert</p>
              <p className="mt-2 text-sm font-semibold text-primary">
                {dynamicStockStats.wastagePct}% Stock is getting wasted if not used
              </p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">
                Raw Materials Below Par Level
              </p>
              <p className="mt-2 text-xl font-bold text-ink">
                {dynamicStockStats.belowPar}
              </p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs font-medium text-muted">
                Raw Materials Below Min. Level
              </p>
              <p className="mt-2 text-xl font-bold text-ink">
                {dynamicStockStats.belowMin}
              </p>
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
              {dynamicStockStats.lowStock.map((item) => (
                <li key={item.name} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-sm font-medium text-ink">
                    {item.name}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-300"
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
                    data={dynamicStockStats.topRaw}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                  >
                    {dynamicStockStats.topRaw.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* COGS Breakdown */}
      <section className="mb-6 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink">COGS Breakdown</h2>
            <p className="mt-1 text-sm text-muted">
              Cost of goods sold and ingredient consumption for {MONTHS[monthIndex]} {selectedDay}.
            </p>
          </div>
          <span className="rounded-lg bg-page px-2.5 py-1 text-xs font-medium text-muted">
            ₹ {dynamicCogs.cogsAmount.toLocaleString('en-IN')} Total COGS
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="space-y-3">
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <p className="text-xs text-muted">COGS</p>
              <p className="mt-1 text-xl font-bold text-ink">
                ₹ {dynamicCogs.cogsAmount.toLocaleString('en-IN')}
              </p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <div className="flex items-center gap-1 text-success">
                <TrendingUp size={14} />
                <p className="text-sm font-semibold text-ink">
                  {dynamicCogs.highestProfit.name}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted">
                {dynamicCogs.highestProfit.margin}
              </p>
            </article>
            <article className="rounded-xl border border-line bg-page/40 p-4">
              <div className="flex items-center gap-1 text-primary">
                <TrendingDown size={14} />
                <p className="text-sm font-semibold text-ink">
                  {dynamicCogs.leastProfit.name}
                </p>
              </div>
              <p className="mt-1 text-xs text-muted">
                {dynamicCogs.leastProfit.margin}
              </p>
            </article>
          </div>
          <div className="h-64 rounded-xl border border-line p-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dynamicCogs.barData}
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
      </section>

      {/* Purchase Insights */}
      <section className="mb-6 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Purchase Insights</h2>
            <p className="mt-1 text-sm text-muted">
              Purchase history and supplier-wise breakdown for {MONTHS[monthIndex]} {selectedDay}.
            </p>
          </div>
          <div className="flex gap-2">
            <select className="h-8 rounded-md border border-line bg-card px-2 text-xs">
              <option>Top 10 Suppliers</option>
            </select>
            <select className="h-8 rounded-md border border-line bg-card px-2 text-xs">
              <option>Selected Day View</option>
            </select>
          </div>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-line bg-page/40 p-4">
            <p className="text-xs text-muted">Total Purchase</p>
            <p className="mt-1 text-xl font-bold text-ink">
              ₹ {dynamicPurchase.totalPurchase.toLocaleString('en-IN')}
            </p>
          </article>
          <article className="rounded-xl border border-line bg-page/40 p-4">
            <p className="text-xs text-muted">Pending Payment</p>
            <p className="mt-1 text-xl font-bold text-ink">
              ₹ {dynamicPurchase.pendingPayment.toLocaleString('en-IN')}
            </p>
          </article>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="overflow-x-auto rounded-xl border border-line">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <p className="text-sm font-semibold text-ink">
                Supplier Price Comparison
              </p>
              <span className="text-xs text-muted">Latest Prices</span>
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
                {dynamicPurchase.supplierPrices.map((row) => (
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
              <BarChart data={dynamicPurchase.supplierPurchases}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="current" name="Current Purchase" fill="#ff0917" />
                <Bar dataKey="pending" name="Pending Purchase" fill="#f67d00" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Pending Tasks */}
      <section className="mb-6 rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Pending Tasks</h2>
            <p className="mt-1 text-sm text-muted">
              Purchase orders pending delivery or approval for {MONTHS[monthIndex]} {selectedDay}, {year}.
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
              className="inline-flex size-8 items-center justify-center rounded-md border border-line text-muted hover:bg-page hover:text-ink"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {dynamicPendingTasks.length > 0 ? (
          <div className="divide-y divide-line rounded-xl border border-line">
            {dynamicPendingTasks.map((task) => (
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
                        {task.supplier}
                      </p>
                      <span className="font-mono text-xs text-muted">
                        ({task.id})
                      </span>
                    </div>
                    <p className="text-xs text-muted">{task.items}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink">
                      ₹{task.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-muted">{task.due}</p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${task.stageTone}`}
                  >
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
              All Orders Cleared for {MONTHS[monthIndex]} {selectedDay}
            </p>
            <p className="mt-1 text-xs text-muted">
              No pending purchase orders or stock discrepancies recorded for this date.
            </p>
          </div>
        )}
      </section>

      {/* Customize banner */}
      <div className="mb-2 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-sm text-ink">
            You can customize the inventory dashboard widgets, view key metrics, and adjust widget priorities.
          </p>
        </div>
        <button
          type="button"
          className="h-9 shrink-0 rounded-lg border border-primary bg-card px-4 text-sm font-semibold text-primary hover:bg-primary/5"
        >
          Customize
        </button>
      </div>
    </InventoryPageShell>
  )
}
