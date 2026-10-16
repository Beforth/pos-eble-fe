import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../auth/AuthContext'
import { subscribeToRail } from '../services/liveRailClient'
import {
  listOnlineOrdersApi,
  type OnlineOrder,
} from '../services/onlineOrderApi'

/** The Accept Orders screen is the one place orders are answered. */
export const ACCEPT_ORDERS_PATH = '/online-orders/accept'

const POLL_MS = 30_000
const RAIL_EVENTS = new Set(['online_order.received', 'online_order.updated'])

interface OnlineOrdersValue {
  /** Orders still waiting for an answer. Used for quiet counters only. */
  pending: OnlineOrder[]
  refresh: () => void
}

const OnlineOrdersContext = createContext<OnlineOrdersValue>({
  pending: [],
  refresh: () => {},
})

/**
 * Keeps the number of waiting online orders up to date for the header and the
 * dashboard. It never opens a pop-up, plays a sound or shows a toast: a new
 * order only raises a counter, and is answered on the Accept Orders page.
 */
export function OnlineOrdersProvider({ children }: { children: ReactNode }) {
  const { encryptedOutletId, token, canAccess } = useAuth()
  const [pending, setPending] = useState<OnlineOrder[]>([])
  const [reload, setReload] = useState(0)
  const allowed = canAccess(ACCEPT_ORDERS_PATH)
  const active = Boolean(encryptedOutletId && token && allowed)

  const refresh = useCallback(() => setReload((n) => n + 1), [])

  useEffect(() => {
    if (!active || !encryptedOutletId) {
      setPending([])
      return
    }
    let cancelled = false
    listOnlineOrdersApi(encryptedOutletId, { status: ['received'] })
      .then((data) => {
        if (!cancelled) setPending(data.results)
      })
      .catch(() => {
        // A failed check is not worth interrupting anyone for; keep the last count.
      })
    return () => {
      cancelled = true
    }
  }, [active, encryptedOutletId, reload])

  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(refresh, POLL_MS)
    return () => window.clearInterval(timer)
  }, [active, refresh])

  useEffect(() => {
    if (!active || !encryptedOutletId || !token) return
    return subscribeToRail({
      outletId: encryptedOutletId,
      token,
      onEvent: (event) => {
        if (RAIL_EVENTS.has(event)) refresh()
      },
    })
  }, [active, encryptedOutletId, token, refresh])

  const value = useMemo(() => ({ pending, refresh }), [pending, refresh])
  return (
    <OnlineOrdersContext.Provider value={value}>
      {children}
    </OnlineOrdersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOnlineOrders(): OnlineOrdersValue {
  return useContext(OnlineOrdersContext)
}
