export type SortDirection = 'asc' | 'desc'
export type SortValue = string | number | boolean | Date | null | undefined

export function compareSortValues(
  a: SortValue,
  b: SortValue,
  dir: SortDirection,
): number {
  const emptyA = a == null || a === ''
  const emptyB = b == null || b === ''
  if (emptyA && emptyB) return 0
  if (emptyA) return 1
  if (emptyB) return -1

  let result = 0
  if (typeof a === 'number' && typeof b === 'number') {
    result = a - b
  } else if (typeof a === 'boolean' && typeof b === 'boolean') {
    result = Number(a) - Number(b)
  } else if (a instanceof Date && b instanceof Date) {
    result = a.getTime() - b.getTime()
  } else {
    result = String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  }
  return dir === 'asc' ? result : -result
}

export function matchesSearch(
  query: string,
  values: SortValue[],
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return values.some((value) => String(value ?? '').toLowerCase().includes(q))
}

export function applyListQuery<T>(
  rows: T[],
  query: string,
  getSearchValues: (row: T) => SortValue[],
  sortKey: string | null,
  sortDir: SortDirection,
  getSortValue: (row: T, key: string) => SortValue,
): T[] {
  const searched = query.trim()
    ? rows.filter((row) => matchesSearch(query, getSearchValues(row)))
    : rows
  if (!sortKey) return searched
  return [...searched].sort((a, b) =>
    compareSortValues(getSortValue(a, sortKey), getSortValue(b, sortKey), sortDir),
  )
}
