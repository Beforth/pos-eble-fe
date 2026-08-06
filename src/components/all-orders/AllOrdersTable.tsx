import type { ReactNode, SVGProps } from 'react'
import { Eye, Pencil, ReceiptText, Search } from 'lucide-react'
import type { AllOrderRow } from '../../mocks/allOrdersData'
import { formatINR } from '../../utils/format'
import { Badge } from '../common/Badge'
import { Table, type Column } from '../common/Table'

/** Credit card + edit mark — matches Petpooja “Change Payment Type” action. */
function ChangePaymentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="2.5" y="5" width="15.5" height="11" rx="2" />
      <path d="M2.5 9h15.5" />
      {/* Small diagonal edit / pencil tip at bottom-right of the card */}
      <path d="M16 19.5c1.2-1.8 3.3-3.2 4.5-3.8" strokeWidth="2.25" />
    </svg>
  )
}

interface AllOrdersTableProps {
  rows: AllOrderRow[]
  selected: Set<string>
  onToggle: (id: string) => void
  onToggleAll: () => void
  onView?: (row: AllOrderRow) => void
  onViewKot?: (row: AllOrderRow) => void
  onEdit?: (row: AllOrderRow) => void
  onChangePayment?: (row: AllOrderRow) => void
}

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-7 items-center justify-center rounded border border-line bg-card text-muted transition-colors hover:border-muted hover:bg-page hover:text-ink"
    >
      {children}
    </button>
  )
}

export function AllOrdersTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  onView,
  onViewKot,
  onEdit,
  onChangePayment,
}: AllOrdersTableProps) {
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id))

  const columns: Column<AllOrderRow>[] = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={onToggleAll}
          aria-label="Select all orders"
          className="size-3.5 accent-primary"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selected.has(row.id)}
          onChange={() => onToggle(row.id)}
          aria-label={`Select order ${row.orderNo}`}
          className="size-3.5 accent-primary"
        />
      ),
    },
    {
      key: 'orderNo',
      header: 'Order No.',
      render: (row) => (
        <span className="font-semibold text-primary">{row.orderNo}</span>
      ),
    },
    {
      key: 'orderType',
      header: 'Order Type',
      render: (row) => (
        <span className="text-xs font-semibold uppercase tracking-wide text-ink">
          {row.orderType}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer Name',
      render: (row) => row.customerName || '—',
    },
    {
      key: 'assignTo',
      header: 'Assign To',
      render: (row) => row.assignTo || '—',
    },
    {
      key: 'items',
      header: 'Items',
      className: 'min-w-[180px]',
      render: (row) => (
        <span className="line-clamp-2 max-w-[220px] text-xs">{row.items}</span>
      ),
    },
    {
      key: 'myAmount',
      header: 'My Amount (₹)',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums">{formatINR(row.myAmount, 2)}</span>
      ),
    },
    {
      key: 'tax',
      header: 'Tax (₹)',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums">{formatINR(row.tax, 2)}</span>
      ),
    },
    {
      key: 'discount',
      header: 'Discount (₹)',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums">{formatINR(row.discount, 2)}</span>
      ),
    },
    {
      key: 'grandTotal',
      header: 'Grand Total [Round Off] (₹)',
      align: 'right',
      render: (row) => (
        <span className="font-semibold tabular-nums">
          {formatINR(row.grandTotal, 2)}
        </span>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (row) => <span className="text-xs">{row.payment}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          variant={row.status === 'Cancelled' ? 'primary' : 'success'}
          size="sm"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-muted">
          {row.created}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <ActionButton label="View" onClick={() => onView?.(row)}>
            <Eye size={13} />
          </ActionButton>
          <ActionButton label="View KOT" onClick={() => onViewKot?.(row)}>
            <ReceiptText size={13} />
          </ActionButton>
          <ActionButton label="Edit" onClick={() => onEdit?.(row)}>
            <Pencil size={13} />
          </ActionButton>
          <ActionButton
            label="Change Payment Type"
            onClick={() => onChangePayment?.(row)}
          >
            <ChangePaymentIcon width={13} height={13} />
          </ActionButton>
        </div>
      ),
    },
  ]

  if (rows.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center bg-card px-6 py-16 text-center">
        <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-page text-muted">
          <Search size={28} />
        </span>
        <p className="text-base font-semibold text-ink">No Results Found</p>
        <p className="mt-1 text-sm text-muted">
          We couldn&apos;t find a match for your search.
        </p>
      </div>
    )
  }

  return <Table columns={columns} rows={rows} rowKey={(row) => row.id} dense />
}
