import type { ReportCell } from '../../services/reportService'
import { formatINR } from '../../utils/format'
import { displayDate } from '../../utils/reportDates'

export const TH = 'whitespace-nowrap px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted'
export const TD = 'whitespace-nowrap px-4 py-3 text-sm text-ink'

export function reportSubtitle(from: string, to: string, extra?: string): string {
  return `${displayDate(from)} – ${displayDate(to)}${extra ? ` · ${extra}` : ''}`
}

/** A report cell as a two-decimal Indian-format number; anything else shows as it is. */
export function decimal(value: ReportCell | undefined): string {
  const n = Number(value)
  return Number.isFinite(n)
    ? n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(value ?? '')
}

/** ₹ amount with two decimals from any report cell. */
export function money(value: unknown): string {
  return formatINR(Number(value) || 0, 2)
}

/** The row with the largest `key`, for a "top …" tile. */
export function topRow<T extends Record<string, unknown>>(rows: T[], key: string): T | null {
  return rows.reduce<T | null>(
    (best, row) => (!best || Number(row[key]) > Number(best[key]) ? row : best),
    null,
  )
}
