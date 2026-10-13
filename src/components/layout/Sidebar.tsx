import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BadgePercent,
  BarChart3,
  BookOpen,
  Calculator,
  ChefHat,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  CookingPot,
  FileCheck,
  FileText,
  Globe,
  History,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
  Upload,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { isCashierUser } from '../../auth/routePermissions'
import { Avatar } from '../common/Avatar'
import { brand } from '../../theme/brand'
import { BrandLogo } from '../brand/BrandLogo'
import { SidebarNavItem, type NavItemDef } from './SidebarNavItem'
import { useChrome } from '../../state/ChromeContext'

interface NavGroupDef {
  title: string
  items: NavItemDef[]
}

type NavEntry =
  | { kind: 'link'; item: NavItemDef }
  | { kind: 'group'; group: NavGroupDef }
  | { kind: 'divider' }

/**
 * Top-level sections a cashier never sees, matching the prefixes in
 * `isCashierRestrictedPath`.
 *
 * These three carry no `ROUTES` entry, so `filterNavEntry` returns them (and
 * their whole child tree) unfiltered — the `canAccess` check cannot drop them.
 * Giving them a route would be the real fix, but that also changes what a
 * biller and a captain see, so for now the cashier restriction is applied here
 * by id.
 */
const CASHIER_HIDDEN_NAV_IDS = new Set(['menu', 'reports', 'management'])

/** Keep a nav entry only when the user can access at least one of its routes. */
function filterNavEntry(
  entry: NavEntry,
  canAccess: (pathname: string) => boolean,
): NavEntry | null {
  if (entry.kind === 'divider') return entry
  if (entry.kind === 'group') {
    const items = entry.group.items.filter((item) =>
      canAccess(ROUTES[item.id] ?? ''),
    )
    return items.length > 0 ? { ...entry, group: { ...entry.group, items } } : null
  }
  const path = ROUTES[entry.item.id]
  if (!path) return entry
  if (entry.item.children) {
    const children = entry.item.children
      .map((child) => ({ child, path: ROUTES[child.id] }))
      .filter(({ child: _child, path: childPath }) =>
        childPath ? canAccess(childPath) : true,
      )
      .map(({ child }) => child)
    if (children.length === 0) return null
    return { ...entry, item: { ...entry.item, children } }
  }
  return canAccess(path) ? entry : null
}

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
        { id: 'billing', label: 'Billing', icon: UtensilsCrossed },
        { id: 'captain-orders', label: 'Captain Orders', icon: ChefHat },
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
    item: { id: 'inventory', label: 'Inventory', icon: Package },
  },
  { kind: 'divider' },
  {
    kind: 'link',
    item: { id: 'finance', label: 'Finance', icon: IndianRupee },
  },
  { kind: 'divider' },
  {
    kind: 'link',
    item: {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      chevron: true,
      children: [
        {
          id: 'day-end-summary',
          label: 'Day End Summary',
          icon: FileText,
        },
        {
          id: 'other-reports',
          label: 'Other Reports',
          icon: History,
        },
        {
          id: 'report-notification',
          label: 'Report Notification',
          icon: BarChart3,
        },
        {
          id: 'delivery-management',
          label: 'Delivery Management',
          icon: Truck,
        },
      ],
    },
  },
  { kind: 'divider' },
  {
    kind: 'link',
    item: {
      id: 'management',
      label: 'Management',
      icon: Settings,
      chevron: true,
      children: [
        {
          id: 'mgmt-configuration',
          label: 'Configuration',
          icon: Settings,
          chevron: true,
          children: [
            {
              id: 'config-outlet',
              label: 'Outlet Configuration',
            },
            {
              id: 'config-sub-order-type',
              label: 'Sub Order Type',
            },
            {
              id: 'config-delivery-distance',
              label: 'Delivery Distance',
            },
            {
              id: 'config-area-locality-delivery',
              label: 'Area/Locality Wise Delivery Charges',
            },
            {
              id: 'config-floor-plan',
              label: 'Floor Plan',
            },
            {
              id: 'config-email-template',
              label: 'Email Template Settings',
            },
          ],
        },
        {
          id: 'mgmt-accounting',
          label: 'Accounting',
          icon: Calculator,
          chevron: true,
          children: [
            {
              id: 'acct-payments',
              label: 'Payments',
              chevron: true,
              children: [
                {
                  id: 'acct-payment-information',
                  label: 'Payment Information',
                },
                {
                  id: 'acct-virtual-wallet',
                  label: 'Virtual Wallet',
                },
              ],
            },
            {
              id: 'acct-online-order-reconciliation',
              label: 'Online Order Reconciliation',
            },
            {
              id: 'acct-gst-information',
              label: 'GST Information',
            },
            {
              id: 'acct-utility-bills',
              label: 'Utility Bills',
            },
            {
              id: 'acct-expense-withdrawal',
              label: 'Expense & Withdrawal',
            },
            {
              id: 'acct-service-payment-history',
              label: 'Service Payment History',
            },
            {
              id: 'acct-denomination',
              label: 'Denomination',
            },
          ],
        },
        {
          id: 'mgmt-user-management',
          label: 'User Management',
          chevron: true,
          children: [
            {
              id: 'user-mgmt-biller-app',
              label: 'Biller App',
            },
            {
              id: 'user-mgmt-roles',
              label: 'Roles',
            },
          ],
        },
        {
          id: 'mgmt-user-logs',
          label: 'User Logs',
          chevron: true,
          children: [
            {
              id: 'user-logs-online-store',
              label: 'Online Store Logs',
            },
            {
              id: 'user-logs-online-item-on-off',
              label: 'Online Item On/Off Logs',
            },
            {
              id: 'user-logs-auto-accept-change',
              label: 'Auto Accept Change Logs',
            },
            {
              id: 'user-logs-support-mgmt',
              label: 'Support Management',
            },
            {
              id: 'user-logs-notification',
              label: 'Notification',
            },
            {
              id: 'user-logs-menu-trigger',
              label: 'Menu Trigger Logs',
            },
            {
              id: 'user-logs-closing-hour',
              label: 'Closing Hour Logs',
            },
            {
              id: 'user-logs-expense',
              label: 'Expense Logs',
            },
            {
              id: 'user-logs-withdrawal',
              label: 'Withdrawal Logs',
            },
            {
              id: 'user-logs-cash-top-up',
              label: 'Cash Top-Up Logs',
            },
          ],
        },
        {
          id: 'mgmt-marketplace-setting',
          label: 'Marketplace Settings',
        },
        {
          id: 'mgmt-audit-trail',
          label: 'Audit Trail',
        },
        {
          id: 'mgmt-device-mapping',
          label: 'Device Mapping',
        },
      ],
    },
  },
  { kind: 'divider' },
]

const ROUTES: Record<string, string> = {
  dashboard: '/dashboard',
  billing: '/billing',
  'captain-orders': '/captain-orders',
  'live-orders': '/live-orders',
  'all-orders': '/all-orders',
  'online-orders': '/online-orders',
  kot: '/kot',
  'due-payments': '/due-payments',
  'menu-discounts': '/menu',
  'menu-images-upload': '/menu/multi-item-images',
  'menu-on-off': '/menu/menu-on-off',
  inventory: '/inventory',
  marketing: '/marketing',
  finance: '/finance',
  'day-end-summary': '/reports/day-end-summary',
  'other-reports': '/reports/other-reports',
  'report-notification': '/reports/report-notification',
  'delivery-management': '/reports/delivery-management',
  'mgmt-user-management': '/management/user-management',
  'user-mgmt-biller-app': '/management/user-management/biller-app',
  'user-mgmt-roles': '/management/user-management/roles',
  'mgmt-user-logs': '/management/user-logs/online-store',
  'user-logs-online-store': '/management/user-logs/online-store',
  'user-logs-online-item-on-off': '/management/user-logs/online-item-on-off',
  'user-logs-auto-accept-change': '/management/user-logs/auto-accept-change',
  'user-logs-support-mgmt': '/management/user-logs/support-management',
  'user-logs-notification': '/management/user-logs/notification',
  'user-logs-menu-trigger': '/management/user-logs/menu-trigger',
  'user-logs-closing-hour': '/management/user-logs/closing-hour',
  'user-logs-expense': '/management/user-logs/expense',
  'user-logs-withdrawal': '/management/user-logs/withdrawal',
  'user-logs-cash-top-up': '/management/user-logs/cash-top-up',
  'mgmt-marketplace-setting':
    '/management/explore-products/marketplace-setting',
  'mgmt-audit-trail': '/management/audit-trail',
  'mgmt-device-mapping': '/management/device-mapping',
  'config-outlet': '/management/configuration/outlet',
  'config-sub-order-type': '/management/configuration/sub-order-type',
  'config-delivery-distance': '/management/configuration/delivery-distance',
  'config-area-locality-delivery':
    '/management/configuration/area-locality-delivery',
  'config-floor-plan': '/management/configuration/floor-plan',
  'config-email-template': '/management/configuration/email-template',
  'acct-payment-information': '/management/accounting/payment-information',
  'acct-virtual-wallet': '/management/accounting/virtual-wallet',
  'acct-online-order-reconciliation':
    '/management/accounting/online-order-reconciliation',
  'acct-gst-information': '/management/accounting/gst-information',
  'acct-utility-bills': '/management/accounting/utility-bills',
  'acct-expense-withdrawal': '/management/accounting/expense-withdrawal',
  'acct-service-payment-history':
    '/management/accounting/service-payment-history',
  'acct-denomination': '/management/accounting/denomination',
}

const AUTO_EXPAND_PARENTS: Record<string, string[]> = {
  'menu-discounts': ['menu'],
  'menu-images-upload': ['menu'],
  'menu-on-off': ['menu'],
  'day-end-summary': ['reports'],
  'other-reports': ['reports'],
  'report-notification': ['reports'],
  'delivery-management': ['reports'],
  'mgmt-user-management': ['management'],
  'user-mgmt-biller-app': ['management', 'mgmt-user-management'],
  'user-mgmt-roles': ['management', 'mgmt-user-management'],
  'mgmt-user-logs': ['management'],
  'user-logs-online-store': ['management', 'mgmt-user-logs'],
  'user-logs-online-item-on-off': ['management', 'mgmt-user-logs'],
  'user-logs-auto-accept-change': ['management', 'mgmt-user-logs'],
  'user-logs-support-mgmt': ['management', 'mgmt-user-logs'],
  'user-logs-notification': ['management', 'mgmt-user-logs'],
  'user-logs-menu-trigger': ['management', 'mgmt-user-logs'],
  'user-logs-closing-hour': ['management', 'mgmt-user-logs'],
  'user-logs-expense': ['management', 'mgmt-user-logs'],
  'user-logs-withdrawal': ['management', 'mgmt-user-logs'],
  'user-logs-cash-top-up': ['management', 'mgmt-user-logs'],
  'mgmt-marketplace-setting': ['management'],
  'mgmt-audit-trail': ['management'],
  'mgmt-device-mapping': ['management'],
  'mgmt-configuration': ['management'],
  'mgmt-accounting': ['management'],
  'acct-payments': ['management', 'mgmt-accounting'],
  'config-outlet': ['management', 'mgmt-configuration'],
  'config-sub-order-type': ['management', 'mgmt-configuration'],
  'config-delivery-distance': ['management', 'mgmt-configuration'],
  'config-area-locality-delivery': ['management', 'mgmt-configuration'],
  'config-floor-plan': ['management', 'mgmt-configuration'],
  'config-email-template': ['management', 'mgmt-configuration'],
  'acct-payment-information': [
    'management',
    'mgmt-accounting',
    'acct-payments',
  ],
  'acct-virtual-wallet': ['management', 'mgmt-accounting', 'acct-payments'],
  'acct-online-order-reconciliation': ['management', 'mgmt-accounting'],
  'acct-gst-information': ['management', 'mgmt-accounting'],
  'acct-utility-bills': ['management', 'mgmt-accounting'],
  'acct-expense-withdrawal': ['management', 'mgmt-accounting'],
  'acct-service-payment-history': ['management', 'mgmt-accounting'],
  'acct-denomination': ['management', 'mgmt-accounting'],
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
  const { logout, canAccess, user } = useAuth()
  const {
    expanded,
    toggleExpanded: toggleExpandedInStore,
    mergeExpanded,
    navScroll,
    setNavScroll,
  } = useChrome()
  const cashier = isCashierUser(user)
  const visibleNav = NAV.filter(
    (entry) =>
      // A cashier's nav collapses to the Daily Operations group, so the dividers
      // that separated the hidden sections would render as a stack of empty
      // lines. Drop them for a cashier only; other roles keep their separators.
      !(cashier && entry.kind === 'divider') &&
      !(cashier && entry.kind === 'link' && CASHIER_HIDDEN_NAV_IDS.has(entry.item.id)) &&
      filterNavEntry(entry, canAccess) !== null,
  )
  const expandedIds = useMemo(() => new Set(expanded.main), [expanded.main])

  useEffect(() => {
    const parents = AUTO_EXPAND_PARENTS[activeItem]
    if (parents?.length) mergeExpanded('main', parents)
  }, [activeItem, mergeExpanded])

  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = navRef.current
    if (el && el.scrollTop !== navScroll.main) {
      el.scrollTop = navScroll.main
    }
  }, [navScroll.main])

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseMobile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, onCloseMobile])

  function toggleExpanded(id: string) {
    toggleExpandedInStore('main', id)
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
                data-tooltip="Close menu"
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
            className="m-2 cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            {collapsed ? (
              <ChevronsRight size={16} />
            ) : (
              <ChevronsLeft size={16} />
            )}
          </button>
        </div>

        <nav
          ref={navRef}
          onScroll={(e) => setNavScroll('main', e.currentTarget.scrollTop)}
          className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-2"
        >
          <ul className="space-y-0.5">
            {visibleNav.map((entry, index) => {
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
                    to={ROUTES[entry.item.id]}
                    active={
                      activeItem === entry.item.id ||
                      Boolean(
                        entry.item.children?.some((child) => {
                          if (child.id === activeItem) return true
                          return child.children?.some((grand) => {
                            if (grand.id === activeItem) return true
                            return grand.children?.some(
                              (leaf) => leaf.id === activeItem,
                            )
                          })
                        }),
                      )
                    }
                    activeChildId={activeItem}
                    collapsed={collapsed}
                    onClick={handleNavigate}
                    expanded={expandedIds.has(entry.item.id)}
                    onToggleExpand={() => toggleExpanded(entry.item.id)}
                    expandedIds={expandedIds}
                    onToggleExpandId={toggleExpanded}
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
                        to={ROUTES[item.id]}
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
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
                <Avatar src={user?.photoUrl} name={user?.name ?? brand.shopName} size="sm" />
              <button
                type="button"
                onClick={() => handleNavigate('logout')}
                data-tooltip="Logout"
                aria-label="Logout"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-page hover:text-ink"
              >
                <LogOut size={18} strokeWidth={1.75} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex w-full items-center gap-2.5 px-3 py-2.5">
              <Avatar src={user?.photoUrl} name={user?.name ?? brand.shopName} size="sm" />
                <span
                  className="min-w-0 flex-1 truncate text-sm font-medium text-ink"
                  title={user?.name}
                >
                  {user?.name ?? brand.shopName}
                </span>
                <button
                  type="button"
                  onClick={() => handleNavigate('logout')}
                  data-tooltip="Logout"
                  aria-label="Logout"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-page hover:text-ink"
                >
                  <LogOut size={18} strokeWidth={1.75} />
                </button>
              </div>
              <p className="mt-1 px-1 pb-1 text-center text-[10px] text-muted">
                {brand.shopName}
              </p>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
