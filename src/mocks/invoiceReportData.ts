import { brand } from '../theme/brand'

export interface InvoiceReportRow {
  id: string
  restaurant: string
  billStarting: number
  billEnding: number
  totalBills: number
  salesBillCount: number
  salesBillAmount: number
  cancelBillCount: number
  cancelBillAmount: number
}

export type InvoiceReportColumnKey =
  | 'restaurant'
  | 'billStarting'
  | 'billEnding'
  | 'totalBills'
  | 'salesBillCount'
  | 'salesBillAmount'
  | 'cancelBillCount'
  | 'cancelBillAmount'

export const INVOICE_REPORT_COLUMNS: Array<{
  key: InvoiceReportColumnKey
  label: string
  align?: 'left' | 'center' | 'right'
}> = [
  { key: 'restaurant', label: 'Restaurants', align: 'left' },
  { key: 'billStarting', label: 'Bill Starting', align: 'center' },
  { key: 'billEnding', label: 'Bill Ending', align: 'center' },
  { key: 'totalBills', label: 'Total no. of bills', align: 'center' },
  { key: 'salesBillCount', label: 'Sales Bill Count', align: 'center' },
  { key: 'salesBillAmount', label: 'Sales Bill Amount', align: 'right' },
  { key: 'cancelBillCount', label: 'Cancel Bill Count', align: 'center' },
  { key: 'cancelBillAmount', label: 'Cancel Bill Amount', align: 'right' },
]

export const INVOICE_RESTAURANT_OPTIONS = [
  brand.shopName,
  'Rajubhai Express — Andheri',
  'Rajubhai Cafe — Borivali',
]

export const INVOICE_REPORT_ROWS: InvoiceReportRow[] = [
  {
    id: 'outlet-dadar',
    restaurant: brand.shopName,
    billStarting: 56964,
    billEnding: 56978,
    totalBills: 15,
    salesBillCount: 15,
    salesBillAmount: 1600,
    cancelBillCount: 0,
    cancelBillAmount: 0,
  },
]

const NUMERIC_KEYS = [
  'totalBills',
  'salesBillCount',
  'salesBillAmount',
  'cancelBillCount',
  'cancelBillAmount',
] as const

export function summarizeInvoiceReport(rows: InvoiceReportRow[]) {
  if (rows.length === 0) return null

  return Object.fromEntries(
    NUMERIC_KEYS.map((key) => [
      key,
      rows.reduce((sum, row) => sum + row[key], 0),
    ]),
  ) as Record<(typeof NUMERIC_KEYS)[number], number>
}
