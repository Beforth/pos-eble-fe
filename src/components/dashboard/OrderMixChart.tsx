import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { orderMix } from '../../mocks/overviewDashboardData'
import { theme } from '../../theme/colors'
import { formatINR } from '../../utils/format'
import { Card } from '../common/Card'

const COLORS = [theme.colors.accent, theme.colors.success, theme.colors.primary]

const total = orderMix.reduce((sum, row) => sum + row.value, 0)

function TooltipBox({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-ink">{payload[0].name}</p>
      <p className="mt-0.5 text-muted">{formatINR(payload[0].value ?? 0)}</p>
    </div>
  )
}

export function OrderMixChart() {
  return (
    <Card title="Order mix" subtitle="By channel" divider={false}>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={orderMix}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={74}
              paddingAngle={3}
              stroke="none"
            >
              {orderMix.map((row, index) => (
                <Cell key={row.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<TooltipBox />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-1 space-y-2">
        {orderMix.map((row, index) => {
          const pct = total > 0 ? Math.round((row.value / total) * 100) : 0
          return (
            <li key={row.name} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-ink">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                {row.name}
              </span>
              <span className="tabular-nums text-muted">
                {row.orders} · {pct}%
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
