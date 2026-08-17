import type { TableFloorStatus } from '../mocks/billingTables'
import type { KotTicket } from '../mocks/kotViewData'
import { kotTicketAmount } from '../mocks/kotViewData'

const STATUS_KEY = 'pos-eble-table-floor-statuses'
const SESSION_KEY = 'pos-eble-table-sessions'
const KOT_KEY = 'pos-eble-all-kot-tickets'

export interface TableSession {
  tableId: string
  tableNo: string
  persons: number
  startedAt: number
  amount: number
}

export function loadTableStatuses(): Record<string, TableFloorStatus> {
  try {
    const raw = localStorage.getItem(STATUS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, TableFloorStatus>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveTableStatuses(statuses: Record<string, TableFloorStatus>) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(statuses))
}

export function getTableStatus(tableId: string): TableFloorStatus {
  if (!tableId || tableId === 'no-table') return 'blank'
  return loadTableStatuses()[tableId] ?? 'blank'
}

export function setTableStatus(
  tableId: string,
  status: TableFloorStatus,
): void {
  if (!tableId || tableId === 'no-table') return
  const statuses = loadTableStatuses()
  if (status === 'blank') {
    delete statuses[tableId]
  } else {
    statuses[tableId] = status
  }
  saveTableStatuses(statuses)
}

export function clearTableStatus(tableId: string): void {
  setTableStatus(tableId, 'blank')
}

export function loadTableSessions(): Record<string, TableSession> {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, TableSession>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveTableSessions(sessions: Record<string, TableSession>) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessions))
}

export function getTableSession(tableId: string): TableSession | null {
  if (!tableId || tableId === 'no-table') return null
  return loadTableSessions()[tableId] ?? null
}

export function upsertTableSession(
  tableId: string,
  patch: Partial<Omit<TableSession, 'tableId'>> &
    Pick<TableSession, 'tableNo'>,
): void {
  if (!tableId || tableId === 'no-table') return
  const sessions = loadTableSessions()
  const prev = sessions[tableId]
  sessions[tableId] = {
    tableId,
    tableNo: patch.tableNo,
    persons: patch.persons ?? prev?.persons ?? 0,
    startedAt: prev?.startedAt ?? patch.startedAt ?? Date.now(),
    amount: patch.amount ?? prev?.amount ?? 0,
  }
  saveTableSessions(sessions)
}

export function clearTableSession(tableId: string): void {
  if (!tableId || tableId === 'no-table') return
  const sessions = loadTableSessions()
  delete sessions[tableId]
  saveTableSessions(sessions)
  clearTableStatus(tableId)
}

export function loadAllKotTickets(): KotTicket[] {
  try {
    const raw = localStorage.getItem(KOT_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as KotTicket[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveAllKotTickets(tickets: KotTicket[]): void {
  localStorage.setItem(KOT_KEY, JSON.stringify(tickets))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pos-eble-all-kot-tickets', { detail: tickets }))
    try {
      const channel = new BroadcastChannel('pos-eble-kot-sync')
      channel.postMessage({ type: 'tickets_updated', tickets })
      channel.close()
    } catch {
      // BroadcastChannel optional fallback
    }
  }
}

export function updateKotTicketStatus(
  ticketId: string,
  status: 'active' | 'ready',
): KotTicket[] {
  const current = loadAllKotTickets()
  const next = current.map((ticket) =>
    ticket.id === ticketId ? { ...ticket, status } : ticket,
  )
  saveAllKotTickets(next)
  return next
}

export function removeKotTicket(ticketId: string): KotTicket[] {
  const current = loadAllKotTickets()
  const next = current.filter((ticket) => ticket.id !== ticketId)
  saveAllKotTickets(next)
  return next
}

export function appendKotTicket(ticket: KotTicket): KotTicket[] {
  const next = [...loadAllKotTickets(), ticket]
  saveAllKotTickets(next)
  if (ticket.tableId && ticket.tableId !== 'no-table') {
    const tableTickets = next.filter((t) => t.tableId === ticket.tableId)
    const amount = tableTickets.reduce((sum, t) => sum + kotTicketAmount(t), 0)
    upsertTableSession(ticket.tableId, {
      tableNo: ticket.tableNo,
      persons: ticket.persons,
      startedAt: Math.min(...tableTickets.map((t) => t.createdAt)),
      amount,
    })
    setTableStatus(ticket.tableId, 'running-kot')
  }
  return next
}

export function replaceKotTickets(tickets: KotTicket[]): void {
  saveAllKotTickets(tickets)
  const byTable = new Map<string, KotTicket[]>()
  for (const ticket of tickets) {
    if (ticket.tableId === 'no-table') continue
    const list = byTable.get(ticket.tableId) ?? []
    list.push(ticket)
    byTable.set(ticket.tableId, list)
  }
  const sessions = loadTableSessions()
  const statuses = loadTableStatuses()
  for (const [tableId, list] of byTable) {
    sessions[tableId] = {
      tableId,
      tableNo: list[0]?.tableNo ?? sessions[tableId]?.tableNo ?? '',
      persons: Math.max(0, ...list.map((t) => t.persons), 0),
      startedAt: Math.min(...list.map((t) => t.createdAt)),
      amount: list.reduce((sum, t) => sum + kotTicketAmount(t), 0),
    }
  }
  // Drop sessions that no longer have tickets (unless printed — keep until settled)
  for (const tableId of Object.keys(sessions)) {
    if (!byTable.has(tableId) && statuses[tableId] !== 'printed') {
      delete sessions[tableId]
      delete statuses[tableId]
    }
  }
  saveTableSessions(sessions)
  saveTableStatuses(statuses)
}

export function markTablePrinted(tableId: string): void {
  if (!tableId || tableId === 'no-table') return
  setTableStatus(tableId, 'printed')
}

export function settleTableSession(
  tableId: string,
  remainingTickets: KotTicket[],
): void {
  saveAllKotTickets(remainingTickets)
  clearTableSession(tableId)
}

export function formatElapsedMinutes(startedAt: number, now = Date.now()): string {
  const mins = Math.max(0, Math.floor((now - startedAt) / 60000))
  if (mins <= 0) return 'Just now'
  if (mins === 1) return '1 Min'
  return `${mins} Min`
}

export function formatTableAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
