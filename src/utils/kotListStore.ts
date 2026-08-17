import { kotList, parseKotDate, type KotOrderType, type KotRow } from '../mocks/kotData'
import type { KotTicket } from '../mocks/kotViewData'
import { loadAllKotTickets } from './tableStatusStore'

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

/** `ts` -> `14 Aug 2026 14:32:10` (matches the KOT page `parseKotDate` format). */
export function formatKotTimestamp(timestamp: number): string {
  const d = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function orderTypeToKot(type: KotTicket['orderType']): KotOrderType {
  switch (type) {
    case 'delivery':
      return 'DELIVERY'
    case 'pick-up':
      return 'PICK UP'
    case 'other':
      return 'OTHER'
    case 'dine-in':
    default:
      return 'DINE IN'
  }
}

function ticketToKotRow(ticket: KotTicket): KotRow {
  const items = ticket.items
    .map((item) => `${item.name} × ${item.qty}`)
    .join(', ')
  return {
    id: ticket.id,
    kotId: ticket.kotNo,
    orderType: orderTypeToKot(ticket.orderType),
    customerName: '',
    customerPhone: '',
    itemCount: ticket.items.reduce((sum, item) => sum + item.qty, 0),
    items,
    status: 'Pending',
    billPrintDate: '--',
    completeDuration: '--',
    created: formatKotTimestamp(ticket.createdAt),
  }
}

/** Static KOT history merged with tickets created in Billing, newest first. */
export function loadKotRows(): KotRow[] {
  const ticketRows = loadAllKotTickets().map((ticket) => ({
    row: ticketToKotRow(ticket),
    ts: ticket.createdAt,
  }))
  const staticRows = kotList.map((row, index) => ({
    row,
    ts: parseKotDate(row.created)?.getTime() ?? -index,
  }))
  return [...ticketRows, ...staticRows]
    .sort((a, b) => b.ts - a.ts)
    .map((entry) => entry.row)
}
