import { useCallback, useEffect, useMemo, useState } from 'react'

import { showToast } from '../utils/toast'
import { Search } from 'lucide-react'
import { Badge } from '../components/common/Badge'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import { useAuth } from '../auth/AuthContext'
import { useMenuChannels } from '../state/MenuChannelsContext'
import { listCategoriesApi, updateItemApi } from '../services/menuService'
import { fetchCategoryItemsCached, invalidateMenuItems } from '../state/menuItemsCache'
import type { Category, Item, ItemAvailability } from '../types/menu'

type Platform = 'pos' | 'swiggy' | 'zomato'

const PLATFORM_TABS: { id: Platform; label: string }[] = [
  { id: 'pos', label: 'POS' },
  { id: 'swiggy', label: 'Swiggy' },
  { id: 'zomato', label: 'Zomato' },
]

const PLATFORM_LABEL: Record<Platform, string> = {
  pos: 'POS',
  swiggy: 'Swiggy',
  zomato: 'Zomato',
}

const PLATFORM_SLUG: Record<Platform, string> = {
  pos: 'base',
  swiggy: 'swiggy',
  zomato: 'zomato',
}

interface MenuItemRow {
  id: string
  name: string
  shortCode: string
  price: number
  prices: Record<Platform, number>
  availableOnPos: boolean
  availableOnSwiggy: boolean
  availableOnZomato: boolean
}

function getAvailable(item: MenuItemRow, platform: Platform): boolean {
  if (platform === 'pos') return item.availableOnPos
  if (platform === 'swiggy') return item.availableOnSwiggy
  return item.availableOnZomato
}

function Toggle({
  checked,
  onToggle,
  label,
}: {
  checked: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={`menu-on-off-toggle ${checked ? 'is-on' : 'is-off'}`}
    >
      <span className="menu-on-off-toggle-knob" />
    </button>
  )
}

function toRow(item: Item): MenuItemRow {
  const availability = item.availability ?? []
  const avail = (slug: string): boolean => {
    const entry = availability.find((a) => a.channel_slug === slug)
    return entry != null ? entry.is_available : true
  }
  const priceFor = (slug: string): number => {
    const entry = item.area_prices?.find((a) => a.channel_slug === slug)
    if (entry) {
      const n = Number(entry.price)
      if (Number.isFinite(n)) return n
    }
    const base = Number(item.base_price)
    return Number.isFinite(base) ? base : 0
  }
  return {
    id: item.id,
    name: item.name,
    shortCode: item.short_code,
    price: priceFor('base'),
    prices: {
      pos: priceFor('base'),
      swiggy: priceFor('swiggy'),
      zomato: priceFor('zomato'),
    },
    availableOnPos: avail('base'),
    availableOnSwiggy: avail('swiggy'),
    availableOnZomato: avail('zomato'),
  }
}

export default function MenuOnOff() {
  const { encryptedOutletId } = useAuth()
  const { channels } = useMenuChannels()

  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [items, setItems] = useState<MenuItemRow[]>([])
  const [rawItems, setRawItems] = useState<Map<string, Item>>(new Map())
  const [search, setSearch] = useState('')
  const [activePlatforms, setActivePlatforms] = useState<Platform[]>([
    'pos',
    'swiggy',
    'zomato',
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    listCategoriesApi(encryptedOutletId)
      .then((cats) => {
        if (cancelled) return
        setCategories(cats)
        const stillExists = cats.some((cat) => cat.id === categoryId)
        if (cats.length > 0 && !stillExists) {
          setCategoryId(cats[0].id)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encryptedOutletId])

  const fetchAllItems = useCallback(
    async (catId: string) => {
      if (!encryptedOutletId || !catId) return
      setLoading(true)
      try {
        const cachedItems = await fetchCategoryItemsCached(
          encryptedOutletId,
          catId,
        )
        const allRows = cachedItems.map(toRow)
        const allRaw = new Map<string, Item>(
          cachedItems.map((item) => [item.id, item]),
        )
        setItems(allRows)
        setRawItems(allRaw)
      } catch {
        setItems([])
        setRawItems(new Map())
      } finally {
        setLoading(false)
      }
    },
    [encryptedOutletId],
  )

  useEffect(() => {
    if (!categoryId) return
    let cancelled = false
    void fetchAllItems(categoryId).then(() => {
      if (cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [categoryId, fetchAllItems])

  const activeCategory =
    categories.find((cat) => cat.id === categoryId) ?? categories[0]

  const filtered = useMemo(() => {
    let rows = items
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(q) ||
          row.shortCode.toLowerCase().includes(q),
      )
    }
    return rows
  }, [items, search])

  function togglePlatform(platform: Platform) {
    setActivePlatforms((prev) => {
      if (prev.includes(platform)) {
        if (prev.length === 1) return prev
        return prev.filter((p) => p !== platform)
      }
      return [...prev, platform]
    })
  }

  async function toggleItem(item: MenuItemRow, platform: Platform) {
    const slug = PLATFORM_SLUG[platform]
    const channel = channels.find((c) => c.channel_slug === slug)
    if (!channel) {
      showToast(`Channel "${PLATFORM_LABEL[platform]}" not configured`)
      return
    }

    const raw = rawItems.get(item.id)
    const existingAvailability = raw?.availability ?? []
    const newVal = !getAvailable(item, platform)

    const platformAvailability: ItemAvailability = {
      outlet_channel_id: channel.id,
      is_available: newVal,
      channel_slug: slug,
    }

    const merged: ItemAvailability[] = [
      ...existingAvailability
        .filter((a) => a.channel_slug !== slug)
        .map((a) => ({
          outlet_channel_id: a.outlet_channel_id,
          is_available: a.is_available,
          channel_slug: a.channel_slug,
        })),
      platformAvailability,
    ]

    // optimistic local flip
    const key =
      platform === 'pos'
        ? 'availableOnPos'
        : platform === 'swiggy'
          ? 'availableOnSwiggy'
          : 'availableOnZomato'
    setItems((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, [key]: newVal } : r)),
    )

    try {
      await updateItemApi(encryptedOutletId!, item.id, { availability: merged })
      invalidateMenuItems(encryptedOutletId ?? '', categoryId)
      // update the raw cache
      setRawItems((prev) => {
        const next = new Map(prev)
        const cached = next.get(item.id)
        if (cached) {
          next.set(item.id, { ...cached, availability: merged })
        }
        return next
      })
    } catch {
      showToast('Failed to update item availability')
      // revert
      setItems((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, [key]: !newVal } : r)),
      )
    }
  }

  async function toggleAllForCategory(platform: Platform, value: boolean) {
    const slug = PLATFORM_SLUG[platform]
    const channel = channels.find((c) => c.channel_slug === slug)
    if (!channel) {
      showToast(`Channel "${PLATFORM_LABEL[platform]}" not configured`)
      return
    }

    const affected = [...filtered]
    if (affected.length === 0) {
      showToast(
        `All items ${value ? 'ON' : 'OFF'} on ${PLATFORM_LABEL[platform]}`,
      )
      return
    }

    const key =
      platform === 'pos'
        ? 'availableOnPos'
        : platform === 'swiggy'
          ? 'availableOnSwiggy'
          : 'availableOnZomato'

    // optimistic flip all
    const ids = new Set(affected.map((r) => r.id))
    setItems((prev) =>
      prev.map((r) => (ids.has(r.id) ? { ...r, [key]: value } : r)),
    )

    const results = await Promise.allSettled(
      affected.map((row) => {
        const raw = rawItems.get(row.id)
        const existing = raw?.availability ?? []
        const merged: ItemAvailability[] = [
          ...existing
            .filter((a) => a.channel_slug !== slug)
            .map((a) => ({
              outlet_channel_id: a.outlet_channel_id,
              is_available: a.is_available,
              channel_slug: a.channel_slug,
            })),
          {
            outlet_channel_id: channel.id,
            is_available: value,
            channel_slug: slug,
          },
        ]
        return updateItemApi(encryptedOutletId!, row.id, { availability: merged }).then(
          () => {
            setRawItems((prev) => {
              const next = new Map(prev)
              const cached = next.get(row.id)
              if (cached) {
                next.set(row.id, { ...cached, availability: merged })
              }
              return next
            })
          },
        )
      }),
    )

    invalidateMenuItems(encryptedOutletId ?? '', categoryId)

    const failed = results.filter((r) => r.status === 'rejected').length
    if (failed > 0) {
      showToast(
        `${failed} item${failed === 1 ? '' : 's'} failed to update`,
      )
    }
    showToast(
      `All items ${value ? 'ON' : 'OFF'} on ${PLATFORM_LABEL[platform]}`,
    )
  }

  const categoryStats = useMemo(() => {
    const stats: Record<Platform, { on: number; total: number }> = {
      pos: { on: 0, total: filtered.length },
      swiggy: { on: 0, total: filtered.length },
      zomato: { on: 0, total: filtered.length },
    }
    for (const row of filtered) {
      if (getAvailable(row, 'pos')) stats.pos.on++
      if (getAvailable(row, 'swiggy')) stats.swiggy.on++
      if (getAvailable(row, 'zomato')) stats.zomato.on++
    }
    return stats
  }, [filtered])

  const gridCols = `minmax(0,1fr) ${activePlatforms.map(() => '6.5rem').join(' ')}`

  return (
    <MenuPageShell activeItem="menu-on-off" title="Menu on / off" fillViewport>

      <div className="menu-panel-viewport-fill is-fixed-height">
        <div className="menu-on-off-shell">
        {/* Category rail */}
        <aside className="menu-on-off-categories hidden md:flex">
          <p className="menu-on-off-categories-header">Categories</p>
          <ul className="menu-on-off-categories-list space-y-0.5">
            {categories.map((cat) => {
              const active = cat.id === categoryId
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`menu-on-off-category-btn ${active ? 'is-active' : ''}`}
                  >
                    <span className="line-clamp-2 leading-snug">{cat.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        <div className="menu-on-off-main">
          {/* Mobile category pills */}
          <div className="menu-on-off-main-header border-b border-line bg-page/80 px-3 py-2 md:hidden">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Categories
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => {
                const active = cat.id === categoryId
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`h-8 shrink-0 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-card text-ink hover:bg-page'
                    }`}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Toolbar */}
          <div className="menu-on-off-main-header flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{activeCategory?.name ?? ''}</p>
              <p className="text-xs text-muted">
                {loading
                  ? 'Loading...'
                  : `${filtered.length} item${filtered.length === 1 ? '' : 's'} in category`}
              </p>
            </div>
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs sm:flex-none">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="search"
                placeholder="Search items..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-9 w-full rounded-lg border border-line bg-card pl-8 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
              />
            </div>
          </div>

          {/* Platform tabs + stats */}
          <div className="menu-on-off-main-header flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2">
            <div className="flex items-center gap-1">
              {PLATFORM_TABS.map((tab) => {
                const active = activePlatforms.includes(tab.id)
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => togglePlatform(tab.id)}
                    className={`border-b-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                      active
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted hover:text-ink'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {PLATFORM_TABS.filter((tab) =>
                activePlatforms.includes(tab.id),
              ).map((tab) => (
                <span key={tab.id} className="menu-on-off-platform-stat">
                  {tab.label}{' '}
                  <strong>
                    {categoryStats[tab.id].on}/{categoryStats[tab.id].total}
                  </strong>
                </span>
              ))}
            </div>
          </div>

          {/* Bulk actions */}
          <div className="menu-on-off-main-header flex flex-wrap items-center gap-2 border-b border-line bg-page/50 px-4 py-2.5">
            <span className="text-xs font-medium text-muted">Quick actions</span>
            {activePlatforms.map((platform) => (
              <div
                key={platform}
                className="flex items-center gap-1 rounded-lg border border-line bg-card p-0.5"
              >
                <button
                  type="button"
                  onClick={() => toggleAllForCategory(platform, true)}
                  className="menu-on-off-bulk-on rounded-md px-2 py-1 text-[11px] font-semibold transition-colors"
                >
                  All {PLATFORM_LABEL[platform]} ON
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllForCategory(platform, false)}
                  className="menu-on-off-bulk-off rounded-md px-2 py-1 text-[11px] font-semibold transition-colors"
                >
                  All OFF
                </button>
              </div>
            ))}
          </div>

          {/* Column headers */}
          <div
            className="menu-on-off-main-header grid shrink-0 items-center border-b border-line bg-page/80 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted"
            style={{ gridTemplateColumns: gridCols }}
          >
            <span>Item</span>
            {activePlatforms.includes('pos') && (
              <span className="text-center">POS</span>
            )}
            {activePlatforms.includes('swiggy') && (
              <span className="text-center">Swiggy</span>
            )}
            {activePlatforms.includes('zomato') && (
              <span className="text-center">Zomato</span>
            )}
          </div>

          {/* Item list */}
          <div className="menu-on-off-items-scroll">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Badge variant="neutral" size="md">
                  {loading
                    ? 'Loading...'
                    : search
                      ? 'No matches'
                      : 'Empty category'}
                </Badge>
                <p className="text-sm text-muted">
                  {loading
                    ? 'Fetching items...'
                    : search
                      ? 'No items match your search.'
                      : 'No items in this category.'}
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="grid items-center border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-page/60"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  <div className="min-w-0 pr-3">
                    <p className="truncate text-sm font-semibold text-ink">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.shortCode}
                    </p>
                  </div>
                  {PLATFORM_TABS.filter((tab) =>
                    activePlatforms.includes(tab.id),
                  ).map((tab) => (
                    <div
                      key={tab.id}
                      className="flex flex-col items-center gap-1"
                    >
                      <Toggle
                        checked={getAvailable(item, tab.id)}
                        onToggle={() => toggleItem(item, tab.id)}
                        label={`Toggle ${item.name} on ${tab.label}`}
                      />
                      <span className="text-[11px] text-muted">
                        ₹{item.prices[tab.id].toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </div>
    </MenuPageShell>
  )
}
