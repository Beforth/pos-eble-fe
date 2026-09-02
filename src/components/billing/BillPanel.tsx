import { useEffect, useState } from 'react'
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
import { billingTables } from '../../mocks/billingTables'
import { roundSettlementAmount } from '../../utils/settlementRound'
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
import { OTHER_PAYMENT_TYPES } from './OtherPaymentModal'

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
export type PaymentMethod = 'cash' | 'card' | 'due' | 'other' | 'part'

export interface CartLine {
  id: string
  itemId: string
  name: string
  price: number
  qty: number
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
    items: { id: string; name: string; qty: number; price: number; note?: string }[]
  }[]
  orderType: OrderType
  payment: PaymentMethod
  tableId: string
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
  onRemoveKotItem?: (payload: {
    ticketId: string
    itemId: string
    reason: string
  }) => void
  onClearItems?: () => void
  onAction: (action: string) => void
  onSettleSave?: (amount: number) => void
  onCustomerChange: (customer: CustomerDetails) => void
  onCustomerFormOpenChange: (open: boolean) => void
  onNotesClick?: () => void
  hasOrderNote?: boolean
  onOpenDrafts?: () => void
  draftCount?: number
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
  tableKots = [],
  orderType,
  payment,
  tableId,
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
  const [tablePickerOpen, setTablePickerOpen] = useState(false)
  const [guestsPickerOpen, setGuestsPickerOpen] = useState(false)
  const [expandedKotNo, setExpandedKotNo] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    ticketId: string
    itemId: string
    itemName: string
  } | null>(null)
  const selectedTable = billingTables.find((t) => t.id === tableId)

  useEffect(() => {
    setExpandedKotNo(null)
  }, [tableId])
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
  const [settlementInput, setSettlementInput] = useState('')
  const [settlementError, setSettlementError] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
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
  const [historyNotice, setHistoryNotice] = useState<string | null>(null)
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
  const taxableBase = Math.max(0, total - discount + deliveryValue + containerValue)
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
    setSettlementError(null)
    onSettleSave?.(rounded)
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
    setHistoryNotice('Customer history deleted')
    window.setTimeout(() => setHistoryNotice(null), 2200)
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-line bg-card lg:w-[440px] lg:border-l lg:border-t-0 xl:w-[480px]">
      {historyNotice ? (
        <div className="fixed bottom-5 right-5 z-[80] rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {historyNotice}
        </div>
      ) : null}
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
          title="Select table"
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
              {selectedTable.areaName === 'Party Hall'
                ? `P${selectedTable.tableNo.replace(/\D/g, '')}`
                : selectedTable.tableNo}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          title={guests === 0 ? 'No. of Persons' : `Guests: ${guests}`}
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
          title="Customer"
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
          title="Notes"
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
          title="Draft bills"
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
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-white">
            {draftCount > 99 ? '99+' : draftCount}
          </span>
        </button>
        <button
          type="button"
          title="Delete all items"
          aria-label="Delete all items"
          disabled={lines.length === 0}
          onClick={onClearItems}
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
              {billingTables.map((table) => (
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
                  Required for Due payment — mobile and name marked with * are
                  compulsory
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-line bg-page p-0.5">
                <button
                  type="button"
                  title="History"
                  onClick={() => setHistoryOpen(true)}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-card hover:text-ink"
                >
                  <History size={14} />
                </button>
                <button
                  type="button"
                  title="Tax / GST"
                  onClick={() => setGstOpen(true)}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-card hover:text-ink"
                >
                  <FileText size={14} />
                </button>
                <button
                  type="button"
                  title="Order list"
                  onClick={() => setHistoryOpen(true)}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-card hover:text-ink"
                >
                  <List size={14} />
                </button>
                <button
                  type="button"
                  title="Wallet balance"
                  onClick={() => {
                    if (!customer.mobile.trim()) {
                      setHistoryNotice('Enter a mobile number first')
                      window.setTimeout(() => setHistoryNotice(null), 2200)
                      return
                    }
                    setHistoryNotice('Wallet — coming soon')
                    window.setTimeout(() => setHistoryNotice(null), 2200)
                  }}
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-card hover:text-ink"
                >
                  <Wallet size={14} />
                </button>
                <button
                  type="button"
                  title="Delete customer history"
                  onClick={clearCustomerHistory}
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
                    aria-required
                    autoFocus
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Name
                  <RequiredMark />
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
                  aria-required
                />
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
            <span className="w-16 text-center">Qty</span>
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
                                        title={`Delete ${item.name}`}
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
                          <span className="min-w-0 truncate text-sm font-medium text-ink">
                            {line.name}
                          </span>
                          <div className="flex w-16 items-center justify-center gap-1">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
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
                              onClick={() => onQtyChange(line.id, line.qty + 1)}
                              className="inline-flex size-6 items-center justify-center rounded border border-line text-muted hover:bg-page"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="w-14 text-right text-sm font-semibold text-ink">
                            ₹{line.price * line.qty}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove ${line.name}`}
                            onClick={() => onRemoveLine(line.id)}
                            className="inline-flex size-7 items-center justify-center rounded text-muted hover:bg-primary/10 hover:text-primary"
                          >
                            <Trash2 size={14} />
                          </button>
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
              title={detailsOpen ? 'Hide bill details' : 'Show bill details'}
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

        {hasAnyItems && detailsOpen ? (
          <div className="max-h-[38vh] space-y-2 overflow-y-auto border-b border-line bg-white px-3 pb-2 pt-1">
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
            <div className="flex items-center justify-between gap-2 text-sm text-ink">
              <span>Tax</span>
              <span className="font-semibold">{money(0)}</span>
            </div>
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
              <button
                type="button"
                onClick={() => onAction('Split')}
                className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-hover"
              >
                Split
              </button>
            </div>
          </div>
        ) : null}

        <div className="space-y-3 bg-white p-3">
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

          {payment === 'other' ? (
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

          {payment === 'due' ? (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              <Clock3 size={13} />
              Due payment — customer details required
            </p>
          ) : null}

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
                { id: 'Save', label: 'Save' },
                { id: 'Save & Print', label: 'Save & Print' },
                // { id: 'Save & eBill', label: 'Save & eBill' },
                { id: 'KOT', label: 'KOT' },
                { id: 'KOT & Print', label: 'KOT & Print' },
                { id: 'Draft', label: 'Draft', icon: true },
              ] as const
            ).map((action) => (
              <button
                key={action.id}
                type="button"
                title={
                  action.id === 'Draft'
                    ? 'Save current order as draft'
                    : action.label
                }
                onClick={() => onAction(action.id)}
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
