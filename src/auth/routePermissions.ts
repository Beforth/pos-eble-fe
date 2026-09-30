/**
 * Maps a frontend pathname prefix to the Django URL name whose permission gate
 * applies to that screen. The codename itself is resolved from the backend
 * catalog (`screens`), so permission names live in one place.
 *
 * Longest prefix wins. Pathnames not listed here are admin-only: the route
 * guard requires `outlets.view_outlet` (see `OUTLET_GATE_PERMISSION`), so a
 * screen is reachable for non-admin users only once it is mapped here. The
 * backend still enforces its own permissions on top of this.
 */
const PATH_URL_NAMES: Record<string, string> = {
  '/billing/day-end': 'day-end-list',
  '/captain-orders/day-end': 'day-end-list',
  '/day-end': 'day-end-list',
  '/billing/kot': 'kot-list',
  '/captain-orders/kot': 'kot-list',
  '/kot': 'kot-list',
  '/billing/live-orders': 'live-orders',
  '/captain-orders/live-orders': 'live-orders',
  '/live-orders': 'live-orders',
  '/online-orders': 'advance-order-list',
  '/due-payments': 'order-due-collect',
  '/billing': 'order-list',
  '/captain-orders': 'order-list',
  '/all-orders': 'order-list',
  '/table-view': 'order-list',
  '/menu/taxes': 'menu-taxes',
  '/menu/tables': 'menu-dining-tables',
  '/menu/addons': 'menu-addon-groups',
  '/menu/variants': 'menu-addon-groups',
  '/menu/multi-item-images': 'menu-item-images',
  '/menu/add-item': 'menu-items',
  '/menu/categories': 'menu-items',
  '/menu/add-combo': 'menu-combos',
  '/menu/add-commission': 'menu-item-commissions',
  '/menu/discounts': 'menu-discounts',
  '/menu': 'menu-discounts',
  '/configuration/customers': 'customer-list',
  '/screens': 'screen-list',
  '/reports/day-end-summary': 'day-end-list',
}

/** Outlet permission that grants access to every gated screen (hybrid gate). */
export const OUTLET_GATE_PERMISSION = 'outlets.view_outlet'

/** Qualified catalog right that marks a user as a billing operator. */
export const BILLING_RIGHT_CODENAME = 'accounts.pos_allow_billing_rights'

/**
 * Landing screen for a freshly-fetched permission list (no React state).
 * Admins land on /dashboard, billers on /table-view, everyone else on
 * /profile (which is always open).
 */
export function homePathFor(permissions: string[]): string {
  if (permissions.includes(OUTLET_GATE_PERMISSION)) return '/dashboard'
  if (permissions.includes(BILLING_RIGHT_CODENAME)) return '/table-view'
  return '/profile'
}

/** Resolve the Django URL name governing a pathname, or null when unmapped. */
export function resolveUrlName(pathname: string): string | null {
  let best: string | null = null
  for (const prefix of Object.keys(PATH_URL_NAMES)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (best === null || prefix.length > best.length) {
        best = prefix
      }
    }
  }
  return best === null ? null : PATH_URL_NAMES[best]
}
