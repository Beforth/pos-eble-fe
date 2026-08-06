import type { ReactNode } from 'react'
import { ArrowDown, Eye, Info, List, PencilLine } from 'lucide-react'
import type { KotRow, KotStatus } from '../../mocks/kotData'

interface KotTableProps {
  rows: KotRow[]
}

const statusClass: Record<KotStatus, string> = {
  'Used In Bill': 'text-success',
  Pending: 'text-accent',
  Cancelled: 'text-danger',
}

function ActionButton({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="flex size-7 items-center justify-center rounded border border-line text-muted hover:bg-page hover:text-ink"
    >
      {children}
    </button>
  )
}

export function KotTable({ rows }: KotTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-page/80 text-[11px] font-semibold uppercase tracking-wide text-muted">
            <th className="px-3 py-2.5">KOT ID</th>
            <th className="px-3 py-2.5">Order Type</th>
            <th className="px-3 py-2.5">Customer Name</th>
            <th className="px-3 py-2.5">Customer Phone</th>
            <th className="px-3 py-2.5 text-center">No. Of Items</th>
            <th className="px-3 py-2.5">Items</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5">Bill Print Date</th>
            <th className="px-3 py-2.5">Complete Duration</th>
            <th className="px-3 py-2.5">
              <span className="inline-flex items-center gap-1">
                Created
                <ArrowDown size={12} className="text-primary" />
              </span>
            </th>
            <th className="px-3 py-2.5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-line last:border-0 hover:bg-page/40"
            >
              <td className="px-3 py-3 align-top">
                <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-ink">
                  {row.kotId}
                  {row.modified ? (
                    <PencilLine
                      size={12}
                      className="text-primary"
                      aria-label="Modified KOT"
                    />
                  ) : null}
                </span>
              </td>
              <td className="px-3 py-3 align-top font-medium uppercase text-ink">
                {row.orderType}
              </td>
              <td className="px-3 py-3 align-top text-ink">
                {row.customerName || '—'}
              </td>
              <td className="px-3 py-3 align-top tabular-nums text-muted">
                {row.customerPhone || '—'}
              </td>
              <td className="px-3 py-3 text-center align-top tabular-nums text-ink">
                {row.itemCount}
              </td>
              <td className="max-w-[260px] px-3 py-3 align-top text-ink">
                {row.items}
              </td>
              <td className={`px-3 py-3 align-top font-medium ${statusClass[row.status]}`}>
                {row.status}
              </td>
              <td className="whitespace-nowrap px-3 py-3 align-top text-xs text-muted">
                {row.billPrintDate}
              </td>
              <td className="whitespace-nowrap px-3 py-3 align-top text-xs text-ink">
                <span className="inline-flex items-center gap-1">
                  {row.completeDuration}
                  {row.completeDuration !== '--' ? (
                    <Info size={12} className="text-muted" />
                  ) : null}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-3 align-top text-xs text-muted">
                {row.created}
              </td>
              <td className="px-3 py-3 align-top">
                <div className="flex items-center gap-1.5">
                  <ActionButton label="View KOT">
                    <Eye size={13} />
                  </ActionButton>
                  <ActionButton label="KOT details">
                    <List size={13} />
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
