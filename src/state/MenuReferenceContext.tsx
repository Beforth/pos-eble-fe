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
import { useAuth } from '../auth/AuthContext'
import {
  listAddonGroupsApi,
  listCategoriesApi,
  listTaxesApi,
  listVariationGroupsApi,
} from '../services/menuService'
import type {
  AddonGroup,
  Category,
  Tax,
  VariationGroup,
} from '../types/menu'

export type MenuReferenceStatus = 'idle' | 'loading' | 'ready' | 'error'
export type MenuReferenceKind =
  | 'categories'
  | 'taxes'
  | 'variationGroups'
  | 'addonGroups'

export const MENU_REFERENCE_KINDS: MenuReferenceKind[] = [
  'categories',
  'taxes',
  'variationGroups',
  'addonGroups',
]

type DataStore = {
  categories: Category[]
  taxes: Tax[]
  variationGroups: VariationGroup[]
  addonGroups: AddonGroup[]
}

type StatusStore = Record<MenuReferenceKind, MenuReferenceStatus>
type ErrorStore = Record<MenuReferenceKind, string | null>

const FETCHERS: Record<
  MenuReferenceKind,
  (outletId: string) => Promise<unknown[]>
> = {
  categories: listCategoriesApi,
  taxes: listTaxesApi,
  variationGroups: listVariationGroupsApi,
  addonGroups: listAddonGroupsApi,
}

const IDLE_STATUS: StatusStore = {
  categories: 'idle',
  taxes: 'idle',
  variationGroups: 'idle',
  addonGroups: 'idle',
}

const NO_ERRORS: ErrorStore = {
  categories: null,
  taxes: null,
  variationGroups: null,
  addonGroups: null,
}

interface MenuReferenceContextValue {
  categories: Category[]
  taxes: Tax[]
  variationGroups: VariationGroup[]
  addonGroups: AddonGroup[]
  status: StatusStore
  error: ErrorStore
  reload: (
    kind: MenuReferenceKind,
    options?: { force?: boolean },
  ) => Promise<void>
}

const MenuReferenceContext =
  createContext<MenuReferenceContextValue | null>(null)

export function MenuReferenceProvider({ children }: { children: ReactNode }) {
  const { encryptedOutletId } = useAuth()
  const [data, setData] = useState<DataStore>({
    categories: [],
    taxes: [],
    variationGroups: [],
    addonGroups: [],
  })
  const [status, setStatus] = useState<StatusStore>(IDLE_STATUS)
  const [error, setError] = useState<ErrorStore>(NO_ERRORS)
  const statusRef = useRef<StatusStore>(IDLE_STATUS)
  const outletRef = useRef<string | null>(null)

  const reload = useCallback(
    async (kind: MenuReferenceKind, options?: { force?: boolean }) => {
      const outletId = outletRef.current || encryptedOutletId
      if (!outletId) return
      if (statusRef.current[kind] === 'loading') return
      if (!options?.force && statusRef.current[kind] === 'ready') return
      statusRef.current[kind] = 'loading'
      setStatus((prev) => ({ ...prev, [kind]: 'loading' }))
      setError((prev) => ({ ...prev, [kind]: null }))
      try {
        const result = await FETCHERS[kind](outletId)
        setData((prev) => ({
          ...prev,
          [kind]: result as DataStore[typeof kind],
        }))
        statusRef.current[kind] = 'ready'
        setStatus((prev) => ({ ...prev, [kind]: 'ready' }))
      } catch (err) {
        statusRef.current[kind] = 'error'
        setStatus((prev) => ({ ...prev, [kind]: 'error' }))
        setError((prev) => ({
          ...prev,
          [kind]:
            err instanceof Error
              ? err.message
              : `Failed to load ${kind}. Please try again.`,
        }))
      }
    },
    [encryptedOutletId],
  )

  useEffect(() => {
    outletRef.current = encryptedOutletId
    statusRef.current = IDLE_STATUS
    setData({
      categories: [],
      taxes: [],
      variationGroups: [],
      addonGroups: [],
    })
    setStatus(IDLE_STATUS)
    setError(NO_ERRORS)
  }, [encryptedOutletId])

  const value = useMemo<MenuReferenceContextValue>(
    () => ({
      categories: data.categories,
      taxes: data.taxes,
      variationGroups: data.variationGroups,
      addonGroups: data.addonGroups,
      status,
      error,
      reload,
    }),
    [data, status, error, reload],
  )

  return (
    <MenuReferenceContext.Provider value={value}>
      {children}
    </MenuReferenceContext.Provider>
  )
}

export function useMenuReference(
  kinds: MenuReferenceKind[] = MENU_REFERENCE_KINDS,
): MenuReferenceContextValue {
  const ctx = useContext(MenuReferenceContext)
  if (!ctx) {
    throw new Error(
      'useMenuReference must be used within a MenuReferenceProvider',
    )
  }
  const kindsRef = useRef(kinds)
  kindsRef.current = kinds

  useEffect(() => {
    for (const kind of kindsRef.current) {
      if (ctx.status[kind] === 'idle') void ctx.reload(kind)
    }
  }, [ctx])

  return ctx
}