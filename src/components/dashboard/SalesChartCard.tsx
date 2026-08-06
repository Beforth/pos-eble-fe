import { useEffect, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartColumn, ChartArea, ChartLine, Check, ChevronDown } from 'lucide-react'
import type { ChannelKey, ChartPoint, ChartStatus } from '../../types'
import { theme } from '../../theme/colors'
import { formatINR, formatINRCompact, formatNumber } from '../../utils/format'
import { Card } from '../common/Card'

type ChartKind = 'line' | 'area' | 'column'

interface ChannelDef {
  key: ChannelKey
  label: string
  color: string
}

const DEFAULT_CHANNELS: ChannelDef[] = [
  { key: 'dineIn', label: 'Dine In', color: theme.colors.primary },
  { key: 'online', label: 'Delivery', color: theme.colors.success },
  { key: 'parcel', label: 'Parcel', color: theme.colors.accent },
]

const CHART_OPTIONS: {
  value: ChartKind
  label: string
  icon: typeof ChartLine
}[] = [
  { value: 'line', label: 'Line', icon: ChartLine },
  { value: 'area', label: 'Area', icon: ChartArea },
  { value: 'column', label: 'Column', icon: ChartColumn },
]

interface ChartTooltipProps {
  active?: boolean
  label?: string | number
  payload?: Array<{ name?: string; value?: number; color?: string }>
}

function RangeTick({
  x,
  y,
  payload,
  index,
  visibleTicksCount,
}: {
  x?: number
  y?: number
  payload?: { value?: string }
  index?: number
  visibleTicksCount?: number
}) {
  const raw = payload?.value ?? ''
  const [start, end] = raw.split(' - ')
  const isFirst = index === 0
  const isLast =
    typeof visibleTicksCount === 'number' &&
    typeof index === 'number' &&
    index === visibleTicksCount - 1

  const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle'

  return (
    <g transform={`translate(${x ?? 0},${y ?? 0})`}>
      <text
        textAnchor={anchor}
        fill="var(--color-muted)"
        fontSize={10}
        className="select-none"
      >
        <tspan x={0} dy={12}>
          {start}
        </tspan>
        {end && (
          <tspan x={0} dy={12}>
            {end}
          </tspan>
        )}
      </text>
    </g>
  )
}

function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-ink">{label}</p>
      <ul className="space-y-1">
        {payload.map((entry) => (
          <li
            key={entry.name}
            className="flex items-center justify-between gap-5 text-muted"
          >
            <span className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-ink tabular-nums">
              {formatINR(entry.value ?? 0)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ChartTypeDropdown({
  value,
  onChange,
}: {
  value: ChartKind
  onChange: (kind: ChartKind) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected =
    CHART_OPTIONS.find((option) => option.value === value) ?? CHART_OPTIONS[0]
  const SelectedIcon = selected.icon

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Chart type"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 text-xs font-medium text-ink transition-colors hover:border-muted"
      >
        <SelectedIcon size={14} className="text-primary" />
        {selected.label}
        <ChevronDown
          size={13}
          className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-40 mt-1.5 w-36 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg"
        >
          {CHART_OPTIONS.map((option) => {
            const isSelected = option.value === value
            const Icon = option.icon
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-page"
                >
                  <Icon
                    size={15}
                    className={isSelected ? 'text-primary' : 'text-muted'}
                  />
                  <span
                    className={`flex-1 ${isSelected ? 'font-medium text-primary' : 'text-ink'}`}
                  >
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check size={14} className="shrink-0 text-primary" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

interface SalesChartCardProps {
  series: ChartPoint[]
  status: ChartStatus
  channels?: ChannelDef[]
  totalOrders: number
  className?: string
}

export function SalesChartCard({
  series,
  status,
  channels = DEFAULT_CHANNELS,
  totalOrders,
  className = '',
}: SalesChartCardProps) {
  const [chartKind, setChartKind] = useState<ChartKind>('area')

  const sharedAxis = [
    <CartesianGrid
      key="grid"
      strokeDasharray="3 3"
      vertical={false}
      stroke="var(--color-line)"
    />,
    <XAxis
      key="x"
      dataKey="label"
      axisLine={false}
      tickLine={false}
      interval={0}
      height={40}
      tick={<RangeTick />}
    />,
    <YAxis
      key="y"
      axisLine={false}
      tickLine={false}
      width={40}
      tick={{ fill: 'var(--color-muted)', fontSize: 11 }}
      tickFormatter={(value: number) => formatINRCompact(value)}
    />,
    <Tooltip
      key="tooltip"
      content={<ChartTooltip />}
      cursor={
        chartKind === 'column'
          ? { fill: 'var(--color-page)' }
          : { stroke: 'var(--color-line)' }
      }
    />,
  ]

  return (
    <Card
      title="Sales"
      subtitle="daily • stacked by channel"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted">
            Total orders{' '}
            <span className="font-semibold text-ink">
              {formatNumber(totalOrders)}
            </span>
          </span>
          <ChartTypeDropdown value={chartKind} onChange={setChartKind} />
        </div>
      }
      className={`overflow-hidden ${className}`}
      divider={false}
      bodyClassName="pt-0"
    >
      {/* Status chips */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
        <span className="flex items-center gap-1.5 text-success">
          <span className="size-2 rounded-full bg-success" />
          {status.successful} Successful
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <span className="size-2 rounded-full bg-muted/50" />
          {status.complementary} Complementary
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <span className="size-2 rounded-full bg-muted/40" />
          {status.cancelled} Cancelled
        </span>
      </div>

      <div className="h-64 w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          {chartKind === 'line' ? (
            <LineChart
              data={series}
              margin={{ top: 8, right: 28, left: 4, bottom: 28 }}
            >
              {sharedAxis}
              {channels.map((channel) => (
                <Line
                  key={channel.key}
                  type="monotone"
                  name={channel.label}
                  dataKey={channel.key}
                  stroke={channel.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          ) : chartKind === 'column' ? (
            <BarChart
              data={series}
              margin={{ top: 8, right: 28, left: 4, bottom: 28 }}
            >
              {sharedAxis}
              {channels.map((channel) => (
                <Bar
                  key={channel.key}
                  name={channel.label}
                  dataKey={channel.key}
                  stackId="sales"
                  fill={channel.color}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          ) : (
            <AreaChart
              data={series}
              margin={{ top: 8, right: 28, left: 4, bottom: 28 }}
            >
              {sharedAxis}
              {channels.map((channel) => (
                <Area
                  key={channel.key}
                  type="monotone"
                  name={channel.label}
                  dataKey={channel.key}
                  stackId="sales"
                  stroke={channel.color}
                  fill={channel.color}
                  fillOpacity={0.75}
                  strokeWidth={1.5}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Channel legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-line pt-3">
        {channels.map((channel) => (
          <span
            key={channel.key}
            className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted"
          >
            <span
              className="size-2.5 rounded-full"
              style={{ background: channel.color }}
            />
            {channel.label}
          </span>
        ))}
      </div>
    </Card>
  )
}
