import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  fetchPermissionsApi,
  loginApi,
  type AuthUser,
  type LoginCredentials,
} from '../services/authService'
import { useRoles } from '../state/RoleContext'
import { switchOutletApi } from '../services/outletService'
import {
  AUTH_ENCRYPTED_OUTLET_KEY,
  AUTH_OUTLET_KEY,
  AUTH_PERMISSIONS_KEY,
  AUTH_REFRESH_KEY,
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  clearAuthStorage,
} from './storage'

interface AuthContextValue {
  token: string | null
  refresh: string | null
  user: AuthUser | null
  permissions: string[]
  outletId: number | null
  encryptedOutletId: string | null
  isAuthenticated: boolean
  hasPermission: (codename: string) => boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateProfile: (patch: Partial<AuthUser>) => void
  switchOutlet: (outletId: number) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function readStoredPermissions(): string[] {
  try {
    const raw = localStorage.getItem(AUTH_PERMISSIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

function readStoredOutletId(): number | null {
  const raw = localStorage.getItem(AUTH_OUTLET_KEY)
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function readStoredEncryptedOutletId(): string | null {
  return localStorage.getItem(AUTH_ENCRYPTED_OUTLET_KEY)
}

/** Derive the encrypted id for the active outlet from the memberships list. */
function encryptedIdForOutlet(
  user: AuthUser | null,
  outletId: number | null,
): string | null {
  if (!user || outletId == null) return null
  return (
    user.memberships.find((m) => m.outletId === outletId)?.encryptedId ?? null
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { clearRoles } = useRoles()
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_TOKEN_KEY),
  )
  const [refresh, setRefresh] = useState<string | null>(() =>
    localStorage.getItem(AUTH_REFRESH_KEY),
  )
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)
  const [permissions, setPermissions] = useState<string[]>(readStoredPermissions)
  const [outletId, setOutletId] = useState<number | null>(readStoredOutletId)
  const [encryptedOutletId, setEncryptedOutletId] = useState<string | null>(
    readStoredEncryptedOutletId,
  )

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await loginApi(credentials)
    localStorage.setItem(AUTH_TOKEN_KEY, result.token)
    localStorage.setItem(AUTH_REFRESH_KEY, result.refresh)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(result.user))
    localStorage.setItem(
      AUTH_PERMISSIONS_KEY,
      JSON.stringify(result.permissions),
    )
    if (result.outletId != null) {
      localStorage.setItem(AUTH_OUTLET_KEY, String(result.outletId))
    } else {
      localStorage.removeItem(AUTH_OUTLET_KEY)
    }
    const encryptedId = encryptedIdForOutlet(result.user, result.outletId)
    if (encryptedId) {
      localStorage.setItem(AUTH_ENCRYPTED_OUTLET_KEY, encryptedId)
    } else {
      localStorage.removeItem(AUTH_ENCRYPTED_OUTLET_KEY)
    }
    setToken(result.token)
    setRefresh(result.refresh)
    setUser(result.user)
    setPermissions(result.permissions)
    setOutletId(result.outletId)
    setEncryptedOutletId(encryptedId)
  }, [])

  const logout = useCallback(() => {
    clearAuthStorage()
    clearRoles()
    setToken(null)
    setRefresh(null)
    setUser(null)
    setPermissions([])
    setOutletId(null)
    setEncryptedOutletId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateProfile = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const hasPermission = useCallback(
    (codename: string) => permissions.includes(codename),
    [permissions],
  )

  const switchOutlet = useCallback(
    async (targetOutletId: number) => {
      const summary = await switchOutletApi(targetOutletId)
      localStorage.setItem(AUTH_OUTLET_KEY, String(summary.outlet_id))
      if (summary.encrypted_id) {
        localStorage.setItem(AUTH_ENCRYPTED_OUTLET_KEY, summary.encrypted_id)
      } else {
        localStorage.removeItem(AUTH_ENCRYPTED_OUTLET_KEY)
      }
      setOutletId(summary.outlet_id)
      setEncryptedOutletId(summary.encrypted_id ?? null)

      setUser((prev) => {
        if (!prev) return prev
        const next: AuthUser = {
          ...prev,
          outlet: summary.outlet_name,
          outletId: summary.outlet_id,
          groups: summary.groups,
        }
        if (summary.encrypted_id) {
          next.encryptedOutletId = summary.encrypted_id
        }
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next))
        return next
      })

      if (token) {
        const perm = await fetchPermissionsApi(token)
        localStorage.setItem(
          AUTH_PERMISSIONS_KEY,
          JSON.stringify(perm.permissions),
        )
        setPermissions(perm.permissions)
      }
    },
    [token],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      refresh,
      user,
      permissions,
      outletId,
      encryptedOutletId,
      isAuthenticated: Boolean(token),
      hasPermission,
      login,
      logout,
      updateProfile,
      switchOutlet,
    }),
    [
      token,
      refresh,
      user,
      permissions,
      outletId,
      encryptedOutletId,
      hasPermission,
      login,
      logout,
      updateProfile,
      switchOutlet,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

/** Redirects unauthenticated visitors to /login, preserving origin. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}
