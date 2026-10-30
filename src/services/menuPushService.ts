import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

/** Aggregators the menu can be pushed to (through Wera). */
export type PushPlatform = 'zomato' | 'swiggy'

export interface PushIssue {
  level: 'skipped' | 'warning'
  entity: string
  id: number | null
  name: string
  message: string
}

export interface MenuPushPreview {
  platform: PushPlatform
  merchant_id: string | null
  counts: {
    categories: number
    sub_categories: number
    items: number
    addon_groups: number
    addons: number
  }
  skipped: number
  warnings: number
  not_on_channel: number
  issues: PushIssue[]
  can_push: boolean
  blocked_reason?: string
}

export type PushOutcome = 'success' | 'failed' | 'pending'

export interface MenuPushRecord {
  id: string
  platform: PushPlatform
  status: 'submitted' | 'failed'
  request_id: string
  counts: MenuPushPreview['counts']
  skipped: number
  issues: PushIssue[]
  error: string
  /** Wera's request-tracker answer, as received. */
  tracker: unknown
  /** Read from the tracker: failed, success (queued by Wera) or pending. */
  outcome: PushOutcome
  last_checked_at: string | null
  requested_by: string
  created_at: string
}

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

function pushPath(outletId: string, suffix: string): string {
  return `/api/v1/integrations/${outletId}/menu-push${suffix}`
}

/** What a push would send. Sends nothing. */
export function previewMenuPushApi(
  outletId: string,
  platform: PushPlatform,
): Promise<MenuPushPreview> {
  return apiRequest<MenuPushPreview>(pushPath(outletId, `/${platform}/preview/`), {
    method: 'GET',
    token: authToken(),
  })
}

/** Send the whole menu to Wera. */
export function pushMenuApi(
  outletId: string,
  platform: PushPlatform,
): Promise<MenuPushRecord> {
  return apiRequest<MenuPushRecord>(pushPath(outletId, `/${platform}/`), {
    method: 'POST',
    body: JSON.stringify({}),
    token: authToken(),
  })
}

/** Latest pushes for the outlet, newest first. */
export function listMenuPushesApi(outletId: string): Promise<MenuPushRecord[]> {
  return apiRequest<MenuPushRecord[]>(pushPath(outletId, '/requests/'), {
    method: 'GET',
    token: authToken(),
  })
}

/** One push; `refresh` asks Wera's request tracker for its current status. */
export function getMenuPushApi(
  outletId: string,
  id: string,
  refresh = false,
): Promise<MenuPushRecord> {
  return apiRequest<MenuPushRecord>(
    pushPath(outletId, `/requests/${id}/${refresh ? '?refresh=1' : ''}`),
    { method: 'GET', token: authToken() },
  )
}

/** Wera's validation messages out of a tracker answer, flattened for display. */
export function trackerMessages(tracker: unknown): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const add = (text: string) => {
    if (text && !seen.has(text)) {
      seen.add(text)
      out.push(text)
    }
  }
  const walk = (node: unknown, key = '') => {
    if (Array.isArray(node)) {
      node.forEach((child) => walk(child, key))
    } else if (node && typeof node === 'object') {
      Object.entries(node as Record<string, unknown>).forEach(([k, v]) =>
        walk(v, k),
      )
    } else if (typeof node === 'string' && (key === 'value' || key === 'message')) {
      add(node)
    }
  }
  walk(tracker)
  return out
}
