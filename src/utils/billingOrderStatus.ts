import type { OrderStatus } from '../mocks/allOrdersData'

/** Row tint per status, matching the legend above the orders table. */
export const STATUS_ROW_TINT: Record<OrderStatus, string> = {
  Saved: 'bg-card',
  Printed: 'bg-emerald-50',
  Settled: 'bg-orange-100',
  Cancelled: 'bg-red-100',
}

/** Legend dot per status. */
export const STATUS_DOT: Record<OrderStatus, string> = {
  Saved: 'border border-line bg-card',
  Printed: 'bg-emerald-400',
  Settled: 'bg-orange-300',
  Cancelled: 'bg-red-400',
}

export const STATUS_LEGEND_LABEL: Record<OrderStatus, string> = {
  Saved: 'Saved Bill',
  Printed: 'Printed Bill',
  Cancelled: 'Cancelled Bill',
  Settled: 'Paid',
}
