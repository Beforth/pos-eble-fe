import {
  kotList,
  parseKotDate,
  type KotOrderType,
  type KotRow,
  type KotRowSource,
} from '../mocks/kotData'
import type { KotTicket } from '../mocks/kotViewData'
import { loadAllKotTickets } from './tableStatusStore'

export type { KotRow } from '../mocks/kotData'

/** Map a KOT list row's order type → Billing `orderType` query value. */
export function kotRowToBillingOrderType(
  orderType: KotOrderType,
): 'dine-in' | 'delivery' | 'pick-up' | 'other' {
  switch (orderType) {
    case 'DELIVERY':
      return 'delivery'
    case 'PICK UP':
    case 'PARCEL':
      return 'pick-up'
    case 'OTHER':
      return 'other'
    case 'DINE IN':
    default:
      return 'dine-in'
  }
}

/** Deep-link into Billing Order View with this KOT pinned. */
export function billingUrlForKot(row: KotRow): string {
  const params = new URLSearchParams()
  params.set('openKot', row.id)
  if (row.tableId) params.set('tableId', row.tableId)
  if (row.tableNo) params.set('tableNo', row.tableNo)
  if (row.guests && row.guests > 0) {
    params.set('persons', String(row.guests))
  }
  params.set('orderType', kotRowToBillingOrderType(row.orderType))
  return `/billing?${params.toString()}`
}

/** `"Dabeli × 2, Vada Pav"` -> `[{name, qty}]` (KOT edit save payload). */
export function parseKotItems(itemsText: string): { name: string; qty: number }[] {
  return itemsText
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const qtyMatch = part.match(/[×x]\s*(\d+(?:\.\d+)?)/)
      const qty = qtyMatch ? Number(qtyMatch[1]) : 1
      return {
        name: part.replace(/\s*[×x]\s*\d+/i, '').trim(),
        qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
      }
    })
}

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
    source: ticket.source ?? 'billing',
    tableId:
      ticket.tableId && ticket.tableId !== 'no-table'
        ? ticket.tableId
        : undefined,
    tableNo: ticket.tableNo || undefined,
    guests: ticket.persons || undefined,
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

/** Seed records: dine-in is entered via Captain Orders, everything else via Billing. */
function kotRowSource(row: KotRow): KotRowSource {
  return row.orderType === 'DINE IN' ? 'captain' : 'billing'
}

/** Static KOT history merged with tickets created in Billing/Captain, newest first. */
export function loadKotRows(source?: 'billing' | 'captain'): KotRow[] {
  const ticketRows = loadAllKotTickets().map((ticket) => ({
    row: ticketToKotRow(ticket),
    ts: ticket.createdAt,
  }))
  const staticRows = kotList.map((row, index) => ({
    row: {
      ...row,
      source: kotRowSource(row),
    },
    ts: parseKotDate(row.created)?.getTime() ?? -index,
  }))
  return [...ticketRows, ...staticRows]
    .filter((entry) => !source || entry.row.source === source)
    .sort((a, b) => b.ts - a.ts)
    .map((entry) => entry.row)
}
