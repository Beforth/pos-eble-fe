import { useState, type ReactNode, type SVGProps } from 'react'
import type { OnlineOrderRow, OnlineOrderStatus } from '../../mocks/onlineOrdersData'
import { OnlineOrderActivityDrawer } from './OnlineOrderActivityDrawer'
import { OnlineOrderBillModal } from './OnlineOrderBillModal'
import { OnlineOrderDetailsModal } from './OnlineOrderDetailsModal'

interface OnlineOrdersTableProps {
  rows: OnlineOrderRow[]
}

const statusStyles: Record<OnlineOrderStatus, string> = {
  Delivered: 'bg-success text-white',
  Accepted: 'bg-primary text-white',
  'Food Ready': 'bg-accent text-white',
  Dispatched: 'bg-secondary text-deep',
  Cancelled: 'bg-danger text-white',
}

function iconProps(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
    width: 18,
    height: 18,
    ...props,
  }
}

/** Clipboard with eye badge — view / order details */
function ClipboardEyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <rect x="5" y="3" width="12" height="16" rx="1.75" />
      <path d="M8.5 3h5v2.25h-5z" />
      <circle cx="16.25" cy="16.25" r="4.1" fill="var(--color-card)" />
      <circle cx="16.25" cy="16.25" r="4.1" />
      <ellipse cx="16.25" cy="16.25" rx="2.15" ry="1.35" />
      <circle
        cx="16.25"
        cy="16.25"
        r="0.7"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}

/** Receipt with serrated bottom + bullet lines — bill */
function ReceiptJaggedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="M7 2.5h10v16l-1.25-1-1.25 1-1.25-1-1.25 1-1.25-1-1.25 1-1.25-1-1.25 1V2.5z" />
      <circle cx="9.2" cy="7" r="0.75" fill="currentColor" stroke="none" />
      <path d="M10.85 7H16" />
      <circle cx="9.2" cy="10.15" r="0.75" fill="currentColor" stroke="none" />
      <path d="M10.85 10.15H16" />
      <circle cx="9.2" cy="13.3" r="0.75" fill="currentColor" stroke="none" />
      <path d="M10.85 13.3H16" />
      <circle cx="9.2" cy="16.45" r="0.75" fill="currentColor" stroke="none" />
      <path d="M10.85 16.45h3.5" />
    </svg>
  )
}

/** Clock with history arrow — online order activity / lifecycle */
function HistoryClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="M3.75 9.5A8.25 8.25 0 1 1 3.5 13.75" />
      <path d="M3.75 5v4.5H8.25" />
      <path d="M12 8v4.35l2.85 1.7" />
    </svg>
  )
}

function ActionButton({
  label,
  children,
  onClick,
}: {
  label: string
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-md border border-line bg-page text-ink transition-colors hover:border-muted hover:bg-card"
    >
      {children}
    </button>
  )
}

export function OnlineOrdersTable({ rows }: OnlineOrdersTableProps) {
  const [detailsOrder, setDetailsOrder] = useState<OnlineOrderRow | null>(null)
  const [billOrder, setBillOrder] = useState<OnlineOrderRow | null>(null)
  const [activityOrder, setActivityOrder] = useState<OnlineOrderRow | null>(
    null,
  )

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-page/80 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <th className="px-3 py-2.5">Order No.</th>
              <th className="px-3 py-2.5">Outlet Name / Order From</th>
              <th className="px-3 py-2.5">Order Type / Rider Details</th>
              <th className="px-3 py-2.5">Customer Details</th>
              <th className="px-3 py-2.5">OTP</th>
              <th className="px-3 py-2.5">Date Time</th>
              <th className="px-3 py-2.5 text-right">Total</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-center">At</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-line last:border-0 hover:bg-page/40"
              >
                <td className="bg-primary/[0.04] px-3 py-3 align-top">
                  <p className="font-semibold tabular-nums text-ink">
                    {row.orderNo}
                  </p>
                  <p className="mt-0.5 text-xs text-primary">
                    ({row.paymentLabel})
                  </p>
                </td>

                <td className="px-3 py-3 align-top">
                  <p className="text-ink">{row.outletName}</p>
                  <p className="mt-0.5 text-xs font-medium text-primary">
                    {row.channelLabel}
                  </p>
                </td>

                <td className="px-3 py-3 align-top">
                  <p className="font-semibold text-ink">{row.orderType}</p>
                  <p className="mt-0.5 text-xs font-medium text-primary">
                    {row.riderName}
                  </p>
                  <p className="text-xs tabular-nums text-muted">
                    {row.riderPhone}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase text-primary">
                    {row.riderStatus}
                  </p>
                </td>

                <td className="px-3 py-3 align-top">
                  <p className="font-medium text-primary">{row.customerName}</p>
                  {row.customerPhone ? (
                    <p className="mt-0.5 text-xs tabular-nums text-primary">
                      {row.customerPhone}
                    </p>
                  ) : null}
                </td>

                <td className="px-3 py-3 align-top">
                  <p className="font-semibold tabular-nums text-ink">{row.otp}</p>
                </td>

                <td className="px-3 py-3 align-top">
                  <div className="space-y-0.5 text-[11px] leading-relaxed text-muted">
                    <p>
                      <span className="text-ink">Created:</span> {row.created}
                    </p>
                    <p>
                      <span className="text-ink">Received:</span> {row.received}
                    </p>
                    <p>
                      <span className="text-ink">Accepted:</span> {row.accepted}
                    </p>
                    <p>
                      <span className="text-ink">Updated:</span> {row.updated}
                    </p>
                  </div>
                </td>

                <td className="bg-success/10 px-3 py-3 text-right align-top">
                  <p className="font-bold tabular-nums text-ink">
                    {row.total.toFixed(2)}
                  </p>
                </td>

                <td className="px-3 py-3 align-top">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>

                <td className="px-3 py-3 text-center align-top">
                  <span className="tabular-nums text-ink">{row.atCount}</span>
                </td>

                <td className="px-3 py-3 align-top">
                  <div className="flex items-center gap-1.5">
                    <ActionButton
                      label="View details"
                      onClick={() => setDetailsOrder(row)}
                    >
                      <ClipboardEyeIcon />
                    </ActionButton>
                    <ActionButton
                      label="View bill"
                      onClick={() => setBillOrder(row)}
                    >
                      <ReceiptJaggedIcon />
                    </ActionButton>
                    <ActionButton
                      label="Online order activity"
                      onClick={() => setActivityOrder(row)}
                    >
                      <HistoryClockIcon />
                    </ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OnlineOrderDetailsModal
        open={Boolean(detailsOrder)}
        order={detailsOrder}
        onClose={() => setDetailsOrder(null)}
      />
      <OnlineOrderBillModal
        open={Boolean(billOrder)}
        order={billOrder}
        onClose={() => setBillOrder(null)}
      />
      <OnlineOrderActivityDrawer
        open={Boolean(activityOrder)}
        order={activityOrder}
        onClose={() => setActivityOrder(null)}
      />
    </>
  )
}
