import { useEffect, useMemo, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import {
  Banknote,
  Ellipsis,
  ChevronDown,
  CircleCheck,
  CreditCard,
  HandCoins,
  ChevronUp,
  Clock3,
  FilePenLine,
  FileText,
  History,
  List,
  Minus,
  Plus,
  StickyNote,
  Trash2,
  UserRound,
  Users,
  Utensils,
  Wallet,
  X,
} from 'lucide-react'
import { KOT_STORE_EVENT, loadTableStatuses } from '../../utils/tableStatusStore'
import type { BillingTableRow } from '../../utils/diningTables'
import { roundSettlementAmount } from '../../utils/settlementRound'
import {
  computeTax,
  DEFAULT_TAX_SETTINGS,
  type TaxableItem,
  type TaxBreakdownLine,
  type TaxSettings,
} from '../../utils/taxEngine'
import type { SpecialNote, TaxSummary } from '../../types/menu'
import { useAuth } from '../../auth/AuthContext'
import { listSpecialNotesApi } from '../../services/menuService'
import { BillingAdvanceOrderModal } from './BillingAdvanceOrderModal'
import { MorePaymentDrawer } from './MorePaymentDrawer'
import { SelectDropdown } from '../common/SelectDropdown'
import { TooltipWrapper } from '../common/TooltipWrapper'
import {
  matchSpecialNoteId,
  specialNoteOptions,
  specialNoteText,
} from '../../utils/specialNotes'
import {
  AppliedDiscountModal,
  type AppliedDiscount,
} from './AppliedDiscountModal'
import {
  CustomerHistoryModal,
  type CustomerHistoryOrder,
} from './CustomerHistoryModal'
import { CustomerGstModal } from './CustomerGstModal'
import { DeleteReasonModal } from './DeleteReasonModal'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { type OtherPaymentType } from './OtherPaymentModal'
import {
  usePaymentCardOptions,
  usePaymentTypeOptions,
} from '../../services/usePaymentTypeOptions'
import { PrimaryButton } from '../menu/MenuActionButtons'
import { QtyInput } from '../common/QtyInput'
import { useDisplaySettings } from '../../services/useDisplaySettings'

const SEED_CUSTOMER_HISTORY: Record<string, CustomerHistoryOrder[]> = {
  '1234567899': [
    {
      id: 'hist-1',
      date: '05 Aug 2026',
      billNo: '812',
      amount: 450,
      items: ['Sev Puri', 'Bhel Puri'],
    },
    {
      id: 'hist-2',
      date: '28 Jul 2026',
      billNo: '790',
      amount: 320,
      items: ['Masala Puri', 'Cold Coffee'],
    },
  ],
}

export type OrderType = 'dine-in' | 'delivery' | 'pick-up' | 'other'

/** Snapshot of bill extras passed with Save / Save & Print actions. */
export interface BillChargesSnapshot {
  deliveryCharge: number
  containerCharge: number
  customerPaid: number
  tip: number
  discount: number
  /** Total tax across the cart (forward + backward). */
  tax: number
  /** The slice added on top of the line sum — the backend's `grand_total` input. */
  taxAddedToTotal: number
  /** Per-tax amounts for the printed-bill CGST/SGST bifurcation. */
  taxBreakdown: TaxBreakdownLine[]
  /** Settlement rounding only (not tax / discount residuals). */
  roundOff: number
  settlementTotal: number
  /** The rounded amount payable for the whole bill. */
  billTotal: number
}
export type PaymentMethod = 'cash' | 'card' | 'due' | 'other' | 'part'

export interface CartLine {
  id: string
  itemId: string
  name: string
  price: number
  qty: number
  note?: string
  /** The variation / add-ons chosen for this line; lines merge only when equal. */
  optionKey?: string
}

export interface CustomerDetails {
  mobile: string
  name: string
  address: string
  locality: string
  gstNo?: string
}

interface BillPanelProps {
  lines: CartLine[]
  /** Menu is on the right, so the divider line sits on the panel's right edge. */
  menuOnRight?: boolean
  /** KOTs already sent for the selected table (merged into final bill). */
  tableKots?: {
    id: string
    kotNo: number
    amount: number
    createdAt?: number
    persons?: number
    items: {
      id: string
      /** Menu item id, so KOT lines are priced by the same tax engine. */
      itemId?: string
      name: string
      qty: number
      price: number
      note?: string
    }[]
  }[]
  /** Menu rows keyed by item id — supply the tax slabs for each line. */
  taxSource?: Map<string, TaxableItem>
  /** Outlet tax switches from the `calculations` settings group. */
  taxSettings?: Partial<TaxSettings>
  /**
   * Slabs applied to the delivery/container charges themselves, built by the
   * caller from the outlet's charge-tax percent settings. Empty/omitted = the
   * charges are untaxed.
   */
  chargeTaxes?: TaxSummary[]
  /** When set (e.g. opened from Kot View), expand that KOT in the sent list. */
  focusKotNo?: number | null
  /**
   * Keep the sent-KOT rows out of the item list (walk-in cart): the KOTs
   * still price tax and totals — they just aren't listed, so the cart reads
   * as cleared after a send.
   */
  hideSentKotRows?: boolean
  orderType: OrderType
  payment: PaymentMethod
  tableId: string
  tables: BillingTableRow[]
  guests: number
  complimentary: boolean
  itsPaid: boolean
  /** Advance already paid on an advance booking opened in Billing (0 otherwise). */
  advancePaid?: number
  advanceNo?: string
  loyalty: boolean
  feedbackSms: boolean
  customer: CustomerDetails
  customerFormOpen: boolean
  customerErrors?: Partial<Record<keyof CustomerDetails, boolean>>
  onOrderTypeChange: (type: OrderType) => void
  onPaymentChange: (method: PaymentMethod) => void
  /** Platform chosen when the payment method is Other. */
  otherPaymentType?: string
  /** The card option (bank / card type) picked for a Card payment. */
  cardOption?: string
  onCardOptionChange?: (option: string) => void
  onOtherPaymentTypeChange?: (type: OtherPaymentType) => void
  onTableIdChange: (id: string) => void
  onGuestsChange: (n: number) => void
  onComplimentaryChange: (value: boolean) => void
  onItsPaidChange: (value: boolean) => void
  onLoyaltyChange: (value: boolean) => void
  onFeedbackSmsChange: (value: boolean) => void
  onQtyChange: (lineId: string, qty: number) => void
  onRemoveLine: (lineId: string) => void
  onLineNoteChange?: (lineId: string, note: string) => void
  onRemoveKotItem?: (payload: {
    ticketId: string
    itemId: string
    reason: string
  }) => void
  onClearItems?: () => void
  onAction: (action: string, charges?: BillChargesSnapshot) => void
  onSettleSave?: (
    amount: number,
    due?: number,
    charges?: BillChargesSnapshot,
  ) => void
  onCustomerChange: (customer: CustomerDetails) => void
  onCustomerFormOpenChange: (open: boolean) => void
  onNotesClick?: () => void
  hasOrderNote?: boolean
  onOpenDrafts?: () => void
  draftCount?: number
}

const ORDER_TYPES: { id: OrderType; label: string }[] = [
  { id: 'dine-in', label: 'Dine In' },
  { id: 'pick-up', label: 'Parcel' },
]

const PAYMENTS: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'due', label: 'Due', icon: HandCoins },
  { id: 'other', label: 'Other', icon: Wallet },
]

function fieldClass(error?: boolean) {
  return `h-9 w-full rounded-lg border bg-card px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted ${
    error
      ? 'border-primary bg-primary/[0.03] focus:border-primary'
      : 'border-line focus:border-primary focus:bg-white'
  }`
}

function normalizeMobileDigits(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2)
  }
  return digits.slice(0, 10)
}

function sanitizeCustomerName(value: string): string {
  return value.slice(0, 12)
}

export function BillPanel({
  lines,
  menuOnRight = false,
  tableKots = [],
  focusKotNo = null,
  hideSentKotRows = false,
  taxSource,
  taxSettings,
  chargeTaxes,
  orderType,
  payment,
  tableId,
  tables,
  guests,
  itsPaid,
  advancePaid = 0,
  advanceNo,
  customer,
  customerFormOpen,
  customerErrors,
  onOrderTypeChange,
  onPaymentChange,
  otherPaymentType,
  cardOption = '',
  onCardOptionChange,
  onOtherPaymentTypeChange,
  onTableIdChange,
  onGuestsChange,
  onItsPaidChange,
  onQtyChange,
  onRemoveLine,
  onLineNoteChange,
  onRemoveKotItem,
  onClearItems,
  onAction,
  onSettleSave,
  onCustomerChange,
  onCustomerFormOpenChange,
  onNotesClick,
  hasOrderNote = false,
  onOpenDrafts,
  draftCount = 0,
}: BillPanelProps) {
  const paymentTypeOptions = usePaymentTypeOptions()
  const cardOptions = usePaymentCardOptions()
  const { encryptedOutletId } = useAuth()
  const [tablePickerOpen, setTablePickerOpen] = useState(false)
  const [guestsPickerOpen, setGuestsPickerOpen] = useState(false)
  const [expandedKotNo, setExpandedKotNo] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    ticketId: string
    itemId: string
    itemName: string
  } | null>(null)
  const [pendingLineDelete, setPendingLineDelete] = useState<CartLine | null>(null)
  const [clearAllOpen, setClearAllOpen] = useState(false)
  const [clearCustomerOpen, setClearCustomerOpen] = useState(false)
  const selectedTable = tables.find((t) => t.id === tableId)
  // Occupied = anything but a blank table on the floor plan. Re-read when the
  // picker opens and whenever tickets change, so it matches the table view.
  const [tableStatuses, setTableStatuses] = useState(loadTableStatuses)
  useEffect(() => {
    const refresh = () => setTableStatuses(loadTableStatuses())
    refresh()
    window.addEventListener(KOT_STORE_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(KOT_STORE_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [tablePickerOpen])
  const dineInFieldsLocked = orderType === 'delivery'
  const previousOrderType = useRef(orderType)

  useEffect(() => {
    setExpandedKotNo(focusKotNo ?? null)
  }, [tableId, focusKotNo])
  const currentTotal = lines.reduce(
    (sum, line) => sum + Math.round(line.price * line.qty * 100) / 100,
    0,
  )
  const kotTotal = tableKots.reduce(
    (sum, kot) => sum + Math.round(kot.amount * 100) / 100,
    0,
  )
  const total = Math.round((currentTotal + kotTotal) * 100) / 100
  const hasSentKots = tableKots.length > 0
  const hasAnyItems = lines.length > 0 || hasSentKots
  // With `hideSentKotRows` (walk-in), sent KOTs still price tax and totals —
  // they just aren't listed, so the cart reads as cleared after a send. The
  // one exception is the KOT explicitly opened from Kot View (`focusKotNo`),
  // which the cashier asked to see and must stay visible.
  const visibleSentKots = hideSentKotRows
    ? tableKots.filter((kot) => kot.kotNo === focusKotNo)
    : tableKots
  const [settlementInput, setSettlementInput] = useState('')
  const [advanceOpen, setAdvanceOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  /** Cash handed over now when the bill is booked on Due; the rest stays due. */
  const [duePaid, setDuePaid] = useState('')
  useEffect(() => {
    if (payment !== 'due') setDuePaid('')
  }, [payment])
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [noteLineId, setNoteLineId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [specialNotes, setSpecialNotes] = useState<SpecialNote[]>([])
  const noteLine = lines.find((line) => line.id === noteLineId) ?? null

  useEffect(() => {
    if (!encryptedOutletId) return
    let cancelled = false
    listSpecialNotesApi(encryptedOutletId)
      .then((rows) => {
        if (!cancelled) setSpecialNotes(rows)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  const noteOptions = useMemo(
    () => specialNoteOptions(specialNotes),
    [specialNotes],
  )
  const selectedNoteId = useMemo(
    () => matchSpecialNoteId(specialNotes, noteDraft),
    [specialNotes, noteDraft],
  )

  function handleSelectNote(id: string) {
    const note = specialNotes.find((n) => n.id === id)
    if (note) setNoteDraft(specialNoteText(note))
  }
  const [discount, setDiscount] = useState(0)
  const [discountDetails, setDiscountDetails] = useState<AppliedDiscount | null>(
    null,
  )
  const [discountOpen, setDiscountOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [gstOpen, setGstOpen] = useState(false)
  const [customerHistory, setCustomerHistory] = useState<
    Record<string, CustomerHistoryOrder[]>
  >(() => ({ ...SEED_CUSTOMER_HISTORY }))
  const [deliveryCharge, setDeliveryCharge] = useState('0')
  const [containerCharge, setContainerCharge] = useState('0')
  const [customerPaid, setCustomerPaid] = useState('0')
  const [tip, setTip] = useState('0')

  const itemCount =
    lines.reduce((sum, line) => sum + line.qty, 0) +
    (hasSentKots ? tableKots.length : 0)

  const deliveryValue = Number(deliveryCharge) || 0
  const containerValue = Number(containerCharge) || 0
  const { showTip } = useDisplaySettings()
  const tipValue = showTip ? Number(tip) || 0 : 0
  const paidValue = Number(customerPaid) || 0

  // Tax is priced over the live cart *and* the KOT lines already sent to the
  // table — a table bill is mostly KOT lines, so pricing only `lines` would
  // leave the common case untaxed.
  const taxLines = useMemo(
    () => [
      ...lines.map((line) => ({ itemId: line.itemId, price: line.price, qty: line.qty })),
      ...tableKots.flatMap((kot) =>
        kot.items
          .filter((item) => Boolean(item.itemId))
          .map((item) => ({
            itemId: item.itemId as string,
            price: item.price,
            qty: item.qty,
          })),
      ),
    ],
    [lines, tableKots],
  )

  const tax = useMemo(
    () =>
      computeTax(taxLines, taxSource ?? new Map(), {
        discount,
        deliveryCharge: orderType === 'delivery' ? deliveryValue : 0,
        containerCharge: orderType === 'delivery' ? containerValue : 0,
        chargeTaxes,
        settings: { ...DEFAULT_TAX_SETTINGS, ...taxSettings },
      }),
    [
      taxLines,
      taxSource,
      discount,
      deliveryValue,
      containerValue,
      orderType,
      taxSettings,
      chargeTaxes,
    ],
  )

  // `taxableBase` = the pre-rounding amount the customer owes. Backward tax is
  // already inside the line prices, so only the forward slice is added here —
  // adding the total would double-charge a tax-inclusive cart.
  const taxableBase = Math.max(
    0,
    total - discount + tax.addedToTotal + deliveryValue + containerValue,
  )
  const roundedTotal = roundSettlementAmount(taxableBase)
  const roundOff = Math.round((roundedTotal - taxableBase) * 100) / 100
  // An advance booking has already collected part of the bill: only the
  // balance is taken now.
  const advanceApplied = Math.min(Math.max(0, advancePaid), roundedTotal)
  const payableNow = Math.round((roundedTotal - advanceApplied) * 100) / 100
  const settlementValue =
    settlementInput.trim() === '' || Number.isNaN(Number(settlementInput))
      ? roundedTotal
      : roundSettlementAmount(Number(settlementInput))
  const returnToCustomer = Math.max(
    0,
    Math.round((paidValue - settlementValue - tipValue) * 100) / 100,
  )

  useEffect(() => {
    if (!hasAnyItems) {
      setSettlementInput('')
      setCustomerPaid('0')
      setTip('0')
      setDeliveryCharge('0')
      setContainerCharge('0')
      setDiscount(0)
      setDiscountDetails(null)
      setDiscountOpen(false)
      setDetailsOpen(false)
      return
    }
    setSettlementInput(String(roundSettlementAmount(taxableBase)))
  }, [taxableBase, hasAnyItems])

  useEffect(() => {
    if (orderType !== 'delivery') {
      setDeliveryCharge('0')
      setContainerCharge('0')
      setCustomerPaid('0')
      setTip('0')
    }
  }, [orderType])

  /**
   * Table and guests only apply to a dine-in bill, so they are locked for every
   * takeaway type. On switching to one, drop whatever no longer belongs: delivery
   * has no table at all, pick-up (and `other`, which the API folds into pick-up)
   * keeps the table it came with but has no covers. The previous type is tracked
   * in a ref so this runs on a switch only, never on mount — otherwise a deep
   * link that arrives already set would be wiped before it was read.
   *
   * Guard: when switching to delivery and no table is currently selected, do not
   * call onTableIdChange('') (that would clear a pinned takeaway KOT opened via
   * deep-link with no table).
   */
  useEffect(() => {
    const previous = previousOrderType.current
    previousOrderType.current = orderType
    if (previous === orderType) return

    setTablePickerOpen(false)
    setGuestsPickerOpen(false)

    if (orderType === 'delivery' && tableId) {
      onTableIdChange('')
    }
    if (orderType === 'delivery') onGuestsChange(0)
  }, [orderType, onTableIdChange, onGuestsChange, tableId])

  function chargesSnapshot(): BillChargesSnapshot {
    return {
      deliveryCharge: orderType === 'delivery' ? deliveryValue : 0,
      containerCharge: orderType === 'delivery' ? containerValue : 0,
      customerPaid: orderType === 'delivery' ? paidValue : 0,
      tip: orderType === 'delivery' ? tipValue : 0,
      discount,
      tax: tax.total,
      taxAddedToTotal: tax.addedToTotal,
      taxBreakdown: tax.breakdown,
      roundOff,
      settlementTotal: settlementValue,
      billTotal: roundedTotal,
    }
  }

  function updateCustomer<K extends keyof CustomerDetails>(
    key: K,
    value: CustomerDetails[K],
  ) {
    onCustomerChange({ ...customer, [key]: value })
  }

  function money(n: number) {
    return n.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const customerOrders =
    customerHistory[customer.mobile.trim()] ?? []

  function clearCustomerHistory() {
    const mobile = customer.mobile.trim()
    if (mobile) {
      setCustomerHistory((prev) => {
        if (!(mobile in prev)) return prev
        const next = { ...prev }
        delete next[mobile]
        return next
      })
    }
    onCustomerChange({
      mobile: '',
      name: '',
      address: '',
      locality: '',
      gstNo: '',
    })
    setHistoryOpen(false)
    showToast('Customer removed from bill')
  }

  return (
    <aside
      className={`flex w-full shrink-0 flex-col border-t border-line bg-card lg:w-[520px] lg:border-t-0 xl:w-[600px] ${
        menuOnRight ? 'lg:border-r' : 'lg:border-l'
      }`}
    >
      <AppliedDiscountModal
        open={discountOpen}
        billTotal={total}
        initial={discountDetails ?? undefined}
        onClose={() => setDiscountOpen(false)}
        onSave={(next) => {
          setDiscountDetails(next)
          setDiscount(next.amount)
          setDiscountOpen(false)
        }}
      />

      <CustomerHistoryModal
        open={historyOpen}
        customerName={customer.name}
        customerMobile={customer.mobile}
        orders={customerOrders}
        onClose={() => setHistoryOpen(false)}
      />

      <CustomerGstModal
        open={gstOpen}
        initialGstNo={customer.gstNo ?? ''}
        onClose={() => setGstOpen(false)}
        onSave={(gstNo) => {
          onCustomerChange({ ...customer, gstNo })
          setGstOpen(false)
        }}
      />

      {noteLine ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close note"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setNoteLineId(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="line-note-title"
            className="relative z-10 w-full max-w-lg rounded-lg border border-line bg-card p-5 shadow-xl"
          >
            <h3 id="line-note-title" className="sr-only">
              Add note for {noteLine.name}
            </h3>
            <SelectDropdown
              value={selectedNoteId}
              options={noteOptions}
              onChange={handleSelectNote}
              caption="Special notes"
              placeholder="Select a note"
              searchable
              triggerClassName="mb-3 w-full"
            />
            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              rows={4}
              placeholder={`Add a note for ${noteLine.name}`}
              className="w-full resize-y rounded-md border border-line px-3 py-2.5 text-sm outline-none placeholder:text-muted focus:border-primary"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteLineId(null)}
                className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
              >
                Cancel
              </button>
              <PrimaryButton
                onClick={() => {
                  onLineNoteChange?.(noteLine.id, noteDraft)
                  setNoteLineId(null)
                }}
              >
                Done
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}

      <DeleteReasonModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.itemName}` : 'Delete item'}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(reason) => {
          if (!deleteTarget || !onRemoveKotItem) return
          onRemoveKotItem({
            ticketId: deleteTarget.ticketId,
            itemId: deleteTarget.itemId,
            reason,
          })
          setDeleteTarget(null)
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingLineDelete)}
        compact
        title="Remove item from bill"
        target={pendingLineDelete?.name}
        message={
          pendingLineDelete
            ? pendingLineDelete.qty > 1
              ? `${pendingLineDelete.qty} × ${pendingLineDelete.name} will be removed from this bill.`
              : `${pendingLineDelete.name} will be removed from this bill.`
            : undefined
        }
        note="The bill updates as if this item was never added — nothing is settled until you save or settle."
        confirmLabel="Remove"
        onConfirm={() => {
          if (pendingLineDelete) onRemoveLine(pendingLineDelete.id)
          setPendingLineDelete(null)
        }}
        onClose={() => setPendingLineDelete(null)}
      />
      <ConfirmDialog
        open={clearAllOpen}
        title="Remove all items"
        target={`${lines.length} item${lines.length === 1 ? '' : 's'}`}
        message={`The bill (₹${total.toLocaleString('en-IN', {
          maximumFractionDigits: 2,
        })}) will be emptied in one go.`}
        consequences={[
          'Table, customer, payment, discount and note details stay.',
          'You can re-add items afterwards before settling.',
        ]}
        note="Nothing is settled or recorded — clearing only empties the current bill."
        confirmLabel="Remove all"
        onConfirm={() => {
          onClearItems?.()
          setClearAllOpen(false)
        }}
        onClose={() => setClearAllOpen(false)}
      />
      <ConfirmDialog
        open={clearCustomerOpen}
        title="Remove customer from bill"
        target={
          customer.name.trim() || customer.mobile.trim() || undefined
        }
        message="The customer details will be cleared from this bill."
        consequences={[
          'The saved bill will carry no customer name or mobile.',
          'The history panel for this number stops showing while billing.',
        ]}
        note="This only clears the current bill and the on-screen history view — no customer record is deleted."
        confirmLabel="Remove customer"
        onConfirm={() => {
          clearCustomerHistory()
          setClearCustomerOpen(false)
        }}
        onClose={() => setClearCustomerOpen(false)}
      />

      {/* Order type */}
      <div className="grid grid-cols-2 gap-1 border-b border-line p-2">
        {ORDER_TYPES.map((type) => {
          const active = orderType === type.id
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onOrderTypeChange(type.id)}
              className={`h-10 rounded-lg text-sm font-semibold transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'bg-page text-ink hover:bg-primary/10'
              }`}
            >
              {type.label}
            </button>
          )
        })}
      </div>

      {/* Quick tools */}
      <div className="relative flex items-center gap-1.5 border-b border-line px-2 py-2">
        <TooltipWrapper
          label={
            dineInFieldsLocked ? 'Not applicable for this order type' : 'Select table'
          }
        >
          <button
            type="button"
            aria-label="Select table"
            disabled={dineInFieldsLocked}
            onClick={() => {
              setTablePickerOpen((open) => !open)
              setGuestsPickerOpen(false)
              onCustomerFormOpenChange(false)
            }}
            className="relative inline-flex size-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-page hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Utensils size={16} />
            {selectedTable ? (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {selectedTable.areaName === 'Party Hall'
                  ? `P${selectedTable.tableNo.replace(/\D/g, '')}`
                  : selectedTable.tableNo}
              </span>
            ) : null}
          </button>
        </TooltipWrapper>
        <TooltipWrapper
          label={
            dineInFieldsLocked
              ? 'Not applicable for this order type'
              : guests === 0
                ? 'No. of Persons'
                : `Guests: ${guests}`
          }
        >
          <button
            type="button"
            aria-label={guests === 0 ? 'No. of Persons' : `Guests: ${guests}`}
            disabled={dineInFieldsLocked}
            onClick={() => {
              setTablePickerOpen(false)
              onCustomerFormOpenChange(false)
              setGuestsPickerOpen((open) => !open)
            }}
            className={`relative inline-flex size-9 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              guestsPickerOpen || guests > 0
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-line text-muted hover:bg-page hover:text-ink'
            }`}
          >
            <Users size={16} />
            {guests > 0 ? (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {guests}
              </span>
            ) : null}
          </button>
        </TooltipWrapper>
        <button
          type="button"
          aria-label="Customer"
          data-tooltip="Customer"
          onClick={() => {
            setTablePickerOpen(false)
            setGuestsPickerOpen(false)
            onCustomerFormOpenChange(!customerFormOpen)
          }}
          className={`inline-flex size-9 items-center justify-center rounded-lg border transition-colors ${
            customerFormOpen
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-line text-muted hover:bg-page hover:text-ink'
          }`}
        >
          <UserRound size={16} />
        </button>
        <button
          type="button"
          aria-label="Notes"
          data-tooltip="Notes"
          onClick={() => {
            setTablePickerOpen(false)
            setGuestsPickerOpen(false)
            onNotesClick?.()
          }}
          className={`relative inline-flex size-9 items-center justify-center rounded-lg border transition-colors ${
            hasOrderNote
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-line text-muted hover:bg-page hover:text-ink'
          }`}
        >
          <StickyNote size={16} />
          {hasOrderNote ? (
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary" />
          ) : null}
        </button>
        <button
          type="button"
          data-tooltip="Held bills"
          aria-label="Held bills"
          onClick={() => {
            setTablePickerOpen(false)
            setGuestsPickerOpen(false)
            onCustomerFormOpenChange(false)
            onOpenDrafts?.()
          }}
          className="relative inline-flex size-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-page hover:text-primary"
        >
          <FilePenLine size={16} />
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-white">
            {draftCount > 99 ? '99+' : draftCount}
          </span>
        </button>
        <button
          type="button"
          aria-label="Delete all items"
          disabled={lines.length === 0}
          onClick={onClearItems ? () => setClearAllOpen(true) : undefined}
          className="ml-auto inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-card px-2.5 text-xs font-semibold text-ink hover:border-primary hover:bg-primary/5 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={14} />
          Delete All
        </button>

        {guestsPickerOpen ? (
          <div className="absolute left-0 right-0 top-full z-20 flex items-center justify-between gap-3 border-b border-line bg-[#f3f3f3] px-3 py-2.5 shadow-sm">
            <p className="text-sm text-ink">Please Enter No. of Person</p>
            <input
              type="number"
              min={0}
              max={99}
              value={guests}
              autoFocus
              onChange={(event) => {
                const next = Number(event.target.value)
                onGuestsChange(
                  Number.isFinite(next)
                    ? Math.max(0, Math.min(99, Math.floor(next)))
                    : 0,
                )
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') setGuestsPickerOpen(false)
              }}
              className="h-9 w-14 rounded border border-line bg-white text-center text-sm font-semibold text-ink outline-none focus:border-primary"
            />
          </div>
        ) : null}

        {tablePickerOpen ? (
          <div className="absolute left-2 top-12 z-20 w-72 overflow-hidden rounded-xl border border-line bg-card shadow-lg">
            <p className="border-b border-line px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
              Select table
            </p>
            <ul className="max-h-72 overflow-y-auto py-1">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onTableIdChange('')
                    onGuestsChange(0)
                    setTablePickerOpen(false)
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-page ${
                    !tableId
                      ? 'bg-primary/5 font-semibold text-primary'
                      : 'text-ink'
                  }`}
                >
                  <span>No table selected</span>
                </button>
              </li>
              {tables.map((table) => (
                <li key={table.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onTableIdChange(table.id)
                      onGuestsChange(table.persons)
                      setTablePickerOpen(false)
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-page ${
                      table.id === tableId
                        ? 'bg-primary/5 text-primary'
                        : 'text-ink'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block whitespace-nowrap text-sm font-semibold">
                        Table {table.tableNo}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {table.areaName}
                      </span>
                    </span>
                    {(tableStatuses[table.id] ?? 'blank') !== 'blank' &&
                    table.id !== tableId ? (
                      <span className="shrink-0 whitespace-nowrap rounded-full bg-secondary/40 px-2 py-0.5 text-[11px] font-semibold text-deep">
                        Occupied
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {customerFormOpen ? (
        <div className="min-h-0 flex-1 overflow-y-auto border-b border-line bg-page/40 px-3 py-3">
          <div className="rounded-xl border border-line bg-card p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink">Customer details</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                  Name and mobile are optional
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-line bg-page p-0.5">
                <button
                  type="button"
                  aria-label="History"
                  data-tooltip="History"
                  onClick={() => setHistoryOpen(true)}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-card hover:text-ink"
                >
                  <History size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Tax / GST"
                  data-tooltip="Tax / GST"
                  onClick={() => setGstOpen(true)}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-card hover:text-ink"
                >
                  <FileText size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Order list"
                  data-tooltip="Order list"
                  onClick={() => setHistoryOpen(true)}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-card hover:text-ink"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Wallet balance"
                  data-tooltip="Wallet balance"
                  onClick={() => {
                    if (!customer.mobile.trim()) {
                      showToast('Enter a mobile number first')
                      return
                    }
                    showToast('Wallet — coming soon')
                  }}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-card hover:text-ink"
                >
                  <Wallet size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Delete customer history"
                  data-tooltip="Delete customer history"
                  onClick={() => setClearCustomerOpen(true)}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-card hover:text-primary"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Name
                </span>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) =>
                    updateCustomer('name', sanitizeCustomerName(e.target.value))
                  }
                  maxLength={12}
                  placeholder="Customer name"
                  className={fieldClass(customerErrors?.name)}
                  autoFocus
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Mobile
                </span>
                <div
                  className={`flex h-9 overflow-hidden rounded-lg border bg-card focus-within:border-primary ${
                    customerErrors?.mobile
                      ? 'border-primary bg-primary/[0.03]'
                      : 'border-line focus-within:bg-white'
                  }`}
                >
                  <span className="inline-flex shrink-0 items-center border-r border-line bg-page px-2.5 text-sm font-semibold text-ink">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={normalizeMobileDigits(customer.mobile)}
                    onChange={(e) =>
                      updateCustomer('mobile', normalizeMobileDigits(e.target.value))
                    }
                    maxLength={10}
                    placeholder="10-digit mobile"
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-muted"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Address
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={customer.address}
                    onChange={(e) => updateCustomer('address', e.target.value)}
                    placeholder="Full address"
                    className={`pr-8 ${fieldClass()}`}
                  />
                  {customer.address ? (
                    <button
                      type="button"
                      aria-label="Clear address"
                      data-tooltip="Clear address"
                      onClick={() => updateCustomer('address', '')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted transition-colors hover:text-ink"
                    >
                      <X size={14} />
                    </button>
                  ) : null}
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Locality
                </span>
                <input
                  type="text"
                  value={customer.locality}
                  onChange={(e) => updateCustomer('locality', e.target.value)}
                  placeholder="Area / locality"
                  className={fieldClass()}
                />
              </label>
            </div>

            {(customerErrors?.mobile || customerErrors?.name) && (
              <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2 text-xs font-medium text-primary">
                Enter a valid 10-digit mobile and a name of 3–12 characters
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b border-line bg-page px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            <span>Items</span>
            <span className="w-24 text-center">Qty</span>
            <span className="w-14 text-right">Price</span>
            <span className="w-7" />
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto lg:flex-1" style={{ maxHeight: 'calc(100dvh - 56px - 56px - 220px)' }}>
            {!hasAnyItems ? (
              <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 px-4 text-center">
                <Utensils size={48} className="text-line" strokeWidth={1} />
                <p className="text-sm font-medium text-muted">No Item Selected</p>
                <p className="text-xs text-muted">
                  Tap an item to add it to the bill
                </p>
              </div>
            ) : (
              <div>
                {visibleSentKots.length > 0 ? (
                  <div className="border-b border-line bg-page/60">
                    <p className="border-b border-line px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Sent KOTs ·{' '}
                      {selectedTable
                        ? `Table ${selectedTable.tableNo}`
                        : 'No table'}
                    </p>
                    <ul>
                      {visibleSentKots.map((kot) => {
                        const open = expandedKotNo === kot.kotNo
                        const timeLabel = kot.createdAt
                          ? new Date(kot.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })
                          : null
                        return (
                          <li key={kot.id} className="border-b border-line last:border-b-0">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedKotNo(open ? null : kot.kotNo)
                              }
                              className="flex w-full items-center justify-between gap-2 bg-page px-3 py-2 text-left text-sm text-ink hover:bg-card"
                              aria-expanded={open}
                            >
                              <span className="inline-flex min-w-0 items-center gap-1.5 font-semibold">
                                {open ? (
                                  <ChevronUp size={14} className="shrink-0 text-muted" />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="shrink-0 text-muted"
                                  />
                                )}
                                <span>
                                  KOT - {kot.kotNo}
                                  {timeLabel ? (
                                    <span className="ml-2 font-normal text-muted">
                                      Time - {timeLabel}
                                    </span>
                                  ) : (
                                    <span className="ml-1.5 text-xs font-normal text-muted">
                                      ({kot.items.length} item
                                      {kot.items.length === 1 ? '' : 's'})
                                    </span>
                                  )}
                                </span>
                              </span>
                              <span className="shrink-0 font-semibold tabular-nums">
                                ₹
                                {kot.amount.toLocaleString('en-IN', {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </button>
                            {open ? (
                              <ul className="divide-y divide-line bg-card">
                                {kot.items.map((item) => (
                                  <li
                                    key={item.id}
                                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-3 py-2.5"
                                  >
                                    <div className="flex min-w-0 items-start gap-2">
                                      <button
                                        type="button"
                                        data-tooltip={`Delete ${item.name}`}
                                        aria-label={`Delete ${item.name}`}
                                        onClick={() =>
                                          setDeleteTarget({
                                            ticketId: kot.id,
                                            itemId: item.id,
                                            itemName: item.name,
                                          })
                                        }
                                        className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover"
                                      >
                                        <X size={11} strokeWidth={2.5} />
                                      </button>
                                      <span className="min-w-0">
                                        <span className="block text-sm font-medium text-ink underline decoration-line">
                                          {item.name}
                                        </span>
                                        {item.note ? (
                                          <span className="mt-0.5 block text-xs italic text-muted">
                                            [Note] {item.note}
                                          </span>
                                        ) : null}
                                      </span>
                                    </div>
                                    <span className="w-16 text-center text-sm tabular-nums text-ink">
                                      ×{item.qty}
                                    </span>
                                    <span className="w-14 text-right text-sm font-semibold tabular-nums text-ink">
                                      ₹
                                      {(item.price * item.qty).toLocaleString(
                                        'en-IN',
                                        {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 2,
                                        },
                                      )}
                                    </span>
                                    <span className="w-7" />
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ) : null}

                {lines.length === 0 ? (
                  hasSentKots ? (
                    <div className="px-3 py-3 text-xs text-muted">
                      Add more items and press KOT for the next kitchen ticket.
                    </div>
                  ) : null
                ) : (
                  <>
                    {hasSentKots ? (
                      <p className="border-b border-line bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        New items (not sent yet)
                      </p>
                    ) : null}
                    <ul className="divide-y divide-line">
                      {lines.map((line) => (
                        <li
                            key={line.id}
                            className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-3 py-2.5"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-ink">
                                {line.name}
                              </span>
                              {line.note ? (
                                <span className="mt-0.5 block text-xs italic text-muted">
                                  [Note] {line.note}
                                </span>
                              ) : null}
                            </span>
                            <div className="flex w-24 items-center justify-center gap-1">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                data-tooltip="Decrease quantity"
                                onClick={() => onQtyChange(line.id, line.qty - 1)}
                                className="inline-flex size-6 items-center justify-center rounded border border-line text-muted hover:bg-page"
                              >
                                <Minus size={12} />
                              </button>
                              <QtyInput
                                value={line.qty}
                                label={`Quantity for ${line.name}`}
                                onCommit={(qty) => onQtyChange(line.id, qty)}
                              />
                              <button
                                type="button"
                                aria-label="Increase quantity"
                                data-tooltip="Increase quantity"
                                onClick={() => onQtyChange(line.id, line.qty + 1)}
                                className="inline-flex size-6 items-center justify-center rounded border border-line text-muted hover:bg-page"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <span className="w-14 text-right text-sm font-semibold text-ink">
                              ₹{line.price * line.qty}
                            </span>
                            <span className="flex items-center">
                              <button
                                type="button"
                                data-tooltip={line.note ? 'Edit note' : 'Add note'}
                                aria-label={`Add note to ${line.name}`}
                                onClick={() => {
                                  setNoteDraft(line.note ?? '')
                                  setNoteLineId(line.id)
                                }}
                                className={`inline-flex size-7 items-center justify-center rounded hover:bg-primary/10 ${
                                  line.note
                                    ? 'text-primary'
                                    : 'text-muted hover:text-primary'
                                }`}
                              >
                                <StickyNote size={14} />
                              </button>
                              <button
                                type="button"
                                aria-label={`Remove ${line.name}`}
                                data-tooltip={`Remove ${line.name}`}
                                onClick={() => setPendingLineDelete(line)}
                                className="inline-flex size-7 items-center justify-center rounded text-muted hover:bg-primary/10 hover:text-primary"
                              >
                                <Trash2 size={14} />
                              </button>
                            </span>
                          </li>
                        ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Settlement dropdown panel */}
      <div className="relative border-t border-line bg-white">
        {hasAnyItems ? (
          <div className="flex justify-center">
            <button
              type="button"
              aria-label={detailsOpen ? 'Hide bill details' : 'Show bill details'}
              data-tooltip={detailsOpen ? 'Hide bill details' : 'Show bill details'}
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((open) => !open)}
              className="relative z-10 -mt-3 inline-flex h-6 w-12 items-center justify-center rounded-t-md border border-b-0 border-line bg-white text-muted shadow-sm hover:text-ink"
            >
              <ChevronUp
                size={16}
                className={`transition-transform ${detailsOpen ? '' : 'rotate-180'}`}
              />
            </button>
          </div>
        ) : null}

        {hasAnyItems ? (
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              detailsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden border-b border-line bg-white">
              <div className="max-h-[38vh] space-y-2 overflow-y-auto px-3 pb-2 pt-1">
            <div className="flex items-center justify-between text-sm text-ink">
              <span>
                Sub Total{' '}
                <span className="text-muted">({itemCount})</span>
              </span>
              <span className="font-semibold">{money(total)}</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-sm text-ink">
              <span className="inline-flex items-center gap-1.5">
                <span>Discount</span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    setDiscountOpen(true)
                  }}
                  className="rounded px-1 text-xs font-bold text-primary hover:underline"
                >
                  More
                </button>
              </span>
              <span className="font-semibold">{money(discount)}</span>
            </div>
            {orderType === 'delivery' ? (
              <>
                <label className="flex items-center justify-between gap-3 text-sm text-ink">
                  <span>Delivery Charge</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    className="h-8 w-24 rounded-md border border-line bg-white px-2 text-right text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm text-ink">
                  <span>Container Charge</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={containerCharge}
                    onChange={(e) => setContainerCharge(e.target.value)}
                    className="h-8 w-24 rounded-md border border-line bg-white px-2 text-right text-sm outline-none focus:border-primary"
                  />
                </label>
              </>
            ) : null}
            <div className="flex items-center justify-between gap-2 text-sm text-ink">
              <span>Tax</span>
              <span className="font-semibold">{money(tax.total)}</span>
            </div>
            {tax.breakdown.map((row) => (
              <div
                key={`${row.mode}:${row.label}`}
                className="flex items-center justify-between gap-2 pl-4 text-xs text-muted"
              >
                <span>
                  {row.label}
                  {row.rate > 0 ? ` @ ${row.rate}%` : ''}
                  {row.mode === 'backward' ? ' (incl.)' : ''}
                </span>
                <span>{money(row.amount)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm text-ink">
              <span>Round Off</span>
              <span className="font-semibold">
                {roundOff >= 0 ? '+' : ''}
                {money(roundOff)}
              </span>
            </div>
            {orderType === 'delivery' ? (
              <>
                <label className="flex items-center justify-between gap-3 text-sm text-ink">
                  <span>Customer Paid</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={customerPaid}
                    onChange={(e) => setCustomerPaid(e.target.value)}
                    className="h-8 w-24 rounded-md border border-line bg-white px-2 text-right text-sm outline-none focus:border-primary"
                  />
                </label>
                <div className="flex items-center justify-between text-sm text-ink">
                  <span>Return to Customer</span>
                  <span className="font-semibold text-primary">
                    {money(returnToCustomer)}
                  </span>
                </div>
{showTip ? (
                <label className="flex items-center justify-between gap-3 text-sm text-ink">
                  <span>Tip</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                    className="h-8 w-24 rounded-md border border-line bg-white px-2 text-right text-sm outline-none focus:border-primary"
                  />
                </label>
) : null}
              </>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={() => onAction('Bogo Offer')}
                className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                Bogo Offer
              </button>
            </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3 bg-white p-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAction('Split', chargesSnapshot())}
              className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => {
                if (lines.length === 0) {
                  showToast('Add items to the bill first')
                  return
                }
                setAdvanceOpen(true)
              }}
              className="h-9 rounded-lg border border-primary bg-white px-4 text-sm font-semibold text-primary hover:bg-page"
            >
              Advance Order
            </button>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-semibold text-ink">Total</span>
              {hasSentKots && currentTotal > 0 ? (
                <p className="text-[11px] text-muted">
                  KOTs ₹{kotTotal.toLocaleString('en-IN')} + New ₹
                  {currentTotal.toLocaleString('en-IN')}
                </p>
              ) : hasSentKots ? (
                <p className="text-[11px] text-muted">
                  {tableKots.length} KOT{tableKots.length === 1 ? '' : 's'} merged
                </p>
              ) : null}
            </div>
            <span className="text-2xl font-bold text-accent">
              {roundedTotal.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {advanceApplied > 0 ? (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
              <p className="flex justify-between text-ink">
                <span>Advance paid{advanceNo ? ` (#${advanceNo})` : ''}</span>
                <span className="font-semibold tabular-nums">
                  − {money(advanceApplied)}
                </span>
              </p>
              <p className="mt-1 flex justify-between text-sm font-bold text-ink">
                <span>Balance to collect</span>
                <span className="tabular-nums">{money(payableNow)}</span>
              </p>
              <p className="mt-1 text-[11px] text-muted">
                Save, Save &amp; Print or eBill books the bill with the advance
                counted as paid; tick It&apos;s Paid and press Save to collect the
                balance now.
              </p>
            </div>
          ) : null}

          <div
            role="radiogroup"
            aria-label="Payment method"
            className="grid grid-cols-5 overflow-hidden rounded-lg border border-line"
          >
            {PAYMENTS.map((method) => {
              const selected = payment === method.id
              const Icon = method.icon
              return (
                <button
                  key={method.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onPaymentChange(method.id)}
                  className={`flex h-11 select-none items-center justify-center gap-1.5 border-r border-line px-1 text-sm font-semibold transition-colors last:border-r-0 ${
                    selected
                      ? 'bg-primary/10 text-primary'
                      : 'bg-card text-ink hover:bg-page'
                  }`}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 ${selected ? 'text-primary' : 'text-muted'}`}
                  />
                  {method.label}
                  <CircleCheck
                    size={14}
                    className={`shrink-0 ${selected ? 'text-primary' : 'text-line'}`}
                  />
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              className={`flex h-11 select-none items-center justify-center gap-1.5 px-1 text-sm font-semibold transition-colors ${
                payment === 'part'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-card text-ink hover:bg-page'
              }`}
            >
              <Ellipsis
                size={16}
                className={`shrink-0 ${payment === 'part' ? 'text-primary' : 'text-muted'}`}
              />
              More
              <CircleCheck
                size={14}
                className={`shrink-0 ${payment === 'part' ? 'text-primary' : 'text-line'}`}
              />
            </button>
          </div>

          <MorePaymentDrawer
            open={moreOpen}
            payment={payment}
            otherType={otherPaymentType}
            onSelectMethod={onPaymentChange}
            onSelectOther={(type) => {
              onPaymentChange('other')
              onOtherPaymentTypeChange?.(type)
            }}
            onClose={() => setMoreOpen(false)}
          />

          {payment === 'card' && cardOptions.length > 0 ? (
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                Card
              </span>
              <SelectDropdown
                value={cardOption}
                options={[
                  { value: '', label: 'Any card' },
                  ...cardOptions.map((option) => ({ value: option, label: option })),
                ]}
                onChange={(value) => onCardOptionChange?.(value)}
                caption="Card"
                searchable={false}
                triggerClassName="h-10 w-full bg-white"
              />
            </div>
          ) : null}

          {payment === 'other' ? (
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                Other Payment Type
              </span>
              <SelectDropdown
                value={otherPaymentType ?? paymentTypeOptions[0]}
                options={paymentTypeOptions.map((option) => ({
                  value: option,
                  label: option,
                }))}
                onChange={(value) =>
                  onOtherPaymentTypeChange?.(value)
                }
                caption="Payment platform"
                searchable={false}
                triggerClassName="h-10 w-full bg-white"
              />
            </div>
          ) : null}

          {payment === 'due' ? (
            <div className="space-y-2">
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                <Clock3 size={13} />
                Due payment — customer details required
              </p>
              <label className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm font-semibold text-ink">
                Amount paid now
                <input
                  type="number"
                  min={0}
                  max={payableNow}
                  step="0.01"
                  inputMode="decimal"
                  value={duePaid}
                  placeholder="0"
                  onChange={(event) => setDuePaid(event.target.value)}
                  className="h-10 w-36 rounded-md border border-line bg-white px-3 text-right text-sm font-normal text-ink outline-none focus:border-primary"
                />
              </label>
              {(() => {
                const paid = Math.min(payableNow, Math.max(0, Number(duePaid) || 0))
                return (
                  <p className="text-xs text-muted">
                    Balance due{' '}
                    <span className="font-semibold text-amber-600">
                      {money(Math.round((payableNow - paid) * 100) / 100)}
                    </span>
                    {paid > 0 ? ' — press Save to record the payment' : ''}
                  </p>
                )
              })()}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink">
              <input
                type="checkbox"
                checked={itsPaid}
                onChange={(event) => onItsPaidChange(event.target.checked)}
                className="size-3.5 accent-primary"
              />
              It&apos;s Paid
            </label>
            {/* Loyalty and Send Feedback SMS are switched off for now:
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink">
              <input
                type="checkbox"
                checked={loyalty}
                onChange={(event) => onLoyaltyChange(event.target.checked)}
                className="size-3.5 accent-primary"
              />
              Loyalty
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink">
              <input
                type="checkbox"
                checked={feedbackSms}
                onChange={(event) => onFeedbackSmsChange(event.target.checked)}
                className="size-3.5 accent-primary"
              />
              Send Feedback SMS
            </label>
            */}
          </div>

          <div className="flex gap-1.5">
            {(
              [
                { id: 'Save', label: 'Save' },
                { id: 'Save & Print', label: 'Save & Print' },
                { id: 'Save & eBill', label: 'Save & eBill' },
                { id: 'KOT', label: 'KOT' },
                { id: 'KOT & Print', label: 'KOT & Print' },
                { id: 'Hold', label: 'Hold' },
              ] as const
            ).map((action) => (
              <button
                key={action.id}
                type="button"
                aria-label={
                  action.id === 'Hold'
                    ? 'Put current order on hold'
                    : action.label
                }
                data-tooltip={
                  action.id === 'Hold'
                    ? 'Put current order on hold'
                    : action.label
                }
                onClick={() => {
                  // On Due, an amount typed in "Amount paid now" is settled now and
                  // the rest is booked as due.
                  const duePaidNow =
                    payment === 'due'
                      ? Math.min(payableNow, Math.max(0, Number(duePaid) || 0))
                      : 0
                  if (
                    (itsPaid || duePaidNow > 0) &&
                    action.id === 'Save' &&
                    onSettleSave
                  ) {
                    if (payment === 'due') {
                      onSettleSave(
                        duePaidNow,
                        Math.round((payableNow - duePaidNow) * 100) / 100,
                        chargesSnapshot(),
                      )
                      setDuePaid('')
                    } else {
                      // "It's Paid" + Save books the bill as paid in full.
                      onSettleSave(payableNow, 0, chargesSnapshot())
                    }
                    onItsPaidChange(false)
                    return
                  }
                  onAction(action.id, chargesSnapshot())
                }}
                className={`inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1 text-[10px] font-semibold leading-tight sm:text-xs ${
                  action.id === 'Hold'
                    ? 'border border-primary bg-card text-primary hover:bg-primary/5'
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <BillingAdvanceOrderModal
        open={advanceOpen}
        outletId={encryptedOutletId}
        lines={lines}
        total={roundedTotal}
        orderType={orderType}
        customerName={customer.name}
        customerPhone={customer.mobile}
        onClose={() => setAdvanceOpen(false)}
        onSaved={() => onClearItems?.()}
      />
    </aside>
  )
}
