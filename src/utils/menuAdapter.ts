import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useMenuChannels } from '../state/MenuChannelsContext'
import {
  useMenuReference,
  type MenuReferenceStatus,
} from '../state/MenuReferenceContext'
import { fetchAllItemsCached } from '../state/menuItemsCache'
import type { Category, Item, TaxSummary } from '../types/menu'

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
  onlineDisplayName: string
  price: number
  description: string
  available: boolean
  availableOnPos?: boolean
  availableOnSwiggy?: boolean
  availableOnZomato?: boolean
  tags: string[]
  hasImage: boolean
  rank?: number
  isFavorite?: boolean
  /**
   * Active tax slabs assigned to this item. Drives `computeTax`. Optional so
   * locally-built rows (combo builder, demo fixtures) stay tax-free by default;
   * `adaptItem` always fills it from the server item.
   */
  taxes?: TaxSummary[]
  /** Item's "ignore tax" flag — when true the item is priced tax-free. */
  ignoreTax?: boolean
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

function isAvailableForChannel(item: Item, channelId: string): boolean {
  if (!item.is_active) return false
  if (!channelId) return true
  const entry = item.availability?.find(
    (a) => a.outlet_channel_id === channelId,
  )
  return entry ? entry.is_available : true
}

/**
 * Map a server `Item` onto a billing grid row.
 * Price: the POS channel (`dine-in`) area price, else `base_price`.
 * favourite: the authoritative `flags.set_as_favorite`, not a hasImage guess.
 * taxes: the item's assigned slabs, kept (plus `flags.ignore_tax`) so the cart
 * can price a line — the item list already returns both, so no extra request.
 */
export function adaptItem(item: Item, channelId: string): MenuItemRow {
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
    onlineDisplayName: item.online_display_name,
    price,
    description: item.description,
    available: isAvailableForChannel(item, channelId),
    tags: [...(choiceMark ? [choiceMark] : []), ...(item.tags ?? [])],
    hasImage: item.has_image,
    rank: item.rank,
    isFavorite: item.flags?.set_as_favorite ?? false,
    taxes: item.taxes ?? [],
    ignoreTax: item.flags?.ignore_tax ?? false,
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

  const items = useMemo(
    () => rawItems.map((item) => adaptItem(item, channelId)),
    [rawItems, channelId],
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
  }
}
