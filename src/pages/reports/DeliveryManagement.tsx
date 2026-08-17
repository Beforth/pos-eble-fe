import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import { DateTimeField } from '../../components/common/DateTimeField'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { theme } from '../../theme/colors'
import { brand } from '../../theme/brand'
import { formatINR } from '../../utils/format'

const PROVIDER_OPTIONS = [
  'All',
  'Dunzo',
  'Shadowfax',
  'Porter',
  'Own Delivery',
]

const ORDER_DONUT = [
  {
    name: 'No. of Orders',
    value: 1218,
    color: theme.colors.accent,
  },
  {
    name: 'No. of Third Party Orders',
    value: 0,
    color: theme.colors.deep,
  },
]

const DELIVERED_TREND = [
  { date: '6th Aug', delivered: 0 },
  { date: '7th Aug', delivered: 0 },
  { date: '8th Aug', delivered: 0 },
  { date: '9th Aug', delivered: 0 },
  { date: '10th Aug', delivered: 0 },
  { date: '11th Aug', delivered: 0 },
  { date: '12th Aug', delivered: 0 },
]

export default function DeliveryManagement() {
  const [startDate, setStartDate] = useState(
    () => new Date(2026, 7, 6, 0, 0, 0),
  )
  const [endDate, setEndDate] = useState(
    () => new Date(2026, 7, 12, 23, 59, 59),
  )
  const [provider, setProvider] = useState('All')
  const [toast, setToast] = useState<string | null>(null)

  const totalOrders = useMemo(
    () => ORDER_DONUT.reduce((sum, slice) => sum + slice.value, 0),
    [],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    showToast('Search applied')
  }

  function handleShowAll() {
    setStartDate(new Date(2026, 7, 6, 0, 0, 0))
    setEndDate(new Date(2026, 7, 12, 23, 59, 59))
    setProvider('All')
    showToast('Showing all records')
  }

  return (
    <ReportsPageShell
      title="Delivery Management"
      activeItem="delivery-management"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm text-ink">
            <p>
              Credit Remaining:{' '}
              <span className="font-semibold text-deep">{formatINR(0)}</span>
            </p>
            <p>
              Credit Purchase Till Now:{' '}
              <span className="font-semibold text-deep">{formatINR(0)}</span>
            </p>
          </div>
          <ExportExcelMenu
            onExportPage={() => showToast('Exporting current page…')}
            onExportAll={() => showToast('Exporting all records…')}
          />
        </div>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-3">
        <DateTimeField
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
          defaultTime={{ hours: 0, minutes: 0, seconds: 0 }}
        />
        <DateTimeField
          label="End Date"
          value={endDate}
          onChange={setEndDate}
          defaultTime={{ hours: 23, minutes: 59, seconds: 59 }}
        />
        <label className="text-xs text-muted">
          Select Provider
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            className="mt-1 block h-9 min-w-[160px] rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
          >
            {PROVIDER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
        <OutlineButton variant="gray" onClick={handleShowAll}>
          Show All
        </OutlineButton>
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-card p-4">
          <h2 className="mb-2 text-sm font-bold text-ink">
            Last 7 Days Orders
          </h2>
          <div className="relative h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ORDER_DONUT}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={1}
                >
                  {ORDER_DONUT.map((slice) => (
                    <Cell key={slice.name} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-line)',
                    borderRadius: 8,
                    color: 'var(--color-ink)',
                  }}
                  formatter={(value, name) => [
                    Number(value).toLocaleString('en-IN'),
                    String(name),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-ink">
                {totalOrders.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {ORDER_DONUT.map((slice) => (
              <li
                key={slice.name}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted"
              >
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                {slice.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-card p-4">
          <h2 className="mb-2 text-sm font-bold text-ink">
            Last 7 Days - Delivered Orders
          </h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={DELIVERED_TREND}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="4 6"
                  stroke={theme.colors.line}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: theme.colors.muted }}
                />
                <YAxis
                  width={28}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: theme.colors.muted }}
                  domain={[0, 4]}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--color-line)',
                    borderRadius: 8,
                    color: 'var(--color-ink)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  name="Delivered"
                  stroke={theme.colors.primary}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  dot={{
                    r: 3.5,
                    fill: theme.colors.primary,
                    strokeWidth: 0,
                  }}
                  activeDot={{
                    r: 5,
                    fill: theme.colors.primary,
                    stroke: theme.colors.card,
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-12 text-center">
        <Search size={56} strokeWidth={1.25} className="mb-3 text-muted/40" />
        <p className="max-w-xl text-base font-semibold text-ink">
          No Records OR Use {brand.shortName} Enabled Delivery System To Track
          Delivery
        </p>
        <p className="mt-1 text-sm text-muted">
          We couldn&apos;t find a match for your search.
        </p>
      </div>
    </ReportsPageShell>
  )
}
