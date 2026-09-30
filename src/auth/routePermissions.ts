import type { AuthUser } from '../services/authService'

/** Outlet permission that grants access to every gated screen (hybrid gate). */
export const OUTLET_GATE_PERMISSION = 'outlets.view_outlet'

/** Qualified catalog right that marks a user as a billing operator. */
export const BILLING_RIGHT_CODENAME = 'accounts.pos_allow_billing_rights'

/**
 * Captain Orders right (the floor order-taking board, `/captain-orders`).
 * Mirrors `accounts.permissions.CAPTAIN_ORDER_CODENAME` on the backend.
 */
export const CAPTAIN_ORDER_CODENAME = 'accounts.kot_kot_management_read'

/**
 * Table-view right (the floor plan, `/table-view`).
 * Mirrors `accounts.permissions.TABLE_VIEW_READ_CODENAME` on the backend.
 */
export const TABLE_VIEW_READ_CODENAME = 'accounts.cfg_area_table_management_read'

/**
 * Right to take money on an order — the backend gate for `order-settle`. A
 * captain is denied it, so screens hide their payment and settlement controls
 * rather than offering actions that would 403.
 */
export const SETTLE_CODENAME = 'accounts.pos_settle_save'

/** Captain-mode floor plan: `?from=captain` makes TableView open captain orders. */
export const CAPTAIN_TABLE_VIEW_PATH = '/table-view?from=captain'

/**
 * All Orders board — a cashier's landing screen. Same path the sidebar's
 * "All Orders" entry uses, so the nav item is highlighted on arrival.
 */
export const ALL_ORDERS_PATH = '/all-orders'

/**
 * True for a floor captain: holds the captain-order right but is denied the
 * billing right, so Billing is closed to them and Captain Orders is the only
 * order-taking screen they can open.
 */
export function isCaptainOnly(permissions: string[]): boolean {
  return (
    !permissions.includes(BILLING_RIGHT_CODENAME) &&
    permissions.includes(CAPTAIN_ORDER_CODENAME)
  )
}

/**
 * True for a cashier: the counter billing role, which lands on the All Orders
 * board instead of the floor plan.
 *
 * Mirrors `isAdminUser` — matches the custom role's `code`/`name` or the outlet
 * group name, case-insensitively — so it keys on the role, never on the
 * username. A user in the `Billing User` group whose name happens to contain
 * "cashier" is still a biller and still lands on `/table-view`.
 */
export function isCashierUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false
  const roleCode = user.role?.code?.trim().toLowerCase()
  const roleName = user.role?.name?.trim().toLowerCase()
  if (roleCode === 'cashier' || roleName === 'cashier') return true
  return user.groups.some((group) => group.trim().toLowerCase() === 'cashier')
}

/**
 * How a screen is gated: either a Django URL name, whose codename is resolved
 * from the backend catalog (`screens`) so permission names live in one place,
 * or an explicit qualified codename.
 *
 * The explicit form exists for screens that share ONE API endpoint. `/billing`
 * and `/captain-orders` both drive the `order-list` route, and the backend
 * resolves that route's gate from the URL name — so it sees one gate for both
 * and cannot tell the screens apart. The Billing/Captain split is therefore a
 * frontend routing concern, spelled out here.
 */
type ScreenGate = string | { codename: string }

/**
 * Maps a frontend pathname prefix to the gate that applies to that screen.
 *
 * Longest prefix wins. Pathnames not listed here are admin-only: the route
 * guard requires `outlets.view_outlet` (see `OUTLET_GATE_PERMISSION`), so a
 * screen is reachable for non-admin users only once it is mapped here. The
 * backend still enforces its own permissions on top of this.
 */
const PATH_URL_NAMES: Record<string, ScreenGate> = {
  '/billing/day-end': 'day-end-list',
  '/day-end': 'day-end-list',
  '/billing/kot': 'kot-list',
  '/captain-orders/kot': 'kot-list',
  '/kot': 'kot-list',
  '/billing/live-orders': 'live-orders',
  '/captain-orders/live-orders': 'live-orders',
  '/live-orders': 'live-orders',
  '/online-orders': 'advance-order-list',
  '/due-payments': 'order-due-collect',
  '/billing': { codename: BILLING_RIGHT_CODENAME },
  '/captain-orders': { codename: CAPTAIN_ORDER_CODENAME },
  '/all-orders': 'order-list',
  '/table-view': { codename: TABLE_VIEW_READ_CODENAME },
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

/**
 * Landing screen for a freshly-fetched permission list (no React state).
 * Admins land on /dashboard, a cashier on the All Orders board, billers on
 * /table-view, a captain on the floor plan in captain mode, everyone else on
 * /profile (which is always open).
 *
 * `user` is optional so a caller holding only a permission list can still use
 * this; without it a cashier is indistinguishable from any other biller and
 * gets `/table-view`.
 */
export function homePathFor(
  permissions: string[],
  user?: AuthUser | null,
): string {
  if (permissions.includes(OUTLET_GATE_PERMISSION)) return '/dashboard'
  // A captain is denied the billing right but holds the captain-order right:
  // the floor plan in captain mode is the only screen that suits them.
  if (isCaptainOnly(permissions)) return CAPTAIN_TABLE_VIEW_PATH
  // A cashier is a billing operator, so the All Orders board is open to them and
  // is the screen their sidebar entry points at. Guarded on the billing right
  // because that is what gates `/all-orders` (`order-list`): sending a cashier
  // whose group was hand-edited to drop that right here would land them on a
  // screen ProtectedRoute refuses, which bounces to homePath() and loops.
  if (isCashierUser(user) && permissions.includes(BILLING_RIGHT_CODENAME)) {
    return ALL_ORDERS_PATH
  }
  if (permissions.includes(BILLING_RIGHT_CODENAME)) return '/table-view'
  return '/profile'
}

/** Drop `?query` / `#hash` so `/table-view?from=captain` matches `/table-view`. */
function stripQuery(pathname: string): string {
  const cut = pathname.search(/[?#]/)
  return cut === -1 ? pathname : pathname.slice(0, cut)
}

/**
 * Sections a cashier never sees. Menu, Reports and Management hold outlet
 * configuration and reporting, which a counter role does not own — the cashier
 * template grants no `cfg_*` right for them.
 *
 * This is a role rule, not a permission one, so it is deliberately kept out of
 * `PATH_URL_NAMES`: a cashier-only prefix must not strip the menu screens from
 * a biller, who legitimately reads items through `pos_item_master_read`.
 * `canAccess` consults it, which closes the routes as well as the nav.
 */
const CASHIER_RESTRICTED_PREFIXES = ['/menu', '/reports', '/management']

/** True when a pathname sits inside a section hidden from cashiers. */
export function isCashierRestrictedPath(pathname: string): boolean {
  const path = stripQuery(pathname)
  return CASHIER_RESTRICTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  )
}

/** Resolve the gate governing a pathname, or null when unmapped. */
export function resolveScreenGate(pathname: string): ScreenGate | null {
  const path = stripQuery(pathname)
  let best: string | null = null
  for (const prefix of Object.keys(PATH_URL_NAMES)) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      if (best === null || prefix.length > best.length) {
        best = prefix
      }
    }
  }
  return best === null ? null : PATH_URL_NAMES[best]
}

/**
 * Qualified codename a pathname requires, or null when it is not gated.
 * `screens` is the backend catalog (URL name → codename); an explicit gate
 * ignores it, which also keeps billing/captain/table-view fail-closed when that
 * best-effort fetch fails.
 */
export function resolveRequiredCodename(
  pathname: string,
  screens: Record<string, string>,
): string | null {
  const gate = resolveScreenGate(pathname)
  if (typeof gate === 'string') return screens[gate] ?? null
  if (gate) return gate.codename
  // Fail closed: a screen is reachable for non-admin users only once it is
  // mapped in PATH_URL_NAMES. `/profile` is the one always-open exception.
  if (stripQuery(pathname) === '/profile') return null
  return OUTLET_GATE_PERMISSION
}
