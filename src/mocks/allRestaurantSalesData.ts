import { brand } from '../theme/brand'

export interface AllRestaurantSalesRow {
  id: string
  restaurant: string
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

export type AllRestaurantSalesColumnKey =
  | 'restaurant'
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

export const ALL_RESTAURANT_SALES_COLUMNS: Array<{
  key: AllRestaurantSalesColumnKey
  label: string
  align?: 'left' | 'center' | 'right'
}> = [
  { key: 'restaurant', label: 'Restaurants', align: 'left' },
  { key: 'invoiceNos', label: 'Invoice Nos.', align: 'center' },
  { key: 'totalBills', label: 'Total no. of bills', align: 'center' },
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

export const ALL_RESTAURANT_OPTIONS = [
  brand.shopName,
  'Rajubhai Express — Andheri',
  'Rajubhai Cafe — Borivali',
]

export const ALL_RESTAURANT_SALES_ROWS: AllRestaurantSalesRow[] = [
  {
    id: 'outlet-dadar',
    restaurant: brand.shopName,
    invoiceFrom: 58964,
    invoiceTo: 58978,
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

export function summarizeAllRestaurantSales(rows: AllRestaurantSalesRow[]) {
  if (rows.length === 0) {
    return {
      total: null,
      min: null,
      max: null,
      avg: null,
    }
  }

  const numericKeys = [
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

  const total = Object.fromEntries(
    numericKeys.map((key) => [
      key,
      rows.reduce((sum, row) => sum + row[key], 0),
    ]),
  ) as Record<(typeof numericKeys)[number], number>

  const min = Object.fromEntries(
    numericKeys.map((key) => [
      key,
      Math.min(...rows.map((row) => row[key])),
    ]),
  ) as Record<(typeof numericKeys)[number], number>

  const max = Object.fromEntries(
    numericKeys.map((key) => [
      key,
      Math.max(...rows.map((row) => row[key])),
    ]),
  ) as Record<(typeof numericKeys)[number], number>

  const avg = Object.fromEntries(
    numericKeys.map((key) => [key, total[key] / rows.length]),
  ) as Record<(typeof numericKeys)[number], number>

  return { total, min, max, avg }
}
