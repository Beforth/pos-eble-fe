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
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                    cat.id === 'favorites'
                      ? active
                        ? 'bg-success/20 font-semibold text-success'
                        : 'bg-success/10 font-medium text-success hover:bg-success/15'
                      : active
                        ? 'bg-primary/10 font-semibold text-primary'
                        : 'text-ink hover:bg-page'
                  }`}
                >
                  <span className="line-clamp-2 leading-snug">{cat.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
