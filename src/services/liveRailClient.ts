import { API_BASE_URL } from '../config/api'

/**
 * WebSocket client for the POS live billing rail.
 *
 * Connects to `ws(s)://<host>/ws/billing/{encryptedOutletId}/?token=<jwt>`
 * (same URL the backend `billing` app serves). In dev the connection goes
 * through the Vite proxy (`/ws` → Django ASGI), exactly like `/api`.
 * Reconnects with exponential backoff while the caller is mounted.
 */
const RECONNECT_MIN_MS = 1000
const RECONNECT_MAX_MS = 15000

// Close codes that mean the server rejected us permanently. Retrying these
// just hammers the backend every backoff interval (see billing consumer).
const PERMANENT_CLOSE_CODES = new Set([4401, 4403])

export type RailConnectionStatus = 'connecting' | 'open' | 'closed'

export interface RailSubscriptionOptions {
  outletId: string
  token: string
  onEvent: (event: string, data: unknown) => void
  onStatus?: (status: RailConnectionStatus) => void
}

function buildUrl(outletId: string, token: string): string {
  const path = `/ws/billing/${outletId}/?token=${encodeURIComponent(token)}`
  const base = API_BASE_URL
  if (/^https?:\/\//i.test(base)) {
    return `${base.replace(/\/$/, '').replace(/^http/i, 'ws')}${path}`
  }
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${protocol}://${window.location.host}${path}`
}

/** Start listening on the outlet's billing rail; returns an unsubscribe fn. */
export function subscribeToRail({
  outletId,
  token,
  onEvent,
  onStatus,
}: RailSubscriptionOptions): () => void {
  let socket: WebSocket | null = null
  let timer: number | undefined
  let attempts = 0
  let disposed = false

  function connect() {
    if (disposed) return
    onStatus?.('connecting')
    const ws = new WebSocket(buildUrl(outletId, token))
    socket = ws

    ws.onopen = () => {
      attempts = 0
      onStatus?.('open')
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as {
          event?: string
          data?: unknown
        }
        if (message.event) onEvent(message.event, message.data)
      } catch {
        // Unparseable frames are ignored (keep = duplicate); not worth toasting.
      }
    }

    ws.onerror = () => ws.close()

    ws.onclose = (event) => {
      socket = null
      if (disposed) {
        onStatus?.('closed')
        return
      }
      if (PERMANENT_CLOSE_CODES.has(event.code)) {
        // Auth/permission rejection — do not retry.
        onStatus?.('closed')
        return
      }
      const delay = Math.min(RECONNECT_MIN_MS * 2 ** attempts, RECONNECT_MAX_MS)
      attempts += 1
      timer = window.setTimeout(connect, delay)
    }
  }

  connect()

  return () => {
    disposed = true
    if (timer) window.clearTimeout(timer)
    if (socket) socket.close()
  }
}