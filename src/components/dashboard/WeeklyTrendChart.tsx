import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { weeklySales } from '../../mocks/overviewDashboardData'
import { theme } from '../../theme/colors'
import { formatINR, formatINRCompact } from '../../utils/format'
import { Card } from '../common/Card'

function TooltipBox({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value?: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const point = weeklySales.find((row) => row.day === label)
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-ink">{label}</p>
      <p className="mt-1 text-muted">Sales {formatINR(payload[0]?.value ?? 0)}</p>
      <p className="text-muted">Orders {point?.orders ?? 0}</p>
    </div>
  )
}

export function WeeklyTrendChart() {
  return (
    <Card title="This week" subtitle="Sales vs orders" divider={false}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklySales} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="weekSalesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.colors.accent} stopOpacity={0.35} />
                <stop offset="100%" stopColor={theme.colors.accent} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-line)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <YAxis
              yAxisId="sales"
              axisLine={false}
              tickLine={false}
              width={42}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
              tickFormatter={(value: number) => formatINRCompact(value)}
            />
            <Tooltip content={<TooltipBox />} />
            <Area
              yAxisId="sales"
              type="monotone"
              dataKey="sales"
              stroke={theme.colors.accent}
              fill="url(#weekSalesFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
