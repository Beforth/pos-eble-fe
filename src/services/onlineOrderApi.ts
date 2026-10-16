import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

export type OnlineOrderStatus =
  | 'received'
  | 'accepted'
  | 'auto_accepted'
  | 'rejected'
  | 'cancelled'

export interface OnlineOrderItem {
  name: string
  qty: string
  line_total: string
  note: string
}

/** One aggregator order as the Accept Orders screen shows it (money = strings). */
export interface OnlineOrder {
  id: string
  reference: string
  wera_order_id: string
  external_order_id: string
  platform: string
  order_type: 'dine-in' | 'delivery' | 'pick-up'
  payment_mode: 'online' | 'cash'
  prepaid: boolean
  restaurant_fulfilled: boolean
  status: OnlineOrderStatus
  received_at: string
  ordered_at: string | null
  /** Set while the order waits: when Wera will accept it for us. */
  auto_accept_at: string | null
  accepted_at: string | null
  preparation_time: number | null
  net_amount: string
  gross_amount: string
  discount: string
  customer: {
    name: string
    phone: string
    email: string
    address: string
    delivery_area: string
    address_instructions: string
  }
  instructions: string
  order_otp: string
  is_train_order: boolean
  items: OnlineOrderItem[]
  rider: { name: string; number: string; status: string }
  rejection_reason: string
  cancel_reason: string
  has_pos_order: boolean
}

export interface RejectionReason {
  id: number
  label: string
}

export interface OnlineOrderList {
  results: OnlineOrder[]
  counts: { received: number; in_progress: number; closed: number }
  default_preparation_time: number
  auto_accept_seconds: number
  rejection_reasons: RejectionReason[]
}

export interface OnlineOrderQuery {
  status?: OnlineOrderStatus[]
  platform?: string
  search?: string
}

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

function ordersPath(outletId: string, suffix = ''): string {
  return `/api/v1/integrations/${outletId}/online-orders/${suffix}`
}

export function listOnlineOrdersApi(
  outletId: string,
  query: OnlineOrderQuery = {},
): Promise<OnlineOrderList> {
  const params = new URLSearchParams()
  if (query.status?.length) params.set('status', query.status.join(','))
  if (query.platform) params.set('platform', query.platform)
  if (query.search?.trim()) params.set('search', query.search.trim())
  const qs = params.toString()
  return apiRequest<OnlineOrderList>(`${ordersPath(outletId)}${qs ? `?${qs}` : ''}`, {
    method: 'GET',
    token: authToken(),
  })
}

export function acceptOnlineOrderApi(
  outletId: string,
  id: string,
  preparationTime: number,
): Promise<OnlineOrder> {
  return apiRequest<OnlineOrder>(ordersPath(outletId, `${id}/accept/`), {
    method: 'POST',
    body: JSON.stringify({ preparation_time: preparationTime }),
    token: authToken(),
  })
}

export function rejectOnlineOrderApi(
  outletId: string,
  id: string,
  rejectionId: number,
): Promise<OnlineOrder> {
  return apiRequest<OnlineOrder>(ordersPath(outletId, `${id}/reject/`), {
    method: 'POST',
    body: JSON.stringify({ rejection_id: rejectionId }),
    token: authToken(),
  })
}
