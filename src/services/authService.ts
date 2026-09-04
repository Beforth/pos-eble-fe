import { apiRequest } from './apiClient'

export interface LoginCredentials {
  identifier: string
  password: string
  outletId?: number
}

export interface OutletMembership {
  outletId: number
  outletName: string
  outletCode?: string | null
  groups: string[]
  isDefault: boolean
}

export interface AuthUser {
  name: string
  identifier: string
  outlet: string
  outletId?: number | null
  phone?: string
  photoUrl?: string
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
  groups: string[]
  is_default: boolean
}

type ApiUser = {
  id: number
  username: string
  name: string
  email?: string | null
  phone?: string | null
  photo?: string | null
  user_code?: string | null
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
    outlet: active?.outletName || '',
    outletId: active?.outletId ?? null,
    phone: apiUser.phone ?? undefined,
    photoUrl: apiUser.photo ?? undefined,
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
