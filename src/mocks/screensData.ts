import {
  baseMenuCategories,
  getMenuItemById,
  menuItems,
} from './menuItemsData'
import { getDietType, type FoodType } from '../utils/dietType'
import { normalizeFoodText } from '../utils/itemSearch'
import type { KotTicket, KotViewItem } from './kotViewData'

export interface KotScreen {
  id: string
  name: string
  categoryIds: string[]
  itemIds?: string[]
  createdAt: number
}

export interface ScreenCategory {
  id: string
  name: string
  itemCount: number
}

export interface ScreenTicketItem extends KotViewItem {
  categoryId: string | null
}

/** Diet-type pseudo-categories selectable alongside menu categories. */
export const DIET_CATEGORIES = [
  { id: 'veg', name: 'Veg' },
  { id: 'non-veg', name: 'Non-Veg' },
  { id: 'egg', name: 'Egg' },
] as const

export type DietCategoryId = (typeof DIET_CATEGORIES)[number]['id']

export function isDietCategoryId(id: string): id is DietCategoryId {
  return DIET_CATEGORIES.some((category) => category.id === id)
}

const CATEGORY_INDEX = new Map<string, string>([
  ...baseMenuCategories.map((category) => [category.id, category.name] as const),
  ...DIET_CATEGORIES.map((category) => [category.id, category.name] as const),
])

export function categoryName(id: string): string {
  return CATEGORY_INDEX.get(id) ?? id
}

/** Every menu category plus the diet pseudo-categories (Veg/Non-Veg/Egg first). */
export function allCategories(): ScreenCategory[] {
  const categoryCounts = new Map<string, number>()
  const dietCounts = new Map<DietCategoryId, number>()
  for (const item of menuItems) {
    categoryCounts.set(
      item.categoryId,
      (categoryCounts.get(item.categoryId) ?? 0) + 1,
    )
    const diet = getDietType(item.tags, item.name)
    dietCounts.set(diet, (dietCounts.get(diet) ?? 0) + 1)
  }
  const dietCategories: ScreenCategory[] = DIET_CATEGORIES.map(
    ({ id, name }) => ({ id, name, itemCount: dietCounts.get(id) ?? 0 }),
  )
  const menuCategories: ScreenCategory[] = baseMenuCategories
    .map(({ id, name }) => ({ id, name, itemCount: categoryCounts.get(id) ?? 0 }))
    .sort((a, b) => a.name.localeCompare(b.name))
  return [...dietCategories, ...menuCategories]
}

export function autoScreenName(categoryNames: string[]): string {
  if (categoryNames.length === 0) return 'Screen'
  const joined =
    categoryNames.length === 1
      ? categoryNames[0]
      : `${categoryNames.slice(0, -1).join(', ')} & ${categoryNames[categoryNames.length - 1]}`
  return `${joined} Screen`
}

/** Find the menu item backing a KOT line (itemId → line-id prefix → fuzzy name). */
function findMenuItemForKotItem(item: KotViewItem) {
  if (item.itemId) {
    const menuItem = getMenuItemById(item.itemId)
    if (menuItem) return menuItem
  }

  if (item.id) {
    const stripped = item.id.startsWith('line-') ? item.id.slice(5) : item.id
    const baseId = stripped.split('-')[0]
    const menuItem = getMenuItemById(baseId) || getMenuItemById(stripped)
    if (menuItem) return menuItem
  }

  const normalized = normalizeFoodText(item.name)
  if (!normalized) return null

  const exact =
    menuItems.find(
      (row) => normalizeFoodText(row.name) === normalized,
    ) ??
    menuItems.find(
      (row) => normalizeFoodText(row.onlineDisplayName) === normalized,
    )
  if (exact) return exact

  const nameWords = normalized.split(' ')
  const words = (value: string) =>
    normalizeFoodText(value).split(' ').filter(Boolean)
  const candidates = menuItems
    .map((row) => ({ row, rowWords: words(row.name) }))
    .filter(({ rowWords }) =>
      rowWords.every((word) => nameWords.includes(word)) ||
      nameWords.every((word) => rowWords.includes(word)),
    )
    .sort((a, b) => b.rowWords.length - a.rowWords.length)
  return candidates[0]?.row ?? null
}

/** Map a KOT item back to a menu category (itemId → menu → category → fallback keywords). */
export function resolveItemCategoryId(item: KotViewItem): string | null {
  const found = findMenuItemForKotItem(item)
  if (found) return found.categoryId

  const lower = item.name.toLowerCase()
  if (lower.includes('chaat') || lower.includes('puri') || lower.includes('bhel') || lower.includes('kachori')) return 'c1'
  if (lower.includes('party box')) return 'c2'
  if (lower.includes('dabeli')) return 'c3'
  if (lower.includes('snack')) return 'c4'
  if (lower.includes('kadak')) return 'c5'
  if (lower.includes('pav bhaji') || lower.includes('bhaji')) return 'c6'
  if (lower.includes('sandwich')) return 'c7'
  if (lower.includes('burger')) return 'c12'
  if (lower.includes('pizza')) return 'c15'
  if (lower.includes('frankie')) return 'c19'
  if (lower.includes('chinese') || lower.includes('noodles') || lower.includes('manchurian') || lower.includes('fried rice')) return 'c20'
  if (lower.includes('combo')) return 'c21'
  if (lower.includes('tea') || lower.includes('coffee') || lower.includes('beverage') || lower.includes('shake') || lower.includes('juice') || lower.includes('drink') || lower.includes('water')) return 'c22'
  if (lower.includes('fafda') || lower.includes('jalebi')) return 'c23'
  return null
}

/** Map a KOT item to a diet type (menu tags when known, else name heuristics). */
export function resolveItemDietType(item: KotViewItem): FoodType {
  const menuItem = findMenuItemForKotItem(item)
  return menuItem
    ? getDietType(menuItem.tags, menuItem.name)
    : getDietType([], item.name)
}

export interface FilteredScreenTicket {
  ticket: KotTicket
  items: ScreenTicketItem[]
  amount: number
}

/**
 * Keep only the ticket's item lines that belong to the screen: an item is
 * included when its menu item is selected, its menu category is selected, or
 * its diet type is selected.
 * If the screen has no specific categories or items configured (or has 'all'),
 * all items will be shown.
 */
export function filterTicketForScreen(
  ticket: KotTicket,
  screen: Pick<KotScreen, 'categoryIds' | 'itemIds'>,
): FilteredScreenTicket | null {
  const categoryIds = screen.categoryIds ?? []
  const itemIds = screen.itemIds ?? []

  // If screen has no specific filters or 'all' is selected, show all items on this screen
  const isAllScreen =
    (categoryIds.length === 0 && itemIds.length === 0) ||
    categoryIds.includes('all') ||
    categoryIds.includes('*')

  if (isAllScreen) {
    const items: ScreenTicketItem[] = ticket.items.map((item) => ({
      ...item,
      categoryId: resolveItemCategoryId(item),
    }))
    const amount = items.reduce((sum, item) => sum + item.price * item.qty, 0)
    return { ticket, items, amount }
  }

  const categorySet = new Set(categoryIds)
  const dietSet = new Set(categoryIds.filter(isDietCategoryId))
  const itemSet = new Set(itemIds)
  const items: ScreenTicketItem[] = []

  for (const item of ticket.items) {
    const categoryId = resolveItemCategoryId(item)
    const menuItem = findMenuItemForKotItem(item)
    const matchesItem = menuItem !== null && itemSet.has(menuItem.id)
    const matchesCategory =
      categoryId !== null &&
      !isDietCategoryId(categoryId) &&
      categorySet.has(categoryId)
    const matchesDiet = dietSet.has(resolveItemDietType(item))

    if (matchesItem || matchesCategory || matchesDiet) {
      items.push({ ...item, categoryId })
    }
  }

  if (items.length === 0) return null
  const amount = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  return { ticket, items, amount }
}

export interface ScreenMatchDebugItem {
  name: string
  itemId: string | null
  matchedMenuItemId: string | null
  matchedMenuItemName: string | null
  categoryId: string | null
  diet: FoodType
}

/** Temporary diagnostics: why each ticket item does/doesn't resolve. */
export function debugScreenMatch(ticket: KotTicket): ScreenMatchDebugItem[] {
  return ticket.items.map((item) => {
    const menuItem = findMenuItemForKotItem(item)
    return {
      name: item.name,
      itemId: item.itemId ?? null,
      matchedMenuItemId: menuItem?.id ?? null,
      matchedMenuItemName: menuItem?.name ?? null,
      categoryId: resolveItemCategoryId(item),
      diet: resolveItemDietType(item),
    }
  })
}
