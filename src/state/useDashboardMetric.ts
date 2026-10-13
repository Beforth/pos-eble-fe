import { useCallback, useEffect, useMemo, useState } from 'react'

/** Date range state shared by the dashboard panels (mirrors DatePickerPill). */
export interface DashboardRange {
  value: string
  customFrom?: string
  customTo?: string
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Map a DatePickerPill range selection to ``?from=&to=`` query values. */
export function rangeToQuery(range: DashboardRange): {
  from?: string
  to?: string
} {
  if (range.value === 'custom') {
    return {
      from: range.customFrom || undefined,
      to: range.customTo || range.customFrom || undefined,
    }
  }
  const today = startOfDay(new Date())
  switch (range.value) {
    case 'yesterday': {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      return { from: toKey(y), to: toKey(y) }
    }
    case '7d': {
      const start = new Date(today)
      start.setDate(start.getDate() - 6)
      return { from: toKey(start), to: toKey(today) }
    }
    case '30d': {
      const start = new Date(today)
      start.setDate(start.getDate() - 29)
      return { from: toKey(start), to: toKey(today) }
    }
    case 'month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: toKey(start), to: toKey(today) }
    }
    case 'last-month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { from: toKey(start), to: toKey(end) }
    }
    case 'today':
    default:
      return { from: toKey(today), to: toKey(today) }
  }
}

/**
 * Fetch one dashboard metric whenever the outlet or date range changes.
 * Panels get ``{ data, loading, error, refetch }`` — data is ``null`` while
 * loading or on error.
 */
export function useDashboardMetric<T>(
  outletId: string | null | undefined,
  fetcher: (outletId: string, from?: string, to?: string) => Promise<T>,
  range: DashboardRange | null,
  refreshKey?: unknown,
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { from, to } = useMemo(() => rangeToQuery(range ?? { value: 'today' }), [range])

  const load = useCallback(() => {
    if (!outletId) return
    setLoading(true)
    setError(null)
    fetcher(outletId, from, to)
      .then((result) => setData(result))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load')
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [outletId, fetcher, from, to, refreshKey])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, refetch: load }
}
