import { brand } from '../theme/brand'

export interface PaxSalesReportRow {
  id: string
  restaurant: string
  name: string
  totalPax: number
  totalSales: number
  apc: number
}

export type PaxSalesColumnKey =
  | 'restaurant'
  | 'name'
  | 'totalPax'
  | 'totalSales'
  | 'apc'

export const PAX_SALES_COLUMNS: Array<{
  key: PaxSalesColumnKey
  label: string
  align?: 'left' | 'center' | 'right'
}> = [
  { key: 'restaurant', label: 'Restaurants', align: 'left' },
  { key: 'name', label: 'Name', align: 'left' },
  { key: 'totalPax', label: 'Total Pax', align: 'right' },
  { key: 'totalSales', label: 'Total Sales (₹)', align: 'right' },
  { key: 'apc', label: 'APC', align: 'right' },
]

export const PAX_SALES_RESTAURANT_OPTIONS = [
  brand.shopName,
  'Rajubhai Express — Andheri',
  'Rajubhai Cafe — Borivali',
]

export const PAX_SALES_ROWS: PaxSalesReportRow[] = [
  {
    id: 'biller-utkarsh',
    restaurant: brand.shopName,
    name: 'Utkarsh Gosavi (Biller)',
    totalPax: 0,
    totalSales: 1600,
    apc: 0,
  },
]

export function summarizePaxSales(rows: PaxSalesReportRow[]) {
  if (rows.length === 0) return null

  const totalPax = rows.reduce((sum, row) => sum + row.totalPax, 0)
  const totalSales = rows.reduce((sum, row) => sum + row.totalSales, 0)
  const apc = totalPax > 0 ? totalSales / totalPax : 0

  return { totalPax, totalSales, apc }
}
