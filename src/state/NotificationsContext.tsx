import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../auth/AuthContext'
import { subscribeToRail } from '../services/liveRailClient'
import {
  listNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  type AppNotification,
} from '../services/notificationService'
import { showToast } from '../utils/toast'

const POLL_MS = 60_000
const RAIL_EVENT = 'notification.created'

interface NotificationsValue {
  items: AppNotification[]
  unreadCount: number
  loading: boolean
  markRead: (id: string) => void
  markAllRead: () => void
  refresh: () => void
}

const NotificationsContext = createContext<NotificationsValue>({
  items: [],
  unreadCount: 0,
  loading: false,
  markRead: () => {},
  markAllRead: () => {},
  refresh: () => {},
})

/**
 * The bell: the outlet's recent notifications and how many are unread for this
 * user. New ones arrive over the live rail; a slow poll catches anything missed
 * while the socket was down. Only warnings and dangers raise a toast, so a busy
 * counter (a new online order) stays quiet, as the Accept Orders counter does.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { encryptedOutletId, token } = useAuth()
  const [items, setItems] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [reload, setReload] = useState(0)
  const active = Boolean(encryptedOutletId && token)
  const seen = useRef(new Set<string>())

  const refresh = useCallback(() => setReload((n) => n + 1), [])

  useEffect(() => {
    if (!active || !encryptedOutletId) {
      setItems([])
      setUnreadCount(0)
      seen.current = new Set()
      return
    }
    let cancelled = false
    setLoading(true)
    listNotificationsApi(encryptedOutletId)
      .then((page) => {
        if (cancelled) return
        setItems(page.results)
        setUnreadCount(page.unread_count)
        seen.current = new Set(page.results.map((row) => row.id))
      })
      .catch(() => {
        // A failed check is not worth interrupting anyone for; keep what we have.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
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
      onEvent: (event, data) => {
        if (event !== RAIL_EVENT || !data) return
        const row = data as AppNotification
        if (!row.id || seen.current.has(row.id)) return
        seen.current.add(row.id)
        setItems((prev) => [row, ...prev])
        setUnreadCount((n) => n + 1)
        if (row.severity !== 'info') showToast(row.title, row.body, row.severity)
      },
    })
  }, [active, encryptedOutletId, token])

  const markRead = useCallback(
    (id: string) => {
      if (!encryptedOutletId) return
      const target = items.find((row) => row.id === id)
      if (!target || target.read) return
      setItems((prev) => prev.map((row) => (row.id === id ? { ...row, read: true } : row)))
      setUnreadCount((n) => Math.max(n - 1, 0))
      markNotificationReadApi(encryptedOutletId, id)
        .then((result) => setUnreadCount(result.unread_count))
        .catch(refresh)
    },
    [encryptedOutletId, items, refresh],
  )

  const markAllRead = useCallback(() => {
    if (!encryptedOutletId) return
    setItems((prev) => prev.map((row) => ({ ...row, read: true })))
    setUnreadCount(0)
    markAllNotificationsReadApi(encryptedOutletId).catch(refresh)
  }, [encryptedOutletId, refresh])

  const value = useMemo(
    () => ({ items, unreadCount, loading, markRead, markAllRead, refresh }),
    [items, unreadCount, loading, markRead, markAllRead, refresh],
  )
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications(): NotificationsValue {
  return useContext(NotificationsContext)
}
