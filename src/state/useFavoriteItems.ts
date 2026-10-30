import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { subscribeToRail } from '../services/liveRailClient'
import { listBestSellersApi, type BestSeller } from '../services/menuService'
import { useOutletSettings } from '../services/useOutletSettings'
import type { MenuItemRow } from '../utils/menuAdapter'

/** Slots in the Favorite Items rail when the outlet has not set its own. */
export const DEFAULT_FAVORITE_ITEMS_COUNT = 16

/**
 * What the Billing / Captain "Favorite Items" rail shows.
 *
 * The outlet's manual favorites (menu "Set As Favorite") come first, in menu
 * order; the outlet's best sellers fill whatever slots are left, up to the
 * outlet's `favorite_items_count` (Display settings) — unless the outlet
 * turned `favorite_items_auto` off, in which case only manual favorites
 * show. A new outlet therefore
 * starts empty and each item joins the rail the moment it is first sold; once
 * more items have sold than there are slots, the sales average decides.
 * Nothing stored on the menu is changed.
 */
export interface FavoriteItems {
  /** Ids shown in the rail: manual favorites first, then best sellers. */
  favoriteIds: Set<string>
  /** Slots the outlet allows (Display settings). */
  slots: number
  /** Items with the menu's own favorite switch on (shown first, never auto-dropped). */
  pinnedCount: number
}

export function useFavoriteItems(menuItems: MenuItemRow[]): FavoriteItems {
  const { encryptedOutletId, token } = useAuth()
  const { data: display } = useOutletSettings('display')
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([])
  const [reload, setReload] = useState(0)
  const debounceRef = useRef<number | undefined>(undefined)

  // Wait for the settings before showing automatic picks, so a switched-off
  // outlet never flashes best sellers it does not want.
  const autoBestSellers = display != null && display.favorite_items_auto !== false

  const slots = useMemo(() => {
    const configured = Number(display?.favorite_items_count)
    return Number.isInteger(configured) && configured >= 1
      ? configured
      : DEFAULT_FAVORITE_ITEMS_COUNT
  }, [display])

  useEffect(() => {
    if (!encryptedOutletId) return
    if (!autoBestSellers) {
      setBestSellers([])
      return
    }
    let cancelled = false
    listBestSellersApi(encryptedOutletId)
      .then((rows) => {
        if (!cancelled) setBestSellers(rows)
      })
      .catch(() => {
        // Best sellers are an extra: keep whatever we had (or just the manual
        // favorites) rather than blocking billing on a failed request.
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId, reload, autoBestSellers])

  // A settled bill changes the ranking; refetch shortly after, once per burst.
  useEffect(() => {
    if (!encryptedOutletId || !token || !autoBestSellers) return
    const unsubscribe = subscribeToRail({
      outletId: encryptedOutletId,
      token,
      onEvent: (event) => {
        if (event !== 'order.settle') return
        window.clearTimeout(debounceRef.current)
        debounceRef.current = window.setTimeout(
          () => setReload((key) => key + 1),
          1500,
        )
      },
    })
    return () => {
      window.clearTimeout(debounceRef.current)
      unsubscribe()
    }
  }, [encryptedOutletId, token, autoBestSellers])

  return useMemo(() => {
    const pinnedCount = menuItems.filter((item) => item.isFavorite).length
    const ids: string[] = menuItems
      .filter((item) => item.isFavorite)
      .slice(0, slots)
      .map((item) => item.id)
    if (autoBestSellers && ids.length < slots && bestSellers.length > 0) {
      const byId = new Map(menuItems.map((item) => [item.id, item]))
      const taken = new Set(ids)
      for (const seller of bestSellers) {
        if (ids.length >= slots) break
        const item = byId.get(seller.id)
        // Removed by the cashier: stays out even though it still sells well.
        if (!item || item.excludeFromAutoFavorites || taken.has(seller.id)) continue
        taken.add(seller.id)
        ids.push(seller.id)
      }
    }
    return { favoriteIds: new Set(ids), slots, pinnedCount }
  }, [menuItems, bestSellers, slots, autoBestSellers])
}
