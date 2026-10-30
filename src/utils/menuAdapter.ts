import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useMenuChannels } from '../state/MenuChannelsContext'
import {
  useMenuReference,
  type MenuReferenceStatus,
} from '../state/MenuReferenceContext'
import { fetchAllItemsCached, invalidateMenuItems } from '../state/menuItemsCache'
import type { Category, Item, TaxSummary } from '../types/menu'
import { buildItemOptions, type ItemOptions } from './itemOptions'

/**
 * Billing menu row shape — the single grid row contract shared by Billing,
 * Captain Orders and their item grids. Replaces the old mock row type.
 * All `id` values are OPAQUE ENCRYPTED STRINGS — never Number() them.
 */
export interface MenuItemRow {
  id: string
  categoryId: string
  name: string
  shortCode: string
  /** Secondary short code (`short_code_2`) — matched for quick-add, optional. */
  shortCode2?: string
  onlineDisplayName: string
  price: number
  description: string
  available: boolean
  availableOnPos?: boolean
  availableOnSwiggy?: boolean
  availableOnZomato?: boolean
  tags: string[]
  hasImage: boolean
  /** First uploaded picture, shown on the billing cards when enabled. */
  imageUrl?: string
  rank?: number
  isFavorite?: boolean
  /** Removed from Favorite Items on purpose; best sellers skip it. */
  excludeFromAutoFavorites?: boolean
  /**
   * Active tax slabs assigned to this item. Drives `computeTax`. Optional so
   * locally-built rows (combo builder, demo fixtures) stay tax-free by default;
   * `adaptItem` always fills it from the server item.
   */
  taxes?: TaxSummary[]
  /** Item's "ignore tax" flag — when true the item is priced tax-free. */
  ignoreTax?: boolean
  /**
   * Variations and add-ons the cashier is asked about when the item is added,
   * priced for the billing menu. Undefined when the item has none.
   */
  options?: ItemOptions
}

/** Channel whose per-channel price/availability drives POS billing. */
export const POS_CHANNEL_SLUG = 'dine-in'

const CHOICE_MARK: Record<string, string> = {
  veg: 'V+',
  egg: 'E',
  'non-veg': 'N',
}

function toNumber(value: number | string | null | undefined): number {
  if (value == null) return 0
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * Menu On/Off's POS switch writes the `base` channel, while billing prices
 * from `dine-in`: an item switched off on either is not sellable at the counter.
 */
function isAvailableForChannel(
  item: Item,
  channelId: string,
  alsoChannelIds: string[],
): boolean {
  if (!item.is_active) return false
  return [channelId, ...alsoChannelIds].every((id) => {
    if (!id) return true
    const entry = item.availability?.find((a) => a.outlet_channel_id === id)
    return entry ? entry.is_available : true
  })
}

/**
 * Map a server `Item` onto a billing grid row.
 * Price: the POS channel (`dine-in`) area price, else `base_price`.
 * favourite: the authoritative `flags.set_as_favorite`, not a hasImage guess.
 * taxes: the item's assigned slabs, kept (plus `flags.ignore_tax`) so the cart
 * can price a line — the item list already returns both, so no extra request.
 */
export function adaptItem(
  item: Item,
  channelId: string,
  alsoChannelIds: string[] = [],
): MenuItemRow {
  const area = item.area_prices?.find(
    (price) => price.outlet_channel_id === channelId,
  )
  const price =
    channelId && area ? toNumber(area.price) : toNumber(item.base_price)
  const choiceMark = item.choice ? CHOICE_MARK[item.choice] : ''
  return {
    id: item.id,
    categoryId: item.category_id ?? '',
    name: item.name,
    shortCode: item.short_code,
    shortCode2: item.short_code_2,
    onlineDisplayName: item.online_display_name,
    price,
    description: item.description,
    available: isAvailableForChannel(item, channelId, alsoChannelIds),
    tags: [...(choiceMark ? [choiceMark] : []), ...(item.tags ?? [])],
    hasImage: item.has_image,
    imageUrl: item.images?.[0]?.image || undefined,
    rank: item.rank,
    isFavorite: item.flags?.set_as_favorite ?? false,
    excludeFromAutoFavorites: item.flags?.exclude_from_auto_favorites ?? false,
    taxes: item.taxes ?? [],
    ignoreTax: item.flags?.ignore_tax ?? false,
    options: buildItemOptions(item, channelId),
  }
}

export type BillingMenuStatus = 'loading' | 'ready' | 'error'

export interface BillingMenuState {
  items: MenuItemRow[]
  categories: Category[]
  /** Status of the *items* fetch. */
  status: BillingMenuStatus
  error: string | null
  /**
   * Status of the *categories* fetch. Tracked separately because it used to be
   * dropped here, which let an empty category list reach the screens as a
   * silent "Favorite Items / All Categories" rail with no error and no way to
   * recover. The rail now gates on this.
   */
  categoriesStatus: MenuReferenceStatus
  categoriesError: string | null
  /** Force-refetches items *and* categories. */
  reload: () => Promise<void>
  /**
   * Set an item's favorite flags in memory (and drop the shared items cache so
   * the next screen refetches). The caller saves them with `updateItemApi`.
   * `excluded` = removed from Favorite Items, so best sellers skip it.
   */
  setItemFavorite: (
    itemId: string,
    flags: { favorite: boolean; excluded: boolean },
  ) => void
}

/**
 * Live menu for the billing screens: all items (paginated) adapted for the
 * POS channel, plus reference categories. Reads through the shared
 * `menuItemsCache` so menu pages and billing share one request.
 */
export function useBillingMenu(): BillingMenuState {
  const { encryptedOutletId } = useAuth()
  const { channels } = useMenuChannels()
  const {
    categories,
    reload: reloadReference,
    status: referenceStatus,
    error: referenceError,
  } = useMenuReference(['categories'])
  const [rawItems, setRawItems] = useState<Item[]>([])
  const [status, setStatus] = useState<BillingMenuStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  const channelId = useMemo(
    () => channels.find((c) => c.channel_slug === POS_CHANNEL_SLUG)?.id ?? '',
    [channels],
  )

  const baseChannelId = useMemo(
    () => channels.find((c) => c.channel_slug === 'base')?.id ?? '',
    [channels],
  )

  const load = useCallback(
    async (force: boolean) => {
      if (!encryptedOutletId) {
        setRawItems([])
        setStatus('ready')
        return
      }
      setStatus('loading')
      setError(null)
      try {
        const all = await fetchAllItemsCached(encryptedOutletId, { force })
        setRawItems(all)
        setStatus('ready')
      } catch (err) {
        setStatus('error')
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load the menu. Please try again.',
        )
      }
    },
    [encryptedOutletId],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  // Menu On/Off is changed from another tab or device, so an open billing
  // screen re-reads the items quietly (no loading state) when the tab regains
  // focus and once a minute while it stays visible. The list is large, so it
  // is read at most this often (a request in flight is shared) — more often
  // and it queues ahead of the bill requests on the server.
  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    let lastRefresh = Date.now()
    const refresh = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastRefresh < 15_000) return
      lastRefresh = Date.now()
      fetchAllItemsCached(encryptedOutletId, { force: true })
        .then((all) => {
          if (!cancelled) setRawItems(all)
        })
        .catch(() => undefined)
    }
    const timer = window.setInterval(refresh, 60_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [encryptedOutletId])

  const items = useMemo(
    () =>
      rawItems.map((item) =>
        adaptItem(item, channelId, baseChannelId ? [baseChannelId] : []),
      ),
    [rawItems, channelId, baseChannelId],
  )

  const setItemFavorite = useCallback(
    (itemId: string, { favorite, excluded }: { favorite: boolean; excluded: boolean }) => {
      setRawItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                flags: {
                  ...item.flags,
                  set_as_favorite: favorite,
                  exclude_from_auto_favorites: excluded,
                },
              }
            : item,
        ),
      )
      if (encryptedOutletId) invalidateMenuItems(encryptedOutletId)
    },
    [encryptedOutletId],
  )

  return {
    items,
    categories,
    status,
    error,
    categoriesStatus: referenceStatus.categories,
    categoriesError: referenceError.categories,
    reload: async () => {
      // Both halves of the menu: the old retry only reloaded items, so a failed
      // categories fetch could never be recovered from the Retry button.
      await Promise.all([load(true), reloadReference('categories', { force: true })])
    },
    setItemFavorite,
  }
}
