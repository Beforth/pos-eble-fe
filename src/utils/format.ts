/* Small formatting helpers used across the dashboard. */

/** `123456` -> `₹ 1,23,456` (space after ₹, PetPooja-style) */
export function formatINR(value: number, decimals = 0): string {
  const fmt = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `₹ ${fmt.format(value)}`
}

/** Compact Indian notation: `1234567` -> `₹12.3L` */
export function formatINRCompact(value: number): string {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1)}Cr`
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)}L`
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`
  return `₹${value}`
}

/** `1234` -> `1,234` */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(
    value,
  )
}

/** `5` -> `5 Mins ago` */
export function formatMinutesAgo(mins: number): string {
  if (mins < 60) return `${mins} Mins ago`
  const hours = Math.floor(mins / 60)
  return `${hours} hour${hours > 1 ? 's' : ''} ago`
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function ordinalDay(day: number): string {
  const mod100 = day % 100
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`
  switch (day % 10) {
    case 1:
      return `${day}st`
    case 2:
      return `${day}nd`
    case 3:
      return `${day}rd`
    default:
      return `${day}th`
  }
}

/** `2026-08-05` -> `5th Aug` */
export function formatDayMonth(date: Date): string {
  return `${ordinalDay(date.getDate())} ${MONTHS_SHORT[date.getMonth()]}`
}

/** `2026-08-05` -> `August` */
export function formatMonthName(date: Date): string {
  return MONTHS_LONG[date.getMonth()]
}

/** Parse `YYYY-MM-DD` as a local date. */
export function parseInputDate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Shift a date by N calendar days (local time). */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}
