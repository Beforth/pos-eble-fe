import { brand } from '../theme/brand'

export interface OrderSubOrderWiseRow {
  id: string
  restaurant: string
  orderType: string
  subOrderType: string
  totalBills: number
  myAmount: number
  totalDiscount: number
  netSales: number
  deliveryCharge: number
  containerCharge: number
  serviceCharge: number
  totalTax: number
  roundOff: number
  tip: number
  totalSales: number
}

export type OrderSubOrderColumnKey =
  | 'restaurant'
  | 'orderType'
  | 'subOrderType'
  | 'totalBills'
  | 'myAmount'
  | 'totalDiscount'
  | 'netSales'
  | 'deliveryCharge'
  | 'containerCharge'
  | 'serviceCharge'
  | 'totalTax'
  | 'roundOff'
  | 'tip'
  | 'totalSales'

export const ORDER_SUB_ORDER_COLUMNS: Array<{
  key: OrderSubOrderColumnKey
  label: string
  align?: 'left' | 'center' | 'right'
}> = [
  { key: 'restaurant', label: 'Restaurants', align: 'left' },
  { key: 'orderType', label: 'Order Type', align: 'left' },
  { key: 'subOrderType', label: 'Sub Order Type', align: 'left' },
  { key: 'totalBills', label: 'Total no. of bills', align: 'right' },
  { key: 'myAmount', label: 'My Amount (₹)', align: 'right' },
  { key: 'totalDiscount', label: 'Total Discount (₹)', align: 'right' },
  {
    key: 'netSales',
    label: 'Net Sales (₹) (M.A - T.D)',
    align: 'right',
  },
  { key: 'deliveryCharge', label: 'Delivery Charge', align: 'right' },
  { key: 'containerCharge', label: 'Container Charge', align: 'right' },
  { key: 'serviceCharge', label: 'Service Charge', align: 'right' },
  { key: 'totalTax', label: 'Total Tax (₹)', align: 'right' },
  { key: 'roundOff', label: 'Round Off', align: 'right' },
  { key: 'tip', label: 'Tip', align: 'right' },
  { key: 'totalSales', label: 'Total Sales (₹)', align: 'right' },
]

export const ORDER_SUB_ORDER_RESTAURANT_OPTIONS = [
  brand.shopName,
  'Rajubhai Express — Andheri',
  'Rajubhai Cafe — Borivali',
]

export const ORDER_SUB_ORDER_ROWS: OrderSubOrderWiseRow[] = [
  {
    id: 'pickup-dinein',
    restaurant: brand.shopName,
    orderType: 'Pick Up',
    subOrderType: 'DINE IN',
    totalBills: 15,
    myAmount: 1523.8,
    totalDiscount: 0,
    netSales: 1523.8,
    deliveryCharge: 0,
    containerCharge: 0,
    serviceCharge: 0,
    totalTax: 76.19,
    roundOff: 0.01,
    tip: 0,
    totalSales: 1600,
  },
]

const NUMERIC_KEYS = [
  'totalBills',
  'myAmount',
  'totalDiscount',
  'netSales',
  'deliveryCharge',
  'containerCharge',
  'serviceCharge',
  'totalTax',
  'roundOff',
  'tip',
  'totalSales',
] as const

export function summarizeOrderSubOrder(rows: OrderSubOrderWiseRow[]) {
  if (rows.length === 0) return null

  return Object.fromEntries(
    NUMERIC_KEYS.map((key) => [
      key,
      rows.reduce((sum, row) => sum + row[key], 0),
    ]),
  ) as Record<(typeof NUMERIC_KEYS)[number], number>
}
