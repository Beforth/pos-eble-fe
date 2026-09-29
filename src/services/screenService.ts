import {
  AUTH_ENCRYPTED_OUTLET_KEY,
  AUTH_TOKEN_KEY,
} from '../auth/storage'
import {
  DIET_CATEGORIES,
  registerCategoryNames,
  setScreenMenuLookup,
  type KotScreen,
  type ScreenCategory,
  type ScreenMenuRow,
} from '../mocks/screensData'
import { fetchAllItemsCached } from '../state/menuItemsCache'
import type { Item } from '../types/menu'
import { apiRequest } from './apiClient'
import { listCategoriesApi } from './menuService'

function authToken(): string | undefined {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined
}

function activeOutletId(): string {
  const id = localStorage.getItem(AUTH_ENCRYPTED_OUTLET_KEY)
  if (!id) throw new Error('No active outlet selected.')
  return id
}

function screensPath(outletId: string, suffix = ''): string {
  return `/api/v1/screens/${outletId}${suffix}`
}

function jsonRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    token: authToken(),
  })
}

/** Server read shape (`KitchenScreenReadSerializer`). */
interface ScreenDto {
  id: string
  name: string
  category_ids: string[]
  item_ids: string[]
  created_at: string
}

function toKotScreen(dto: ScreenDto): KotScreen {
  return {
    id: dto.id,
    name: dto.name,
    categoryIds: dto.category_ids ?? [],
    itemIds: dto.item_ids ?? [],
    createdAt: Date.parse(dto.created_at) || Date.now(),
  }
}

function itemToScreenRow(item: Item): ScreenMenuRow {
  const tags = [...(item.tags ?? [])]
  if (item.choice && !tags.includes(item.choice)) tags.push(item.choice)
  return {
    id: item.id,
    name: item.name,
    categoryId: item.category_id ?? '',
    tags,
    onlineDisplayName: item.online_display_name || item.name,
  }
}

function notifyScreensChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('pos-eble-kot-screens'))
  try {
    const channel = new BroadcastChannel('pos-eble-kot-sync')
    channel.postMessage({ type: 'screens_updated' })
    channel.close()
  } catch {
    // BroadcastChannel optional
  }
}

/** Diet pseudo-categories + live menu categories (with item counts). */
export async function fetchCategories(
  outletId = activeOutletId(),
): Promise<ScreenCategory[]> {
  const [categories, items] = await Promise.all([
    listCategoriesApi(outletId),
    fetchAllItemsCached(outletId),
  ])

  setScreenMenuLookup(items.map(itemToScreenRow))
  registerCategoryNames(
    categories.map((category) => [category.id, category.name] as const),
  )

  const categoryCounts = new Map<string, number>()
  const dietCounts = new Map<string, number>()
  for (const item of items) {
    if (item.category_id) {
      categoryCounts.set(
        item.category_id,
        (categoryCounts.get(item.category_id) ?? 0) + 1,
      )
    }
    const diet = item.choice || 'veg'
    dietCounts.set(diet, (dietCounts.get(diet) ?? 0) + 1)
  }

  const dietCategories: ScreenCategory[] = DIET_CATEGORIES.map(
    ({ id, name }) => ({
      id,
      name,
      itemCount: dietCounts.get(id) ?? 0,
    }),
  )
  const menuCategories: ScreenCategory[] = categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      itemCount: categoryCounts.get(category.id) ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return [...dietCategories, ...menuCategories]
}

/** Warm category/item name lookups used by Screen cards and KOT filters. */
export async function warmScreenLookups(
  outletId = activeOutletId(),
): Promise<void> {
  await fetchCategories(outletId)
}

export async function fetchScreens(
  outletId = activeOutletId(),
): Promise<KotScreen[]> {
  const rows = await jsonRequest<ScreenDto[]>(
    screensPath(outletId, '/'),
    'GET',
  )
  return rows.map(toKotScreen)
}

export async function fetchScreen(
  id: string,
  outletId = activeOutletId(),
): Promise<KotScreen | null> {
  try {
    const row = await jsonRequest<ScreenDto>(
      screensPath(outletId, `/${id}/`),
      'GET',
    )
    return toKotScreen(row)
  } catch (error) {
    const status = (error as { status?: number })?.status
    if (status === 400 || status === 404) return null
    throw error
  }
}

export async function createScreen(config: {
  categoryIds: string[]
  itemIds?: string[]
  name?: string
  outletId?: string
}): Promise<KotScreen> {
  const outletId = config.outletId ?? activeOutletId()
  const row = await jsonRequest<ScreenDto>(screensPath(outletId, '/'), 'POST', {
    name: (config.name ?? '').trim() || 'Kitchen Display Screen',
    category_ids: config.categoryIds,
    item_ids: config.itemIds ?? [],
  })
  notifyScreensChanged()
  return toKotScreen(row)
}

export async function updateScreen(
  id: string,
  config: {
    categoryIds?: string[]
    itemIds?: string[]
    name?: string
    outletId?: string
  },
): Promise<KotScreen> {
  const outletId = config.outletId ?? activeOutletId()
  const body: Record<string, unknown> = {}
  if (config.name !== undefined) body.name = config.name.trim() || 'Kitchen Display Screen'
  if (config.categoryIds !== undefined) body.category_ids = config.categoryIds
  if (config.itemIds !== undefined) body.item_ids = config.itemIds
  const row = await jsonRequest<ScreenDto>(
    screensPath(outletId, `/${id}/`),
    'PATCH',
    body,
  )
  notifyScreensChanged()
  return toKotScreen(row)
}

export async function removeScreen(
  id: string,
  outletId = activeOutletId(),
): Promise<void> {
  await jsonRequest<unknown>(screensPath(outletId, `/${id}/`), 'DELETE')
  notifyScreensChanged()
}
