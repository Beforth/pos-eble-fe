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

/**
 * Factories, not constants. These stores are per-provider state, and they are
 * written through `statusRef` from inside an async fetcher. A shared
 * module-level object would be mutated in place, permanently poisoning the
 * initial value: after the first successful fetch, `IDLE_STATUS.categories`
 * would read 'ready' for the rest of the tab, so the outlet-change reset below
 * would re-install 'ready' alongside wiped data and nothing would ever refetch.
 */
function makeStatus(value: MenuReferenceStatus): StatusStore {
  return {
    categories: value,
    taxes: value,
    variationGroups: value,
    addonGroups: value,
  }
}

function makeErrors(): ErrorStore {
  return {
    categories: null,
    taxes: null,
    variationGroups: null,
    addonGroups: null,
  }
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
  const [status, setStatus] = useState<StatusStore>(() => makeStatus('idle'))
  const [error, setError] = useState<ErrorStore>(() => makeErrors())
  const statusRef = useRef<StatusStore>(makeStatus('idle'))
  const outletRef = useRef<string | null>(null)
  const isFirstRun = useRef(true)

  const reload = useCallback(
    async (kind: MenuReferenceKind, options?: { force?: boolean }) => {
      const outletId = outletRef.current || encryptedOutletId
      if (!outletId) return
      if (statusRef.current[kind] === 'loading') return
      if (!options?.force && statusRef.current[kind] === 'ready') return
      statusRef.current = { ...statusRef.current, [kind]: 'loading' }
      setStatus((prev) => ({ ...prev, [kind]: 'loading' }))
      setError((prev) => ({ ...prev, [kind]: null }))
      try {
        const result = await FETCHERS[kind](outletId)
        setData((prev) => ({
          ...prev,
          [kind]: result as DataStore[typeof kind],
        }))
        statusRef.current = { ...statusRef.current, [kind]: 'ready' }
        setStatus((prev) => ({ ...prev, [kind]: 'ready' }))
      } catch (err) {
        statusRef.current = { ...statusRef.current, [kind]: 'error' }
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
    // On mount the state is already the empty/'idle' initial value, and child
    // effects (which React runs first) have usually started a fetch already.
    // Wiping here would clobber that fetch and force a duplicate request, so
    // the reset only applies to a genuine outlet change.
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    statusRef.current = makeStatus('idle')
    setData({
      categories: [],
      taxes: [],
      variationGroups: [],
      addonGroups: [],
    })
    setStatus(makeStatus('idle'))
    setError(makeErrors())
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
    // 'error' is deliberately NOT auto-retried: this context has many
    // simultaneous consumers (both POS screens, both headers, the item forms),
    // so an invisible retry would multiply requests and fight the error +
    // Retry UI that the POS screens now render. A failure is reported instead.
  }, [ctx])

  return ctx
}