import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
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

function getAvailable(item: MenuItemRow, platform: Platform): boolean {
  if (platform === 'pos') return item.availableOnPos ?? item.available
  if (platform === 'swiggy') return item.availableOnSwiggy ?? item.available
  return item.availableOnZomato ?? item.available
}

function Toggle({
  checked,
  onToggle,
}: {
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? 'bg-success' : 'bg-muted'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
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

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  const filtered = useMemo(() => {
    let rows = items.filter((r) => r.categoryId === categoryId)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.shortCode.toLowerCase().includes(q),
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
    const ids = new Set(filtered.map((r) => r.id))
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
      `All items ${value ? 'ON' : 'OFF'} on ${platform === 'pos' ? 'POS' : platform === 'swiggy' ? 'Swiggy' : 'Zomato'}`,
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

  return (
    <MenuPageShell activeItem="menu-on-off" title="Menu on / off">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="flex overflow-hidden rounded-lg border border-line bg-card">
        {/* Category sidebar */}
        <aside className="flex h-[calc(100vh-240px)] min-h-[360px] w-56 shrink-0 flex-col border-r border-line bg-page/40">
          <div className="shrink-0 border-b border-line px-3 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Categories
            </p>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto py-2">
            {baseMenuCategories.map((cat) => {
              const active = cat.id === categoryId
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-ink hover:bg-page'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
            {/* Platform tabs */}
            <div className="flex items-center gap-1 rounded-lg bg-page p-1">
              {PLATFORM_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => togglePlatform(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activePlatforms.includes(tab.id)
                      ? 'bg-card text-ink shadow-sm'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative ml-auto">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-52 rounded-lg border border-line bg-page pl-8 pr-3 text-sm text-ink placeholder-muted focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_repeat(3,100px)] items-center border-b border-line bg-page/40 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">
            <span>Item</span>
            {activePlatforms.includes('pos') && (
              <span className="text-center">
                POS{' '}
                <span className="text-muted">
                  {categoryStats.pos.on}/{categoryStats.pos.total}
                </span>
              </span>
            )}
            {activePlatforms.includes('swiggy') && (
              <span className="text-center">
                Swiggy{' '}
                <span className="text-muted">
                  {categoryStats.swiggy.on}/{categoryStats.swiggy.total}
                </span>
              </span>
            )}
            {activePlatforms.includes('zomato') && (
              <span className="text-center">
                Zomato{' '}
                <span className="text-muted">
                  {categoryStats.zomato.on}/{categoryStats.zomato.total}
                </span>
              </span>
            )}
          </div>

          {/* Quick actions row */}
          <div className="flex items-center gap-2 border-b border-line px-4 py-2">
            <span className="text-xs text-muted">Quick:</span>
            {activePlatforms.map((p) => (
              <span key={p} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleAllForCategory(p, true)}
                  className="rounded bg-success/10 px-2 py-0.5 text-xs font-medium text-success transition-colors hover:bg-success/20"
                >
                  All {p === 'pos' ? 'POS' : p === 'swiggy' ? 'Swiggy' : 'Zomato'} ON
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllForCategory(p, false)}
                  className="rounded bg-danger/10 px-2 py-0.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20"
                >
                  All OFF
                </button>
              </span>
            ))}
          </div>

          {/* Item list */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-sm text-muted">
                {search
                  ? 'No items match your search.'
                  : 'No items in this category.'}
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_repeat(3,100px)] items-center border-b border-line px-4 py-3 last:border-b-0 hover:bg-page/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted">
                      {item.shortCode} &middot; ₹{item.price}
                    </p>
                  </div>
                  {activePlatforms.includes('pos') && (
                    <div className="flex justify-center">
                      <Toggle
                        checked={getAvailable(item, 'pos')}
                        onToggle={() => toggleItem(item, 'pos')}
                      />
                    </div>
                  )}
                  {activePlatforms.includes('swiggy') && (
                    <div className="flex justify-center">
                      <Toggle
                        checked={getAvailable(item, 'swiggy')}
                        onToggle={() => toggleItem(item, 'swiggy')}
                      />
                    </div>
                  )}
                  {activePlatforms.includes('zomato') && (
                    <div className="flex justify-center">
                      <Toggle
                        checked={getAvailable(item, 'zomato')}
                        onToggle={() => toggleItem(item, 'zomato')}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MenuPageShell>
  )
}
