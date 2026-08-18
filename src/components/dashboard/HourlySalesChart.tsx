import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { hourlySales } from '../../mocks/overviewDashboardData'
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
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-ink">{label}</p>
      <p className="mt-0.5 text-muted">{formatINR(payload[0]?.value ?? 0)}</p>
    </div>
  )
}

export function HourlySalesChart() {
  return (
    <Card
      title="Hourly sales"
      subtitle="Today · counter + online"
      divider={false}
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlySales} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-line)" />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={42}
              tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
              tickFormatter={(value: number) => formatINRCompact(value)}
            />
            <Tooltip content={<TooltipBox />} cursor={{ fill: 'var(--color-page)' }} />
            <Bar
              dataKey="sales"
              fill={theme.colors.primary}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
