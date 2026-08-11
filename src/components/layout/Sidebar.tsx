import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgePercent,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  CookingPot,
  FileCheck,
  Globe,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  SlidersHorizontal,
  Upload,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { brand } from '../../theme/brand'
import { BrandLogo } from '../brand/BrandLogo'
import { SidebarNavItem, type NavItemDef } from './SidebarNavItem'

interface NavGroupDef {
  title: string
  items: NavItemDef[]
}

type NavEntry =
  | { kind: 'link'; item: NavItemDef }
  | { kind: 'group'; group: NavGroupDef }
  | { kind: 'divider' }

const NAV: NavEntry[] = [
  {
    kind: 'link',
    item: { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  },
  { kind: 'divider' },
  {
    kind: 'group',
    group: {
      title: 'Daily Operations',
      items: [
        { id: 'live-orders', label: 'Live Orders', icon: Clock3 },
        { id: 'all-orders', label: 'All Orders', icon: ShoppingBag },
        { id: 'online-orders', label: 'Online Orders', icon: Globe },
        { id: 'kot', label: 'KOT', icon: CookingPot },
        {
          id: 'due-payments',
          label: 'Due Payment Settlement',
          icon: FileCheck,
        },
      ],
    },
  },
  { kind: 'divider' },
  {
    kind: 'link',
    item: {
      id: 'menu',
      label: 'Menu',
      icon: BookOpen,
      chevron: true,
      children: [
        {
          id: 'menu-discounts',
          label: 'Menu & Discounts',
          icon: BadgePercent,
        },
        {
          id: 'menu-images-upload',
          label: 'Multi-Item Images Upload',
          icon: Upload,
        },
        {
          id: 'menu-on-off',
          label: 'Menu on/off',
          icon: SlidersHorizontal,
        },
      ],
    },
  },
  { kind: 'divider' },
  {
    kind: 'link',
    item: { id: 'inventory', label: 'Inventory' },
  },
  { kind: 'divider' },
  {
    kind: 'link',
    item: {
      id: 'marketing',
      label: 'Marketing Automation',
      badge: 'New',
    },
  },
  { kind: 'divider' },
  {
    kind: 'link',
    item: { id: 'finance', label: 'Finance', badge: 'New' },
  },
  { kind: 'divider' },
  {
    kind: 'link',
    item: { id: 'reports', label: 'Reports', chevron: true },
  },
  { kind: 'divider' },
  {
    kind: 'link',
    item: { id: 'management', label: 'Management', chevron: true },
  },
  { kind: 'divider' },
  {
    kind: 'link',
    item: { id: 'crm', label: 'CRM', chevron: true },
  },
  { kind: 'divider' },
  {
    kind: 'link',
    item: { id: 'aggregator', label: 'Aggregator Center', chevron: true },
  },
]

const ROUTES: Record<string, string> = {
  dashboard: '/dashboard',
  'live-orders': '/live-orders',
  'all-orders': '/all-orders',
  'online-orders': '/online-orders',
  kot: '/kot',
  'menu-discounts': '/menu',
  'menu-images-upload': '/menu/multi-item-images',
  inventory: '/inventory',
}

interface SidebarProps {
  collapsed: boolean
  mobileOpen: boolean
  onToggleCollapse: () => void
  onCloseMobile: () => void
  activeItem: string
  onNavigate?: (id: string) => void
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  activeItem,
  onNavigate,
}: SidebarProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, onCloseMobile])

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleNavigate(id: string) {
    onCloseMobile()
    if (id === 'logout') {
      logout()
      navigate('/login', { replace: true })
      return
    }
    onNavigate?.(id)
    const path = ROUTES[id]
    if (path) navigate(path)
  }

  const widthClass = collapsed ? 'lg:w-[76px]' : 'lg:w-[264px]'

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-card transition-all duration-300 lg:z-30 lg:translate-x-0 ${widthClass} w-[264px] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center gap-2.5 border-b border-line px-3">
          {collapsed ? (
            <div className="flex w-full justify-center">
              <BrandLogo size={36} />
            </div>
          ) : (
            <>
              <BrandLogo size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold leading-tight text-ink">
                  {brand.shortName}
                </p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-primary">
                  POS
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-muted hover:bg-page lg:hidden"
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>

        <div
          className={`hidden border-b border-line lg:flex ${collapsed ? 'justify-center' : 'justify-end'}`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="m-2 rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            {collapsed ? (
              <ChevronsRight size={16} />
            ) : (
              <ChevronsLeft size={16} />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2">
          <ul className="space-y-0.5">
            {NAV.map((entry, index) => {
              if (entry.kind === 'divider') {
                return (
                  <li
                    key={`divider-${index}`}
                    aria-hidden="true"
                    className="my-1.5 border-t border-line"
                  />
                )
              }

              if (entry.kind === 'link') {
                return (
                  <SidebarNavItem
                    key={entry.item.id}
                    item={entry.item}
                    active={
                      activeItem === entry.item.id ||
                      Boolean(
                        entry.item.children?.some(
                          (child) => child.id === activeItem,
                        ),
                      )
                    }
                    collapsed={collapsed}
                    onClick={handleNavigate}
                    expanded={expandedIds.has(entry.item.id)}
                    onToggleExpand={() => toggleExpanded(entry.item.id)}
                  />
                )
              }

              const group = entry.group
              return (
                <li key={group.title} className="space-y-0.5">
                  {!collapsed ? (
                    <p className="mb-1 rounded-lg bg-page px-3 py-2 text-sm font-bold text-ink">
                      {group.title}
                    </p>
                  ) : (
                    <p className="mb-1 px-1 text-center text-[9px] font-semibold uppercase tracking-wide text-muted">
                      Ops
                    </p>
                  )}
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <SidebarNavItem
                        key={item.id}
                        item={item}
                        active={activeItem === item.id}
                        collapsed={collapsed}
                        nested
                        onClick={handleNavigate}
                      />
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-line px-2.5 py-2">
          <button
            type="button"
            onClick={() => handleNavigate('logout')}
            title={collapsed ? 'Logout' : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-page hover:text-ink ${
              collapsed ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut size={18} strokeWidth={1.75} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          {!collapsed && (
            <p className="mt-1 px-1 pb-1 text-center text-[10px] text-muted">
              {brand.shopName}
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
