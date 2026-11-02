import { useCallback, useEffect, useRef, useState } from 'react'
import { showToast } from '../../utils/toast'
import { ApiError } from '../../services/apiClient'
import {
  listMenuItemsPageApi,
  type MenuItemRef,
} from '../../services/inventoryService'

const PAGE_SIZE = 20

/**
 * Menu items that are not yet a finished good, loaded a page at a time and
 * searched on the server, for a `SearchableSelect` that loads lazily.
 */
export function useMenuItemPicker(outletId: string | null) {
  const [items, setItems] = useState<MenuItemRef[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  // Only the newest request may write its result (a slow one must not win).
  const latest = useRef(0)

  const fetchPage = useCallback(
    async (nextPage: number, term: string, replace: boolean) => {
      if (!outletId) return
      const ticket = ++latest.current
      setLoading(true)
      try {
        const result = await listMenuItemsPageApi(outletId, {
          search: term.trim(),
          page: nextPage,
          pageSize: PAGE_SIZE,
          excludeStocked: true,
        })
        if (ticket !== latest.current) return
        setItems((prev) =>
          replace
            ? result.results
            : [
                ...prev,
                ...result.results.filter((row) => !prev.some((old) => old.id === row.id)),
              ],
        )
        setPage(nextPage)
        setHasMore(Boolean(result.next))
      } catch (err) {
        if (ticket === latest.current) {
          showToast(err instanceof ApiError ? err.message : 'Unable to load menu items')
        }
      } finally {
        if (ticket === latest.current) setLoading(false)
      }
    },
    [outletId],
  )

  // First page now; a typed search waits a moment so each key is not a request.
  useEffect(() => {
    const timer = window.setTimeout(
      () => void fetchPage(1, query, true),
      query ? 250 : 0,
    )
    return () => window.clearTimeout(timer)
  }, [fetchPage, query])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) void fetchPage(page + 1, query, false)
  }, [fetchPage, hasMore, loading, page, query])

  const reload = useCallback(() => fetchPage(1, query, true), [fetchPage, query])

  return { items, hasMore, loading, setQuery, loadMore, reload }
}
