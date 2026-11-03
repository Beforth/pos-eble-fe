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
import { listWebsiteOrdersApi, type WebsiteOrder } from '../services/websiteOrderApi'

/** The Accept Orders screen is the one place orders are answered. */
export const ACCEPT_ORDERS_PATH = '/online-orders/accept'

const POLL_MS = 30_000
const RAIL_EVENTS = new Set([
  'online_order.received',
  'online_order.updated',
  'website_order.received',
  'website_order.updated',
])

interface OnlineOrdersValue {
  /** Wera and website orders still waiting for an answer. Quiet counters only. */
  pending: Array<OnlineOrder | WebsiteOrder>
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
  const [pending, setPending] = useState<Array<OnlineOrder | WebsiteOrder>>([])
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
    // Two independent sources: one failing must not zero the other's count.
    Promise.allSettled([
      listOnlineOrdersApi(encryptedOutletId, { status: ['received'] }),
      listWebsiteOrdersApi(encryptedOutletId, { status: ['received'] }),
    ]).then(([wera, website]) => {
      if (cancelled) return
      setPending((previous) => {
        const previousWera = previous.filter((o) => o.platform !== 'website')
        const previousWebsite = previous.filter((o) => o.platform === 'website')
        // A failed check is not worth interrupting anyone for; keep that source's last count.
        return [
          ...(wera.status === 'fulfilled' ? wera.value.results : previousWera),
          ...(website.status === 'fulfilled' ? website.value.results : previousWebsite),
        ]
      })
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
