import type { KotStatus } from '../mocks/kotData'

/** Status pill classes per KOT status, from the app's own palette. */
export const KOT_STATUS_PILL: Record<KotStatus, string> = {
  'Used In Bill': 'bg-page text-muted ring-1 ring-inset ring-line',
  Printed: 'bg-accent/10 text-accent',
  Ready: 'bg-success/10 text-success',
  Pending: 'bg-secondary/40 text-ink',
  Cancelled: 'bg-danger/10 text-danger',
}

/** Status dot per KOT status. */
export const KOT_STATUS_DOT: Record<KotStatus, string> = {
  'Used In Bill': 'bg-muted',
  Printed: 'bg-accent',
  Ready: 'bg-success',
  Pending: 'bg-secondary',
  Cancelled: 'bg-danger',
}

export interface KotLegendEntry {
  label: string
  dot: string
}

export const KOT_LEGEND: KotLegendEntry[] = [
  { label: 'Not prepared', dot: KOT_STATUS_DOT.Pending },
  { label: 'Ready', dot: KOT_STATUS_DOT.Ready },
  { label: 'Printed', dot: KOT_STATUS_DOT.Printed },
  { label: 'Used in bill', dot: KOT_STATUS_DOT['Used In Bill'] },
  { label: 'Cancelled / shifted', dot: KOT_STATUS_DOT.Cancelled },
]
