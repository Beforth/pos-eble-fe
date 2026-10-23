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
import { STATUS_ROW_TINT } from '../../utils/billingOrderStatus'
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
      ? 'bg-primary text-white hover:bg-primary-hover'
      : tone === 'danger'
        ? 'bg-danger text-white hover:opacity-90'
        : 'bg-card text-ink hover:bg-page'
  return (
    <button
      type="button"
      aria-label={label}
      data-tooltip={label}
      onClick={onClick}
      className={`inline-flex size-8 items-center justify-center rounded-lg ${toneClass}`}
    >
      {children}
    </button>
  )
}

/**
 * The current-orders table: one tinted row per order (tint = bill status), the
 * grand total as an editable link, and the actions as icon buttons.
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
      header: 'Order No.',
      render: (row) => (
        <button
          type="button"
          onClick={() => onView(row)}
          className="rounded-md bg-card px-2 py-0.5 font-semibold text-primary underline hover:bg-page"
        >
          {row.orderNo}
        </button>
      ),
    },
    {
      key: 'orderType',
      header: 'Order Type',
      render: (row) => (
        <div className="whitespace-nowrap">
          <p>{row.orderType}</p>
          <p className="font-bold italic">({row.orderType})</p>
        </div>
      ),
    },
    {
      key: 'customerPhone',
      header: 'Customer Phone',
      render: (row) => row.customerPhone || '',
    },
    {
      key: 'customerName',
      header: 'Customer Name',
      render: (row) => (row.customerName === 'Walk-in' ? '' : row.customerName),
    },
    {
      key: 'payment',
      header: 'Payment Type',
      render: (row) => row.payment || '',
    },
    {
      key: 'myAmount',
      header: 'My Amount (₹)',
      render: (row) => <span className="tabular-nums">{row.myAmount.toFixed(2)}</span>,
    },
    {
      key: 'tax',
      header: 'Tax (₹)',
      render: (row) => <span className="tabular-nums">{row.tax.toFixed(2)}</span>,
    },
    {
      key: 'discount',
      header: 'Discount (₹)',
      render: (row) => (
        <span className="tabular-nums">({row.discount.toFixed(2)})</span>
      ),
    },
    {
      key: 'grandTotal',
      header: 'Grand Total (₹)',
      render: (row) => {
        const due = row.balanceDue ?? 0
        return (
          <div className="whitespace-nowrap">
            <button
              type="button"
              onClick={() => onEdit(row)}
              aria-label={`Edit order ${row.orderNo}`}
              data-tooltip="Edit order"
              className="inline-flex items-center gap-1 rounded-lg bg-card px-2 py-1 font-semibold tabular-nums text-primary underline hover:bg-page"
            >
              {row.grandTotal.toFixed(2)}
              <Pencil size={12} />
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
      render: (row) => <span className="whitespace-nowrap">{row.created}</span>,
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

  return (
    <Table
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      rowClassName={(row) => STATUS_ROW_TINT[row.status]}
    />
  )
}
