import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { listDiningAreasApi } from '../services/menuService'
import type { DiningArea } from '../types/menu'

export interface BillingTableRow {
  id: string
  tableNo: string
  persons: number
  areaName: string
}

export type DiningTablesStatus = 'loading' | 'ready' | 'error'

export interface DiningTablesState {
  tables: BillingTableRow[]
  tablesById: Record<string, BillingTableRow>
  status: DiningTablesStatus
  reload: () => void
}

/**
 * Live dining tables for the billing screens, flattened from the dining
 * areas endpoint. `id` values are OPAQUE ENCRYPTED STRINGS — never Number().
 */
export function useDiningTables(): DiningTablesState {
  const { encryptedOutletId } = useAuth()
  const [areas, setAreas] = useState<DiningArea[]>([])
  const [status, setStatus] = useState<DiningTablesStatus>('loading')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) {
      setAreas([])
      setStatus('ready')
      return
    }
    setStatus('loading')
    listDiningAreasApi(encryptedOutletId)
      .then((data) => {
        if (cancelled) return
        setAreas(data)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, reloadKey])

  const tables = useMemo(
    () =>
      areas.flatMap((area) =>
        area.tables.map((table) => ({
          id: table.id,
          tableNo: table.table_no,
          persons: table.persons,
          areaName: area.name,
        })),
      ),
    [areas],
  )

  const tablesById = useMemo(() => {
    const map: Record<string, BillingTableRow> = {}
    for (const table of tables) {
      map[table.id] = table
    }
    return map
  }, [tables])

  return {
    tables,
    tablesById,
    status,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    reload: () => setReloadKey((k) => k + 1),
  }
}