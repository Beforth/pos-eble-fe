import { apiRequest } from './apiClient'
import { AUTH_TOKEN_KEY } from '../auth/storage'

export interface CatalogCategory {
  code: string
  label: string
}

export interface CatalogPermission {
  label: string
  codename: string
  id: string | null
}

export interface CatalogFeature {
  key: string
  label: string
  category: string
  mode: 'yes' | 'multi' | 'report'
  info?: string | null
  options: string[]
  defaults: {
    checked?: boolean
    selected?: string[]
    show?: boolean
    has_display_values?: boolean
    display_values?: boolean
    days?: string
  }
  permissions: CatalogPermission[]
}

export interface PermissionCatalog {
  categories: CatalogCategory[]
  features: CatalogFeature[]
  screens: Record<string, string>
}

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

/** Full POS user-rights catalog with native Django permission codenames. */
export async function getPermissionCatalogApi(): Promise<PermissionCatalog> {
  return apiRequest<PermissionCatalog>('/api/v1/accounts/permissions/catalog/', {
    method: 'GET',
    token: authToken(),
  })
}