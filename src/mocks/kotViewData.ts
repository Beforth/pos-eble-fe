export type KotViewOrderType = 'dine-in' | 'delivery' | 'pick-up' | 'other'

export interface KotViewItem {
  id: string
  /** Menu item id (when sourced from the menu) — used to map back to category. */
  itemId?: string
  name: string
  qty: number
  price: number
  note?: string
}

export interface KotTicket {
  id: string
  /** Sequence for this table (1st KOT = 1, 2nd = 2, …). */
  kotNo: number
  tableId: string
  tableNo: string
  orderType: KotViewOrderType
  biller: string
  /** Cover size / no. of persons for this order. */
  persons: number
  items: KotViewItem[]
  note?: string
  createdAt: number
  status: 'active' | 'ready'
  customerName?: string
  /** Customer-facing token (10–99). */
  displayToken?: number
}

export const ORDER_TYPE_LEGEND: {
  id: KotViewOrderType | 'limit' | 'website'
  label: string
  color: string
}[] = [
  { id: 'delivery', label: 'Delivery', color: 'bg-success' },
  { id: 'limit', label: 'Limit Exceed', color: 'bg-accent' },
  { id: 'website', label: 'Website', color: 'bg-[#1e3a8a]' },
  { id: 'other', label: 'Other', color: 'bg-[#2563eb]' },
  { id: 'dine-in', label: 'Dine In', color: 'bg-primary' },
  { id: 'pick-up', label: 'Pick Up', color: 'bg-sky-400' },
]

export function headerClassForOrderType(type: KotViewOrderType): string {
  switch (type) {
    case 'delivery':
      return 'bg-success text-white'
    case 'pick-up':
      return 'bg-sky-400 text-ink'
    case 'other':
      return 'bg-[#2563eb] text-white'
    case 'dine-in':
    default:
      return 'bg-primary text-white'
  }
}

export function labelForOrderType(type: KotViewOrderType): string {
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

export function kotTicketAmount(ticket: KotTicket): number {
  return ticket.items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

export function nextKotNoForTable(
  tickets: KotTicket[],
  tableId: string,
): number {
  const seq = tickets
    .filter((t) => t.tableId === tableId)
    .map((t) => t.kotNo)
  return seq.length === 0 ? 1 : Math.max(...seq) + 1
}

export function ticketsForTable(
  tickets: KotTicket[],
  tableId: string,
): KotTicket[] {
  return tickets
    .filter((t) => t.tableId === tableId)
    .sort((a, b) => a.kotNo - b.kotNo || a.createdAt - b.createdAt)
}

export function sortKotTicketsForDisplay(tickets: KotTicket[]): KotTicket[] {
  return [...tickets].sort(
    (a, b) => a.createdAt - b.createdAt || a.kotNo - b.kotNo,
  )
}
