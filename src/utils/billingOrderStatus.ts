import type { OrderStatus } from '../mocks/allOrdersData'

/** Status pill classes (tinted background + text), from the app's own palette. */
export const STATUS_PILL: Record<OrderStatus, string> = {
  Saved: 'bg-page text-muted ring-1 ring-inset ring-line',
  Printed: 'bg-accent/10 text-accent',
  Settled: 'bg-success/10 text-success',
  Cancelled: 'bg-danger/10 text-danger',
}

/** Status dot per status (legend chips and pills). */
export const STATUS_DOT: Record<OrderStatus, string> = {
  Saved: 'bg-muted',
  Printed: 'bg-accent',
  Settled: 'bg-success',
  Cancelled: 'bg-danger',
}

export const STATUS_LEGEND_LABEL: Record<OrderStatus, string> = {
  Saved: 'Saved',
  Printed: 'Printed',
  Cancelled: 'Cancelled',
  Settled: 'Paid',
}
