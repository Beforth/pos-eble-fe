import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useOutletSettings } from '../services/useOutletSettings'

function cacheKey(outletId: string): string {
  return `rajubhai.display.menuOnRight.${outletId}`
}

function readCache(outletId: string | null): boolean {
  if (!outletId) return false
  try {
    return localStorage.getItem(cacheKey(outletId)) === '1'
  } catch {
    return false
  }
}

/**
 * Whether the Billing / Captain screens put the menu on the right of the bill.
 *
 * Driven by Display settings: "Display preference for the Menu" = *On the Right*,
 * which applies **only to the Touch Screen layout** (a Keyboard layout always
 * keeps the menu on the left). The last answer is remembered per outlet so the
 * screen opens already on the right side instead of jumping once the settings
 * have loaded.
 */
export function useMenuOnRight(): boolean {
  const { encryptedOutletId } = useAuth()
  const { data } = useOutletSettings('display')
  const [onRight, setOnRight] = useState(() => readCache(encryptedOutletId))

  useEffect(() => {
    if (!data) return
    const next =
      data.layout_type === 'Touch Screen' && data.menu_position === 'On the Right'
    setOnRight(next)
    if (!encryptedOutletId) return
    try {
      localStorage.setItem(cacheKey(encryptedOutletId), next ? '1' : '0')
    } catch {
      // Remembering the side is a convenience; the screen works without it.
    }
  }, [data, encryptedOutletId])

  return onRight
}
