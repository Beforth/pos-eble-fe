import type { LucideIcon } from 'lucide-react'
import { Badge } from '../common/Badge'

export interface NavItemDef {
  id: string
  label: string
  icon: LucideIcon
  badge?: string
  /** Dashed accent style, e.g. the "+Add" quick link. */
  accent?: boolean
}

interface SidebarNavItemProps {
  item: NavItemDef
  active: boolean
  collapsed: boolean
  onClick: (id: string) => void
}

export function SidebarNavItem({
  item,
  active,
  collapsed,
  onClick,
}: SidebarNavItemProps) {
  const Icon = item.icon

  return (
    <li>
      <button
        type="button"
        title={collapsed ? item.label : undefined}
        aria-current={active ? 'page' : undefined}
        onClick={() => onClick(item.id)}
        className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
          collapsed ? 'justify-center px-0' : ''
        } ${
          active
            ? 'bg-primary/10 font-semibold text-primary'
            : item.accent
              ? 'border border-dashed border-accent/60 text-accent hover:bg-accent/5'
              : 'text-muted hover:bg-page hover:text-ink'
        }`}
      >
        {active && !collapsed && (
          <span className="absolute -left-3 h-5 w-1 rounded-r bg-primary" />
        )}
        <Icon
          size={18}
          strokeWidth={active ? 2.2 : 1.8}
          className="shrink-0"
        />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-left">
              {item.label}
            </span>
            {item.badge && (
              <Badge variant="secondary" size="sm">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </button>
    </li>
  )
}
