import { BarChart3, LayoutGrid } from 'lucide-react'
import { formatINR, formatNumber } from '../../utils/format'
import type { RunningTablesSummary } from '../../mocks/liveOrdersData'

interface RunningTablesViewProps {
  data: RunningTablesSummary
}

export function RunningTablesView({ data }: RunningTablesViewProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <span className="flex size-10 items-center justify-center rounded-lg bg-page text-muted">
            <LayoutGrid size={18} />
          </span>
          <div>
            <p className="text-2xl font-bold text-ink tabular-nums">
              {formatNumber(data.activeTables)}
            </p>
            <p className="text-xs text-muted">Active Tables</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <span className="flex size-10 items-center justify-center rounded-lg bg-page text-muted">
            <BarChart3 size={18} />
          </span>
          <div>
            <p className="text-2xl font-bold text-ink tabular-nums">
              {formatINR(data.revenueEstimated)}
            </p>
            <p className="text-xs text-muted">Revenue (Estimated)</p>
          </div>
        </div>
      </div>

      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-page text-muted">
          <LayoutGrid size={28} />
        </span>
        <p className="text-base font-semibold text-ink">No active tables</p>
        <p className="mt-1 text-sm text-muted">
          Tables will appear here when orders start.
        </p>
      </div>
    </div>
  )
}
