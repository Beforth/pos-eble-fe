import { useState, type ReactNode } from 'react'
import {
  ArrowUpRight,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Globe2,
  HandCoins,
  Info,
  Landmark,
  Lock,
  QrCode,
  RefreshCw,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  CartesianGrid,
} from 'recharts'
import { FinancePageShell } from '../../components/layout/FinancePageShell'
import {
  CASH_SUMMARY,
  CASH_WEEKLY,
  DEDUCTIONS,
  FINANCE_KPIS,
  MONTH_TRENDS,
  ONLINE_RECON,
  PAYMENT_DISTRIBUTION,
  TREND_SERIES,
} from '../../mocks/financeData'
import { formatINR, formatNumber } from '../../utils/format'

type FinanceTab = 'card-upi' | 'cash' | 'online-recon'

const DATE_OPTIONS = ['Today', 'Yesterday', 'Last 7 Days', 'This Month']

const KPI_ICONS: Record<string, ReactNode> = {
  total: <FileText size={18} />,
  card: <CreditCard size={18} />,
  wallet: <Wallet size={18} />,
  cash: <HandCoins size={18} />,
  online: <Globe2 size={18} />,
  due: <HandCoins size={18} />,
  other: <Building2 size={18} />,
}

const KPI_TONES: Record<string, string> = {
  total: 'bg-primary/10 text-primary',
  card: 'bg-accent/15 text-accent',
  wallet: 'bg-secondary/40 text-deep',
  cash: 'bg-success/10 text-success',
  online: 'bg-sky-100 text-sky-700',
  due: 'bg-accent/15 text-accent',
  other: 'bg-page text-muted',
}

function DateSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-2.5 text-sm text-ink">
      <Calendar size={14} className="text-muted" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer bg-transparent outline-none"
      >
        {DATE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function InfoTip({ text }: { text: string }) {
  return (
    <span title={text} className="inline-flex text-muted">
      <Info size={13} />
    </span>
  )
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number
    color?: string
  }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  const sorted = [...payload].sort(
    (a, b) => Number(b.value ?? 0) - Number(a.value ?? 0),
  )

  return (
    <div className="min-w-[160px] rounded-lg border border-line bg-card px-3 py-2.5 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-ink">{label}</p>
      <ul className="space-y-1.5">
        {sorted.map((entry) => (
          <li
            key={String(entry.name)}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold tabular-nums text-ink">
              {formatINR(Number(entry.value ?? 0))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TrendLegend({
  payload,
}: {
  payload?: Array<{ value?: string; color?: string }>
}) {
  if (!payload?.length) return null

  return (
    <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {payload.map((entry) => (
        <li
          key={String(entry.value)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted"
        >
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  )
}

function UnlockCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-[180px] flex-1 flex-col items-start rounded-xl border border-line bg-card p-5">
      <span className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock size={18} />
      </span>
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted">
        {description}
      </p>
      <button
        type="button"
        className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        I&apos;m Interested
      </button>
    </div>
  )
}

export default function FinanceDashboard() {
  const [range, setRange] = useState('Yesterday')
  const [trendRange, setTrendRange] = useState('Last 6 Months')
  const [cardDate, setCardDate] = useState('Yesterday')
  const [digitalDate, setDigitalDate] = useState('Today')
  const [cashDate, setCashDate] = useState('Yesterday')
  const [reconDate, setReconDate] = useState('Yesterday')
  const [activeTab, setActiveTab] = useState<FinanceTab>('card-upi')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2000)
  }

  return (
    <FinancePageShell activeItem="dashboard">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">
            Track your business financial performance in real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs text-muted">Latest data retrieved just now</p>
          <button
            type="button"
            aria-label="Refresh"
            onClick={() => showToast('Data refreshed')}
            className="inline-flex size-9 items-center justify-center rounded-md border border-line bg-card text-ink hover:bg-page"
          >
            <RefreshCw size={15} />
          </button>
          <DateSelect value={range} onChange={setRange} />
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FINANCE_KPIS.map((kpi) => (
          <div
            key={kpi.id}
            className="rounded-xl border border-line bg-card p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <span
                className={`inline-flex size-9 items-center justify-center rounded-lg ${KPI_TONES[kpi.tone]}`}
              >
                {KPI_ICONS[kpi.tone]}
              </span>
              <InfoTip text={`${kpi.label} collection for selected period`} />
            </div>
            <p className="text-sm font-medium text-muted">{kpi.label}</p>
            {kpi.value == null ? (
              <p className="mt-1 text-2xl font-bold text-muted">—</p>
            ) : (
              <p className="mt-1 flex flex-wrap items-baseline gap-1.5 text-2xl font-bold text-ink">
                {formatNumber(kpi.value)}
                <ArrowUpRight size={16} className="text-sky-600" />
                {kpi.bills != null ? (
                  <span className="text-xs font-medium text-muted">
                    ({kpi.bills} Bills)
                  </span>
                ) : null}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-card p-4">
          <h2 className="mb-3 text-sm font-bold text-ink">
            Payment Distribution
          </h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PAYMENT_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {PAYMENT_DISTRIBUTION.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, _name, item) => {
                    const amount = (
                      item?.payload as { amount?: number } | undefined
                    )?.amount
                    return [
                      `${Number(value).toFixed(1)}%${amount != null ? ` · ${formatINR(amount)}` : ''}`,
                      String(item?.name ?? ''),
                    ]
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted">
            {PAYMENT_DISTRIBUTION.map((slice) => (
              <div key={slice.name} className="flex justify-between gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  {slice.name}
                </span>
                <span>
                  {slice.value.toFixed(1)}% · {formatINR(slice.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-ink">
              Month Wise Payment Trends
            </h2>
            <select
              value={trendRange}
              onChange={(event) => setTrendRange(event.target.value)}
              className="h-8 rounded-md border border-line bg-card px-2.5 text-xs font-medium text-ink outline-none"
            >
              <option>Last 6 Months</option>
              <option>Last 12 Months</option>
            </select>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={
                  trendRange === 'Last 6 Months'
                    ? MONTH_TRENDS.slice(-6)
                    : MONTH_TRENDS
                }
                margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="4 6"
                  stroke="var(--color-line)"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                  tickMargin={10}
                  tickFormatter={(value) =>
                    String(value).replace(/ 20/, ` '`)
                  }
                />
                <YAxis
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                  tickFormatter={(value) => {
                    const n = Number(value)
                    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
                    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}k`
                    return `₹${n}`
                  }}
                />
                <Tooltip
                  cursor={{
                    stroke: 'var(--color-muted)',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                  content={<TrendTooltip />}
                />
                <Legend content={<TrendLegend />} />
                {TREND_SERIES.map((series) => (
                  <Line
                    key={series.key}
                    type="monotone"
                    dataKey={series.key}
                    stroke={series.color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={{
                      r: 3.5,
                      fill: series.color,
                      strokeWidth: 0,
                    }}
                    activeDot={{
                      r: 5.5,
                      fill: series.color,
                      stroke: '#fff',
                      strokeWidth: 2,
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-line bg-card p-4">
        <h2 className="mb-3 text-sm font-bold text-ink">Deductions & Tips</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Charges', value: DEDUCTIONS.charges },
            { label: 'Tax', value: DEDUCTIONS.tax },
            { label: 'Discount', value: DEDUCTIONS.discount },
            { label: 'Tips', value: DEDUCTIONS.tips },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-line bg-page/60 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ReceiptIcon />
                </span>
                <InfoTip text={item.label} />
              </div>
              <p className="text-xs font-medium text-muted">{item.label}</p>
              <p className="mt-1 text-lg font-bold text-ink">
                {formatNumber(item.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3 border-b border-line">
        <div className="flex flex-wrap gap-1">
          {(
            [
              { id: 'card-upi', label: 'Card/UPI' },
              { id: 'cash', label: 'Cash' },
              { id: 'online-recon', label: 'Online Order Reconciliation' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'card-upi' ? (
        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-card p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink">
                  Card & UPI Payouts
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  Total transactions processed through Card, Wallet, and any
                  custom payment types.
                </p>
              </div>
              <DateSelect value={cardDate} onChange={setCardDate} />
            </div>

            <div className="mb-5 flex flex-wrap items-stretch justify-center gap-3 lg:gap-4">
              <div className="flex w-full max-w-[220px] flex-col gap-3">
                <FlowCard
                  icon={<CreditCard size={18} />}
                  title="EDC Transaction Amount"
                  empty
                />
                <FlowCard
                  icon={<QrCode size={18} />}
                  title="UPI Transaction Amount"
                  empty
                />
              </div>
              <div className="hidden items-center text-sky-500 lg:flex">→</div>
              <div className="flex w-full max-w-[220px] items-center">
                <FlowCard
                  icon={<HandCoins size={18} />}
                  title="Provider Charges"
                  empty
                />
              </div>
              <div className="hidden items-center text-sky-500 lg:flex">→</div>
              <div className="flex w-full max-w-[220px] items-center">
                <FlowCard
                  icon={<Landmark size={18} />}
                  title="Aggregate Payout"
                  empty
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <UnlockCard
                title="Unlock insights with Swipe-machine integration"
                description="Integrate your swipe machine to see all your payouts in one place and get clearer, more accurate insights instantly."
              />
              <UnlockCard
                title="Unlock insights with Swipe-machine integration"
                description="Integrate your swipe machine to see all your payouts in one place and get clearer, more accurate insights instantly."
              />
            </div>
          </section>

          <section className="rounded-xl border border-line bg-card p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink">
                  More Digital Payments
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  Total sales from all other custom payment types created in
                  your outlet.
                </p>
              </div>
              <DateSelect value={digitalDate} onChange={setDigitalDate} />
            </div>
            <div className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed border-line bg-page/50 px-4 py-8 text-center">
              <FileText size={40} className="mb-2 text-muted/50" />
              <p className="text-sm font-semibold text-ink">
                No Digital Payment Transactions Found
              </p>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === 'cash' ? (
        <div className="space-y-4">
          <section className="rounded-xl border border-line bg-card p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-ink">Cash</h2>
                <p className="mt-0.5 text-xs text-muted">
                  Total cash transactions bifurcation as per your day end
                  records.
                </p>
              </div>
              <DateSelect value={cashDate} onChange={setCashDate} />
            </div>

            <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CashStatCard
                title="Opening Balance"
                value={CASH_SUMMARY.opening}
                meta={`As of ${CASH_SUMMARY.asOf}`}
                tone="blue"
              />
              <CashStatCard
                title="Total Bills"
                value={CASH_SUMMARY.totalBills}
                meta={`${CASH_SUMMARY.billCount} Transactions`}
                tone="blue"
              />
              <CashStatCard
                title="Closing Balance"
                value={CASH_SUMMARY.closing}
                meta={`As of ${CASH_SUMMARY.asOf}`}
                tone="green"
              />
              <CashStatCard
                title="Missing Amount"
                value={CASH_SUMMARY.missing}
                meta={`Opening + Bills - Closing (${CASH_SUMMARY.asOf})`}
                tone="danger"
                warn
              />
            </div>

            <h3 className="mb-3 text-sm font-bold text-ink">
              Weekly Cash Utilization Trend
            </h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CASH_WEEKLY}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-line)"
                  />
                  <XAxis dataKey="slot" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) =>
                      Number(value) >= 100000
                        ? `₹${(Number(value) / 100000).toFixed(0)}L`
                        : `₹${(Number(value) / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip formatter={(value) => formatINR(Number(value))} />
                  <Legend />
                  <Bar
                    dataKey="lastWeek"
                    name="Last Week"
                    fill="#93c5fd"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="currentWeek"
                    name="Current Week"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === 'online-recon' ? (
        <section className="rounded-xl border border-line bg-card p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-ink">
                Online Order Reconciliation
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Online order reconciliation for all integrated Zomato and Swiggy
                outlets.
              </p>
            </div>
            <DateSelect value={reconDate} onChange={setReconDate} />
          </div>

          <div className="space-y-3">
            {ONLINE_RECON.map((platform) => (
              <div
                key={platform.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-page/40 px-4 py-3"
              >
                <div className="min-w-[110px]">
                  <p className="text-sm font-bold text-ink">{platform.name}</p>
                  <p className="text-xs text-muted">
                    {platform.outlets} Outlets
                  </p>
                </div>
                <p className="text-sm text-ink">
                  Total Orders:{' '}
                  <span className="font-semibold">{platform.orders}</span>
                </p>
                <p className="blur-[5px] select-none text-sm font-semibold text-ink">
                  {formatINR(platform.amount)}
                </p>
                <div className="flex min-w-0 flex-1 items-start gap-2 text-xs text-primary">
                  <Lock size={14} className="mt-0.5 shrink-0" />
                  <span>
                    Advanced Insights Are Locked! Turn on online order
                    reconciliation to unlock platform-level settlement details.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => showToast('Interest recorded')}
                  className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  I&apos;m Interested
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </FinancePageShell>
  )
}

function ReceiptIcon() {
  return <FileText size={15} />
}

function FlowCard({
  icon,
  title,
  empty,
}: {
  icon: ReactNode
  title: string
  empty?: boolean
}) {
  return (
    <div className="w-full rounded-xl border border-line bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="inline-flex size-8 items-center justify-center rounded-md bg-sky-50 text-sky-600">
          {icon}
        </span>
        <InfoTip text={title} />
      </div>
      <p className="text-xs font-semibold text-ink">{title}</p>
      <p className="mt-2 text-lg font-bold text-muted">—</p>
      {empty ? (
        <p className="mt-1 text-[11px] text-muted">No Transaction Found.</p>
      ) : null}
    </div>
  )
}

function CashStatCard({
  title,
  value,
  meta,
  tone,
  warn,
}: {
  title: string
  value: number
  meta: string
  tone: 'blue' | 'green' | 'danger'
  warn?: boolean
}) {
  const toneClass =
    tone === 'green'
      ? 'bg-success/10 text-success'
      : tone === 'danger'
        ? 'bg-primary/10 text-primary'
        : 'bg-sky-100 text-sky-700'

  return (
    <div className="rounded-xl border border-line bg-card p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={`inline-flex size-9 items-center justify-center rounded-lg ${toneClass}`}
        >
          {warn ? <TriangleAlert size={16} /> : <FileText size={16} />}
        </span>
        <InfoTip text={title} />
      </div>
      <p className="text-xs font-medium text-muted">{title}</p>
      <p className="mt-1 text-lg font-bold text-ink">
        Rs. {formatNumber(value)}
      </p>
      <p className="mt-1 text-[11px] text-muted">{meta}</p>
    </div>
  )
}
