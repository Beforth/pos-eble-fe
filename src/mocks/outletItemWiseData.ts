import { brand } from '../theme/brand'

export interface OutletItemWiseRow {
  id: string
  taxable: string
  restaurant: string
  category: string
  item: string
  qty: number
  myAmount: number
  discount: number
  tax: number
  grossSales: number
}

export type OutletItemWiseColumnKey =
  | 'taxable'
  | 'restaurant'
  | 'category'
  | 'item'
  | 'qty'
  | 'myAmount'
  | 'discount'
  | 'tax'
  | 'grossSales'

export const OUTLET_ITEM_WISE_COLUMNS: Array<{
  key: OutletItemWiseColumnKey
  label: string
  align?: 'left' | 'center' | 'right'
}> = [
  { key: 'taxable', label: 'Taxable', align: 'left' },
  { key: 'restaurant', label: 'Restaurant', align: 'left' },
  { key: 'category', label: 'Category', align: 'left' },
  { key: 'item', label: 'Item', align: 'left' },
  { key: 'qty', label: 'Qty', align: 'right' },
  { key: 'myAmount', label: 'My Amount', align: 'right' },
  { key: 'discount', label: 'Discount', align: 'right' },
  { key: 'tax', label: 'Tax', align: 'right' },
  { key: 'grossSales', label: 'Gross Sales', align: 'right' },
]

export const OUTLET_ITEM_RESTAURANT_OPTIONS = [
  brand.shopName,
  'Rajubhai Express — Andheri',
  'Rajubhai Cafe — Borivali',
]

export const OUTLET_ITEM_WISE_ROWS: OutletItemWiseRow[] = [
  {
    id: '1',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Vegetable Sandwich',
    item: 'Grill Aaloo Sandwich (Cheese)',
    qty: 1,
    myAmount: 76.19,
    discount: 0,
    tax: 3.8,
    grossSales: 79.99,
  },
  {
    id: '2',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Kathiyawadi Fafda',
    item: 'Kathiyawadi Fafda (1 Plate)',
    qty: 1,
    myAmount: 76.19,
    discount: 0,
    tax: 3.8,
    grossSales: 79.99,
  },
  {
    id: '3',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Dil Se Desi Sandwiches',
    item: 'Tandoori Masala Sandwich',
    qty: 1,
    myAmount: 76.19,
    discount: 0,
    tax: 3.8,
    grossSales: 79.99,
  },
  {
    id: '4',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Chaat',
    item: 'Paani Puri',
    qty: 5,
    myAmount: 285.7,
    discount: 0,
    tax: 14.3,
    grossSales: 300,
  },
  {
    id: '5',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Dil Se Desi Sandwiches',
    item: 'Tandoori Masala Sandwich',
    qty: 1,
    myAmount: 76.19,
    discount: 0,
    tax: 3.8,
    grossSales: 79.99,
  },
  {
    id: '6',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Beverages',
    item: 'Bisleri (BIG)',
    qty: 2,
    myAmount: 38.1,
    discount: 0,
    tax: 1.9,
    grossSales: 40,
  },
  {
    id: '7',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Chaat',
    item: 'Dahi Puri',
    qty: 1,
    myAmount: 76.19,
    discount: 0,
    tax: 3.8,
    grossSales: 79.99,
  },
  {
    id: '8',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Masala Burger',
    item: 'Masala Burger',
    qty: 1,
    myAmount: 66.66,
    discount: 0,
    tax: 3.33,
    grossSales: 69.99,
  },
  {
    id: '9',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Vegetable Sandwich',
    item: 'Vegetable Grill Sandwich (Cheese)',
    qty: 1,
    myAmount: 76.19,
    discount: 0,
    tax: 3.8,
    grossSales: 79.99,
  },
  {
    id: '10',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Chaat',
    item: 'Dahi Wada',
    qty: 2,
    myAmount: 114.28,
    discount: 0,
    tax: 5.72,
    grossSales: 120,
  },
  {
    id: '11',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Cheese Sandwiches',
    item: 'Cheese Chilly Sandwich',
    qty: 2,
    myAmount: 171.42,
    discount: 0,
    tax: 8.58,
    grossSales: 180,
  },
  {
    id: '12',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Dil Se Desi Sandwiches',
    item: 'Sev Tomato Sandwich',
    qty: 3,
    myAmount: 166.65,
    discount: 0,
    tax: 8.34,
    grossSales: 174.99,
  },
  {
    id: '13',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Vegetable Sandwich',
    item: 'Veg Cheese Sandwich',
    qty: 3,
    myAmount: 228.57,
    discount: 0,
    tax: 11.42,
    grossSales: 239.99,
  },
  {
    id: '14',
    taxable: 'Taxable',
    restaurant: brand.shopName,
    category: 'Chaat',
    item: 'Bhel Puri',
    qty: 3,
    myAmount: 171.42,
    discount: 0,
    tax: 8.58,
    grossSales: 180,
  },
]

const NUMERIC_KEYS = [
  'qty',
  'myAmount',
  'discount',
  'tax',
  'grossSales',
] as const

export function summarizeOutletItemWise(rows: OutletItemWiseRow[]) {
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
