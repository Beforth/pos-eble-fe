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
    <aside className="flex w-[148px] shrink-0 flex-col overflow-hidden bg-ink sm:w-[168px]">
      <div className="border-b border-white/10 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white/50">
        Categories
      </div>
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        <ul>
          {categories.map((cat) => {
            const active = cat.id === activeId
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => onSelect(cat.id)}
                  className={`w-full border-b border-white/5 px-3 py-3 text-left text-sm transition-colors ${
                    active
                      ? 'bg-primary font-semibold text-white'
                      : cat.id === 'favorites'
                        ? 'bg-success/25 font-medium text-white hover:bg-success/35'
                        : 'text-white/85 hover:bg-white/10'
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
