import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

export interface GroupSummary {
  id: string
  name: string
}

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

/** List all permission groups. Open to any authenticated user. */
export async function listGroupsApi(): Promise<GroupSummary[]> {
  return apiRequest<GroupSummary[]>('/api/v1/accounts/groups/', {
    method: 'GET',
    token: authToken(),
  })
}

/** Get the full permission codenames granted by a group. Requires view_user. */
export async function getGroupPermissionsApi(
  groupId: string,
): Promise<string[]> {
  const data = await apiRequest<{ permissions: string[] }>(
    `/api/v1/accounts/groups/${groupId}/permissions/`,
    { method: 'GET', token: authToken() },
  )
  return data.permissions
}

/** Replace a group's POS-catalog permissions. Requires change_user. */
export async function updateGroupPermissionsApi(
  groupId: string,
  permissions: string[],
): Promise<string[]> {
  const data = await apiRequest<{ permissions: string[] }>(
    `/api/v1/accounts/groups/${groupId}/permissions/`,
    {
      method: 'PATCH',
      body: JSON.stringify({ permissions }),
      token: authToken(),
    },
  )
  return data.permissions
}