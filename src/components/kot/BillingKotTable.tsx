import type { ReactNode } from 'react'
import { Eye, Info, Pencil, PencilLine, Printer, ShoppingCart } from 'lucide-react'
import type { KotRow } from '../../mocks/kotData'
import { KOT_STATUS_DOT, KOT_STATUS_PILL } from '../../utils/billingKotStatus'

interface BillingKotTableProps {
  rows: KotRow[]
  onView: (row: KotRow) => void
  onDetails: (row: KotRow) => void
  onEdit: (row: KotRow) => void
  onOpenInBilling: (row: KotRow) => void
}

const HEADINGS = [
  { label: 'KOT', align: 'left' },
  { label: 'Type', align: 'left' },
  { label: 'Customer', align: 'left' },
  { label: 'Items', align: 'left' },
  { label: 'Status', align: 'left' },
  { label: 'Created', align: 'left' },
  { label: 'Bill printed', align: 'left' },
  { label: 'Duration', align: 'left' },
  { label: '', align: 'right' },
] as const

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      data-tooltip={label}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-card text-muted transition-colors hover:border-primary/40 hover:bg-page hover:text-primary"
    >
      {children}
    </button>
  )
}

/** "DINE IN" → "Dine In" for display. */
function titleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * KOT listing: white rows, a status pill instead of a tinted row, customer name
 * and phone in one cell, and ghost icon actions.
 */
export function BillingKotTable({
  rows,
  onView,
  onDetails,
  onEdit,
  onOpenInBilling,
}: BillingKotTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line">
            {HEADINGS.map((heading) => (
              <th
                key={heading.label || 'actions'}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-muted ${
                  heading.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {heading.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-line last:border-0 hover:bg-page/60"
            >
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                  #{row.kotId}
                  {row.modified ? (
                    <PencilLine size={12} aria-label="Modified KOT" />
                  ) : null}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                {titleCase(row.orderType)}
              </td>
              <td className="px-4 py-3">
                {row.customerName || row.customerPhone ? (
                  <div>
                    {row.customerName ? (
                      <p className="font-medium text-ink">{row.customerName}</p>
                    ) : null}
                    {row.customerPhone ? (
                      <p className="text-xs tabular-nums text-muted">
                        {row.customerPhone}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <span className="text-muted">Walk-in</span>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink">
                {row.itemCount} item{row.itemCount === 1 ? '' : 's'}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${KOT_STATUS_PILL[row.status]}`}
                >
                  <span className={`size-1.5 rounded-full ${KOT_STATUS_DOT[row.status]}`} />
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted">
                <Stamp value={row.created} />
              </td>
              <td className="px-4 py-3 text-xs text-muted">
                <Stamp value={row.billPrintDate} />
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink">
                <span className="inline-flex items-center gap-1">
                  {row.completeDuration}
                  {row.completeDuration !== '--' ? (
                    <Info size={14} className="text-muted" />
                  ) : null}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  <IconAction label="KOT details" onClick={() => onDetails(row)}>
                    <Eye size={15} />
                  </IconAction>
                  <IconAction label="View KOT ticket" onClick={() => onView(row)}>
                    <Printer size={15} />
                  </IconAction>
                  <IconAction label="Open in billing" onClick={() => onOpenInBilling(row)}>
                    <ShoppingCart size={15} />
                  </IconAction>
                  <IconAction label="Edit KOT" onClick={() => onEdit(row)}>
                    <Pencil size={15} />
                  </IconAction>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** `2026-10-21 14:06:55` → date on one line, time on the next. */
function Stamp({ value }: { value: string }) {
  const [date, time] = value.split(' ')
  if (!time) return <span>{value}</span>
  return (
    <span className="block whitespace-nowrap">
      <span className="font-medium text-ink">{date}</span>
      <br />
      {time}
    </span>
  )
}
