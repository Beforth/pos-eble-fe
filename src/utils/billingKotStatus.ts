import type { KotStatus } from '../mocks/kotData'

/** Row tint per KOT status, matching the legend above the KOT listing. */
export const KOT_ROW_TINT: Record<KotStatus, string> = {
  'Used In Bill': 'bg-card',
  Printed: 'bg-emerald-100',
  Ready: 'bg-emerald-100',
  Pending: 'bg-cyan-100',
  Cancelled: 'bg-red-100',
}

export interface KotLegendEntry {
  label: string
  dot: string
}

export const KOT_LEGEND: KotLegendEntry[] = [
  { label: 'Used in Bill', dot: 'border border-line bg-card' },
  { label: 'Active', dot: 'bg-emerald-400' },
  { label: 'Cancelled/Shifted', dot: 'bg-red-400' },
  { label: 'Not Prepared', dot: 'bg-cyan-300' },
]
