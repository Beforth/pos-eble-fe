import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

export interface NavItemDef {
  id: string
  label: string
  icon?: LucideIcon
  badge?: string
  /** Show a right chevron (expandable section). */
  chevron?: boolean
  /** Nested items shown when this row is expanded. */
  children?: NavItemDef[]
  /** Dashed accent style, e.g. the "+Add" quick link. */
  accent?: boolean
}

interface SidebarNavItemProps {
  item: NavItemDef
  active: boolean
  collapsed: boolean
  onClick: (id: string) => void
  /** Indent under a section group (Daily Operations children). */
  nested?: boolean
  expanded?: boolean
  onToggleExpand?: () => void
}

export function SidebarNavItem({
  item,
  active,
  collapsed,
  onClick,
  nested = false,
  expanded = false,
  onToggleExpand,
}: SidebarNavItemProps) {
  const Icon = item.icon
  const isExpandable = Boolean(item.children?.length) || item.chevron

  function handleClick() {
    if (item.children?.length && onToggleExpand) {
      onToggleExpand()
      return
    }
    onClick(item.id)
  }

  return (
    <li>
      <button
        type="button"
        title={collapsed ? item.label : undefined}
        aria-current={active ? 'page' : undefined}
        aria-expanded={item.children?.length ? expanded : undefined}
        onClick={handleClick}
        className={`group flex w-full items-center gap-2.5 rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
          collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
        } ${nested && !collapsed ? 'pl-3' : ''} ${
          active
            ? 'bg-primary/10 font-semibold text-primary'
            : item.accent
              ? 'border border-dashed border-accent/60 text-accent hover:bg-accent/5'
              : 'text-ink hover:bg-page'
        }`}
      >
        {Icon ? (
          <Icon
            size={18}
            strokeWidth={active ? 2.2 : 1.75}
            className={`shrink-0 ${active ? 'text-primary' : 'text-muted'}`}
          />
        ) : (
          !collapsed && <span className="w-[18px] shrink-0" />
        )}
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
            {item.badge ? (
              <span className="shrink-0 rounded-md bg-[#e8e0f5] px-1.5 py-0.5 text-[10px] font-semibold text-[#5b4fcf]">
                {item.badge}
              </span>
            ) : null}
            {isExpandable ? (
              <ChevronRight
                size={16}
                className={`shrink-0 text-muted transition-transform duration-200 ${
                  expanded ? 'rotate-90' : ''
                }`}
              />
            ) : null}
          </>
        )}
      </button>

      {!collapsed && expanded && item.children && item.children.length > 0 ? (
        <ul className="mt-0.5 space-y-0.5">
          {item.children.map((child) => {
            const ChildIcon = child.icon
            return (
              <li key={child.id}>
                <button
                  type="button"
                  onClick={() => onClick(child.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-page"
                >
                  {ChildIcon ? (
                    <ChildIcon
                      size={17}
                      strokeWidth={1.75}
                      className="shrink-0 text-muted"
                    />
                  ) : null}
                  <span className="truncate text-left">{child.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </li>
  )
}
