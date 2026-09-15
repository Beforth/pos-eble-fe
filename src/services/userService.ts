import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'
import type { RoleSummary } from './authService'

export interface UserMembership {
  outlet_id: number
  outlet_name: string
  outlet_code: string | null
  groups: string[]
  is_default: boolean
}

export interface UserSummary {
  id: string
  username: string
  name: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  user_code: string | null
  passcode: string
  swipe_code: string
  discount_capping: string
  discount_value: string | number | null
  is_active: boolean
  role: RoleSummary | null
  role_id: string | null
  memberships: UserMembership[]
  permissions: string[]
  date_joined: string
}

export type UserPayload = {
  username?: string
  password?: string
  first_name?: string
  last_name?: string
  email?: string | null
  phone?: string | null
  user_code?: string | null
  role_id?: string | null
  is_active?: boolean
  passcode?: string
  swipe_code?: string | null
  discount_capping?: string
  discount_value?: string | number | null
  group?: string | ''
  permissions?: string[]
}

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

/** List all users. Requires the accounts.view_user permission. */
export async function listUsersApi(): Promise<UserSummary[]> {
  return apiRequest<UserSummary[]>('/api/v1/accounts/users/', {
    method: 'GET',
    token: authToken(),
  })
}

/** Get one user. Requires the accounts.view_user permission. */
export async function getUserApi(id: string): Promise<UserSummary> {
  return apiRequest<UserSummary>(`/api/v1/accounts/users/${id}/`, {
    method: 'GET',
    token: authToken(),
  })
}

/** Create a user. Requires the accounts.add_user permission. */
export async function createUserApi(payload: UserPayload): Promise<UserSummary> {
  return apiRequest<UserSummary>('/api/v1/accounts/users/', {
    method: 'POST',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

/** Update a user. Requires the accounts.change_user permission. */
export async function updateUserApi(
  id: string,
  payload: Partial<UserPayload>,
): Promise<UserSummary> {
  return apiRequest<UserSummary>(`/api/v1/accounts/users/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token: authToken(),
  })
}

/** Delete a user. Requires the accounts.delete_user permission. */
export async function deleteUserApi(id: string): Promise<UserSummary> {
  return apiRequest<UserSummary>(`/api/v1/accounts/users/${id}/`, {
    method: 'DELETE',
    token: authToken(),
  })
}