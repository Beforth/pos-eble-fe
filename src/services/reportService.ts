import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

export type ReportSlug =
  | 'sales-summary'
  | 'sales-report'
  | 'item-wise'
  | 'category-wise'
  | 'payment-mode'
  | 'bills'
  | 'cancelled'
  | 'discounts'
  | 'dues'
  | 'tax'
  | 'kot'
  | 'online-orders'
  | 'customers'

export interface ReportColumn {
  key: string
  label: string
  type: 'text' | 'number' | 'money'
}

/** Money and quantities arrive as strings (`"125.00"`); counts as numbers. */
export type ReportCell = string | number

export interface ReportResult {
  slug: ReportSlug
  title: string
  columns: ReportColumn[]
  rows: Record<string, ReportCell>[]
  totals: Record<string, ReportCell>
  truncated: boolean
  from: string
  to: string
}

/** `GET /api/v1/orders/{outlet}/reports/{slug}/?from=&to=` (outlet-local days). */
export function fetchReportApi(
  outletId: string,
  slug: ReportSlug,
  range: { from: string; to: string },
): Promise<ReportResult> {
  const query = new URLSearchParams({ from: range.from, to: range.to })
  return apiRequest<ReportResult>(
    `/api/v1/orders/${outletId}/reports/${slug}/?${query.toString()}`,
    { method: 'GET', token: localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined },
  )
}

export interface OrderSummaryResult {
  slug: 'order-summary'
  title: string
  from: string
  to: string
  status: { status: string; my_amount: string; total: string; orders: number }[]
  status_total: { my_amount: string; total: string; orders: number }
  success: {
    orders: number
    invoice_from: string
    invoice_to: string
    lines: { label: string; amount: string }[]
  }
  cancelled: { count: number; amount: string }
  performance: { avg_per_bill: string; avg_discount_per_order: string }
  order_types: { type: string; count: number; total: string; net: string }[]
  payments: { mode: string; total: string }[]
  online: {
    rows: { source: string; my_amount: string; total: string; orders: number }[]
    total: { my_amount: string; total: string; orders: number }
  }
}

/** `GET /api/v1/orders/{outlet}/reports/order-summary/` — blocks, not table rows. */
export function fetchOrderSummaryApi(
  outletId: string,
  range: { from: string; to: string },
): Promise<OrderSummaryResult> {
  const query = new URLSearchParams({ from: range.from, to: range.to })
  return apiRequest<OrderSummaryResult>(
    `/api/v1/orders/${outletId}/reports/order-summary/?${query.toString()}`,
    { method: 'GET', token: localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined },
  )
}
