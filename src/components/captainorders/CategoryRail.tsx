interface CategoryRailProps {
  categories: { id: string; name: string }[]
  activeId: string
  onSelect: (id: string) => void
}

export function CategoryRail({
  categories,
  activeId,
  onSelect,
}: CategoryRailProps) {
  return (
    <aside className="flex w-[148px] shrink-0 flex-col overflow-hidden border-r border-line bg-card sm:w-[168px]">
      <div className="border-b border-line px-2.5 py-2">
        <p className="rounded-lg bg-page px-3 py-2 text-sm font-bold text-ink">
          Categories
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2">
        <ul className="space-y-0.5">
          {categories.map((cat) => {
            const active = cat.id === activeId
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onSelect(cat.id)}
                  className={`group relative w-full overflow-hidden rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-300 ease-out will-change-transform focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                    active
                      ? 'bg-primary/10 font-semibold text-primary shadow-[0_4px_14px_rgba(255,9,23,0.12)] before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-r before:bg-primary'
                      : cat.id === 'favorites'
                        ? 'bg-primary/5 font-medium text-primary hover:translate-x-1 hover:scale-[1.02] hover:bg-primary/10 hover:shadow-[0_4px_14px_rgba(255,9,23,0.12)]'
                        : 'text-ink hover:translate-x-1 hover:scale-[1.02] hover:bg-page hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  <span className="category-rail-shine" aria-hidden />
                  <span className="relative line-clamp-2 leading-snug transition-transform duration-300 group-hover:translate-x-0.5">
                    {cat.name}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
