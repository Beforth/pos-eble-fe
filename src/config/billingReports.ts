import type { ReportSlug } from '../services/reportService'

/** The billing sidebar's Reports dropdown and the `/billing/reports/:slug` page. */
export const BILLING_REPORTS: { slug: ReportSlug; label: string }[] = [
  { slug: 'sales-summary', label: 'Sales summary' },
  { slug: 'item-wise', label: 'Item-wise sales' },
  { slug: 'category-wise', label: 'Category-wise sales' },
  { slug: 'payment-mode', label: 'Payment-mode summary' },
  { slug: 'bills', label: 'All orders (bill-wise)' },
  { slug: 'cancelled', label: 'Cancelled orders' },
  { slug: 'discounts', label: 'Discount report' },
  { slug: 'dues', label: 'Due / credit' },
  { slug: 'tax', label: 'Tax summary' },
  { slug: 'kot', label: 'KOT report' },
  { slug: 'online-orders', label: 'Online orders' },
  { slug: 'customers', label: 'Customers' },
]

export const BILLING_REPORTS_PATH = '/billing/reports'
