import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReportCell } from '../../services/reportService'
import { TD, TH, decimal } from './reportStyles'

export interface GroupedColumn {
  key: string
  label: string
  /** Text columns (a code) sit left; numbers sit right and are formatted. */
  text?: boolean
}

export interface GroupedBlock {
  name: string
  rows: Record<string, ReportCell>[]
  /** Per-column sums for the group header. */
  sums: Record<string, number>
}

/**
 * Report rows grouped under collapsible headers (Group / Variation reports).
 * Each header shows the item count and the group's sums; a bar under every item
 * compares its `barKey` amount with the best one in the report.
 */
export function GroupedTable({
  itemLabel,
  itemKey,
  columns,
  blocks,
  totals,
  collapsed,
  onToggle,
  summaryKeys,
  barKey,
  extraRows,
}: {
  itemLabel: string
  itemKey: string
  columns: GroupedColumn[]
  blocks: GroupedBlock[]
  totals: Record<string, ReportCell>
  collapsed: Set<string>
  onToggle: (name: string) => void
  /** Columns summed in each group header, as `{ key, label }`; ₹ is added to money keys. */
  summaryKeys: { key: string; label: string; money?: boolean }[]
  barKey?: string
  extraRows?: ReactNode
}) {
  const topAmount = barKey
    ? blocks.reduce(
        (max, block) =>
          block.rows.reduce((m, row) => Math.max(m, Number(row[barKey]) || 0), max),
        0,
      )
    : 0

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr className="bg-primary/5 text-left">
            <th className={TH}>{itemLabel}</th>
            {columns.map((col) => (
              <th key={col.key} className={`${TH} ${col.text ? 'text-left' : 'text-right'}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => {
            const isCollapsed = collapsed.has(block.name)
            return (
              <GroupBody
                key={block.name}
                block={block}
                itemKey={itemKey}
                columns={columns}
                collapsed={isCollapsed}
                onToggle={() => onToggle(block.name)}
                summaryKeys={summaryKeys.filter((s) => columns.some((c) => c.key === s.key))}
                barKey={barKey}
                topAmount={topAmount}
              />
            )
          })}
          {extraRows}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-primary/30 bg-primary/5 font-bold">
            <td className={TD}>Total</td>
            {columns.map((col) => (
              <td
                key={col.key}
                className={`${TD} ${col.text ? '' : 'text-right tabular-nums'}`}
              >
                {col.text ? '' : decimal(totals[col.key])}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function GroupBody({
  block,
  itemKey,
  columns,
  collapsed,
  onToggle,
  summaryKeys,
  barKey,
  topAmount,
}: {
  block: GroupedBlock
  itemKey: string
  columns: GroupedColumn[]
  collapsed: boolean
  onToggle: () => void
  summaryKeys: { key: string; label: string; money?: boolean }[]
  barKey?: string
  topAmount: number
}) {
  return (
    <>
      <tr className="border-t border-line bg-page">
        <td colSpan={columns.length + 1} className="px-4 py-3">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            className="flex w-full items-center gap-2 text-left font-semibold text-ink"
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            {block.name}
            <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted">
              {block.rows.length} item{block.rows.length === 1 ? '' : 's'}
            </span>
            <span className="ml-auto flex items-center gap-4 text-sm font-semibold tabular-nums">
              {summaryKeys.map((summary) => (
                <span key={summary.key} className={summary.money ? 'text-ink' : 'text-muted'}>
                  {summary.money ? '' : `${summary.label} `}
                  <span className="text-ink">
                    {summary.money ? '₹' : ''}
                    {decimal(block.sums[summary.key])}
                  </span>
                </span>
              ))}
            </span>
          </button>
        </td>
      </tr>
      {!collapsed &&
        block.rows.map((row, index) => {
          const amount = barKey ? Number(row[barKey]) || 0 : 0
          return (
            <tr key={index} className="border-t border-line hover:bg-page/60">
              <td className={`${TD} pl-10`}>
                <span className="block">{row[itemKey]}</span>
                {barKey && topAmount > 0 ? (
                  <span className="mt-1.5 block h-1 w-40 max-w-full overflow-hidden rounded-full bg-line">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, (amount / topAmount) * 100)}%` }}
                    />
                  </span>
                ) : null}
              </td>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`${TD} ${col.text ? 'text-muted' : 'text-right tabular-nums'}`}
                >
                  {col.text ? row[col.key] : decimal(row[col.key])}
                </td>
              ))}
            </tr>
          )
        })}
    </>
  )
}
