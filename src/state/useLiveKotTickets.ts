import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { KotTicket } from '../mocks/kotViewData'
import { subscribeToRail } from '../services/liveRailClient'
import { kotEventToTicket, type KotEventData } from '../services/orderService'
import { syncKotStoreFromServer } from '../utils/kotStoreSync'
import {
  KOT_STORE_EVENT,
  loadAllKotTickets,
  removeKotTicket,
  upsertKotTicketFromServer,
} from '../utils/tableStatusStore'

const SYNC_INTERVAL_MS = 5000

/**
 * The open kitchen tickets, kept live.
 *
 * Reads the shared KOT store (the same one the kitchen screen and the KOT view
 * use) and keeps it fresh three ways: rail events patch it as they arrive, a
 * reconciliation with the server runs on connect / on an interval / when the
 * tab is looked at again (the rail has no backlog, so a ticket sent while it
 * was down is only found that way), and other tabs' writes are picked up.
 */
export function useLiveKotTickets(): { tickets: KotTicket[]; refresh: () => void } {
  const { encryptedOutletId, token } = useAuth()
  const [tickets, setTickets] = useState<KotTicket[]>(() => loadAllKotTickets())

  const reload = useCallback(() => setTickets(loadAllKotTickets()), [])

  const sync = useCallback(async () => {
    if (!encryptedOutletId) return
    const changed = await syncKotStoreFromServer(encryptedOutletId)
    if (changed) reload()
  }, [encryptedOutletId, reload])

  // Other tabs / screens writing the shared store.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'pos-eble-all-kot-tickets') reload()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(KOT_STORE_EVENT, reload)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(KOT_STORE_EVENT, reload)
    }
  }, [reload])

  // Rail events.
  useEffect(() => {
    if (!encryptedOutletId || !token) return
    const handleRemoved = (id: string) => {
      removeKotTicket(id)
      reload()
    }
    return subscribeToRail({
      outletId: encryptedOutletId,
      token,
      onStatus: (status) => {
        if (status === 'open') void sync()
      },
      onEvent: (event, data) => {
        if (event === 'kot.prep' || event === 'kot.modified') {
          upsertKotTicketFromServer(kotEventToTicket(data as KotEventData))
          reload()
          return
        }
        if (event === 'kot.deleted') {
          handleRemoved((data as { id: string }).id)
          return
        }
        if (event === 'kot.cancelled' || event === 'kot.used_in_bill') {
          handleRemoved((data as KotEventData).id)
          return
        }
        // Day End starts the live view over: reconcile now so the tickets from
        // before the close drop off at once.
        if (event === 'day_end.close') void sync()
      },
    })
  }, [encryptedOutletId, token, reload, sync])

  // Reconcile with the server now, on an interval, and when the tab is shown.
  useEffect(() => {
    if (!encryptedOutletId || !token) return
    void sync()
    const interval = window.setInterval(() => void sync(), SYNC_INTERVAL_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        reload()
        void sync()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [encryptedOutletId, token, sync, reload])

  return { tickets, refresh: () => void sync().then(reload) }
}
