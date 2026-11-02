import type { OnlineOrder } from '../services/onlineOrderApi'
import { addDays, formatDayMonth } from './format'

export type OnlineAggregator = 'All' | 'Zomato' | 'Swiggy'

export type OnlineOrderStatus =
  | 'Received'
  | 'Accepted'
  | 'Food Ready'
  | 'Dispatched'
  | 'Delivered'
  | 'Rejected'
  | 'Cancelled'

export interface OnlineOrderItem {
  name: string
  specialNote: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

/** One row of the Online Orders Activity table, built from the API order. */
export interface OnlineOrderRow {
  id: string
  orderNo: string
  paymentLabel: string
  paymentType: string
  outletName: string
  aggregator: 'Zomato' | 'Swiggy' | 'Other'
  channelLabel: string
  orderType: string
  riderName: string
  riderPhone: string
  riderStatus: string
  customerName: string
  customerPhone?: string
  customerAddress?: string
  customerNotes?: string
  /** Not sent by the aggregators; the details popup shows a dash. */
  persons?: string
  isUrgent?: boolean
  otp: string
  created: string
  received: string
  accepted: string
  foodReady: string
  updated: string
  /** ISO time the order was received; drives the date filters and the chart. */
  receivedAt: string
  total: number
  deliveryCharge: number
  containerCharge: number
  status: OnlineOrderStatus
  /** Minutes the kitchen said it would take; null until the order is accepted. */
  prepTime: number | null
  items: OnlineOrderItem[]
}

const ORDER_TYPE_LABEL: Record<OnlineOrder['order_type'], string> = {
  'dine-in': 'Dine In',
  delivery: 'Delivery',
  'pick-up': 'Pick Up',
}

/** `DD-MM-YYYY HH:mm:ss` in local time, the format the table has always shown. */
export function formatOrderTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function aggregatorOf(platform: string): OnlineOrderRow['aggregator'] {
  const key = platform.trim().toLowerCase()
  if (key === 'zomato') return 'Zomato'
  if (key === 'swiggy') return 'Swiggy'
  return 'Other'
}

function statusOf(order: OnlineOrder): OnlineOrderStatus {
  if (order.status === 'received') return 'Received'
  if (order.status === 'rejected') return 'Rejected'
  if (order.status === 'cancelled') return 'Cancelled'
  const rider = order.rider.status.trim().toLowerCase()
  if (rider === 'delivered') return 'Delivered'
  if (rider === 'dispatched' || rider === 'pickedup' || rider === 'picked_up') {
    return 'Dispatched'
  }
  return order.food_ready_at ? 'Food Ready' : 'Accepted'
}

export function toOnlineOrderRow(order: OnlineOrder, outletName: string): OnlineOrderRow {
  const prepaid = order.prepaid || order.payment_mode === 'online'
  const items = order.items.map((item) => {
    const quantity = Number(item.qty) || 0
    const totalPrice = Number(item.line_total) || 0
    return {
      name: item.name,
      specialNote: item.note || '--',
      quantity,
      unitPrice: quantity > 0 ? totalPrice / quantity : totalPrice,
      totalPrice,
    }
  })
  const total = Number(order.net_amount) || 0
  const status = statusOf(order)
  return {
    id: order.id,
    orderNo: order.external_order_id || order.reference || order.wera_order_id,
    paymentLabel: prepaid ? 'Online Paid' : 'Cash',
    paymentType: prepaid ? 'Online' : 'Cash',
    outletName,
    aggregator: aggregatorOf(order.platform),
    channelLabel: order.platform
      ? order.platform.charAt(0).toUpperCase() + order.platform.slice(1)
      : 'Online',
    orderType: ORDER_TYPE_LABEL[order.order_type] ?? order.order_type,
    riderName: order.rider.name || '—',
    riderPhone: order.rider.number || '',
    riderStatus: order.rider.status || '',
    customerName: order.customer.name || 'Customer',
    customerPhone: order.customer.phone || undefined,
    customerAddress: order.customer.address || undefined,
    customerNotes: order.instructions || undefined,
    otp: order.order_otp || '—',
    created: formatOrderTime(order.ordered_at ?? order.received_at),
    received: formatOrderTime(order.received_at),
    accepted: formatOrderTime(order.accepted_at),
    foodReady: formatOrderTime(order.food_ready_at),
    updated: formatOrderTime(
      order.food_ready_at ?? order.accepted_at ?? order.received_at,
    ),
    receivedAt: order.received_at,
    total,
    deliveryCharge: 0,
    containerCharge: 0,
    status,
    prepTime: order.preparation_time,
    items,
  }
}

/** Orders received per day for the last `days` days, today last. */
export function lastDaysSeries(rows: OnlineOrderRow[], days = 5) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Array.from({ length: days }, (_, index) => {
    const day = addDays(today, index - (days - 1))
    const next = addDays(day, 1)
    const value = rows.filter((row) => {
      const at = new Date(row.receivedAt)
      return at >= day && at < next
    }).length
    return { label: formatDayMonth(day), value }
  })
}
