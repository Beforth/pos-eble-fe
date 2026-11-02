import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  listSubOrderTypesApi,
  type SubOrderTypeRecord,
} from './outletService'

/**
 * The active sub order types of the current outlet (Management → Sub Order
 * Type). Loaded once per outlet; empty while loading or if the call fails, so
 * the screens that offer them simply show nothing.
 */
export function useSubOrderTypes(): SubOrderTypeRecord[] {
  const { encryptedOutletId } = useAuth()
  const [loaded, setLoaded] = useState<{
    outletId: string
    rows: SubOrderTypeRecord[]
  } | null>(null)

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    listSubOrderTypesApi(encryptedOutletId)
      .then((rows) => {
        if (!cancelled) {
          setLoaded({ outletId: encryptedOutletId, rows: rows.filter((row) => row.is_active) })
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded({ outletId: encryptedOutletId, rows: [] })
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  return loaded && loaded.outletId === encryptedOutletId ? loaded.rows : []
}
