/**
 * Deep links from the Live Orders boards into the order-taking screen.
 *
 * `base` is the screen root: `/billing` for a biller, `/captain-orders` for a
 * captain (a captain is denied the billing right and would be bounced off
 * `/billing`) — the same rule `billingUrlForKot` follows for KOT rows.
 */

/** Open an existing order in the cart so the cashier can save & settle it. */
export function billingUrlForOrder(orderId: string, base = '/billing'): string {
  return `${base}?openOrder=${encodeURIComponent(orderId)}`
}

/** Open a kitchen ticket in billing pinned on the bill. */
export function billingUrlForKotId(kotId: string, base = '/billing'): string {
  return `${base}?openKot=${encodeURIComponent(kotId)}`
}