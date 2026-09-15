import { apiRequest } from './apiClient'
import type { RoleSummary } from './authService'
import { AUTH_TOKEN_KEY } from '../auth/storage'

export type Role = RoleSummary & {
  created_at?: string
  updated_at?: string
}

export type RolePayload = {
  name: string
  code: string
  description?: string
}

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

/** List all roles (open to any authenticated user). */
export async function listRolesApi(): Promise<Role[]> {
  return apiRequest<Role[]>('/api/v1/accounts/roles/', {
    method: 'GET',
    token: authToken(),
  })
}

/** Create a role. Requires add_role permission. */
export async function createRoleApi(payload: RolePayload): Promise<Role> {
  return apiRequest<Role>('/api/v1/accounts/roles/', {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

/** Update a role. Requires change_role permission. */
export async function updateRoleApi(
  id: string,
  payload: Partial<RolePayload>,
): Promise<Role> {
  return apiRequest<Role>(`/api/v1/accounts/roles/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

/** Delete a role. Requires delete_role permission. */
export async function deleteRoleApi(id: string): Promise<Role> {
  return apiRequest<Role>(`/api/v1/accounts/roles/${id}/`, {
    method: 'DELETE',
    token: authToken(),
  })
}