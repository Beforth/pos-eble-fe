/** Local calendar day as YYYY-MM-DD (the server reads it in the outlet's zone). */
export function todayIso(): string {
  return isoOffset(0)
}

export function isoOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Quick date ranges for the report screens; the From / To boxes still allow any range. */
export function datePresets(): { label: string; from: string; to: string }[] {
  const today = todayIso()
  const monthStart = `${today.slice(0, 8)}01`
  return [
    { label: 'Today', from: today, to: today },
    { label: 'Yesterday', from: isoOffset(-1), to: isoOffset(-1) },
    { label: 'Last 7 days', from: isoOffset(-6), to: today },
    { label: 'This month', from: monthStart, to: today },
  ]
}

/** DD-MM-YYYY, the way the report titles read. */
export function displayDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}-${m}-${y}` : iso
}
