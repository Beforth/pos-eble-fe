import { forwardRef, useCallback, type ComponentProps } from 'react'
import {
  Link as RouterLink,
  useLocation,
  useNavigate as useRouterNavigate,
  type NavigateOptions,
  type To,
} from 'react-router-dom'

/** Counter copy of the inventory pages: `/billing/inventory/...`. */
export const BILLING_INVENTORY_PREFIX = '/billing/inventory'

export function isBillingInventoryPath(pathname: string): boolean {
  return pathname === BILLING_INVENTORY_PREFIX || pathname.startsWith(`${BILLING_INVENTORY_PREFIX}/`)
}

/**
 * The inventory pages are shared by the admin area (`/inventory/...`) and the
 * counter (`/billing/inventory/...`) and link to each other with `/inventory/...`
 * addresses. Inside the billing copy those links must stay in billing, so every
 * `/inventory...` target is moved under `/billing`; elsewhere targets pass through.
 */
export function scopeInventoryTo(to: To, billing: boolean): To {
  if (!billing) return to
  const rewrite = (path: string) =>
    path === '/inventory' || path.startsWith('/inventory/') || path.startsWith('/inventory?')
      ? `/billing${path}`
      : path
  if (typeof to === 'string') return rewrite(to)
  return to.pathname ? { ...to, pathname: rewrite(to.pathname) } : to
}

/** `useNavigate` that keeps billing users inside `/billing/inventory/...`. */
export function useNavigate() {
  const navigate = useRouterNavigate()
  const billing = isBillingInventoryPath(useLocation().pathname)
  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') return navigate(to)
      return navigate(scopeInventoryTo(to, billing), options)
    },
    [navigate, billing],
  )
}

/** `Link` that keeps billing users inside `/billing/inventory/...`. */
export const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof RouterLink>>(
  function InventoryLink({ to, ...rest }, ref) {
    const billing = isBillingInventoryPath(useLocation().pathname)
    return <RouterLink ref={ref} to={scopeInventoryTo(to, billing)} {...rest} />
  },
)
