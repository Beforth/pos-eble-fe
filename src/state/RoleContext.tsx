import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ApiError } from '../services/apiClient'
import { listRolesApi, type Role } from '../services/roleService'

export type RoleLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface RoleContextValue {
  roles: Role[]
  status: RoleLoadStatus
  error: string | null
  loadedAt: number | null
  loadRoles: (options?: { force?: boolean }) => Promise<void>
  upsertRole: (role: Role) => void
  removeRole: (id: string) => void
  clearRoles: () => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<Role[]>([])
  const [status, setStatus] = useState<RoleLoadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [loadedAt, setLoadedAt] = useState<number | null>(null)

  const loadRoles = useCallback(async (options?: { force?: boolean }) => {
    if (!options?.force && status === 'ready') return
    if (status === 'loading') return
    setStatus('loading')
    setError(null)
    try {
      const data = await listRolesApi()
      setRoles(data)
      setStatus('ready')
      setLoadedAt(Date.now())
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to load roles. Please try again.',
      )
    }
  }, [status])

  const upsertRole = useCallback((role: Role) => {
    setRoles((prev) => {
      const exists = prev.some((row) => row.id === role.id)
      return exists
        ? prev.map((row) => (row.id === role.id ? role : row))
        : [...prev, role]
    })
    setStatus('ready')
  }, [])

  const removeRole = useCallback((id: string) => {
    setRoles((prev) => prev.filter((row) => row.id !== id))
  }, [])

  const clearRoles = useCallback(() => {
    setRoles([])
    setStatus('idle')
    setError(null)
    setLoadedAt(null)
  }, [])

  const value = useMemo<RoleContextValue>(
    () => ({
      roles,
      status,
      error,
      loadedAt,
      loadRoles,
      upsertRole,
      removeRole,
      clearRoles,
    }),
    [roles, status, error, loadedAt, loadRoles, upsertRole, removeRole, clearRoles],
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRoles(): RoleContextValue {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRoles must be used within a RoleProvider')
  return ctx
}