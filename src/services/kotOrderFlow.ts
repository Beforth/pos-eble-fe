import type { KotTicket } from '../mocks/kotViewData'
import type { TaxBreakdownLine } from '../utils/taxEngine'
import { getTableSession, upsertTableSession } from '../utils/tableStatusStore'
import {
  adoptOrderKotsApi,
  createOrderApi,
  settleOrderApi,
  updateOrderApi,
  type CreateKotPayload,
  type OrderDto,
  type OrderItemPayload,
  type OrderType,
  type KotDto,
} from './orderService'

export interface KotOrderItems {
  /** Order line items (full-replaced on create / each edit). */
  items: OrderItemPayload[]
  my_amount: number
  tax: number
  tax_breakdown: TaxBreakdownLine[]
  round_off: number
  discount: number
  grand_total: number
}

/** Tax totals supplied by the caller (priced by the shared tax engine).
 *  Omit for a tax-free cart. */
export interface KotTaxTotals {
  tax: number
  taxBreakdown: TaxBreakdownLine[]
  /** The forward-only slice added on top of `my_amount`. */
  addedToTotal: number
  roundOff?: number
}

/** Build order line-items + money totals for one or more KOT tickets
 *  (the union of every ticket on the table — the running bill).
 *
 *  Tax is *not* invented here: this function used to apply a hardcoded 5% that
 *  never matched the bill panel, which left phantom dues. The caller passes the
 *  engine-priced totals so the running order, the printed bill and the money
 *  step all agree. */
export function kotItemsForOrder(
  tickets: KotTicket[],
  tax?: KotTaxTotals,
): KotOrderItems {
  const itemMap = new Map<string, OrderItemPayload>()
  for (const ticket of tickets) {
    for (const item of ticket.items) {
      const key = `${item.itemId ?? item.name}|${item.price}|${item.note ?? ''}`
      const existing = itemMap.get(key)
      if (existing) {
        existing.qty += item.qty
        existing.total_price = Math.round(existing.qty * item.price * 100) / 100
      } else {
        itemMap.set(key, {
          name: item.name,
          note: item.note,
          qty: item.qty,
          unit_price: item.price,
          total_price: Math.round(item.price * item.qty * 100) / 100,
        })
      }
    }
  }
  const items = [...itemMap.values()]
  const myAmount = Math.round(
    items.reduce((sum, i) => sum + (i.total_price ?? 0), 0) * 100,
  ) / 100
  const taxTotal = tax?.tax ?? 0
  const roundOff = tax?.roundOff ?? 0
  const grandTotal =
    Math.round((myAmount + (tax?.addedToTotal ?? 0) + roundOff) * 100) / 100
  return {
    items,
    my_amount: myAmount,
    tax: taxTotal,
    tax_breakdown: tax?.taxBreakdown ?? [],
    round_off: roundOff,
    discount: 0,
    grand_total: grandTotal,
  }
}

/** The newest KOT in an order echo (order.kots is ordered `-created`). */
export function newestKotOf(order: OrderDto | undefined): KotDto | null {
  const kots = order?.kots ?? []
  return kots.length > 0 ? kots[0] : null
}

export interface SendKotResult {
  ticket: KotTicket
  orderId: string | null
}

/**
 * Send a kitchen ticket through the KOT→order flow (M4): the first KOT of a
 * table creates a saved order carrying the KOT; later KOTs append to that
 * same order. Callers pass the accumulated bill (every KOT ticket on the
 * table) so the order stays in sync with the running table total. Returns
 * the server-stamped ticket plus the order id.
 */
export async function sendKotForOrder(options: {
  outletId: string
  tableId: string
  ticket: KotTicket
  payload: CreateKotPayload
  orderType: OrderType
  orderTypeLabel: string
  /** Every KOT ticket on the table (including this new one). */
  allTableTickets: KotTicket[]
  /** Engine-priced tax for the running table bill. */
  tax?: KotTaxTotals
}): Promise<SendKotResult> {
  const { outletId, tableId, ticket, payload, orderType, orderTypeLabel } = options
  const session = getTableSession(tableId)
  const orderId = session?.orderId ?? null
  const kotPayload = payload
  const bill = kotItemsForOrder(options.allTableTickets, options.tax)

  if (orderId) {
    const order = await updateOrderApi(outletId, orderId, {
      action: 'edit',
      ...bill,
      kots: [kotPayload],
    })
    const newest = newestKotOf(order)
    return {
      ticket: newest
        ? { ...ticket, id: newest.id, kotNo: newest.kot_no }
        : { ...ticket, id: order.id, kotNo: ticket.kotNo },
      orderId: order.id,
    }
  }

  const order = await createOrderApi(outletId, {
    order_type: orderType,
    order_type_label: orderTypeLabel,
    customer_name: ticket.customerName?.trim() || '',
    source: ticket.source === 'captain' ? 'captain' : 'billing',
    ...bill,
    kots: [kotPayload],
  })
  const newest = newestKotOf(order)
  upsertTableSession(tableId, {
    tableNo: ticket.tableNo,
    persons: ticket.persons,
    startedAt: ticket.createdAt,
    amount: bill.my_amount,
    orderId: order.id,
  })
  return {
    ticket: newest
      ? { ...ticket, id: newest.id, kotNo: newest.kot_no }
      : { ...ticket, id: order.id, kotNo: ticket.kotNo },
    orderId: order.id,
  }
}

export interface SettleKotOrderOptions {
  outletId: string
  /** Existing order id to close; when null a fresh order is created+settled. */
  orderId: string | null
  orderType: OrderType
  orderTypeLabel: string
  /** The full table bill (all KOT tickets) used to run the money totals. */
  tickets: KotTicket[]
  /** Engine-priced tax for the table bill; omit for a tax-free cart. */
  tax?: KotTaxTotals
  paymentLabel: string
  customerName: string
  customerPhone: string
  settlementBy?: string
  /** Optional amount override (scan/settle input); defaults to computed total. */
  grandTotal?: number
}

/**
 * Close the table for payment (M4): if the table already owns an order
 * (created by its first KOT) settle that order; otherwise fall back to the
 * legacy path — create a fresh paid order (counter / no-table sales).
 */
export async function settleKotOrder(options: SettleKotOrderOptions): Promise<void> {
  const {
    outletId,
    orderId,
    orderType,
    orderTypeLabel,
    tickets,
    paymentLabel,
    customerName,
    customerPhone,
    settlementBy,
    grandTotal,
  } = options
  const bill = kotItemsForOrder(tickets, options.tax)
  const money = {
    payment_type: paymentLabel,
    my_amount: bill.my_amount,
    tax: bill.tax,
    tax_breakdown: bill.tax_breakdown,
    round_off: bill.round_off,
    discount: bill.discount,
    // grand_total is always the tax-inclusive bill; received_amount is the
    // tendered cash, which may be lower (the backend books the rest as due).
    // Overriding only received_amount was the phantom-due bug — the earlier
    // version pushed the *total* here and left a synthetic cash difference.
    grand_total: bill.grand_total,
    received_amount: grandTotal ?? bill.grand_total,
    settlement_by: settlementBy || undefined,
  }

  if (orderId) {
    await updateOrderApi(outletId, orderId, {
      action: 'settle',
      ...money,
      items: bill.items,
    })
  } else {
    const order = await createOrderApi(outletId, {
      order_type: orderType,
      order_type_label: orderTypeLabel,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      payment_type: paymentLabel,
      source: tickets[0]?.source === 'captain' ? 'captain' : 'billing',
      ...bill,
      items: bill.items,
    })
    // Attach the tickets this bill is built from before paying, so the settle
    // can retire them server-side. Local-only tickets (id ``kot-…``) skipped —
    // they were never persisted, so there is nothing to close.
    const ticketIds = tickets
      .map((t) => t.id)
      .filter((id) => !id.startsWith('kot-'))
    if (ticketIds.length > 0) {
      await adoptOrderKotsApi(outletId, order.id, ticketIds)
    }
    await settleOrderApi(outletId, order.id, money)
  }
}