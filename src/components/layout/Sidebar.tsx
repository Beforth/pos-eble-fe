import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  Boxes,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  Globe,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  PlusCircle,
  Printer,
  Settings,
  ShoppingBag,
  Smartphone,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { brand } from '../../theme/brand'
import { BrandLogo } from '../brand/BrandLogo'
import { SidebarNavItem, type NavItemDef } from './SidebarNavItem'

interface NavGroupDef {
  title: string
  items: NavItemDef[]
  addButton?: boolean
}

type NavEntry =
  | { kind: 'link'; item: NavItemDef }
  | { kind: 'group'; group: NavGroupDef }

const NAV: NavEntry[] = [
  {
    kind: 'link',
    item: { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  },
  {
    kind: 'group',
    group: {
      title: 'Daily Operations',
      items: [
        { id: 'live-orders', label: 'Live Orders', icon: Clock3 },
        { id: 'all-orders', label: 'All Orders', icon: ShoppingBag },
        { id: 'online-orders', label: 'Online Orders', icon: Globe },
        { id: 'kot', label: 'KOT', icon: Printer },
        {
          id: 'due-payments',
          label: 'Due Payment Settlement',
          icon: HandCoins,
        },
      ],
    },
  },
  {
    kind: 'link',
    item: { id: 'hyperpure', label: 'Explore Hyperpure', icon: Package },
  },
  { kind: 'link', item: { id: 'menu', label: 'Menu', icon: BookOpen } },
  { kind: 'link', item: { id: 'inventory', label: 'Inventory', icon: Boxes } },
  {
    kind: 'link',
    item: {
      id: 'marketing',
      label: 'Marketing Automation',
      icon: Megaphone,
      badge: 'New',
    },
  },
  {
    kind: 'link',
    item: { id: 'finance', label: 'Finance', icon: Wallet, badge: 'New' },
  },
  { kind: 'link', item: { id: 'reports', label: 'Reports', icon: BarChart3 } },
  {
    kind: 'link',
    item: { id: 'management', label: 'Management', icon: Settings },
  },
  { kind: 'link', item: { id: 'crm', label: 'CRM', icon: Users } },
  {
    kind: 'link',
    item: { id: 'aggregator', label: 'Aggregator Center', icon: Smartphone },
  },
  {
    kind: 'link',
    item: { id: 'logout', label: 'Logout', icon: LogOut },
  },
  {
    kind: 'group',
    group: { title: 'Quick Links', addButton: true, items: [] },
  },
]

const ROUTES: Record<string, string> = {
  dashboard: '/dashboard',
  'live-orders': '/live-orders',
  'all-orders': '/all-orders',
  'online-orders': '/online-orders',
  kot: '/kot',
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

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, onCloseMobile])

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

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
          <ul className="space-y-1">
            {NAV.map((entry) => {
              if (entry.kind === 'link') {
                return (
                  <SidebarNavItem
                    key={entry.item.id}
                    item={entry.item}
                    active={activeItem === entry.item.id}
                    collapsed={collapsed}
                    onClick={handleNavigate}
                  />
                )
              }
              const group = entry.group
              return (
                <li key={group.title} className="pt-3 first:pt-0">
                  {!collapsed && (
                    <p className="mb-1 flex items-center justify-between px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {group.title}
                      {group.addButton && (
                        <span className="flex items-center gap-1 text-primary">
                          <PlusCircle size={13} /> Add
                        </span>
                      )}
                    </p>
                  )}
                  {group.items.length > 0 && (
                    <ul className="space-y-1">
                      {group.items.map((item) => (
                        <SidebarNavItem
                          key={item.id}
                          item={item}
                          active={activeItem === item.id}
                          collapsed={collapsed}
                          onClick={handleNavigate}
                        />
                      ))}
                    </ul>
                  )}
                  {group.addButton && !collapsed && (
                    <button
                      type="button"
                      onClick={() => handleNavigate('add')}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-accent/60 px-3 py-2 text-xs font-medium text-accent transition-colors hover:bg-accent/5"
                    >
                      <PlusCircle size={14} /> Add
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-line px-4 py-3">
          {collapsed ? (
            <div className="flex justify-center">
              <span className="text-[10px] font-semibold text-muted">R®</span>
            </div>
          ) : (
            <p className="text-center text-[10px] text-muted">
              {brand.shopName} · {brand.tagline}
            </p>
          )}
        </div>
      </aside>
    </>
  )
}
