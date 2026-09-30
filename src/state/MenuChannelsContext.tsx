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
import { getChannelsApi } from '../services/menuService'
import type { Channel } from '../types/menu'

export type ChannelsStatus = 'idle' | 'loading' | 'ready' | 'error'

interface MenuChannelsContextValue {
  channels: Channel[]
  status: ChannelsStatus
  error: string | null
  getChannel: (id: string | null | undefined) => Channel | undefined
  loadChannels: (options?: { force?: boolean }) => Promise<void>
}

const MenuChannelsContext = createContext<MenuChannelsContextValue | null>(null)

export function MenuChannelsProvider({ children }: { children: ReactNode }) {
  const { encryptedOutletId } = useAuth()
  const [channels, setChannels] = useState<Channel[]>([])
  const [status, setStatus] = useState<ChannelsStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const statusRef = useRef<ChannelsStatus>('idle')

  const loadChannels = useCallback(
    async (options?: { force?: boolean }) => {
      const outletId = encryptedOutletId
      if (!outletId) return
      if (statusRef.current === 'loading') return
      if (!options?.force && statusRef.current === 'ready') return
      statusRef.current = 'loading'
      setStatus('loading')
      setError(null)
      try {
        const data = await getChannelsApi(outletId)
        setChannels(data)
        statusRef.current = 'ready'
        setStatus('ready')
      } catch (err) {
        statusRef.current = 'error'
        setStatus('error')
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load channels. Please try again.',
        )
      }
    },
    [encryptedOutletId],
  )

  useEffect(() => {
    statusRef.current = 'idle'
    setChannels([])
    setStatus('idle')
    setError(null)
    void loadChannels()
  }, [encryptedOutletId, loadChannels])

  const getChannel = useCallback(
    (id: string | null | undefined) => channels.find((channel) => channel.id === id),
    [channels],
  )

  const value = useMemo<MenuChannelsContextValue>(
    () => ({ channels, status, error, getChannel, loadChannels }),
    [channels, status, error, getChannel, loadChannels],
  )

  return (
    <MenuChannelsContext.Provider value={value}>
      {children}
    </MenuChannelsContext.Provider>
  )
}

export function useMenuChannels(): MenuChannelsContextValue {
  const ctx = useContext(MenuChannelsContext)
  if (!ctx) {
    throw new Error('useMenuChannels must be used within a MenuChannelsProvider')
  }
  return ctx
}