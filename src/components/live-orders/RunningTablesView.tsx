import { BarChart3, Clock3, LayoutGrid } from 'lucide-react'
import { formatINR, formatNumber } from '../../utils/format'
import type { RunningTablesSummary } from '../../services/orderService'

function openFor(openedAt: string | null): string {
  if (!openedAt) return ''
  const mins = Math.max(0, Math.floor((Date.now() - new Date(openedAt).getTime()) / 60000))
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)} h ${mins % 60} min`
}

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

      {data.list.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.list.map((table) => (
            <div
              key={table.tableNo}
              className="rounded-xl border border-line bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-base font-bold text-ink">
                  Table {table.tableNo}
                </p>
                <p className="text-base font-bold text-ink tabular-nums">
                  {formatINR(table.amount, 2)}
                </p>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
                <span>
                  {formatNumber(table.kots)} KOT{table.kots === 1 ? '' : 's'}
                </span>
                {table.openedAt && (
                  <span className="inline-flex items-center gap-1">
                    <Clock3 size={12} />
                    {openFor(table.openedAt)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-line bg-card px-6 py-16 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-page text-muted">
            <LayoutGrid size={28} />
          </span>
          <p className="text-base font-semibold text-ink">No active tables</p>
          <p className="mt-1 text-sm text-muted">
            Tables will appear here when orders start.
          </p>
        </div>
      )}
    </div>
  )
}
