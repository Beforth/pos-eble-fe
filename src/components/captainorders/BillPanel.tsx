import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import {
  ChevronDown,
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
import { SelectDropdown } from '../common/SelectDropdown'
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
import { OTHER_PAYMENT_TYPES } from './OtherPaymentModal'
import { PrimaryButton } from '../menu/MenuActionButtons'

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
}
export type PaymentMethod = 'cash' | 'card' | 'due' | 'other' | 'part'

export interface CartLine {
  id: string
  itemId: string
  name: string
  price: number
  qty: number
  note?: string
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
  orderType: OrderType
  payment: PaymentMethod
  tableId: string
  tables: BillingTableRow[]
  guests: number
  complimentary: boolean
  itsPaid: boolean
  loyalty: boolean
  feedbackSms: boolean
  customer: CustomerDetails
  customerFormOpen: boolean
  customerErrors?: Partial<Record<keyof CustomerDetails, boolean>>
  onOrderTypeChange: (type: OrderType) => void
  onPaymentChange: (method: PaymentMethod) => void
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
  onSettleSave?: (amount: number, due?: number) => void
  onCustomerChange: (customer: CustomerDetails) => void
  onCustomerFormOpenChange: (open: boolean) => void
  onNotesClick?: () => void
  hasOrderNote?: boolean
  onOpenDrafts?: () => void
  draftCount?: number
  /**
   * Whether the user may take money on this order. A captain is denied
   * `pos_settle_save` (and `pos_allow_billing_rights`), so the payment
   * methods, the settlement box and the bill Save actions are hidden for them
   * rather than left on screen to fail. Order-taker actions (KOT, Draft) stay.
   */
  canSettle?: boolean
}

const ORDER_TYPES: { id: OrderType; label: string }[] = [
  { id: 'dine-in', label: 'Dine In' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'pick-up', label: 'Pick Up' },
]

const PAYMENTS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'due', label: 'Due' },
  { id: 'other', label: 'Other' },
  { id: 'part', label: 'Part' },
]

function RequiredMark() {
  return <span className="ml-0.5 text-primary">*</span>
}

function fieldClass(error?: boolean) {
  return `h-9 w-full rounded-lg border bg-card px-3 text-sm text-ink outline-none transition-colors placeholder:text-muted ${
    error
      ? 'border-primary bg-primary/[0.03] focus:border-primary'
      : 'border-line focus:border-primary focus:bg-white'
  }`
}

export function BillPanel({
  lines,
  tableKots = [],
  focusKotNo = null,
  taxSource,
  taxSettings,
  chargeTaxes,
  orderType,
  payment,
  tableId,
  tables,
  guests,
  complimentary,
  itsPaid,
  loyalty,
  feedbackSms,
  customer,
  customerFormOpen,
  customerErrors,
  onOrderTypeChange,
  onPaymentChange,
  onTableIdChange,
  onGuestsChange,
  onComplimentaryChange,
  onItsPaidChange,
  onLoyaltyChange,
  onFeedbackSmsChange,
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
  canSettle = true,
}: BillPanelProps) {
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

  useEffect(() => {
    setExpandedKotNo(focusKotNo ?? null)
  }, [tableId, focusKotNo])
  const currentTotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0)
  const kotTotal = tableKots.reduce((sum, kot) => sum + kot.amount, 0)
  const total = currentTotal + kotTotal
  const hasSentKots = tableKots.length > 0
  const hasAnyItems = lines.length > 0 || hasSentKots
  const [settlementInput, setSettlementInput] = useState('')
  const [settlementError, setSettlementError] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [noteLineId, setNoteLineId] = useState<string | null>(null)
  // Derive after the state above — reading noteLineId before its declaration is
  // a temporal-dead-zone ReferenceError whenever the cart has a line.
  const noteLine = lines.find((line) => line.id === noteLineId) ?? null
  const [noteDraft, setNoteDraft] = useState('')
  const [specialNotes, setSpecialNotes] = useState<SpecialNote[]>([])
  const [discount, setDiscount] = useState(0)

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
  const [otherPlatform, setOtherPlatform] = useState<string>(OTHER_PAYMENT_TYPES[0])

  const itemCount =
    lines.reduce((sum, line) => sum + line.qty, 0) +
    (hasSentKots ? tableKots.length : 0)

  const deliveryValue = Number(deliveryCharge) || 0
  const containerValue = Number(containerCharge) || 0
  const tipValue = Number(tip) || 0
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
      setSettlementError(null)
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
    setSettlementError(null)
  }, [taxableBase, hasAnyItems])

  useEffect(() => {
    if (orderType !== 'delivery') {
      setDeliveryCharge('0')
      setContainerCharge('0')
      setCustomerPaid('0')
      setTip('0')
    }
  }, [orderType])

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
    }
  }

  function updateCustomer<K extends keyof CustomerDetails>(
    key: K,
    value: CustomerDetails[K],
  ) {
    onCustomerChange({ ...customer, [key]: value })
  }

  function handleSettlementBlur() {
    const raw = Number(settlementInput)
    if (settlementInput.trim() === '' || Number.isNaN(raw) || raw < 0) {
      setSettlementError('Enter a valid amount')
      return
    }
    const rounded = roundSettlementAmount(raw)
    setSettlementInput(String(rounded))
    setSettlementError(null)
  }

  function handleSettleSave() {
    const raw = Number(settlementInput)
    if (settlementInput.trim() === '' || Number.isNaN(raw) || raw < 0) {
      setSettlementError('Enter a valid amount')
      return
    }
    if (!hasAnyItems) {
      setSettlementError('Add items before settling')
      return
    }
    const rounded = roundSettlementAmount(raw)
    setSettlementInput(String(rounded))
    const due = Math.max(0, Math.round((roundedTotal - rounded) * 100) / 100)
    // A short settlement books a due balance, which is tracked per customer —
    // so the customer name is mandatory before it can be saved.
    if (due > 0 && !customer.name.trim()) {
      setSettlementError('Customer name is required when a due balance remains')
      onCustomerFormOpenChange(true)
      return
    }
    setSettlementError(null)
    onSettleSave?.(rounded, due)
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
    <aside className="flex h-full w-full min-h-0 shrink-0 flex-col border-line bg-card lg:border-l">
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
        message={`The bill (${money(total)}) will be emptied in one go.`}
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
      <div className="grid grid-cols-3 gap-1 border-b border-line p-2">
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
        <button
          type="button"
          aria-label="Select table"
          data-tooltip="Select table"
          onClick={() => {
            setTablePickerOpen((open) => !open)
            setGuestsPickerOpen(false)
            onCustomerFormOpenChange(false)
          }}
          className="relative inline-flex size-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-page hover:text-ink"
        >
          <Utensils size={16} />
          {selectedTable ? (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {selectedTable.tableNo}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          data-tooltip={guests === 0 ? 'No. of Persons' : `Guests: ${guests}`}
          aria-label={guests === 0 ? 'No. of Persons' : `Guests: ${guests}`}
          onClick={() => {
            setTablePickerOpen(false)
            onCustomerFormOpenChange(false)
            setGuestsPickerOpen((open) => !open)
          }}
          className={`relative inline-flex size-9 items-center justify-center rounded-lg border transition-colors ${
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
          data-tooltip="Draft bills"
          aria-label="Draft bills"
          onClick={() => {
            setTablePickerOpen(false)
            setGuestsPickerOpen(false)
            onCustomerFormOpenChange(false)
            onOpenDrafts?.()
          }}
          className="relative inline-flex size-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-page hover:text-primary"
        >
          <FilePenLine size={16} />
          {draftCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {draftCount > 9 ? '9+' : draftCount}
            </span>
          ) : null}
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
        <span className="rounded-md bg-secondary px-2.5 py-1.5 text-xs font-bold text-deep">
          {selectedTable?.areaName ?? 'Select Area'}
        </span>

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
          <div className="absolute left-2 top-12 z-20 w-56 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
            <p className="border-b border-line px-3 py-2 text-xs font-semibold text-muted">
              Select table
            </p>
            <ul className="max-h-48 overflow-y-auto py-1">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onTableIdChange('')
                    onGuestsChange(0)
                    setTablePickerOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-page ${
                    !tableId
                      ? 'font-semibold text-primary'
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
                    className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-page ${
                      table.id === tableId
                        ? 'font-semibold text-primary'
                        : 'text-ink'
                    }`}
                  >
                    <span>Table {table.tableNo}</span>
                    <span className="text-xs text-muted">{table.areaName}</span>
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
                  Required for Due payment — all fields marked with * are compulsory
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
                  aria-label="List"
                  data-tooltip="List"
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-card hover:text-ink"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Wallet"
                  data-tooltip="Wallet"
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
                  Mobile
                  <RequiredMark />
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={customer.mobile}
                  onChange={(e) => updateCustomer('mobile', e.target.value)}
                  placeholder="10-digit mobile number"
                  className={fieldClass(customerErrors?.mobile)}
                  aria-required
                  autoFocus
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Name
                  <RequiredMark />
                </span>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => updateCustomer('name', e.target.value)}
                  placeholder="Customer name"
                  className={fieldClass(customerErrors?.name)}
                  aria-required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Address
                  <RequiredMark />
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={customer.address}
                    onChange={(e) => updateCustomer('address', e.target.value)}
                    placeholder="Full address"
                    className={`pr-8 ${fieldClass(customerErrors?.address)}`}
                    aria-required
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
                  <RequiredMark />
                </span>
                <input
                  type="text"
                  value={customer.locality}
                  onChange={(e) => updateCustomer('locality', e.target.value)}
                  placeholder="Area / locality"
                  className={fieldClass(customerErrors?.locality)}
                  aria-required
                />
              </label>
            </div>

            {(customerErrors?.mobile ||
              customerErrors?.name ||
              customerErrors?.address ||
              customerErrors?.locality) && (
              <p className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-2 text-xs font-medium text-primary">
                Please fill all compulsory fields marked with *
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b border-line bg-page px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            <span>Items</span>
            <span className="w-16 text-center">Qty</span>
            <span className="w-14 text-right">Price</span>
            <span className="w-7" />
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto">
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
                {hasSentKots ? (
                  <div className="border-b border-line bg-page/60">
                    <p className="border-b border-line px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Sent KOTs ·{' '}
                      {selectedTable
                        ? `Table ${selectedTable.tableNo}`
                        : 'No table'}
                    </p>
                    <ul>
                      {tableKots.map((kot) => {
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
                          <div className="flex w-16 items-center justify-center gap-1">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              data-tooltip="Decrease quantity"
                              onClick={() => onQtyChange(line.id, line.qty - 1)}
                              className="inline-flex size-6 items-center justify-center rounded border border-line text-muted hover:bg-page"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-5 text-center text-sm font-semibold text-ink">
                              {line.qty}
                            </span>
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
            <div className="flex items-center justify-between text-sm text-ink">
              <span>
                Tax{' '}
                <button
                  type="button"
                  onClick={() => onAction('Tax')}
                  className="text-xs font-semibold text-primary"
                >
                  More
                </button>
              </span>
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

            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={() => onAction('Bogo Offer')}
                className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                Bogo Offer
              </button>
              {/* order-split is gated on pos_allow_billing_rights. */}
              {canSettle ? (
                <button
                  type="button"
                  onClick={() => onAction('Split')}
                  className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover"
                >
                  Split
                </button>
              ) : null}
            </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-3 bg-white p-3">
          {/* order-settle is gated on pos_settle_save: no settlement box for a captain. */}
          {canSettle ? (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-ink">
                  Settlement Amount
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={settlementInput}
                  onChange={(e) => {
                    setSettlementInput(e.target.value)
                    if (settlementError) setSettlementError(null)
                  }}
                  onBlur={handleSettlementBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSettleSave()
                    }
                  }}
                  className={`h-9 w-[110px] rounded-md border bg-white px-2.5 text-sm text-ink outline-none focus:border-primary ${
                    settlementError ? 'border-primary' : 'border-line'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSettleSave}
                  className="h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover"
                >
                  Settle & Save
                </button>
                <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink">
                  <input
                    type="checkbox"
                    checked={complimentary}
                    onChange={(event) => onComplimentaryChange(event.target.checked)}
                    className="size-3.5 accent-primary"
                  />
                  Complimentary
                </label>
              </div>
              {settlementError ? (
                <p className="text-xs text-primary">{settlementError}</p>
              ) : null}
            </div>
          ) : null}

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

          {canSettle ? (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              {PAYMENTS.map((method) => (
                <label
                  key={method.id}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink"
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === method.id}
                    onChange={() => onPaymentChange(method.id)}
                    className="size-3.5 accent-primary"
                  />
                  {method.label}
                </label>
              ))}
            </div>
          ) : null}

          {canSettle && payment === 'other' ? (
            <label className="block text-sm font-semibold text-ink">
              Other Payment Type
              <select
                value={otherPlatform}
                onChange={(e) => setOtherPlatform(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-md border border-line bg-white px-3 text-sm font-normal text-ink outline-none focus:border-primary"
              >
                {OTHER_PAYMENT_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {canSettle && payment === 'due' ? (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <Clock3 size={13} />
              Due payment — customer details required
            </p>
          ) : null}

          {canSettle ? (
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink">
                <input
                  type="checkbox"
                  checked={itsPaid}
                  onChange={(event) => onItsPaidChange(event.target.checked)}
                  className="size-3.5 accent-primary"
                />
                It&apos;s Paid
              </label>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
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
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
            {(
              [
                // Save / Save & Print create a bill, which a captain is denied;
                // KOT, KOT & Print and Draft are order-taker actions they keep.
                ...(canSettle
                  ? [
                      { id: 'Save', label: 'Save' },
                      { id: 'Save & Print', label: 'Save & Print' },
                    ]
                  : []),
                // { id: 'Save & eBill', label: 'Save & eBill' },
                { id: 'KOT', label: 'KOT' },
                { id: 'KOT & Print', label: 'KOT & Print' },
                { id: 'Draft', label: 'Draft', icon: true },
              ] as const
            ).map((action) => (
              <button
                key={action.id}
                type="button"
                aria-label={
                  action.id === 'Draft'
                    ? 'Save current order as draft'
                    : action.label
                }
                data-tooltip={
                  action.id === 'Draft'
                    ? 'Save current order as draft'
                    : action.label
                }
                onClick={() => onAction(action.id, chargesSnapshot())}
                className={`inline-flex h-10 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-1 text-[11px] font-semibold leading-tight sm:text-xs ${
                  action.id === 'Draft'
                    ? 'border border-primary bg-card text-primary hover:bg-primary/5'
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
              >
                {action.id === 'Draft' ? <FilePenLine size={13} /> : null}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
