import {
  Banknote,
  CreditCard,
  Eye,
  Pencil,
  Printer,
  ShoppingCart,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { AllOrderRow } from '../../mocks/allOrdersData'
import {
  STATUS_DOT,
  STATUS_LEGEND_LABEL,
  STATUS_PILL,
} from '../../utils/billingOrderStatus'
import { formatINR } from '../../utils/format'
import { isUnpaid } from '../../utils/orderStatus'
import { Table, type Column } from '../common/Table'

interface BillingOrdersTableProps {
  rows: AllOrderRow[]
  onView: (order: AllOrderRow) => void
  onViewKot: (order: AllOrderRow) => void
  onEdit: (order: AllOrderRow) => void
  onChangePayment: (order: AllOrderRow) => void
  onSettleDue: (order: AllOrderRow) => void
  onOpenInBilling: (order: AllOrderRow) => void
  onCancel: (order: AllOrderRow) => void
}

function IconAction({
  label,
  onClick,
  tone = 'plain',
  children,
}: {
  label: string
  onClick: () => void
  tone?: 'plain' | 'primary' | 'danger'
  children: ReactNode
}) {
  const toneClass =
    tone === 'primary'
      ? 'border-primary bg-primary text-white hover:bg-primary-hover'
      : tone === 'danger'
        ? 'border-danger bg-danger text-white hover:opacity-90'
        : 'border-line bg-card text-muted hover:border-primary/40 hover:bg-page hover:text-primary'
  return (
    <button
      type="button"
      aria-label={label}
      data-tooltip={label}
      onClick={onClick}
      className={`inline-flex size-8 items-center justify-center rounded-lg border transition-colors ${toneClass}`}
    >
      {children}
    </button>
  )
}

/** "DINE IN" → "Dine In" for display. */
function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * The current-orders table: white rows, a status pill instead of a tinted row,
 * customer name and phone in one cell, the grand total as an editable link and
 * the actions as ghost icon buttons.
 */
export function BillingOrdersTable({
  rows,
  onView,
  onViewKot,
  onEdit,
  onChangePayment,
  onSettleDue,
  onOpenInBilling,
  onCancel,
}: BillingOrdersTableProps) {
  const columns: Column<AllOrderRow>[] = [
    {
      key: 'orderNo',
      header: 'Order',
      render: (row) => (
        <button
          type="button"
          onClick={() => onView(row)}
          className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary hover:bg-primary/15"
        >
          #{row.orderNo}
        </button>
      ),
    },
    {
      key: 'orderType',
      header: 'Type',
      render: (row) => (
        <div className="whitespace-nowrap">
          <p className="font-medium text-ink">{titleCase(row.orderType)}</p>
          {row.tableNo ? (
            <p className="text-xs text-muted">Table {row.tableNo}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => {
        const name = row.customerName === 'Walk-in' ? '' : row.customerName
        if (!name && !row.customerPhone) {
          return <span className="text-muted">Walk-in</span>
        }
        return (
          <div>
            {name ? <p className="font-medium text-ink">{name}</p> : null}
            {row.customerPhone ? (
              <p className="text-xs tabular-nums text-muted">{row.customerPhone}</p>
            ) : null}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_PILL[row.status]}`}
        >
          <span className={`size-1.5 rounded-full ${STATUS_DOT[row.status]}`} />
          {STATUS_LEGEND_LABEL[row.status]}
        </span>
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (row) =>
        row.payment ? (
          <span className="whitespace-nowrap rounded-md bg-page px-2 py-1 text-xs font-medium text-ink">
            {row.payment}
          </span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: 'myAmount',
      header: 'Amount (₹)',
      align: 'right',
      render: (row) => <span className="tabular-nums">{row.myAmount.toFixed(2)}</span>,
    },
    {
      key: 'tax',
      header: 'Tax (₹)',
      align: 'right',
      render: (row) => <span className="tabular-nums">{row.tax.toFixed(2)}</span>,
    },
    {
      key: 'discount',
      header: 'Discount (₹)',
      align: 'right',
      render: (row) => (
        <span className="tabular-nums text-muted">{row.discount.toFixed(2)}</span>
      ),
    },
    {
      key: 'grandTotal',
      header: 'Total (₹)',
      align: 'right',
      render: (row) => {
        const due = row.balanceDue ?? 0
        return (
          <div className="whitespace-nowrap">
            <button
              type="button"
              onClick={() => onEdit(row)}
              aria-label={`Edit order ${row.orderNo}`}
              data-tooltip="Edit order"
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-base font-bold tabular-nums text-ink hover:bg-page hover:text-primary"
            >
              {row.grandTotal.toFixed(2)}
              <Pencil size={12} className="text-muted" />
            </button>
            {due > 0 ? (
              <p className="mt-0.5 text-xs font-semibold text-danger">
                {formatINR(due, 2)} due
              </p>
            ) : null}
          </div>
        )
      },
    },
    {
      key: 'created',
      header: 'Created',
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-muted">{row.created}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => {
        const due = row.balanceDue ?? 0
        return (
          <div className="flex items-center justify-end gap-1.5">
            {isUnpaid(row.status) ? (
              <IconAction
                label="Open bill to pay"
                tone="primary"
                onClick={() => onOpenInBilling(row)}
              >
                <ShoppingCart size={15} />
              </IconAction>
            ) : null}
            {due > 0 ? (
              <IconAction
                label="Collect due"
                tone="danger"
                onClick={() => onSettleDue(row)}
              >
                <Banknote size={15} />
              </IconAction>
            ) : null}
            <IconAction label="View details" onClick={() => onView(row)}>
              <Eye size={15} />
            </IconAction>
            <IconAction label="Print kitchen ticket" onClick={() => onViewKot(row)}>
              <Printer size={15} />
            </IconAction>
            <IconAction
              label="Change payment type"
              onClick={() => onChangePayment(row)}
            >
              <CreditCard size={15} />
            </IconAction>
            {isUnpaid(row.status) ? (
              <IconAction label="Cancel order" onClick={() => onCancel(row)}>
                <X size={15} />
              </IconAction>
            ) : null}
          </div>
        )
      },
    },
  ]

  return <Table columns={columns} rows={rows} rowKey={(row) => row.id} />
}
