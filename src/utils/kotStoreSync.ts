import {
  kotEventToTicket,
  listKotsApi,
  type KotsPage,
} from '../services/orderService'
import { isServerBackedKotId } from './kotListStore'
import {
  loadAllKotTickets,
  removeKotTicket,
  upsertKotTicketFromServer,
} from './tableStatusStore'

/**
 * KOT statuses that still count as live kitchen work. A ticket in any of these
 * is on the boards and must survive a reconciliation; everything else
 * (`Used In Bill`/`Cancelled`) is closed and must not.
 */
export const OPEN_KOT_STATUSES = new Set<string>(['Pending', 'Ready', 'Printed'])

const PAGE_SIZE = 100

/**
 * Reconcile the shared KOT store (`pos-eble-all-kot-tickets`) with the server's
 * open tickets — the single source of truth for "is this ticket still live?".
 *
 * Tickets the server lists as open but we do not hold are **added**; tickets we
 * hold that are server-backed but no longer open are **removed**. That removal
 * is the point: the rail has no backlog, so a ticket closed in another tab (or
 * while this screen was disconnected) still uses to linger locally forever and
 * reads as a ticket "from nowhere". No date scoping — live work carries across
 * midnight (STANDARDS §22).
 *
 * Deliberately **additive**: an already-known ticket is left untouched rather
 * than re-mapped, so local display context (prices, ready state) is not
 * clobbered and a server `Ready` cannot flip a ticket to a state the board
 * hides.
 *
 * Returns `true` when the store changed. A failed fetch returns `false`
 * **without pruning**, so a screen that loses connectivity degrades to stale
 * rather than blank.
 */
export async function syncKotStoreFromServer(outletId: string): Promise<boolean> {
  if (!outletId) return false
  const known = new Map(loadAllKotTickets().map((ticket) => [ticket.id, ticket]))
  const openIds = new Set<string>()
  let changed = false
  try {
    let page = 1
    for (;;) {
      const res: KotsPage = await listKotsApi(outletId, {
        page,
        page_size: PAGE_SIZE,
      })
      for (const dto of res.results) {
        if (!isServerBackedKotId(dto.id)) continue
        if (!OPEN_KOT_STATUSES.has(dto.status)) continue
        openIds.add(dto.id)
        const existing = known.get(dto.id)
        if (existing) {
          // Known ticket: refresh only the settled (`billed`) flag and the bill
          // number, so a bill paid on another terminal drops off this KOT view,
          // while local display state (prices, ready progress) is left untouched.
          const mappedBill = dto.bill_no?.trim() || undefined
          if (
            Boolean(dto.billed) !== Boolean(existing.billed) ||
            (mappedBill !== undefined && mappedBill !== existing.billNo)
          ) {
            const mapped = kotEventToTicket(dto)
            upsertKotTicketFromServer(mapped)
            known.set(dto.id, { ...existing, billed: mapped.billed, billNo: mapped.billNo })
            changed = true
          }
          continue
        }
        const mapped = kotEventToTicket(dto)
        known.set(dto.id, mapped)
        upsertKotTicketFromServer(mapped)
        changed = true
      }
      if (res.results.length === 0) break
      page += 1
      if (page * PAGE_SIZE >= res.count) break
    }
  } catch {
    return false
  }
  const stale = loadAllKotTickets()
    .filter((ticket) => isServerBackedKotId(ticket.id) && !openIds.has(ticket.id))
    .map((ticket) => ticket.id)
  for (const staleId of stale) {
    removeKotTicket(staleId)
    changed = true
  }
  return changed
}
