import { useEffect, useMemo, useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import type { MenuItemRow } from '../../utils/menuAdapter'
import { getDietType } from '../../utils/dietType'
import {
  SelectDropdown,
  type SelectDropdownOption,
} from '../common/SelectDropdown'

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
  /**
   * When given, every card carries a heart button; clicking it adds the item
   * to Favorite Items, or removes it when it is already there.
   */
  onToggleFavorite?: (item: MenuItemRow) => void
  /**
   * Every id currently in Favorite Items, marked by hand or an automatic best
   * seller: those hearts are solid red, all others a grey outline. Without
   * it, only items marked by hand count.
   */
  favoriteIds?: Set<string>
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
  onToggleFavorite,
  favoriteIds,
  showOpenItem = false,
  onOpenItemClick,
}: ItemGridProps) {
  const hasItems = items.length > 0
  const showEmpty = !hasItems && !showOpenItem
  const [tapFlash, setTapFlash] = useState<{ id: string; key: number } | null>(
    null,
  )

  const categoryFilterOptions = useMemo<SelectDropdownOption[]>(
    () => [
      { value: 'all', label: 'All Categories' },
      ...categoryOptions.map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [categoryOptions],
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
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line bg-card px-3 py-3 sm:py-2.5">
        {/* Category select — hidden on phone (CategoryRail strip handles it), shown md+ */}
        <div className="hidden md:block">
          <SelectDropdown
            value={categoryFilter}
            options={categoryFilterOptions}
            onChange={onCategoryFilterChange}
            caption="Select category"
            placeholder="All Categories"
            searchPlaceholder="Search category"
            className="w-full"
            triggerClassName="h-9 min-w-[130px] w-full justify-between"
          />
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-2.5 sm:min-w-[260px] sm:flex-row sm:items-center sm:gap-2">
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
            className="box-border h-12 min-h-12 w-full min-w-0 appearance-none rounded-lg border border-line bg-card px-3 py-3 text-base leading-normal text-ink outline-none placeholder:text-muted focus:border-primary sm:h-9 sm:min-h-9 sm:flex-1 sm:py-0 sm:text-sm"
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
            className="box-border h-12 min-h-12 w-full min-w-0 appearance-none rounded-lg border border-line bg-card px-3 py-3 text-base leading-normal text-ink outline-none placeholder:text-muted focus:border-primary sm:h-9 sm:min-h-9 sm:flex-1 sm:py-0 sm:text-sm"
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
              // solid red = in Favorite Items (by hand or best seller);
              // grey outline = not a favorite.
              const inFavorites = favoriteIds
                ? favoriteIds.has(item.id)
                : Boolean(item.isFavorite)
              return (
                <li key={item.id} className="relative">
                  <button
                    type="button"
                    disabled={!item.available}
                    onClick={() => handleItemClick(item)}
                    aria-pressed={selected}
                    className={`billing-item-card relative flex h-[72px] w-full items-center overflow-hidden rounded-xl border pl-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                      onToggleFavorite ? 'pr-10' : 'pr-8'
                    } ${
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
                        {showFavoriteHeart && !onToggleFavorite ? (
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
                  <span className="pointer-events-none absolute right-2.5 top-2.5 z-10">
                    <DietMark type={diet} />
                  </span>
                  {onToggleFavorite ? (
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(item)}
                      aria-pressed={inFavorites}
                      aria-label={
                        inFavorites
                          ? `Remove ${item.name} from Favorite Items`
                          : `Add ${item.name} to Favorite Items`
                      }
                      data-tooltip={
                        inFavorites
                          ? 'Remove from Favorite Items'
                          : 'Add to Favorite Items'
                      }
                      className={`absolute bottom-1 right-1.5 z-10 flex size-7 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-page focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                        inFavorites ? 'text-primary' : 'text-muted hover:text-primary'
                      }`}
                    >
                      <Heart
                        size={16}
                        strokeWidth={1.75}
                        className={inFavorites ? 'fill-primary' : 'fill-transparent'}
                      />
                    </button>
                  ) : null}
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
