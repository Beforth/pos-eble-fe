import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ApiError } from '../services/apiClient'
import {
  listCategoriesApi,
  listUnitsApi,
  type InventoryCategory,
  type InventoryUnit,
} from '../services/inventoryService'

export type InventoryLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface InventoryMastersContextValue {
  units: InventoryUnit[]
  categories: InventoryCategory[]
  status: InventoryLoadStatus
  error: string | null
  loadMasters: (options?: { force?: boolean }) => Promise<void>
  upsertUnit: (unit: InventoryUnit) => void
  removeUnit: (id: string) => void
  upsertCategory: (category: InventoryCategory) => void
  removeCategory: (id: string) => void
  clearMasters: () => void
}

const InventoryMastersContext = createContext<InventoryMastersContextValue | null>(
  null,
)

export function InventoryMastersProvider({ children }: { children: ReactNode }) {
  const [units, setUnits] = useState<InventoryUnit[]>([])
  const [categories, setCategories] = useState<InventoryCategory[]>([])
  const [status, setStatus] = useState<InventoryLoadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const statusRef = useRef(status)
  statusRef.current = status

  const loadMasters = useCallback(async (options?: { force?: boolean }) => {
    if (!options?.force && statusRef.current === 'ready') return
    if (statusRef.current === 'loading') return
    setStatus('loading')
    setError(null)
    try {
      const [nextUnits, nextCategories] = await Promise.all([
        listUnitsApi(),
        listCategoriesApi(),
      ])
      setUnits(nextUnits)
      setCategories(nextCategories)
      setStatus('ready')
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof ApiError
          ? err.message
          : 'Unable to load inventory masters. Please try again.',
      )
    }
  }, [])

  const upsertUnit = useCallback((unit: InventoryUnit) => {
    setUnits((prev) => {
      const exists = prev.some((row) => row.id === unit.id)
      return exists
        ? prev.map((row) => (row.id === unit.id ? unit : row))
        : [...prev, unit]
    })
    setStatus('ready')
  }, [])

  const removeUnit = useCallback((id: string) => {
    setUnits((prev) => prev.filter((row) => row.id !== id))
  }, [])

  const upsertCategory = useCallback((category: InventoryCategory) => {
    setCategories((prev) => {
      const exists = prev.some((row) => row.id === category.id)
      return exists
        ? prev.map((row) => (row.id === category.id ? category : row))
        : [...prev, category]
    })
    setStatus('ready')
  }, [])

  const removeCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((row) => row.id !== id))
  }, [])

  const clearMasters = useCallback(() => {
    setUnits([])
    setCategories([])
    setStatus('idle')
    setError(null)
  }, [])

  const value = useMemo<InventoryMastersContextValue>(
    () => ({
      units,
      categories,
      status,
      error,
      loadMasters,
      upsertUnit,
      removeUnit,
      upsertCategory,
      removeCategory,
      clearMasters,
    }),
    [
      units,
      categories,
      status,
      error,
      loadMasters,
      upsertUnit,
      removeUnit,
      upsertCategory,
      removeCategory,
      clearMasters,
    ],
  )

  return (
    <InventoryMastersContext.Provider value={value}>
      {children}
    </InventoryMastersContext.Provider>
  )
}

export function useInventoryMasters(): InventoryMastersContextValue {
  const ctx = useContext(InventoryMastersContext)
  if (!ctx) {
    throw new Error(
      'useInventoryMasters must be used within an InventoryMastersProvider',
    )
  }
  return ctx
}
