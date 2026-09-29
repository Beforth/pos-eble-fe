import { listItemsApi } from '../services/menuService'
import type { Item } from '../types/menu'

const PAGE_SIZE = 100
const ALL_SCOPE = '__all__'

const cache = new Map<string, { items: Item[]; loadedAt: number }>()

function keyFor(outletId: string, scope: string): string {
  return `${outletId}:${scope}`
}

async function loadAllPages(
  outletId: string,
  categoryId?: string,
): Promise<Item[]> {
  const items: Item[] = []
  for (let page = 1; ; page += 1) {
    const res = await listItemsApi(
      outletId,
      categoryId
        ? { category_id: categoryId, page, page_size: PAGE_SIZE }
        : { page, page_size: PAGE_SIZE },
    )
    items.push(...res.results)
    if (items.length >= (res.count ?? 0)) break
    if (!res.next) break
  }
  return items
}

export async function fetchCategoryItemsCached(
  outletId: string,
  categoryId: string,
  options: { force?: boolean } = {},
): Promise<Item[]> {
  const key = keyFor(outletId, categoryId)
  const hit = cache.get(key)
  if (!options.force && hit) return hit.items
  const items = await loadAllPages(outletId, categoryId)
  cache.set(key, { items, loadedAt: Date.now() })
  return items
}

export async function fetchAllItemsCached(
  outletId: string,
  options: { force?: boolean } = {},
): Promise<Item[]> {
  const key = keyFor(outletId, ALL_SCOPE)
  const hit = cache.get(key)
  if (!options.force && hit) return hit.items
  const items = await loadAllPages(outletId)
  cache.set(key, { items, loadedAt: Date.now() })
  return items
}

export function invalidateMenuItems(
  outletId: string,
  categoryId?: string,
): void {
  if (categoryId) {
    cache.delete(keyFor(outletId, categoryId))
    cache.delete(keyFor(outletId, ALL_SCOPE))
    return
  }
  const prefix = `${outletId}:`
  for (const key of Array.from(cache.keys())) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

export function invalidateMenuItemCache(
  outletId: string,
  item: Pick<Item, 'category_id'>,
): void {
  cache.delete(keyFor(outletId, ALL_SCOPE))
  if (item.category_id) cache.delete(keyFor(outletId, item.category_id))
}