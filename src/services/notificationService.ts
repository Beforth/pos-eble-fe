import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

export type NotificationKind = 'order' | 'inventory' | 'payment' | 'alert'
export type NotificationSeverity = 'info' | 'warning' | 'danger'

export interface AppNotification {
  id: string
  kind: NotificationKind
  severity: NotificationSeverity
  title: string
  body: string
  /** In-app path the notification opens ('' when it just informs). */
  link: string
  created_at: string
  read: boolean
}

export interface NotificationPage {
  count: number
  unread_count: number
  page: number
  has_next: boolean
  results: AppNotification[]
}

function path(outletId: string, suffix = '') {
  return `/api/v1/notifications/${outletId}/${suffix}`
}

export async function listNotificationsApi(
  outletId: string,
  params?: { page?: number; pageSize?: number },
): Promise<NotificationPage> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  query.set('page_size', String(params?.pageSize ?? 30))
  return apiRequest<NotificationPage>(`${path(outletId)}?${query}`, {
    method: 'GET',
    token: authToken(),
  })
}

export async function markNotificationReadApi(
  outletId: string,
  id: string,
): Promise<{ unread_count: number }> {
  return apiRequest<{ unread_count: number }>(path(outletId, `${id}/read/`), {
    method: 'POST',
    body: JSON.stringify({}),
    token: authToken(),
  })
}

export async function markAllNotificationsReadApi(
  outletId: string,
): Promise<{ marked: number; unread_count: number }> {
  return apiRequest<{ marked: number; unread_count: number }>(
    path(outletId, 'read-all/'),
    { method: 'POST', body: JSON.stringify({}), token: authToken() },
  )
}
