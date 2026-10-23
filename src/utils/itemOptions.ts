import type { Item } from '../types/menu'

/**
 * Variations (Regular / Large) and add-ons (Extra Cheese) an item can be sold
 * with, already priced for ONE menu (the billing menu). Built from the item
 * read API's `variation_groups` / `addon_groups`.
 */
export interface OptionVariation {
  id: string
  name: string
  price: number
}

export interface OptionVariationGroup {
  id: string
  name: string
  variations: OptionVariation[]
}

export interface OptionAddon {
  id: string
  name: string
  price: number
  choice: string
}

export interface OptionAddonGroup {
  id: string
  name: string
  /** Fewest add-ons that must be picked (0 = optional). */
  min: number
  /** Most add-ons that may be picked (0 = no limit); 1 when single-choice. */
  max: number
  addons: OptionAddon[]
}

export interface ItemOptions {
  variationGroups: OptionVariationGroup[]
  addonGroups: OptionAddonGroup[]
}

/** What the cashier picked: one variation per group, any add-ons per group. */
export interface OptionSelection {
  variations: Record<string, string>
  addons: Record<string, string[]>
}

const BASE_SLUG = 'base'

function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/** The price a menu charges, or null when it is not sold on that menu. */
function menuPrice(
  prices: Array<{
    outlet_channel_id: string
    channel_slug: string
    price: number | string
    is_active?: boolean
  }>,
  channelId: string,
): number | null {
  const own = channelId
    ? prices.find((p) => p.outlet_channel_id === channelId)
    : undefined
  if (own) return own.is_active === false ? null : toNumber(own.price)
  const base = prices.find((p) => p.channel_slug === BASE_SLUG)
  if (base && base.is_active !== false) return toNumber(base.price)
  return null
}

/**
 * The item's options priced for `channelId`, or undefined when it has none to
 * ask about. A variation not sold on this menu is left out; an add-on without
 * a price on this menu falls back to its Base price.
 */
export function buildItemOptions(
  item: Item,
  channelId: string,
): ItemOptions | undefined {
  const variationGroups: OptionVariationGroup[] = []
  for (const group of item.variation_groups ?? []) {
    const variations: OptionVariation[] = []
    for (const variation of group.variations) {
      const price = menuPrice(variation.area_prices, channelId)
      if (price !== null) {
        variations.push({ id: variation.id, name: variation.name, price })
      }
    }
    if (variations.length > 0) {
      variationGroups.push({
        id: group.id,
        name: group.department_name,
        variations,
      })
    }
  }

  const addonGroups: OptionAddonGroup[] = []
  for (const group of item.addon_groups ?? []) {
    const addons: OptionAddon[] = []
    for (const addon of group.addons) {
      const own = channelId
        ? addon.area_prices.find((p) => p.outlet_channel_id === channelId)
        : undefined
      if (own && own.is_active === false) continue
      addons.push({
        id: addon.id,
        name: addon.name,
        price: own ? toNumber(own.price) : toNumber(addon.base_price),
        choice: addon.choice,
      })
    }
    if (addons.length === 0) continue
    const single = group.selection_mode === 'single'
    const max = single ? 1 : group.addon_max
    const min = Math.max(group.addon_min, group.is_required ? 1 : 0)
    addonGroups.push({
      id: group.id,
      name: group.department_name,
      min: max > 0 ? Math.min(min, max) : min,
      max,
      addons,
    })
  }

  if (variationGroups.length === 0 && addonGroups.length === 0) return undefined
  return { variationGroups, addonGroups }
}

/** Why the selection cannot be added yet, or null when it is complete. */
export function selectionProblem(
  options: ItemOptions,
  selection: OptionSelection,
): string | null {
  for (const group of options.variationGroups) {
    if (!selection.variations[group.id]) return `Choose a ${group.name}`
  }
  for (const group of options.addonGroups) {
    const count = (selection.addons[group.id] ?? []).length
    if (count < group.min) {
      return `Choose at least ${group.min} from ${group.name}`
    }
    if (group.max > 0 && count > group.max) {
      return `Choose at most ${group.max} from ${group.name}`
    }
  }
  return null
}

export interface PricedSelection {
  /** Price of one unit: the chosen variations (or the item's own price) plus add-ons. */
  price: number
  /** The line name: `Margherita (Large) + Extra Cheese`. */
  name: string
  /** Same choices -> same key, so they merge into one cart line. */
  key: string
}

/**
 * The unit price and line name for a selection. A variation's price replaces
 * the item's own (HALF vs FULL are full prices); with several variation groups
 * the chosen prices add up. Add-on prices are added on top.
 */
export function priceSelection(
  itemName: string,
  itemPrice: number,
  options: ItemOptions,
  selection: OptionSelection,
): PricedSelection {
  const chosenVariations: OptionVariation[] = []
  for (const group of options.variationGroups) {
    const found = group.variations.find(
      (v) => v.id === selection.variations[group.id],
    )
    if (found) chosenVariations.push(found)
  }
  const chosenAddons: OptionAddon[] = []
  for (const group of options.addonGroups) {
    const picked = new Set(selection.addons[group.id] ?? [])
    for (const addon of group.addons) {
      if (picked.has(addon.id)) chosenAddons.push(addon)
    }
  }

  const base = options.variationGroups.length
    ? chosenVariations.reduce((sum, v) => sum + v.price, 0)
    : itemPrice
  const price = Math.round(
    (base + chosenAddons.reduce((sum, a) => sum + a.price, 0)) * 100,
  ) / 100

  const variationText = chosenVariations.length
    ? ` (${chosenVariations.map((v) => v.name).join(', ')})`
    : ''
  const addonText = chosenAddons.map((a) => ` + ${a.name}`).join('')
  return {
    price,
    name: `${itemName}${variationText}${addonText}`,
    key: [
      ...chosenVariations.map((v) => `v${v.id}`),
      ...chosenAddons.map((a) => `a${a.id}`),
    ].join('|'),
  }
}

/**
 * Find the menu item a saved order line came from. Order lines keep only a name
 * snapshot, and a line with options is named `Item (Variation) + Addon`, so an
 * exact match is tried first, then the longest item name the line starts with
 * (followed by ` (` or ` + `).
 */
export function matchMenuItemId(
  lineName: string,
  items: ReadonlyArray<{ id: string; name: string }>,
): string {
  const wanted = lineName.trim().toLowerCase()
  let best = ''
  let bestLength = 0
  for (const item of items) {
    const name = item.name.trim().toLowerCase()
    if (name === wanted) return item.id
    if (
      name.length > bestLength &&
      (wanted.startsWith(`${name} (`) || wanted.startsWith(`${name} + `))
    ) {
      best = item.id
      bestLength = name.length
    }
  }
  return best
}
