import type { KotTicket } from '../mocks/kotViewData'
import { KOT_STORE_EVENT } from './tableStatusStore'

const PREP_KEY = 'pos-eble-kot-item-ready'

type ReadyMap = Record<string, string[]>

function emitPrepChange() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(KOT_STORE_EVENT))
  window.dispatchEvent(new CustomEvent('pos-eble-all-kot-tickets'))
  try {
    const channel = new BroadcastChannel('pos-eble-kot-sync')
    channel.postMessage({ type: 'prep_updated' })
    channel.close()
  } catch {
    // BroadcastChannel optional fallback
  }
}

export function loadReadyProgress(): ReadyMap {
  try {
    const raw = localStorage.getItem(PREP_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as ReadyMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveReadyProgress(map: ReadyMap) {
  localStorage.setItem(PREP_KEY, JSON.stringify(map))
  emitPrepChange()
}

export function loadReadyItemIds(ticketId: string): string[] {
  return loadReadyProgress()[ticketId] ?? []
}

export function markKotItemsReady(ticketId: string, itemIds: string[]): string[] {
  const map = loadReadyProgress()
  const next = Array.from(new Set([...(map[ticketId] ?? []), ...itemIds]))
  map[ticketId] = next
  saveReadyProgress(map)
  return next
}

export function isKotFullyReady(ticket: KotTicket): boolean {
  if (ticket.status === 'ready') return true
  if (ticket.items.length === 0) return false
  const ready = new Set(loadReadyItemIds(ticket.id))
  return ticket.items.every((item) => ready.has(item.id))
}

export function pruneReadyProgress(liveTicketIds: Iterable<string>): void {
  const live = new Set(liveTicketIds)
  const map = loadReadyProgress()
  let changed = false
  for (const ticketId of Object.keys(map)) {
    if (!live.has(ticketId)) {
      delete map[ticketId]
      changed = true
    }
  }
  if (changed) saveReadyProgress(map)
}
