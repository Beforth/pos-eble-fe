import { listItemsApi } from '../services/menuService'
import type { Item } from '../types/menu'

const PAGE_SIZE = 100
const ALL_SCOPE = '__all__'

// Items change from other devices, imports and the backend, none of which can
// invalidate this in-memory cache, so a hit is only trusted for a short while.
const CACHE_TTL_MS = 30_000

const cache = new Map<string, { items: Item[]; loadedAt: number }>()

function freshHit(key: string, force?: boolean): Item[] | null {
  const hit = cache.get(key)
  if (!hit || force || Date.now() - hit.loadedAt > CACHE_TTL_MS) return null
  return hit.items
}

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
  const hit = freshHit(key, options.force)
  if (hit) return hit
  const items = await loadAllPages(outletId, categoryId)
  cache.set(key, { items, loadedAt: Date.now() })
  return items
}

export async function fetchAllItemsCached(
  outletId: string,
  options: { force?: boolean } = {},
): Promise<Item[]> {
  const key = keyFor(outletId, ALL_SCOPE)
  const hit = freshHit(key, options.force)
  if (hit) return hit
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