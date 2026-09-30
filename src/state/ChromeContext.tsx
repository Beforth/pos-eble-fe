import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type RailKey = 'main' | 'menu' | 'inventory' | 'finance' | 'audit'

interface ChromeContextValue {
  collapsed: boolean
  expanded: Record<RailKey, string[]>
  navScroll: Record<RailKey, number>
  toggleCollapsed: () => void
  toggleExpanded: (rail: RailKey, id: string) => void
  mergeExpanded: (rail: RailKey, ids: string[]) => void
  setNavScroll: (rail: RailKey, top: number) => void
}

const ChromeContext = createContext<ChromeContextValue | null>(null)

const INITIAL_EXPANDED: Record<RailKey, string[]> = {
  main: [],
  menu: [],
  inventory: [],
  finance: [],
  audit: ['management', 'report'],
}

const INITIAL_SCROLL: Record<RailKey, number> = {
  main: 0,
  menu: 0,
  inventory: 0,
  finance: 0,
  audit: 0,
}

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState(INITIAL_EXPANDED)
  const [navScroll, setNavScrollState] = useState(INITIAL_SCROLL)

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  const toggleExpanded = useCallback((rail: RailKey, id: string) => {
    setExpanded((prev) => {
      const current = prev[rail]
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
      return { ...prev, [rail]: next }
    })
  }, [])

  const mergeExpanded = useCallback((rail: RailKey, ids: string[]) => {
    setExpanded((prev) => {
      const current = prev[rail]
      const missing = ids.filter((id) => !current.includes(id))
      if (missing.length === 0) return prev
      return { ...prev, [rail]: [...current, ...missing] }
    })
  }, [])

  const setNavScroll = useCallback((rail: RailKey, top: number) => {
    setNavScrollState((prev) => ({ ...prev, [rail]: top }))
  }, [])

  const value = useMemo<ChromeContextValue>(
    () => ({
      collapsed,
      expanded,
      navScroll,
      toggleCollapsed,
      toggleExpanded,
      mergeExpanded,
      setNavScroll,
    }),
    [
      collapsed,
      expanded,
      navScroll,
      toggleCollapsed,
      toggleExpanded,
      mergeExpanded,
      setNavScroll,
    ],
  )

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>
}

export function useChrome(): ChromeContextValue {
  const ctx = useContext(ChromeContext)
  if (!ctx) throw new Error('useChrome must be used within a ChromeProvider')
  return ctx
}
