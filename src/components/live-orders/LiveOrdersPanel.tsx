import { useState, type ReactNode } from 'react'
import { ChefHat, LayoutGrid, Loader2, RefreshCw, ShoppingBag } from 'lucide-react'
import { formatINR, formatNumber } from '../../utils/format'
import type {
  LiveOrderChannelRow,
  LiveOrdersSummary,
  RunningTablesSummary,
} from '../../services/orderService'
import { LiveOrdersBoard } from './LiveOrdersBoard'
import { RunningTablesView } from './RunningTablesView'
import {
  LIVE_BOARD_TITLES,
  LIVE_CHANNEL_ICONS,
  type LiveBoardKind,
} from './liveOrdersConfig'

type LiveTab = 'orders' | 'tables'

const LIVE_TABS: { value: LiveTab; label: string }[] = [
  { value: 'orders', label: 'Running Orders' },
  { value: 'tables', label: 'Running Tables' },
]

interface LiveOrdersPanelProps {
  loading: boolean
  error: boolean
  running: LiveOrdersSummary | null
  pending: LiveOrdersSummary | null
  tables: RunningTablesSummary | null
  onRetry: () => void
  onRowClick: (board: LiveBoardKind, row: LiveOrderChannelRow) => void
}

function SummaryCard({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode
  label: string
  value: string
  note: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="text-xl font-bold leading-tight text-ink tabular-nums">
          {value}
        </p>
        <p className="truncate text-xs text-muted">{note}</p>
      </div>
    </div>
  )
}

/**
 * Everything under the "Live Orders" heading, shared by the admin, billing and
 * captain pages: three headline numbers, then the two lists, in plain words.
 * The pages own the data and the header; this only draws it.
 */
export function LiveOrdersPanel({
  loading,
  error,
  running,
  pending,
  tables,
  onRetry,
  onRowClick,
}: LiveOrdersPanelProps) {
  const [tab, setTab] = useState<LiveTab>('orders')

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-line bg-card">
        <Loader2 size={22} className="animate-spin text-primary" />
      </div>
    )
  }

  if (error || !running || !pending || !tables) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center">
        <p className="text-base font-semibold text-ink">
          Couldn&apos;t load live orders
        </p>
        <p className="mt-1 text-sm text-muted">
          Check your connection and retry.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
        >
          <RefreshCw size={15} className="text-muted" />
          Retry
        </button>
      </div>
    )
  }

  const tabBar = (
    <div
      role="tablist"
      aria-label="Live orders views"
      className="flex items-center gap-5 border-b border-line"
    >
      {LIVE_TABS.map((option) => {
        const active = tab === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setTab(option.value)}
            className={`-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors ${
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )

  if (tab === 'tables') {
    return (
      <div className="space-y-4">
        {tabBar}
        <RunningTablesView data={tables} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tabBar}
      <p className="text-sm text-muted">
        What is happening in the restaurant right now. This page updates by
        itself.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={<ShoppingBag size={18} />}
          label="Money to collect"
          value={formatINR(running.totalAmount, 2)}
          note={`from ${formatNumber(running.totalOrders)} unpaid order${running.totalOrders === 1 ? '' : 's'}`}
        />
        <SummaryCard
          icon={<ChefHat size={18} />}
          label="In the kitchen"
          value={formatNumber(pending.totalOrders)}
          note={pending.totalOrders === 1 ? 'order being prepared' : 'orders being prepared'}
        />
        <SummaryCard
          icon={<LayoutGrid size={18} />}
          label="Tables in use"
          value={formatNumber(tables.activeTables)}
          note={`about ${formatINR(tables.revenueEstimated)} on them`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LiveOrdersBoard
          title={LIVE_BOARD_TITLES.running}
          subtitle="Customers who have ordered but not paid yet."
          emptyText="No unpaid orders right now."
          data={running}
          icons={LIVE_CHANNEL_ICONS}
          hideEmptyRows={false}
          onRowClick={(row) => onRowClick('running', row)}
        />
        <LiveOrdersBoard
          title={LIVE_BOARD_TITLES.pending}
          subtitle="Food that is being cooked, or is ready to be served."
          emptyText="The kitchen has nothing waiting."
          data={pending}
          icons={LIVE_CHANNEL_ICONS}
          onRowClick={(row) => onRowClick('pending', row)}
        />
      </div>
    </div>
  )
}
