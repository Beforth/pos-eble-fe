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
  loginApi,
  type AuthUser,
  type LoginCredentials,
} from '../services/authService'

const TOKEN_KEY = 'rajubhai.auth.token'
const REFRESH_KEY = 'rajubhai.auth.refresh'
const USER_KEY = 'rajubhai.auth.user'
const PERMISSIONS_KEY = 'rajubhai.auth.permissions'
const OUTLET_KEY = 'rajubhai.auth.outletId'

interface AuthContextValue {
  token: string | null
  refresh: string | null
  user: AuthUser | null
  permissions: string[]
  outletId: number | null
  isAuthenticated: boolean
  hasPermission: (codename: string) => boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  updateProfile: (patch: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function readStoredPermissions(): string[] {
  try {
    const raw = localStorage.getItem(PERMISSIONS_KEY)
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
  const raw = localStorage.getItem(OUTLET_KEY)
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(PERMISSIONS_KEY)
  localStorage.removeItem(OUTLET_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  )
  const [refresh, setRefresh] = useState<string | null>(() =>
    localStorage.getItem(REFRESH_KEY),
  )
  const [user, setUser] = useState<AuthUser | null>(readStoredUser)
  const [permissions, setPermissions] = useState<string[]>(readStoredPermissions)
  const [outletId, setOutletId] = useState<number | null>(readStoredOutletId)

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await loginApi(credentials)
    localStorage.setItem(TOKEN_KEY, result.token)
    localStorage.setItem(REFRESH_KEY, result.refresh)
    localStorage.setItem(USER_KEY, JSON.stringify(result.user))
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(result.permissions))
    if (result.outletId != null) {
      localStorage.setItem(OUTLET_KEY, String(result.outletId))
    } else {
      localStorage.removeItem(OUTLET_KEY)
    }
    setToken(result.token)
    setRefresh(result.refresh)
    setUser(result.user)
    setPermissions(result.permissions)
    setOutletId(result.outletId)
  }, [])

  const logout = useCallback(() => {
    clearAuthStorage()
    setToken(null)
    setRefresh(null)
    setUser(null)
    setPermissions([])
    setOutletId(null)
  }, [])

  const updateProfile = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const hasPermission = useCallback(
    (codename: string) => permissions.includes(codename),
    [permissions],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      refresh,
      user,
      permissions,
      outletId,
      isAuthenticated: Boolean(token),
      hasPermission,
      login,
      logout,
      updateProfile,
    }),
    [
      token,
      refresh,
      user,
      permissions,
      outletId,
      hasPermission,
      login,
      logout,
      updateProfile,
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
