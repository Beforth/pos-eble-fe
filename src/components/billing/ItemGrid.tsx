import { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import type { MenuItemRow } from '../../mocks/menuItemsData'
import { getDietType } from '../../utils/dietType'

interface ItemGridProps {
  items: MenuItemRow[]
  categoryFilter: string
  search: string
  shortCode: string
  onCategoryFilterChange: (value: string) => void
  onSearchChange: (value: string) => void
  onShortCodeChange: (value: string) => void
  onSearchSubmit?: () => void
  onShortCodeSubmit?: () => void
  categoryOptions: { id: string; name: string }[]
  onAddItem: (item: MenuItemRow) => void
  /** Qty already in cart keyed by menu item id. */
  selectedQtyByItemId?: Record<string, number>
  /** Show pink heart on cards (Favorite Items section). */
  showFavoriteHeart?: boolean
  /** Show Open Item tile at the end (Favorite Items section). */
  showOpenItem?: boolean
  onOpenItemClick?: () => void
}

type DietType = 'veg' | 'non-veg' | 'egg'

const DietMark = ({ type }: { type: DietType }) => {
  const styles =
    type === 'egg'
      ? {
          box: 'border-secondary',
          dot: 'bg-secondary',
          label: 'Egg',
        }
      : type === 'non-veg'
        ? {
            box: 'border-primary',
            dot: 'bg-primary',
            label: 'Non-veg',
          }
        : {
            box: 'border-success',
            dot: 'bg-success',
            label: 'Veg',
          }

  return (
    <span
      title={styles.label}
      aria-label={styles.label}
      className={`inline-flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border ${styles.box}`}
    >
      <span className={`size-1.5 rounded-full ${styles.dot}`} />
    </span>
  )
}

export function ItemGrid({
  items,
  categoryFilter,
  search,
  shortCode,
  onCategoryFilterChange,
  onSearchChange,
  onShortCodeChange,
  onSearchSubmit,
  onShortCodeSubmit,
  categoryOptions,
  onAddItem,
  selectedQtyByItemId = {},
  showFavoriteHeart = false,
  showOpenItem = false,
  onOpenItemClick,
}: ItemGridProps) {
  const hasItems = items.length > 0
  const showEmpty = !hasItems && !showOpenItem
  const [tapFlash, setTapFlash] = useState<{ id: string; key: number } | null>(
    null,
  )
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    }
  }, [])

  function handleItemClick(item: MenuItemRow) {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    setTapFlash((prev) => ({
      id: item.id,
      key: (prev?.id === item.id ? prev.key : 0) + 1,
    }))
    clickTimerRef.current = setTimeout(() => setTapFlash(null), 320)
    onAddItem(item)
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-page">
      {/* Search / filter bar — stacks on phone, row on tablet+ */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-card px-3 py-2.5">
        {/* Category select — hidden on phone (CategoryRail strip handles it), shown md+ */}
        <select
          value={categoryFilter}
          onChange={(event) => onCategoryFilterChange(event.target.value)}
          className="hidden h-9 min-w-[130px] rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary md:block"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <div className="flex min-w-[260px] flex-1 items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onSearchSubmit?.()
              }
            }}
            placeholder="Search item (Enter to add)"
            className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
          />
          <input
            type="search"
            value={shortCode}
            onChange={(event) => onShortCodeChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onShortCodeSubmit?.()
              }
            }}
            placeholder="Short Code (Enter)"
            className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-3">
        {showEmpty ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted">
            No items match your filters
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 xl:grid-cols-4 2xl:grid-cols-5">
            {items.map((item) => {
              const diet = getDietType(item.tags, item.name)
              const selectedQty = selectedQtyByItemId[item.id] ?? 0
              const selected = selectedQty > 0
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() => handleItemClick(item)}
                    aria-pressed={selected}
                    className={`billing-item-card relative flex h-[72px] w-full items-center overflow-hidden rounded-xl border px-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                      selected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-line bg-card hover:border-primary/40'
                    }`}
                  >
                    {tapFlash?.id === item.id ? (
                      <span
                        key={tapFlash.key}
                        className="billing-item-tap-flash"
                        aria-hidden
                      />
                    ) : null}
                    <span className="relative flex min-w-0 flex-1 items-center gap-2">
                      <span className="min-w-0 flex-1">
                        <span
                          className={`line-clamp-2 text-sm font-semibold leading-snug ${
                            selected ? 'text-primary' : 'text-ink'
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">
                          ₹{item.price}
                          {item.shortCode ? ` · ${item.shortCode}` : ''}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-center justify-center gap-1">
                        <DietMark type={diet} />
                        {showFavoriteHeart ? (
                          <span aria-hidden className="text-primary">
                            <Heart
                              size={14}
                              className="fill-primary text-primary"
                              strokeWidth={1.5}
                            />
                          </span>
                        ) : null}
                        {selected ? (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
                            {selectedQty}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}

            {showOpenItem ? (
              <li>
                <button
                  type="button"
                  onClick={onOpenItemClick}
                  className="relative flex h-[72px] w-full items-center overflow-hidden rounded-xl border border-line bg-card px-3 text-left"
                >
                  <span className="relative flex min-w-0 flex-1 items-center gap-2">
                    <span className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-ink">
                        Open Item
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        00
                      </span>
                    </span>
                    <span aria-hidden className="shrink-0 text-primary">
                      <Heart
                        size={14}
                        className="fill-primary text-primary"
                        strokeWidth={1.5}
                      />
                    </span>
                  </span>
                </button>
              </li>
            ) : null}
          </ul>
        )}
      </div>
    </section>
  )
}
