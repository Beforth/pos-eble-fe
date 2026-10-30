import { useMemo, useRef, useState } from 'react'
import {
  applyListQuery,
  type SortDirection,
  type SortValue,
} from '../utils/listQuery'

export function useListQuery<T>(
  rows: T[],
  getSearchValues: (row: T) => SortValue[],
  getSortValue: (row: T, key: string) => SortValue,
) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const gettersRef = useRef({ getSearchValues, getSortValue })
  gettersRef.current = { getSearchValues, getSortValue }

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key)
      setSortDir('asc')
      return
    }
    setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
  }

  const visible = useMemo(() => {
    const { getSearchValues: searchValues, getSortValue: sortValue } =
      gettersRef.current
    return applyListQuery(
      rows,
      search,
      searchValues,
      sortKey,
      sortDir,
      sortValue,
    )
  }, [rows, search, sortKey, sortDir])

  return { search, setSearch, sortKey, sortDir, toggleSort, visible }
}
