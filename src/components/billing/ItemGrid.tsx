import type { MenuItemRow } from '../../mocks/menuItemsData'

interface ItemGridProps {
  items: MenuItemRow[]
  categoryFilter: string
  search: string
  shortCode: string
  onCategoryFilterChange: (value: string) => void
  onSearchChange: (value: string) => void
  onShortCodeChange: (value: string) => void
  categoryOptions: { id: string; name: string }[]
  onAddItem: (item: MenuItemRow) => void
}

function stripeClass(tags: string[]) {
  if (tags.some((t) => t === 'N' || t === 'NV' || t.toLowerCase() === 'non-veg')) {
    return 'bg-primary'
  }
  return 'bg-success'
}

export function ItemGrid({
  items,
  categoryFilter,
  search,
  shortCode,
  onCategoryFilterChange,
  onSearchChange,
  onShortCodeChange,
  categoryOptions,
  onAddItem,
}: ItemGridProps) {
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
          placeholder="Search item"
          className="h-9 min-w-[140px] flex-1 rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
        />
        <input
          type="search"
          value={shortCode}
          onChange={(event) => onShortCodeChange(event.target.value)}
          placeholder="Short Code"
          className="h-9 w-[120px] rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted">
            No items match your filters
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={!item.available}
                  onClick={() => onAddItem(item)}
                  className={`relative flex h-[72px] w-full items-center overflow-hidden rounded-lg border border-line bg-card pl-2.5 pr-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45 ${
                    item.available ? 'hover:border-primary/40' : ''
                  }`}
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-1 ${stripeClass(item.tags)}`}
                  />
                  <span className="min-w-0 pl-1.5">
                    <span className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
                      {item.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      ₹{item.price}
                      {item.shortCode ? ` · ${item.shortCode}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
