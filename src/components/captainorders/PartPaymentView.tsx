import { useEffect, useMemo, useState } from 'react'
import {
  CreditCard,
  FileText,
  Clock3,
  Coins,
  QrCode,
  Wallet,
  X,
} from 'lucide-react'

export interface PartPaymentEntry {
  id: string
  method: 'card' | 'upi' | 'wallets' | 'other' | 'due'
  label: string
  amount: number
  comment?: string
}

type PartMethodTab = 'card' | 'upi' | 'wallets' | 'other' | 'due'

interface PartPaymentViewProps {
  billNo: string
  payableAmount: number
  onBackToOrder: () => void
  onNewOrder: () => void
  onPrint?: () => void
}

const OTHER_OPTIONS = ['Google Pay', 'Paytm', 'Cheque'] as const
const WALLET_OPTIONS = ['Paytm', 'PhonePe', 'Amazon Pay'] as const

const TABS: {
  id: PartMethodTab
  label: string
  icon: typeof CreditCard
}[] = [
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'upi', label: 'UPI', icon: QrCode },
  { id: 'wallets', label: 'Wallets', icon: Wallet },
  { id: 'other', label: 'Other', icon: Coins },
  { id: 'due', label: 'Due Payment', icon: Clock3 },
]

export function PartPaymentView({
  billNo,
  payableAmount,
  onBackToOrder,
  onNewOrder,
  onPrint,
}: PartPaymentViewProps) {
  const [tab, setTab] = useState<PartMethodTab>('card')
  const [amount, setAmount] = useState(String(payableAmount || ''))
  const [otherType, setOtherType] = useState<(typeof OTHER_OPTIONS)[number]>('Paytm')
  const [walletType, setWalletType] = useState<(typeof WALLET_OPTIONS)[number]>('Paytm')
  const [comment, setComment] = useState('')
  const [entries, setEntries] = useState<PartPaymentEntry[]>([])
  const [otherOpen, setOtherOpen] = useState(false)

  const paidTotal = useMemo(
    () => entries.reduce((sum, e) => sum + e.amount, 0),
    [entries],
  )
  const remaining = Math.max(0, Number((payableAmount - paidTotal).toFixed(2)))

  useEffect(() => {
    setAmount(String(remaining > 0 ? remaining : payableAmount || ''))
  }, [payableAmount, remaining])

  function methodLabel(): string {
    if (tab === 'card') return 'Card'
    if (tab === 'upi') return 'UPI'
    if (tab === 'wallets') return `Wallets (${walletType})`
    if (tab === 'other') return `Other (${otherType})`
    return 'Due Payment'
  }

  function handleSave() {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return
    if (value > remaining + 0.001) return

    setEntries((prev) => [
      ...prev,
      {
        id: `pay-${Date.now()}`,
        method: tab,
        label: methodLabel(),
        amount: Number(value.toFixed(2)),
        comment: comment.trim() || undefined,
      },
    ])
    setComment('')
    setOtherOpen(false)
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <h1 className="text-xl font-bold text-ink">Part Payment</h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 text-sm">
          <p className="text-ink">
            Bill No :{' '}
            <span className="font-semibold text-primary">
              {billNo || '—'}
            </span>
          </p>
          <p className="text-ink">
            Payable Amount :{' '}
            <span className="font-semibold text-primary">
              ₹ {payableAmount.toLocaleString('en-IN')}
            </span>
          </p>
        </div>

        {/* Method tabs */}
        <div className="mt-4 flex flex-wrap gap-0 border-b border-line">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id)
                  setOtherOpen(false)
                }}
                className={`flex min-w-[100px] flex-1 flex-col items-center gap-1.5 border px-3 py-3 text-xs font-semibold transition-colors sm:min-w-[120px] ${
                  active
                    ? 'border-primary text-primary'
                    : 'border-line text-muted hover:text-ink'
                }`}
              >
                <Icon size={28} strokeWidth={1.5} />
                {label}
              </button>
            )
          })}
        </div>

        {/* Input section */}
        <div className="mt-5 space-y-4">
          {tab === 'card' || tab === 'upi' || tab === 'due' ? (
            <div>
              <p className="mb-2 text-sm font-bold text-ink">
                {tab === 'card'
                  ? 'Captured Amount:'
                  : tab === 'upi'
                    ? 'UPI Amount:'
                    : 'Due Amount:'}
              </p>
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-sm text-ink">
                  Enter Amount: <span className="text-primary">*</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block h-9 w-40 rounded border border-line bg-white px-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-9 rounded bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  Save
                </button>
              </div>
            </div>
          ) : null}

          {tab === 'wallets' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-sm text-ink">
                  Wallet:
                  <select
                    value={walletType}
                    onChange={(e) =>
                      setWalletType(e.target.value as (typeof WALLET_OPTIONS)[number])
                    }
                    className="mt-1 block h-9 min-w-[160px] rounded border border-line bg-white px-2.5 text-sm outline-none focus:border-primary"
                  >
                    {WALLET_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="min-w-[200px] flex-1 text-sm text-ink">
                  Comments:
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1 block h-9 w-full rounded border border-line bg-white px-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-sm text-ink">
                  Enter Amount: <span className="text-primary">*</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block h-9 w-40 rounded border border-line bg-white px-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-9 rounded bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  Save
                </button>
              </div>
            </div>
          ) : null}

          {tab === 'other' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                <div className="relative text-sm text-ink">
                  <p className="mb-1">Other:</p>
                  <button
                    type="button"
                    onClick={() => setOtherOpen((o) => !o)}
                    className="flex h-9 min-w-[160px] items-center justify-between rounded border border-line bg-white px-2.5 text-left text-sm hover:border-muted"
                  >
                    {otherType}
                    <span className="text-muted">▾</span>
                  </button>
                  {otherOpen ? (
                    <ul className="absolute left-0 top-[calc(100%+4px)] z-20 min-w-full overflow-hidden rounded border border-line bg-white shadow-lg">
                      {OTHER_OPTIONS.map((opt) => (
                        <li key={opt}>
                          <button
                            type="button"
                            onClick={() => {
                              setOtherType(opt)
                              setOtherOpen(false)
                            }}
                            className={`flex w-full px-3 py-2 text-left text-sm hover:bg-primary hover:text-white ${
                              opt === otherType
                                ? 'bg-primary text-white'
                                : 'text-ink'
                            }`}
                          >
                            {opt}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <label className="min-w-[200px] flex-1 text-sm text-ink">
                  Comments:
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1 block h-9 w-full rounded border border-line bg-white px-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-sm text-ink">
                  Enter Amount: <span className="text-primary">*</span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 block h-9 w-40 rounded border border-line bg-white px-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-9 rounded bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
                >
                  Save
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Payment Summary */}
        <div className="mt-8 overflow-hidden rounded border border-[#f0e6c8] bg-[#fff8e1]">
          <div className="flex items-center justify-between gap-3 border-b border-[#f0e6c8] px-4 py-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <FileText size={16} className="text-muted" />
              Payment Summary
            </div>
            <span className="text-sm font-semibold tabular-nums text-ink">
              ₹ {payableAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <ul className="divide-y divide-[#f0e6c8]">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink"
              >
                <button
                  type="button"
                  aria-label={`Remove ${entry.label}`}
                  onClick={() => removeEntry(entry.id)}
                  className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-primary text-white hover:bg-primary-hover"
                >
                  <X size={12} strokeWidth={3} />
                </button>
                <span className="min-w-0 flex-1">
                  Paid via {entry.label}
                  {entry.comment ? (
                    <span className="text-muted"> — {entry.comment}</span>
                  ) : null}
                </span>
                <span className="font-medium tabular-nums">
                  ₹ {entry.amount.toLocaleString('en-IN')}
                </span>
              </li>
            ))}

            {remaining > 0 ? (
              <li className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-ink">
                <span className={entries.length === 0 ? 'pl-0' : 'pl-7'}>
                  Pay via Cash
                </span>
                <span className="font-medium tabular-nums">
                  ₹ {remaining.toLocaleString('en-IN')}
                </span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line bg-white px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onBackToOrder}
          className="h-9 rounded border border-ink/80 bg-white px-4 text-sm font-medium text-ink hover:bg-page"
        >
          Back To Order
        </button>
        <button
          type="button"
          onClick={onNewOrder}
          className="h-9 rounded bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          New Order
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="h-9 rounded bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Print
        </button>
      </div>
    </div>
  )
}
