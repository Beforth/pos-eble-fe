import { CheckCircle2, Plus, Printer } from 'lucide-react'

import type { DummyBillData } from './DummyBillModal'

interface SettledBillPanelProps {
  bill: DummyBillData
  onNewOrder: () => void
  onReprint: () => void
}

function formatMoney(n: number) {
  return n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SettledBillPanel({
  bill,
  onNewOrder,
  onReprint,
}: SettledBillPanelProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-line bg-card lg:w-[440px] lg:border-l lg:border-t-0 xl:w-[480px]">
      <div className="flex items-start justify-between gap-3 border-b border-line px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            Bill #{bill.billNo}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-accent">
            <CheckCircle2 size={12} />
            Settled &amp; printed
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-page px-2 py-1 text-[11px] text-muted">
          {formatDateTime(bill.createdAt)}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-0.5 border-b border-line bg-page/60 px-3 py-2 text-[11px]">
          <div className="flex justify-between gap-3">
            <span className="text-muted">Customer</span>
            <span className="truncate font-medium text-ink">
              {bill.customerName || 'Walk-in'}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">Phone</span>
            <span className="font-medium text-ink">
              {bill.customerPhone || '—'}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">Payment</span>
            <span className="font-medium uppercase text-ink">
              {bill.paymentLabel}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-muted">KOTs merged</span>
            <span className="font-medium text-ink">{bill.kotCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 border-b border-line bg-page px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
          <span>Items</span>
          <span className="w-16 text-center">Qty</span>
          <span className="w-14 text-right">Price</span>
          <span className="w-7" />
        </div>

        <ul className="divide-y divide-line">
          {bill.items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="flex items-center gap-2 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{item.name}</p>
                {item.kotNo != null ? (
                  <p className="text-[11px] text-muted">KOT {item.kotNo}</p>
                ) : null}
              </div>
              <span className="w-16 text-center text-sm text-muted">
                {item.qty}
              </span>
              <span className="w-14 text-right text-sm text-muted">
                {formatMoney(item.price)}
              </span>
              <span className="w-7 text-right text-sm font-semibold text-ink">
                {formatMoney(item.price * item.qty)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-1.5 border-t border-line bg-white p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Subtotal</span>
          <span className="text-ink">₹{formatMoney(bill.subtotal)}</span>
        </div>
        {bill.discount ? (
          <div className="flex justify-between">
            <span className="text-muted">Discount</span>
            <span className="text-ink">₹{formatMoney(bill.discount)}</span>
          </div>
        ) : null}
        {bill.tax > 0 ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted">Tax</span>
              <span className="text-ink">₹{formatMoney(bill.tax)}</span>
            </div>
            {(bill.taxBreakdown ?? []).map((row) => (
              <div
                key={`${row.mode}:${row.label}`}
                className="flex justify-between pl-2 text-[11px] text-muted"
              >
                <span>
                  {row.label}
                  {row.rate > 0 ? ` @${row.rate}%` : ''}
                  {row.mode === 'backward' ? ' (incl.)' : ''}
                </span>
                <span>₹{formatMoney(row.amount)}</span>
              </div>
            ))}
          </>
        ) : null}
        {bill.orderType === 'delivery' ? (
          <>
            <div className="flex justify-between">
              <span className="text-muted">Delivery Charge</span>
              <span className="text-ink">
                ₹{formatMoney(bill.deliveryCharge ?? 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Container Charge</span>
              <span className="text-ink">
                ₹{formatMoney(bill.containerCharge ?? 0)}
              </span>
            </div>
          </>
        ) : null}
        <div className="flex justify-between">
          <span className="text-muted">Round Off</span>
          <span className="text-ink">₹{formatMoney(bill.roundOff ?? 0)}</span>
        </div>
        <div className="flex items-end justify-between border-t border-line pt-2">
          <span className="text-sm font-semibold text-ink">Total paid</span>
          <span className="text-2xl font-bold text-accent">
            ₹{formatMoney(bill.total)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line p-3">
        <button
          type="button"
          onClick={onNewOrder}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Order
        </button>
        <button
          type="button"
          onClick={onReprint}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <Printer size={15} />
          Print again
        </button>
        <p className="w-full text-[11px] text-muted">
          This bill is settled. Tap New Order to start the next one.
        </p>
      </div>
    </aside>
  )
}