import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Badge } from '../components/common/Badge'
import { MenuPageShell } from '../components/layout/MenuPageShell'
import {
  baseMenuCategories,
  getStoredMenuItems,
  menuItems,
  type MenuItemRow,
} from '../mocks/menuItemsData'

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

function getAvailable(item: MenuItemRow, platform: Platform): boolean {
  if (platform === 'pos') return item.availableOnPos ?? item.available
  if (platform === 'swiggy') return item.availableOnSwiggy ?? item.available
  return item.availableOnZomato ?? item.available
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

export default function MenuOnOff() {
  const [items, setItems] = useState<MenuItemRow[]>(() => [
    ...menuItems,
    ...getStoredMenuItems(),
  ])
  const [categoryId, setCategoryId] = useState('c1')
  const [search, setSearch] = useState('')
  const [activePlatforms, setActivePlatforms] = useState<Platform[]>([
    'pos',
    'swiggy',
    'zomato',
  ])
  const [toast, setToast] = useState<string | null>(null)

  const activeCategory =
    baseMenuCategories.find((cat) => cat.id === categoryId) ??
    baseMenuCategories[0]

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  const filtered = useMemo(() => {
    let rows = items.filter((row) => row.categoryId === categoryId)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (row) =>
          row.name.toLowerCase().includes(q) ||
          row.shortCode.toLowerCase().includes(q),
      )
    }
    return rows
  }, [items, categoryId, search])

  function togglePlatform(platform: Platform) {
    setActivePlatforms((prev) => {
      if (prev.includes(platform)) {
        if (prev.length === 1) return prev
        return prev.filter((p) => p !== platform)
      }
      return [...prev, platform]
    })
  }

  function toggleItem(item: MenuItemRow, platform: Platform) {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== item.id) return row
        const key =
          platform === 'pos'
            ? 'availableOnPos'
            : platform === 'swiggy'
              ? 'availableOnSwiggy'
              : 'availableOnZomato'
        return { ...row, [key]: !getAvailable(row, platform) }
      }),
    )
  }

  function toggleAllForCategory(platform: Platform, value: boolean) {
    const ids = new Set(filtered.map((row) => row.id))
    setItems((prev) =>
      prev.map((row) => {
        if (!ids.has(row.id)) return row
        const key =
          platform === 'pos'
            ? 'availableOnPos'
            : platform === 'swiggy'
              ? 'availableOnSwiggy'
              : 'availableOnZomato'
        return { ...row, [key]: value }
      }),
    )
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
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="menu-panel-viewport-fill is-fixed-height">
        <div className="menu-on-off-shell">
        {/* Category rail */}
        <aside className="menu-on-off-categories hidden md:flex">
          <p className="menu-on-off-categories-header">Categories</p>
          <ul className="menu-on-off-categories-list space-y-0.5">
            {baseMenuCategories.map((cat) => {
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
              {baseMenuCategories.map((cat) => {
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
              <p className="text-sm font-semibold text-ink">{activeCategory.name}</p>
              <p className="text-xs text-muted">
                {filtered.length} item{filtered.length === 1 ? '' : 's'} in category
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
                  {search ? 'No matches' : 'Empty category'}
                </Badge>
                <p className="text-sm text-muted">
                  {search
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
                      {item.shortCode} · ₹{item.price.toFixed(1)}
                    </p>
                  </div>
                  {activePlatforms.includes('pos') && (
                    <div className="flex justify-center">
                      <Toggle
                        checked={getAvailable(item, 'pos')}
                        onToggle={() => toggleItem(item, 'pos')}
                        label={`Toggle ${item.name} on POS`}
                      />
                    </div>
                  )}
                  {activePlatforms.includes('swiggy') && (
                    <div className="flex justify-center">
                      <Toggle
                        checked={getAvailable(item, 'swiggy')}
                        onToggle={() => toggleItem(item, 'swiggy')}
                        label={`Toggle ${item.name} on Swiggy`}
                      />
                    </div>
                  )}
                  {activePlatforms.includes('zomato') && (
                    <div className="flex justify-center">
                      <Toggle
                        checked={getAvailable(item, 'zomato')}
                        onToggle={() => toggleItem(item, 'zomato')}
                        label={`Toggle ${item.name} on Zomato`}
                      />
                    </div>
                  )}
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
