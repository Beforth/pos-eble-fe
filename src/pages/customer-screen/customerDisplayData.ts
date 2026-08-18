import type { KotTicket } from '../../mocks/kotViewData'
import { isKotFullyReady } from '../../utils/kotPrepStore'

export type DisplayStatus = 'preparing' | 'ready'

export interface DisplayTicket {
  id: string
  tokenNo: string
  customerName: string
  status: DisplayStatus
  createdAt: number
}

export function messageForStatus(status: DisplayStatus) {
  return status === 'ready' ? 'Your order is ready' : 'Your food is preparing'
}

/** Two-digit token (10–99), never 01 / 02. */
export function randomDisplayToken(used: Iterable<number | string>): number {
  const taken = new Set(
    [...used].map((value) => Number(value)).filter((n) => Number.isFinite(n)),
  )
  const pool: number[] = []
  for (let n = 10; n <= 99; n += 1) {
    if (!taken.has(n)) pool.push(n)
  }
  if (pool.length === 0) return 10 + Math.floor(Math.random() * 90)
  return pool[Math.floor(Math.random() * pool.length)]
}

export function toDisplayTicket(ticket: KotTicket): DisplayTicket {
  const name = ticket.customerName?.trim()
  const token =
    ticket.displayToken != null
      ? String(ticket.displayToken)
      : String(ticket.kotNo)
  return {
    id: ticket.id,
    tokenNo: token,
    customerName: name || `Table ${ticket.tableNo}`,
    status: isKotFullyReady(ticket) ? 'ready' : 'preparing',
    createdAt: ticket.createdAt,
  }
}

export function sortDisplayTickets(tickets: DisplayTicket[]): DisplayTicket[] {
  return [...tickets].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'ready' ? -1 : 1
    return a.createdAt - b.createdAt
  })
}
