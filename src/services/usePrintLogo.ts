import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getOutletSettingsApi } from './outletService'

const CACHE_MS = 60_000
const cache = new Map<string, { url: string; at: number }>()
const inflight = new Map<string, Promise<string>>()

async function loadLogo(outletId: string): Promise<string> {
  const hit = cache.get(outletId)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.url
  const pending = inflight.get(outletId)
  if (pending) return pending
  const request = getOutletSettingsApi(outletId, 'print')
    .then((data) => {
      const url = typeof data.print_logo === 'string' ? data.print_logo : ''
      cache.set(outletId, { url, at: Date.now() })
      return url
    })
    .finally(() => inflight.delete(outletId))
  inflight.set(outletId, request)
  return request
}

/** The outlet's print logo (Print Settings > Print Logo), or '' when none is set. */
export function usePrintLogoUrl(): string {
  const { encryptedOutletId } = useAuth()
  const [url, setUrl] = useState(
    () => (encryptedOutletId ? cache.get(encryptedOutletId)?.url : '') ?? '',
  )

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    loadLogo(encryptedOutletId)
      .then((value) => {
        if (!cancelled) setUrl(value)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  return url
}
