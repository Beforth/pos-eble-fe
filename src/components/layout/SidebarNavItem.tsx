import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

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
  /** React Router path — used so the item always navigates. */
  to?: string
  /** Indent under a section group (Daily Operations children). */
  nested?: boolean
  expanded?: boolean
  onToggleExpand?: () => void
  /** Highlight nested child when it matches the current route. */
  activeChildId?: string
  /** Shared expand state for nested sections (e.g. Management > Configuration). */
  expandedIds?: Set<string>
  onToggleExpandId?: (id: string) => void
}

function isDescendantActive(
  item: NavItemDef,
  activeChildId?: string,
): boolean {
  if (!activeChildId) return false
  if (item.id === activeChildId) return true
  return Boolean(
    item.children?.some((child) => isDescendantActive(child, activeChildId)),
  )
}

function NestedNavList({
  items,
  depth,
  activeChildId,
  expandedIds,
  onToggleExpandId,
  onClick,
}: {
  items: NavItemDef[]
  depth: number
  activeChildId?: string
  expandedIds?: Set<string>
  onToggleExpandId?: (id: string) => void
  onClick: (id: string) => void
}) {
  const paddingLeft = depth === 1 ? 'pl-8' : depth === 2 ? 'pl-12' : 'pl-16'

  return (
    <ul className="mt-0.5 space-y-0.5">
      {items.map((child) => {
        const ChildIcon = child.icon
        const hasNested = Boolean(child.children?.length)
        const nestedExpanded = expandedIds?.has(child.id) ?? false
        const childActive =
          activeChildId === child.id ||
          isDescendantActive(child, activeChildId)

        return (
          <li key={child.id}>
            <button
              type="button"
              aria-current={activeChildId === child.id ? 'page' : undefined}
              aria-expanded={hasNested ? nestedExpanded : undefined}
              onClick={() => {
                if (hasNested && onToggleExpandId) {
                  onToggleExpandId(child.id)
                  return
                }
                onClick(child.id)
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${paddingLeft} ${
                childActive
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-ink hover:bg-page'
              }`}
            >
              {ChildIcon ? (
                <ChildIcon
                  size={depth === 1 ? 17 : 16}
                  strokeWidth={childActive ? 2.2 : 1.75}
                  className={`shrink-0 ${childActive ? 'text-primary' : 'text-muted'}`}
                />
              ) : null}
              <span className="min-w-0 flex-1 truncate text-left">
                {child.label}
              </span>
              {child.badge ? (
                <span className="shrink-0 rounded-md bg-[#e8e0f5] px-1.5 py-0.5 text-[10px] font-semibold text-[#5b4fcf]">
                  {child.badge}
                </span>
              ) : null}
              {hasNested || child.chevron ? (
                <ChevronRight
                  size={14}
                  className={`shrink-0 text-muted transition-transform duration-200 ${
                    nestedExpanded ? 'rotate-90' : ''
                  }`}
                />
              ) : null}
            </button>

            {hasNested && nestedExpanded ? (
              <NestedNavList
                items={child.children!}
                depth={depth + 1}
                activeChildId={activeChildId}
                expandedIds={expandedIds}
                onToggleExpandId={onToggleExpandId}
                onClick={onClick}
              />
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function SidebarNavItem({
  item,
  active,
  collapsed,
  onClick,
  to,
  nested = false,
  expanded = false,
  onToggleExpand,
  activeChildId,
  expandedIds,
  onToggleExpandId,
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

  const className = `group flex w-full items-center gap-2.5 rounded-lg text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
    collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
  } ${nested && !collapsed ? 'pl-3' : ''} ${
    active
      ? 'bg-primary/10 font-semibold text-primary'
      : item.accent
        ? 'border border-dashed border-accent/60 text-accent hover:bg-accent/5'
        : 'text-ink hover:bg-page'
  }`

  const content = (
    <>
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
    </>
  )

  return (
    <li>
      {to && !isExpandable ? (
        <Link
          to={to}
          title={collapsed ? item.label : undefined}
          aria-current={active ? 'page' : undefined}
          onClick={() => onClick(item.id)}
          className={className}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          title={collapsed ? item.label : undefined}
          aria-current={active ? 'page' : undefined}
          aria-expanded={item.children?.length ? expanded : undefined}
          onClick={handleClick}
          className={className}
        >
          {content}
        </button>
      )}

      {!collapsed && expanded && item.children && item.children.length > 0 ? (
        <NestedNavList
          items={item.children}
          depth={1}
          activeChildId={activeChildId}
          expandedIds={expandedIds}
          onToggleExpandId={onToggleExpandId}
          onClick={onClick}
        />
      ) : null}
    </li>
  )
}
