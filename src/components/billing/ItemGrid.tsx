import { Heart } from 'lucide-react'
import type { MenuItemRow } from '../../mocks/menuItemsData'

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
  /** Show pink heart on cards (Favorite Items section). */
  showFavoriteHeart?: boolean
  /** Show Open Item tile at the end (Favorite Items section). */
  showOpenItem?: boolean
  onOpenItemClick?: () => void
}

type DietType = 'veg' | 'non-veg' | 'egg'

function getDietType(tags: string[], name: string): DietType {
  const tagSet = tags.map((t) => t.toLowerCase())
  const lowerName = name.toLowerCase()

  const isEgg =
    tagSet.some((t) => t === 'e' || t === 'egg' || t.includes('egg')) ||
    /\begg\b/.test(lowerName)

  const isNonVeg =
    tagSet.some(
      (t) =>
        t === 'n' ||
        t === 'nv' ||
        t === 'non-veg' ||
        t === 'nonveg' ||
        t.includes('non-veg'),
    ) ||
    /\b(chicken|mutton|fish|prawn|meat|keema|non[\s-]?veg)\b/.test(lowerName)

  if (isEgg) return 'egg'
  if (isNonVeg) return 'non-veg'
  return 'veg'
}

function DietMark({ type }: { type: DietType }) {
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
  showFavoriteHeart = false,
  showOpenItem = false,
  onOpenItemClick,
}: ItemGridProps) {
  const hasItems = items.length > 0
  const showEmpty = !hasItems && !showOpenItem

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-page">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-card px-3 py-2.5">
        <select
          value={categoryFilter}
          onChange={(event) => onCategoryFilterChange(event.target.value)}
          className="h-9 min-w-[140px] rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
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
          className="h-9 min-w-[140px] flex-1 rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
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
          className="h-9 w-[140px] rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {showEmpty ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted">
            No items match your filters
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {items.map((item, index) => {
              const diet = getDietType(item.tags, item.name)
              return (
                <li
                  key={item.id}
                  className="billing-item-card"
                  style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}
                >
                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() => onAddItem(item)}
                    className={`group relative flex h-[72px] w-full items-center overflow-hidden rounded-xl border border-line bg-card px-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out will-change-transform disabled:cursor-not-allowed disabled:opacity-45 ${
                      item.available
                        ? 'hover:-translate-y-1 hover:scale-[1.02] hover:border-line hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]'
                        : ''
                    }`}
                  >
                    <span className="billing-item-shine" aria-hidden />
                    <span className="relative flex min-w-0 flex-1 items-center gap-2">
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition-colors duration-200">
                          {item.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted transition-transform duration-300 group-hover:translate-x-0.5">
                          ₹{item.price}
                          {item.shortCode ? ` · ${item.shortCode}` : ''}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-center justify-center gap-1.5">
                        <DietMark type={diet} />
                        {showFavoriteHeart ? (
                          <span aria-hidden className="text-primary">
                            <Heart
                              size={14}
                              className="fill-primary text-primary drop-shadow-sm"
                              strokeWidth={1.5}
                            />
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}

            {showOpenItem ? (
              <li
                className="billing-item-card"
                style={{
                  animationDelay: `${Math.min(items.length, 20) * 30}ms`,
                }}
              >
                <button
                  type="button"
                  onClick={onOpenItemClick}
                  className="group relative flex h-[72px] w-full items-center overflow-hidden rounded-xl border border-line bg-card px-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                >
                  <span className="billing-item-shine" aria-hidden />
                  <span className="relative flex min-w-0 flex-1 items-center gap-2">
                    <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
                      Open Item
                    </span>
                    <span aria-hidden className="shrink-0 text-primary">
                      <Heart
                        size={14}
                        className="fill-primary text-primary drop-shadow-sm"
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
