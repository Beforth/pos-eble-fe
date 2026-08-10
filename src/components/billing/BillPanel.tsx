import { useState } from 'react'
import {
  Minus,
  Plus,
  StickyNote,
  Trash2,
  UserRound,
  Users,
  Utensils,
} from 'lucide-react'
import { billingTables } from '../../mocks/billingTables'

export type OrderType = 'dine-in' | 'delivery' | 'pick-up'
export type PaymentMethod = 'cash' | 'card' | 'due' | 'other' | 'part'

export interface CartLine {
  id: string
  itemId: string
  name: string
  price: number
  qty: number
}

interface BillPanelProps {
  lines: CartLine[]
  orderType: OrderType
  payment: PaymentMethod
  tableId: string
  guests: number
  complimentary: boolean
  itsPaid: boolean
  loyalty: boolean
  feedbackSms: boolean
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
  onAction: (action: string) => void
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

export function BillPanel({
  lines,
  orderType,
  payment,
  tableId,
  guests,
  complimentary,
  itsPaid,
  loyalty,
  feedbackSms,
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
  onAction,
}: BillPanelProps) {
  const [tablePickerOpen, setTablePickerOpen] = useState(false)
  const selectedTable = billingTables.find((t) => t.id === tableId)
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0)

  return (
    <aside className="flex w-full shrink-0 flex-col border-l border-line bg-card lg:w-[380px] xl:w-[420px]">
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
          onClick={() => setTablePickerOpen((open) => !open)}
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
          title="Guests"
          onClick={() => onGuestsChange(Math.max(1, guests + 1))}
          className="relative inline-flex size-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-page hover:text-ink"
        >
          <Users size={16} />
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
            {guests}
          </span>
        </button>
        <button
          type="button"
          title="Customer"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-page hover:text-ink"
        >
          <UserRound size={16} />
        </button>
        <button
          type="button"
          title="Notes"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-page hover:text-ink"
        >
          <StickyNote size={16} />
        </button>
        <span className="ml-auto rounded-md bg-secondary px-2.5 py-1.5 text-xs font-bold text-deep">
          {selectedTable?.areaName ?? 'Select Area'}
        </span>

        {tablePickerOpen ? (
          <div className="absolute left-2 top-12 z-20 w-56 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
            <p className="border-b border-line px-3 py-2 text-xs font-semibold text-muted">
              Select table
            </p>
            <ul className="max-h-48 overflow-y-auto py-1">
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

      {/* Line items */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b border-line bg-page px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
        <span>Items</span>
        <span className="w-16 text-center">Qty</span>
        <span className="w-14 text-right">Price</span>
        <span className="w-7" />
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto">
        {lines.length === 0 ? (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 px-4 text-center">
            <Utensils size={48} className="text-line" strokeWidth={1} />
            <p className="text-sm font-medium text-muted">No Item Selected</p>
            <p className="text-xs text-muted">Tap an item to add it to the bill</p>
          </div>
        ) : (
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
        )}
      </div>

      {/* Offers + total */}
      <div className="space-y-3 border-t border-line p-3">
        <div className="flex flex-wrap items-center gap-2">
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

        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold text-ink">Total</span>
          <span className="text-2xl font-bold text-accent">
            {total.toLocaleString('en-IN', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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

        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {[
            'Save',
            'Save & Print',
            'Save & eBill',
            'KOT',
            'KOT & Print',
            'Hold',
          ].map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => onAction(action)}
              className={`h-10 rounded-lg px-1 text-[11px] font-semibold leading-tight sm:text-xs ${
                action === 'Hold'
                  ? 'border border-line bg-card text-ink hover:bg-page'
                  : 'bg-primary text-white hover:bg-primary-hover'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
