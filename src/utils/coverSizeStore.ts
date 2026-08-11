export interface CoverSizeEntry {
  id: string
  /** Local calendar date `YYYY-MM-DD` */
  dateKey: string
  persons: number
  tableNo: string
  createdAt: number
}

export interface CoverSizeRow {
  label: string
  persons: number
  isTotal?: boolean
}

const STORAGE_KEY = 'pos-eble-cover-size-entries'

function todayKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatReportDate(d = new Date()): string {
  const day = String(d.getDate()).padStart(2, '0')
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const y = d.getFullYear()
  return `${day}-${m}-${y}`
}

export function loadCoverSizeEntries(): CoverSizeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CoverSizeEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCoverSizeEntries(entries: CoverSizeEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

/** Record cover size for a successful / settled order. */
export function recordCoverSize(persons: number, tableNo: string): void {
  if (persons <= 0) return
  const entries = loadCoverSizeEntries()
  entries.push({
    id: `cs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dateKey: todayKey(),
    persons,
    tableNo,
    createdAt: Date.now(),
  })
  saveCoverSizeEntries(entries)
}

/** Aggregate persons by date for the Cover Size Report table. */
export function buildCoverSizeReportRows(
  entries: CoverSizeEntry[] = loadCoverSizeEntries(),
): CoverSizeRow[] {
  const byDate = new Map<string, number>()
  for (const entry of entries) {
    byDate.set(entry.dateKey, (byDate.get(entry.dateKey) ?? 0) + entry.persons)
  }

  const dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a))
  const total = dates.reduce((sum, key) => sum + (byDate.get(key) ?? 0), 0)

  return [
    { label: 'Total', persons: total, isTotal: true },
    ...dates.map((dateKey) => ({
      label: dateKey,
      persons: byDate.get(dateKey) ?? 0,
    })),
  ]
}

export function coverSizeReportGeneratedLabel(): string {
  return formatReportDate()
}
