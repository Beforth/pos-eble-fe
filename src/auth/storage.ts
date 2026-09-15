export const AUTH_TOKEN_KEY = 'rajubhai.auth.token'
export const AUTH_REFRESH_KEY = 'rajubhai.auth.refresh'
export const AUTH_USER_KEY = 'rajubhai.auth.user'
export const AUTH_PERMISSIONS_KEY = 'rajubhai.auth.permissions'
export const AUTH_OUTLET_KEY = 'rajubhai.auth.outletId'
export const AUTH_ENCRYPTED_OUTLET_KEY = 'rajubhai.auth.encryptedOutletId'

export const AUTH_STORAGE_KEYS = [
  AUTH_TOKEN_KEY,
  AUTH_REFRESH_KEY,
  AUTH_USER_KEY,
  AUTH_PERMISSIONS_KEY,
  AUTH_OUTLET_KEY,
  AUTH_ENCRYPTED_OUTLET_KEY,
] as const

export function clearAuthStorage(): void {
  for (const key of AUTH_STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}