/**
 * Per-item tax engine — the single place POS money is priced.
 *
 * Backend contract (see docs/STANDARDS.md §Tax): the server never computes tax.
 * It stores what we send (`Order.tax` + `tax_breakdown`) and re-derives
 * `grand_total` from the lines and those columns, so the panel total and the
 * stored total must be produced by *this* function.
 *
 * Two directions, both supported in one cart:
 * - forward  (`backward_printing: false`) — `tax = base x rate`, added on top.
 * - backward (`backward_printing: true`)  — the price already includes the tax,
 *   so `base = price / (1 + rate)` and `tax = price - base`. The line is billed
 *   at its full price and the tax is a component *of* it, so only forward tax
 *   changes the total.
 *
 * The returned `total` is always the sum of `breakdown`, and `addedToTotal` is
 * the forward share — that is what the bill adds on top of the line sum.
 */
import type { TaxSummary } from '../types/menu'

/** A cart line as the engine needs it — no dependency on the panel's types. */
export interface TaxableLine {
  /** Opaque item id; used to look the tax slabs up on the menu row. */
  itemId: string
  price: number
  qty: number
}

export interface TaxableItem {
  taxes: TaxSummary[]
  ignoreTax: boolean
}

/** Outlet tax switches, from the `calculations` settings group. */
export interface TaxSettings {
  /** Compute forward tax on the pre-discount base instead of post-discount. */
  taxBeforeDiscount: boolean
  /** For backward tax: extract it after discount rather than before. */
  backwardTaxAfterDiscount: boolean
  taxOnDeliveryCharge: boolean
  taxOnContainerCharge: boolean
}

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  taxBeforeDiscount: false,
  backwardTaxAfterDiscount: false,
  taxOnDeliveryCharge: false,
  taxOnContainerCharge: false,
}

export type TaxMode = 'forward' | 'backward'

export interface TaxBreakdownLine {
  label: string
  amount: number
  mode: TaxMode
  /** Rate as configured (percent), for printing. 0 for flat `Fixed` taxes. */
  rate: number
}

export interface TaxResult {
  /** Total tax across the cart, forward + backward. */
  total: number
  /**
   * The slice added on top of the line sum. Backward tax is already inside the
   * prices, so this is all that actually changes the bill.
   */
  addedToTotal: number
  /** Per-tax amounts, for the printed-bill CGST/SGST bifurcation. */
  breakdown: TaxBreakdownLine[]
  /**
   * Per-line forward tax keyed by line id, so the panel can show a tax column
   * without recomputing.
   */
  lineTax: Map<string, number>
}

function round2(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function toNumber(value: number | string | null | undefined): number {
  if (value == null) return 0
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/** A flat tax bills a fixed amount per unit instead of a rate. */
function isFixed(tax: TaxSummary): boolean {
  return tax.type === 'Fixed'
}

/** The slab's rate as a fraction of 1. `Fixed` taxes have no rate. */
function rateOf(tax: TaxSummary): number {
  return isFixed(tax) ? 0 : toNumber(tax.amount) / 100
}

function modeOf(tax: TaxSummary): TaxMode {
  return tax.backward_printing ? 'backward' : 'forward'
}

function taxLabel(tax: TaxSummary): string {
  const category = tax.tax_category?.trim()
  if (category) return category
  return tax.online_display_name?.trim() || tax.title?.trim() || 'Tax'
}

/** Active, applicable slabs for a line (ignoring a line with no menu row). */
function activeTaxes(
  line: TaxableLine,
  items: Map<string, TaxableItem>,
): TaxSummary[] {
  const item = items.get(line.itemId)
  if (!item || item.ignoreTax) return []
  return (item.taxes ?? []).filter((tax) => tax.is_active)
}

/** Mutable accumulator for one (label, mode) pair across the whole cart. */
interface Slot {
  label: string
  mode: TaxMode
  rate: number
  amount: number
  /** Pre-discount taxable base this amount was computed on, for rescaling. */
  base: number
}

function slotFor(
  slots: Map<string, Slot>,
  tax: TaxSummary,
  mode: TaxMode,
): Slot {
  const label = taxLabel(tax)
  const key = `${mode}:${label}`
  let slot = slots.get(key)
  if (!slot) {
    slot = {
      label,
      mode,
      rate: isFixed(tax) ? 0 : toNumber(tax.amount),
      amount: 0,
      base: 0,
    }
    slots.set(key, slot)
  }
  return slot
}

/**
 * Price a cart.
 *
 * `items` maps the opaque `itemId` to its menu row (tax slabs + ignore-tax
 * flag). `discount` and the two charges are the panel's current values; the
 * engine applies them in the order the outlet settings ask for.
 */
export function computeTax(
  lines: TaxableLine[],
  items: Map<string, TaxableItem>,
  options: {
    discount?: number
    deliveryCharge?: number
    containerCharge?: number
    /** Slabs to apply to the delivery/container charges themselves. */
    chargeTaxes?: TaxSummary[]
    settings?: Partial<TaxSettings>
  } = {},
): TaxResult {
  const settings = { ...DEFAULT_TAX_SETTINGS, ...(options.settings ?? {}) }
  const discount = Math.max(0, round2(options.discount ?? 0))
  /** Whole-cart line value — the base order-wise slabs run on when the cart has
   *  no item-wise slab of their mode to inherit a base from. */
  let cartValue = 0

  const slots = new Map<string, Slot>()
  /** Order-wise slabs, applied once to the whole base instead of per line. */
  const orderWise = new Map<string, TaxSummary>()
  const perLineForward = new Map<string, number>()

  for (const line of lines) {
    const key = String(line.itemId)
    const lineValue = round2(line.price * line.qty)
    cartValue = round2(cartValue + lineValue)

    for (const tax of activeTaxes(line, items)) {
      if (tax.item_order_wise) {
        orderWise.set(taxLabel(tax), tax)
        continue
      }
      const mode = modeOf(tax)
      const slot = slotFor(slots, tax, mode)

      if (isFixed(tax)) {
        // Flat tax bills per unit, so the base is the unit count.
        const value = round2(toNumber(tax.amount) * line.qty)
        slot.base = round2(slot.base + line.qty)
        if (mode === 'forward') {
          perLineForward.set(key, round2((perLineForward.get(key) ?? 0) + value))
        }
        slot.amount = round2(slot.amount + value)
        continue
      }

      const rate = rateOf(tax)
      if (mode === 'backward') {
        // Price is inclusive: strip the tax out of the line value.
        const base = round2(lineValue / (1 + rate))
        const value = round2(lineValue - base)
        slot.base = round2(slot.base + base)
        slot.amount = round2(slot.amount + value)
      } else {
        slot.base = round2(slot.base + lineValue)
        const value = round2(lineValue * rate)
        perLineForward.set(key, round2((perLineForward.get(key) ?? 0) + value))
        slot.amount = round2(slot.amount + value)
      }
    }
  }

  // Discount order: when a mode taxes the post-discount base, rescale every
  // amount of that mode by the fraction of its base that survives the discount.
  const modeBase = { forward: 0, backward: 0 }
  for (const slot of slots.values()) modeBase[slot.mode] = round2(modeBase[slot.mode] + slot.base)

  const factorFor = (mode: TaxMode): number => {
    const afterDiscount =
      mode === 'forward' ? !settings.taxBeforeDiscount : settings.backwardTaxAfterDiscount
    const base = modeBase[mode]
    if (!afterDiscount || base <= 0 || discount <= 0) return 1
    return Math.max(0, (base - discount) / base)
  }

  const forwardFactor = factorFor('forward')
  const backwardFactor = factorFor('backward')

  for (const slot of slots.values()) {
    const factor = slot.mode === 'forward' ? forwardFactor : backwardFactor
    if (factor !== 1) slot.amount = round2(slot.amount * factor)
  }
  if (forwardFactor !== 1) {
    for (const [key, value] of perLineForward) {
      perLineForward.set(key, round2(value * forwardFactor))
    }
  }

  // Order-wise slabs run once, on the whole cart for their mode. Prefer the
  // item-wise base when the cart has one; otherwise fall back to the cart line
  // value (a cart whose only tax is order-wise has no item-wise base, and
  // reading modeBase alone would price that tax at zero).
  for (const tax of orderWise.values()) {
    const mode = modeOf(tax)
    const slot = slotFor(slots, tax, mode)
    if (isFixed(tax)) {
      slot.amount = round2(slot.amount + toNumber(tax.amount))
      continue
    }
    const rate = rateOf(tax)
    const base = modeBase[mode] > 0 ? modeBase[mode] : cartValue
    const orderWiseBase =
      mode === 'backward' ? Math.max(0, base / (1 + rate)) : Math.max(0, base)
    slot.base = round2(slot.base + orderWiseBase)
    slot.amount = round2(slot.amount + orderWiseBase * rate)
  }

  // Delivery / container charges are taxed only when the outlet switch says so.
  const chargeTaxes = (options.chargeTaxes ?? []).filter((t) => t.is_active)
  const addChargeTax = (charge: number) => {
    if (charge <= 0) return
    for (const tax of chargeTaxes) {
      if (tax.item_order_wise) continue
      const slot = slotFor(slots, tax, 'forward')
      const value = isFixed(tax)
        ? toNumber(tax.amount)
        : round2(charge * rateOf(tax))
      slot.amount = round2(slot.amount + value)
    }
  }
  if (settings.taxOnDeliveryCharge) addChargeTax(round2(options.deliveryCharge ?? 0))
  if (settings.taxOnContainerCharge) addChargeTax(round2(options.containerCharge ?? 0))

  const breakdown: TaxBreakdownLine[] = [...slots.values()].map((slot) => ({
    label: slot.label,
    amount: slot.amount,
    mode: slot.mode,
    rate: slot.rate,
  }))

  const forward = round2(
    breakdown
      .filter((row) => row.mode === 'forward')
      .reduce((sum, row) => sum + row.amount, 0),
  )
  const backward = round2(
    breakdown
      .filter((row) => row.mode === 'backward')
      .reduce((sum, row) => sum + row.amount, 0),
  )

  return {
    total: round2(forward + backward),
    addedToTotal: forward,
    breakdown,
    lineTax: perLineForward,
  }
}

/** Shape stored on `Order.tax_breakdown` (amounts as strings, for JSON). */
export function toStoredBreakdown(
  breakdown: TaxBreakdownLine[],
): { label: string; amount: string; mode: TaxMode; rate: number }[] {
  return breakdown.map((row) => ({
    label: row.label,
    amount: row.amount.toFixed(2),
    mode: row.mode,
    rate: row.rate,
  }))
}
