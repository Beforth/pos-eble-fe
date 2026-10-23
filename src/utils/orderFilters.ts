import type { AllOrderRow } from '../mocks/allOrdersData'

export type DatePreset = 'all' | 'today' | 'yesterday' | '7d' | 'month' | 'custom'

export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 days' },
  { value: 'month', label: 'This month' },
  { value: 'custom', label: 'Custom range' },
]

export interface OrderFilterValues {
  datePreset: DatePreset
  /** `YYYY-MM-DD` (custom range, inclusive). */
  dateFrom: string
  dateTo: string
  /** `HH:MM` time of day; either end may be blank. */
  timeFrom: string
  timeTo: string
  /** Table number; `none` = counter orders (no table); `''` = any. */
  table: string
  /** Raw payment type (`''` = any). */
  payment: string
  /** `billing` | `captain` (`''` = any). */
  source: string
  amountMin: string
  amountMax: string
}

export const EMPTY_ORDER_FILTERS: OrderFilterValues = {
  datePreset: 'all',
  dateFrom: '',
  dateTo: '',
  timeFrom: '',
  timeTo: '',
  table: '',
  payment: '',
  source: '',
  amountMin: '',
  amountMax: '',
}

/** How many of the extra filters are switched on (drives "Clear" and the badge). */
export function activeFilterCount(values: OrderFilterValues): number {
  let count = 0
  if (values.datePreset !== 'all') count += 1
  if (values.timeFrom || values.timeTo) count += 1
  if (values.table) count += 1
  if (values.payment) count += 1
  if (values.source) count += 1
  if (values.amountMin !== '' || values.amountMax !== '') count += 1
  return count
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function parseInputDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

/** `[start, end)` in ms for the chosen date filter, or `null` for "all dates". */
function dateWindow(values: OrderFilterValues, now: Date): [number, number] | null {
  const dayMs = 24 * 60 * 60 * 1000
  const today = startOfDay(now)
  switch (values.datePreset) {
    case 'today':
      return [today, today + dayMs]
    case 'yesterday':
      return [today - dayMs, today]
    case '7d':
      return [today - 6 * dayMs, today + dayMs]
    case 'month':
      return [new Date(now.getFullYear(), now.getMonth(), 1).getTime(), today + dayMs]
    case 'custom': {
      const from = parseInputDate(values.dateFrom)
      const to = parseInputDate(values.dateTo)
      if (!from && !to) return null
      return [
        from ? startOfDay(from) : Number.NEGATIVE_INFINITY,
        to ? startOfDay(to) + dayMs : Number.POSITIVE_INFINITY,
      ]
    }
    default:
      return null
  }
}

function minutesOfDay(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

/** Does this order pass the extra filters (date, time, payment, source, amount)? */
export function matchesOrderFilters(
  order: AllOrderRow,
  values: OrderFilterValues,
  now: Date = new Date(),
): boolean {
  const created = order.createdAt
  const window = dateWindow(values, now)
  if (window) {
    if (created == null || created < window[0] || created >= window[1]) return false
  }

  const from = minutesOfDay(values.timeFrom)
  const to = minutesOfDay(values.timeTo)
  if (from != null || to != null) {
    if (created == null) return false
    const d = new Date(created)
    const minutes = d.getHours() * 60 + d.getMinutes()
    if (from != null && to != null) {
      // A range like 22:00 - 02:00 runs past midnight.
      const inside = from <= to ? minutes >= from && minutes <= to : minutes >= from || minutes <= to
      if (!inside) return false
    } else if (from != null && minutes < from) {
      return false
    } else if (to != null && minutes > to) {
      return false
    }
  }

  if (values.table === 'none') {
    if ((order.tableNo ?? '') !== '') return false
  } else if (values.table && (order.tableNo ?? '') !== values.table) {
    return false
  }

  if (values.payment && (order.paymentType ?? '').toLowerCase() !== values.payment.toLowerCase()) {
    return false
  }
  if (values.source && (order.source ?? '').toLowerCase() !== values.source) return false

  const min = values.amountMin.trim() === '' ? null : Number(values.amountMin)
  const max = values.amountMax.trim() === '' ? null : Number(values.amountMax)
  if (min != null && Number.isFinite(min) && order.grandTotal < min) return false
  if (max != null && Number.isFinite(max) && order.grandTotal > max) return false
  return true
}
