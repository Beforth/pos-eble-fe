import { brand } from '../theme/brand'

export interface AllRestaurantDayWiseRow {
  id: string
  restaurant: string
  date: string
  invoiceFrom: number
  invoiceTo: number
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

export type AllRestaurantDayWiseColumnKey =
  | 'restaurant'
  | 'date'
  | 'invoiceNos'
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

export const ALL_RESTAURANT_DAY_WISE_COLUMNS: Array<{
  key: AllRestaurantDayWiseColumnKey
  label: string
  align?: 'left' | 'center' | 'right'
}> = [
  { key: 'restaurant', label: 'Restaurants', align: 'left' },
  { key: 'date', label: 'Date', align: 'center' },
  { key: 'invoiceNos', label: 'Invoice Nos.', align: 'center' },
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

export const ALL_RESTAURANT_DAY_WISE_OPTIONS = [
  brand.shopName,
  'Rajubhai Express — Andheri',
  'Rajubhai Cafe — Borivali',
]

export const ALL_RESTAURANT_DAY_WISE_ROWS: AllRestaurantDayWiseRow[] = [
  {
    id: 'day-2026-08-12',
    restaurant: brand.shopName,
    date: '2026-08-12',
    invoiceFrom: 56964,
    invoiceTo: 56978,
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

export function summarizeAllRestaurantDayWise(
  rows: AllRestaurantDayWiseRow[],
) {
  if (rows.length === 0) {
    return { total: null, min: null, max: null, avg: null }
  }

  const total = Object.fromEntries(
    NUMERIC_KEYS.map((key) => [
      key,
      rows.reduce((sum, row) => sum + row[key], 0),
    ]),
  ) as Record<(typeof NUMERIC_KEYS)[number], number>

  const min = Object.fromEntries(
    NUMERIC_KEYS.map((key) => [key, Math.min(...rows.map((row) => row[key]))]),
  ) as Record<(typeof NUMERIC_KEYS)[number], number>

  const max = Object.fromEntries(
    NUMERIC_KEYS.map((key) => [key, Math.max(...rows.map((row) => row[key]))]),
  ) as Record<(typeof NUMERIC_KEYS)[number], number>

  const avg = Object.fromEntries(
    NUMERIC_KEYS.map((key) => [key, total[key] / rows.length]),
  ) as Record<(typeof NUMERIC_KEYS)[number], number>

  return { total, min, max, avg }
}
