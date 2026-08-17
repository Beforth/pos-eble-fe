import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReactNode } from 'react'
import type { OrdersChartPoint } from '../../mocks/allOrdersData'
import { formatNumber } from '../../utils/format'

interface AllOrdersChartProps {
  series: OrdersChartPoint[]
  className?: string
}

interface TipProps {
  active?: boolean
  label?: string | number
  payload?: Array<{ value?: number }>
}

function ChartTip({ active, label, payload }: TipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-line bg-card px-3 py-2 text-xs shadow-md">
      <div className="flex items-center gap-2 text-ink">
        <span className="font-medium">{label}</span>
        <span
          className="size-2.5 shrink-0 rounded-full bg-primary"
          aria-hidden="true"
        />
        <span className="tabular-nums text-muted">
          : {formatNumber(payload[0]?.value ?? 0)}
        </span>
      </div>
    </div>
  )
}

function valueLabel(props: {
  x?: number | string
  y?: number | string
  value?: ReactNode
}) {
  const { x, y, value } = props
  if (x == null || y == null || value == null) return null
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num === 0) return null

  return (
    <text
      x={Number(x)}
      y={Number(y) - 10}
      textAnchor="middle"
      fill="var(--color-ink)"
      fontSize={11}
      fontWeight={500}
    >
      {formatNumber(num)}
    </text>
  )
}

export function AllOrdersChart({ series, className = '' }: AllOrdersChartProps) {
  const maxValue = Math.max(...series.map((p) => p.value), 1)
  const yMax = Math.ceil(maxValue * 1.18)

  return (
    <div
      className={`h-64 w-full rounded-xl border border-line bg-card px-2 pb-2 pt-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:h-72 sm:px-4 ${className}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={series}
          margin={{ top: 28, right: 16, left: 8, bottom: 4 }}
        >
          <defs>
            <linearGradient id="allOrdersAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity={0.28}
              />
              <stop
                offset="75%"
                stopColor="var(--color-primary)"
                stopOpacity={0.06}
              />
              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="0"
            vertical={false}
            stroke="var(--color-line)"
          />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
            dy={6}
          />

          <YAxis hide domain={[0, yMax]} />

          <Tooltip
            content={<ChartTip />}
            cursor={{
              stroke: 'var(--color-primary)',
              strokeWidth: 1,
              strokeDasharray: '4 4',
              strokeOpacity: 0.35,
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            fill="url(#allOrdersAreaFill)"
            dot={{
              r: 3.5,
              fill: 'var(--color-primary)',
              stroke: 'var(--color-card)',
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: 'var(--color-primary)',
              stroke: 'var(--color-card)',
              strokeWidth: 2,
            }}
            isAnimationActive
          >
            <LabelList dataKey="value" content={valueLabel} />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
