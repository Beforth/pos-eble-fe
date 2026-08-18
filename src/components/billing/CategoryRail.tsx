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
    <>
      {/* ── Phone / small tablet: horizontal pill strip ── */}
      <div className="flex shrink-0 flex-col border-b border-line bg-card md:hidden">
        <div className="border-b border-line bg-page/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Categories
        </div>
        <nav className="overflow-x-auto">
          <ul className="flex gap-1.5 px-2 py-2">
            {categories.map((cat) => {
              const active = cat.id === activeId
              return (
                <li key={cat.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelect(cat.id)}
                    className={`h-8 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-ink text-white shadow-sm'
                        : cat.id === 'favorites'
                          ? 'bg-success/10 text-success hover:bg-success/20'
                          : 'bg-page text-ink hover:bg-line'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* ── md+ (tablet / desktop): original vertical sidebar ── */}
      <aside className="hidden w-[148px] shrink-0 flex-col overflow-hidden border-r border-line bg-card md:flex sm:w-[168px]">
        <div className="border-b border-line bg-page/80 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Categories
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          <ul className="space-y-1 p-1.5">
            {categories.map((cat, index) => {
              const active = cat.id === activeId
              return (
                <li
                  key={cat.id}
                  className={
                    active ? 'category-rail-item-active' : 'category-rail-item'
                  }
                  style={{ animationDelay: `${Math.min(index, 14) * 40}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(cat.id)}
                    className={`group relative w-full overflow-hidden rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-300 ease-out will-change-transform ${
                      active
                        ? 'translate-x-1 scale-[1.02] bg-page font-semibold text-ink shadow-[0_4px_14px_rgba(0,0,0,0.06)] before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-r before:bg-ink before:transition-all before:duration-300'
                        : cat.id === 'favorites'
                          ? 'bg-success/10 font-medium text-success hover:translate-x-1 hover:scale-[1.02] hover:bg-success/20 hover:shadow-[0_4px_14px_rgba(22,163,74,0.12)]'
                          : cat.id === 'all-categories'
                            ? 'bg-page/70 font-medium text-ink hover:translate-x-1 hover:scale-[1.02] hover:bg-page hover:shadow-[0_4px_14px_rgba(0,0,0,0.06)]'
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
    </>
  )
}
