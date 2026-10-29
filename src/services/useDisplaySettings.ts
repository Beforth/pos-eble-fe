import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getOutletSettingsApi } from './outletService'

/** The Display Settings (Outlet Configuration > Display) the screens act on. */
export interface DisplaySettings {
  /** Where New Order opens. */
  defaultScreen: 'Billing' | 'Table Management'
  /** Order Live View: oldest first ('asc') or newest first ('desc'). */
  orderLiveView: 'asc' | 'desc'
  /** KOT Live View: oldest first ('asc') or newest first ('desc'). */
  kotLiveView: 'asc' | 'desc'
  /** Add New Item In Cart: at the end ('bottom') or the start ('top') of the list. */
  cartPosition: 'bottom' | 'top'
  /** Layout for Billing Screen is Touch Screen (not Keyboard). */
  touchLayout: boolean
  /** Enable virtual keyboard in touch. */
  virtualKeyboard: boolean
  /** Open the virtual keyboard when entering an order number. */
  vkOrderNumber: boolean
  /** Open the virtual keyboard for the short code search. */
  vkShortCode: boolean
  /** Show item images on the billing screen. */
  itemImages: boolean
  /** A tap on an item adds it at once (off: the first tap selects, the next adds). */
  autoAddItems: boolean
  /** Add the item as soon as the variation / add-on popup is complete. */
  autoAddFromPopup: boolean
  /** Show the Search Item box (touch layout only). */
  displaySearch: boolean
  /** Enforce an add-on group's min and max in the popup. */
  addonMinMax: boolean
  /** Show the price on item cards. */
  displayItemPrice: boolean
}

/** What a screen assumes until the settings load; the same as the saved defaults. */
export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  defaultScreen: 'Billing',
  orderLiveView: 'desc',
  kotLiveView: 'asc',
  cartPosition: 'bottom',
  touchLayout: true,
  virtualKeyboard: true,
  vkOrderNumber: true,
  vkShortCode: false,
  itemImages: false,
  autoAddItems: true,
  autoAddFromPopup: false,
  displaySearch: true,
  addonMinMax: false,
  displayItemPrice: true,
}

const CACHE_MS = 15_000
const cache = new Map<string, { value: DisplaySettings; at: number }>()
const inflight = new Map<string, Promise<DisplaySettings>>()

const text = (value: unknown) => String(value ?? '').trim().toLowerCase()
const flag = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback

function parse(data: Record<string, unknown>): DisplaySettings {
  const d = DEFAULT_DISPLAY_SETTINGS
  return {
    defaultScreen:
      text(data.default_screen) === 'table management' ? 'Table Management' : 'Billing',
    orderLiveView: text(data.order_live_view) === 'ascending' ? 'asc' : 'desc',
    kotLiveView: text(data.kot_live_view) === 'descending' ? 'desc' : 'asc',
    cartPosition: text(data.new_item_cart_position) === 'on top' ? 'top' : 'bottom',
    touchLayout: data.layout_type === undefined ? d.touchLayout : text(data.layout_type) === 'touch screen',
    virtualKeyboard: flag(data.enable_virtual_keyboard_touch, d.virtualKeyboard),
    vkOrderNumber: flag(data.open_vk_on_order_number, d.vkOrderNumber),
    vkShortCode: flag(data.open_vk_shortcode_search, d.vkShortCode),
    itemImages: flag(data.display_item_images, d.itemImages),
    autoAddItems: flag(data.auto_add_items_on_select, d.autoAddItems),
    autoAddFromPopup: flag(data.auto_add_from_variation_popup, d.autoAddFromPopup),
    displaySearch: flag(data.display_search_item, d.displaySearch),
    addonMinMax: flag(data.addon_min_max_validation, d.addonMinMax),
    displayItemPrice: flag(data.display_item_price, d.displayItemPrice),
  }
}

async function load(outletId: string): Promise<DisplaySettings> {
  const hit = cache.get(outletId)
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value
  const pending = inflight.get(outletId)
  if (pending) return pending
  const request = getOutletSettingsApi(outletId, 'display')
    .then((data) => {
      const value = parse(data)
      cache.set(outletId, { value, at: Date.now() })
      return value
    })
    .finally(() => inflight.delete(outletId))
  inflight.set(outletId, request)
  return request
}

/** Call after the Display settings are saved so the screens pick up the change at once. */
export function invalidateDisplaySettings(): void {
  cache.clear()
}

/** The outlet's Display Settings, kept fresh; the saved defaults until they load. */
export function useDisplaySettings(): DisplaySettings {
  const { encryptedOutletId } = useAuth()
  const [value, setValue] = useState<DisplaySettings>(
    () =>
      (encryptedOutletId ? cache.get(encryptedOutletId)?.value : undefined) ??
      DEFAULT_DISPLAY_SETTINGS,
  )

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    load(encryptedOutletId)
      .then((next) => {
        if (!cancelled) setValue(next)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  return value
}
