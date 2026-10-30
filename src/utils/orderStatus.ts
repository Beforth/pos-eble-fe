import type { OrderStatus } from '../mocks/allOrdersData'

/** True for a bill that is still open: saved or printed, not yet paid or cancelled. */
export function isUnpaid(status: OrderStatus): boolean {
  return status === 'Saved' || status === 'Printed'
}
