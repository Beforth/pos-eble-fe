import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { paymentSplit } from '../../mocks/overviewDashboardData'
import { theme } from '../../theme/colors'
import { formatINR } from '../../utils/format'
import { Card } from '../common/Card'

const COLORS = [
  theme.colors.primary,
  theme.colors.success,
  theme.colors.accent,
  theme.colors.deep,
]

const total = paymentSplit.reduce((sum, row) => sum + row.value, 0)

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

export function PaymentSplitChart() {
  return (
    <Card title="Payments" subtitle="How bills were settled" divider={false}>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={paymentSplit}
              dataKey="value"
              nameKey="name"
              innerRadius={44}
              outerRadius={64}
              paddingAngle={3}
              stroke="none"
            >
              {paymentSplit.map((row, index) => (
                <Cell key={row.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<TooltipBox />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-1 space-y-2">
        {paymentSplit.map((row, index) => {
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
              <span className="font-medium tabular-nums text-ink">
                {pct}%
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
