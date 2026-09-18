import { apiRequest, multipartApiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

export interface LoginCredentials {
  identifier: string
  password: string
  outletId?: number
}

export interface OutletMembership {
  outletId: number
  outletName: string
  outletCode?: string | null
  encryptedId?: string
  groups: string[]
  isDefault: boolean
}

export interface RoleSummary {
  id: string
  name: string
  code: string
  description?: string
}

export interface AuthUser {
  name: string
  identifier: string
  firstName?: string
  lastName?: string
  email?: string
  outlet: string
  outletId?: number | null
  encryptedOutletId?: string
  phone?: string
  photoUrl?: string
  userCode?: string
  lastLoginIp?: string
  role?: RoleSummary | null
  roleId?: string | null
  groups: string[]
  memberships: OutletMembership[]
}

export interface LoginResult {
  token: string
  refresh: string
  user: AuthUser
  permissions: string[]
  outletId: number | null
}

export class OutletSelectionRequiredError extends Error {
  outlets: OutletMembership[]

  constructor(outlets: OutletMembership[]) {
    super('Select an outlet to continue.')
    this.name = 'OutletSelectionRequiredError'
    this.outlets = outlets
  }
}

type ApiMembership = {
  outlet_id: number
  outlet_name: string
  outlet_code?: string | null
  encrypted_id?: string
  groups: string[]
  is_default: boolean
}

type ApiUser = {
  id: number
  username: string
  name: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  photo?: string | null
  user_code?: string | null
  last_login_ip?: string | null
  role?: RoleSummary | null
  role_id?: string | null
  groups?: string[]
  outlet?: ApiMembership | null
  memberships?: ApiMembership[]
}

type LoginData = {
  access: string | null
  refresh: string | null
  requires_outlet_selection?: boolean
  outlets?: ApiMembership[]
  outlet_id?: number | null
  groups?: string[]
  memberships?: ApiMembership[]
  user: ApiUser | null
}

type PermissionsData = {
  permissions: string[]
  outlet_id?: number | null
}

function mapMembership(item: ApiMembership): OutletMembership {
  return {
    outletId: item.outlet_id,
    outletName: item.outlet_name,
    outletCode: item.outlet_code,
    encryptedId: item.encrypted_id,
    groups: item.groups ?? [],
    isDefault: Boolean(item.is_default),
  }
}

function mapUser(apiUser: ApiUser, fallbackIdentifier: string): AuthUser {
  const memberships = (apiUser.memberships ?? []).map(mapMembership)
  const active = apiUser.outlet ? mapMembership(apiUser.outlet) : null
  return {
    name: apiUser.name,
    identifier: apiUser.username || fallbackIdentifier,
    firstName: apiUser.first_name ?? undefined,
    lastName: apiUser.last_name ?? undefined,
    email: apiUser.email ?? undefined,
    outlet: active?.outletName || '',
    outletId: active?.outletId ?? null,
    phone: apiUser.phone ?? undefined,
    photoUrl: apiUser.photo ?? undefined,
    userCode: apiUser.user_code ?? undefined,
    lastLoginIp: apiUser.last_login_ip ?? undefined,
    role: apiUser.role ?? null,
    roleId: apiUser.role_id ?? apiUser.role?.id ?? null,
    groups: apiUser.groups ?? active?.groups ?? [],
    memberships,
  }
}

/** Fetch permissions for the authenticated user (active outlet). */
export async function fetchPermissionsApi(
  accessToken: string,
): Promise<{ permissions: string[]; outletId: number | null }> {
  const data = await apiRequest<PermissionsData>(
    '/api/v1/accounts/permissions/',
    {
      method: 'GET',
      token: accessToken,
    },
  )
  return {
    permissions: data.permissions ?? [],
    outletId: data.outlet_id ?? null,
  }
}

/**
 * Login, then load permissions when tokens are issued.
 * Throws OutletSelectionRequiredError when the user must pick an outlet.
 */
export async function loginApi(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  const body: Record<string, unknown> = {
    identifier: credentials.identifier.trim(),
    password: credentials.password,
  }
  if (credentials.outletId != null) {
    body.outlet_id = credentials.outletId
  }

  const loginData = await apiRequest<LoginData>('/api/v1/accounts/login/', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  if (loginData.requires_outlet_selection || !loginData.access || !loginData.refresh) {
    throw new OutletSelectionRequiredError(
      (loginData.outlets ?? loginData.memberships ?? []).map(mapMembership),
    )
  }

  if (!loginData.user) {
    throw new Error('Login succeeded without a user payload.')
  }

  const perm = await fetchPermissionsApi(loginData.access)

  return {
    token: loginData.access,
    refresh: loginData.refresh,
    user: mapUser(loginData.user, credentials.identifier),
    permissions: perm.permissions,
    outletId: perm.outletId ?? loginData.outlet_id ?? null,
  }
}

export const EDIT_OWN_PROFILE_PERMISSION = 'accounts.cfg_edit_own_profile'
export const CHANGE_OWN_PASSWORD_PERMISSION = 'accounts.cfg_change_own_password'

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

/** Current signed-in user. Any authenticated user may call this. */
export async function fetchMeApi(): Promise<AuthUser> {
  const data = await apiRequest<ApiUser>('/api/v1/accounts/me/', {
    method: 'GET',
    token: authToken(),
  })
  return mapUser(data, data.username)
}

export type ProfileUpdatePayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
  photo?: File | null
}

/** Update own profile. Requires accounts.cfg_edit_own_profile. */
export async function updateProfileApi(
  payload: ProfileUpdatePayload,
): Promise<AuthUser> {
  const form = new FormData()
  form.append('first_name', payload.firstName)
  form.append('last_name', payload.lastName)
  form.append('email', payload.email)
  form.append('phone', payload.phone)
  if (payload.photo) {
    form.append('photo', payload.photo)
  }
  const data = await multipartApiRequest<ApiUser>(
    '/api/v1/accounts/me/',
    form,
    {
      method: 'PATCH',
      token: authToken(),
    },
  )
  return mapUser(data, data.username)
}

/** Change own password. Requires accounts.cfg_change_own_password. */
export async function changePasswordApi(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiRequest('/api/v1/accounts/me/password/', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
    token: authToken(),
  })
}
