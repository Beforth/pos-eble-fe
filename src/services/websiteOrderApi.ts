import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

export type WebsiteOrderStatus =
  | 'received'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'rejected'
  | 'cancelled'

/** One priced line as the backend stores it (webshop/pricing.py). */
export interface WebsiteOrderItem {
  item_id: string
  variation_id: string
  name: string
  variation: string
  addons: Array<{ id: string; name: string; qty: number | string; price: string }>
  /** The backend stores the number the customer sent; treat it as a number. */
  qty: number | string
  note: string
  unit_price: string
  line_total: string
  error: string
}

/** A website order as staff see it (money = decimal strings, ids opaque). */
export interface WebsiteOrder {
  id: string
  reference: string
  platform: 'website'
  status: WebsiteOrderStatus
  customer_name: string
  customer_phone: string
  address: string
  landmark: string
  instructions: string
  items: WebsiteOrderItem[]
  subtotal: string
  container_charge: string
  delivery_charge: string
  tax_total: string
  grand_total: string
  received_at: string
  auto_accept_at: string | null
  accepted_at: string | null
  auto_accepted: boolean
  preparation_minutes: number | null
  reject_reason: string
}

export interface WebsiteOrderCounts {
  received: number
  in_progress: number
  closed: number
}

export interface WebsiteOrderList {
  results: WebsiteOrder[]
  counts: WebsiteOrderCounts
}

export interface WebsiteOrderQuery {
  status?: WebsiteOrderStatus[]
  search?: string
}

export const WEBSITE_REJECT_REASONS: Array<{ id: number; label: string }> = [
  { id: 1, label: 'Items unavailable' },
  { id: 2, label: 'Outlet closed' },
  { id: 3, label: 'Too busy' },
  { id: 4, label: 'Outside delivery area' },
  { id: 5, label: 'Other' },
]

/** Which Accept Orders tab each website status belongs to. */
export const WEBSITE_TAB_STATUSES: Record<keyof WebsiteOrderCounts, WebsiteOrderStatus[]> = {
  received: ['received'],
  in_progress: ['accepted', 'preparing', 'ready', 'out_for_delivery'],
  closed: ['delivered', 'rejected', 'cancelled'],
}

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

function ordersPath(outletId: string, suffix = ''): string {
  return `/api/v1/shop/${outletId}/website-orders/${suffix}`
}

export function listWebsiteOrdersApi(
  outletId: string,
  query: WebsiteOrderQuery = {},
): Promise<WebsiteOrderList> {
  const params = new URLSearchParams()
  if (query.status?.length) params.set('status', query.status.join(','))
  if (query.search?.trim()) params.set('search', query.search.trim())
  const qs = params.toString()
  return apiRequest<WebsiteOrderList>(`${ordersPath(outletId)}${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    token: authToken(),
  })
}

export function acceptWebsiteOrderApi(
  outletId: string,
  id: string,
  minutes: number,
): Promise<WebsiteOrder> {
  return apiRequest<WebsiteOrder>(ordersPath(outletId, `${id}/accept/`), {
    method: 'POST',
    body: JSON.stringify({ preparation_time: minutes }),
    token: authToken(),
  })
}

export function rejectWebsiteOrderApi(
  outletId: string,
  id: string,
  reasonId: number,
): Promise<WebsiteOrder> {
  return apiRequest<WebsiteOrder>(ordersPath(outletId, `${id}/reject/`), {
    method: 'POST',
    body: JSON.stringify({ reason_id: reasonId }),
    token: authToken(),
  })
}
