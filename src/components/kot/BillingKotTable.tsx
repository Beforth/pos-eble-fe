import type { ReactNode } from 'react'
import { Eye, Info, Pencil, PencilLine, Printer, ShoppingCart } from 'lucide-react'
import type { KotRow } from '../../mocks/kotData'
import { KOT_ROW_TINT } from '../../utils/billingKotStatus'

interface BillingKotTableProps {
  rows: KotRow[]
  onView: (row: KotRow) => void
  onDetails: (row: KotRow) => void
  onEdit: (row: KotRow) => void
  onOpenInBilling: (row: KotRow) => void
}

const HEADINGS = [
  'KOT No.',
  'Order Type',
  'Customer Phone',
  'Customer Name',
  'No. of Items',
  'Status',
  'Created',
  'Bill Print Date',
  'Complete Duration',
  '',
]

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
      className="inline-flex size-8 items-center justify-center rounded-lg text-ink hover:bg-black/5"
    >
      {children}
    </button>
  )
}

/** KOT listing: one row per ticket, tinted by status, two-line timestamps. */
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
          <tr className="bg-page">
            {HEADINGS.map((heading) => (
              <th
                key={heading || 'actions'}
                scope="col"
                className="px-4 py-4 text-left text-sm font-bold text-ink"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={`border-b border-line ${KOT_ROW_TINT[row.status]}`}>
              <td className="px-4 py-4 text-ink">
                <span className="inline-flex items-center gap-1.5">
                  {row.kotId}
                  {row.modified ? (
                    <PencilLine size={12} className="text-primary" aria-label="Modified KOT" />
                  ) : null}
                </span>
              </td>
              <td className="px-4 py-4 text-ink">{row.orderType}</td>
              <td className="px-4 py-4 tabular-nums text-ink">{row.customerPhone}</td>
              <td className="px-4 py-4 text-ink">{row.customerName}</td>
              <td className="whitespace-nowrap px-4 py-4 text-ink">
                {row.itemCount} item{row.itemCount === 1 ? '' : 's'}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-ink">{row.status}</td>
              <td className="px-4 py-4 text-ink">
                <Stamp value={row.created} />
              </td>
              <td className="px-4 py-4 text-ink">
                <Stamp value={row.billPrintDate} />
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-ink">
                <span className="inline-flex items-center gap-1">
                  {row.completeDuration}
                  {row.completeDuration !== '--' ? (
                    <Info size={14} className="text-muted" />
                  ) : null}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-end gap-1">
                  <IconAction label="KOT details" onClick={() => onDetails(row)}>
                    <Eye size={18} />
                  </IconAction>
                  <IconAction label="View KOT ticket" onClick={() => onView(row)}>
                    <Printer size={18} />
                  </IconAction>
                  <IconAction label="Open in billing" onClick={() => onOpenInBilling(row)}>
                    <ShoppingCart size={16} />
                  </IconAction>
                  <IconAction label="Edit KOT" onClick={() => onEdit(row)}>
                    <Pencil size={16} />
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
      {date}
      <br />
      {time}
    </span>
  )
}
