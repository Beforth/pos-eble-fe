import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { showToast } from '../utils/toast'
import {
  fetchPermissionsApi,
  loginApi,
  type AuthUser,
  type LoginCredentials,
} from '../services/authService'
import { getPermissionCatalogApi } from '../services/permissionService'
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
import { isAdminUser } from './isAdmin'
import {
  OUTLET_GATE_PERMISSION,
  resolveUrlName,
} from './routePermissions'

interface AuthContextValue {
  token: string | null
  refresh: string | null
  user: AuthUser | null
  permissions: string[]
  /** False until the boot-time permission refresh has resolved (or failed). */
  permissionsReady: boolean
  outletId: number | null
  encryptedOutletId: string | null
  isAuthenticated: boolean
  /** Admin role/group only — used for admin-dashboard entry points. */
  isAdmin: boolean
  hasPermission: (codename: string) => boolean
  /** URL name → qualified POS codename required by each gated screen. */
  screens: Record<string, string>
  /** Codename a pathname requires, or null when it is not gated. */
  requiredPermission: (pathname: string) => string | null
  /** Hybrid gate: outlet permission OR the screen's catalog codename. */
  canAccess: (pathname: string) => boolean
  /** First screen the user may open — admins land on /dashboard, billers on /table-view. */
  homePath: () => string
  login: (credentials: LoginCredentials) => Promise<string[]>
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
  const [permissionsReady, setPermissionsReady] = useState(false)
  const [outletId, setOutletId] = useState<number | null>(readStoredOutletId)
  const [encryptedOutletId, setEncryptedOutletId] = useState<string | null>(
    readStoredEncryptedOutletId,
  )
  const [screens, setScreens] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!token) {
      setScreens({})
      return
    }
    let cancelled = false
    getPermissionCatalogApi()
      .then((catalog) => {
        if (!cancelled) setScreens(catalog.screens ?? {})
      })
      .catch(() => {
        // Catalog is best-effort: without it the route guard cannot restrict,
        // but the backend still enforces every permission.
      })
    return () => {
      cancelled = true
    }
  }, [token])

  // Refresh the permission snapshot from the server on each app start. The
  // stored snapshot is only rewritten at login, so backend-side changes (e.g.
  // group permission templates) would otherwise leave route guards denying
  // screens until the user logs out and back in.
  useEffect(() => {
    if (!token) return
    let cancelled = false
    fetchPermissionsApi(token)
      .then(({ permissions: freshPermissions }) => {
        if (cancelled) return
        localStorage.setItem(
          AUTH_PERMISSIONS_KEY,
          JSON.stringify(freshPermissions),
        )
        setPermissions(freshPermissions)
      })
      .catch(() => {
        // Best-effort refresh: the stored snapshot still applies on failure.
      })
      .finally(() => {
        if (!cancelled) setPermissionsReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [token])

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
    setPermissionsReady(true)
    setOutletId(result.outletId)
    setEncryptedOutletId(encryptedId)
    return result.permissions
  }, [])

  const logout = useCallback(() => {
    clearAuthStorage()
    clearRoles()
    setToken(null)
    setRefresh(null)
    setUser(null)
    setPermissions([])
    setPermissionsReady(false)
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

  const requiredPermission = useCallback(
    (pathname: string): string | null => {
      const urlName = resolveUrlName(pathname)
      if (urlName) return screens[urlName] ?? null
      // Fail closed: a screen is reachable for non-admin users only once it is
      // mapped in PATH_URL_NAMES. `/profile` is the one always-open exception.
      if (pathname === '/profile') return null
      return OUTLET_GATE_PERMISSION
    },
    [screens],
  )

  const canAccess = useCallback(
    (pathname: string): boolean => {
      const codename = requiredPermission(pathname)
      if (!codename) return true
      return (
        hasPermission(OUTLET_GATE_PERMISSION) || hasPermission(codename)
      )
    },
    [requiredPermission, hasPermission],
  )

  const homePath = useCallback((): string => {
    for (const pathname of ['/dashboard', '/table-view', '/billing', '/profile']) {
      if (canAccess(pathname)) return pathname
    }
    return '/profile'
  }, [canAccess])

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

  const isAdmin = isAdminUser(user)

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      refresh,
      user,
      permissions,
      permissionsReady,
      outletId,
      encryptedOutletId,
      isAuthenticated: Boolean(token),
      isAdmin,
      hasPermission,
      screens,
      requiredPermission,
      canAccess,
      homePath,
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
      permissionsReady,
      outletId,
      encryptedOutletId,
      isAdmin,
      hasPermission,
      screens,
      requiredPermission,
      canAccess,
      homePath,
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
  const { isAuthenticated, permissionsReady, canAccess, requiredPermission, homePath } =
    useAuth()
  const location = useLocation()
  const notifiedRef = useRef<string | null>(null)

  const codename = isAuthenticated ? requiredPermission(location.pathname) : null
  const allowed = !codename || canAccess(location.pathname)

  useEffect(() => {
    if (!isAuthenticated || !codename || allowed) return
    if (notifiedRef.current === location.pathname) return
    notifiedRef.current = location.pathname
    showToast(`Permission denied. Required permission: ${codename}.`)
  }, [isAuthenticated, codename, allowed, location.pathname])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (!permissionsReady) {
    // Wait for the boot-time permission refresh before ruling on access so a
    // stale snapshot can never deny (or falsely allow) a gated screen.
    return (
      <div className="flex h-dvh items-center justify-center bg-page text-muted">
        <span className="text-sm">Checking permissions…</span>
      </div>
    )
  }
  if (!allowed) {
    return <Navigate to={homePath()} replace />
  }
  return children
}
