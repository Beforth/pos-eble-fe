import { useEffect } from 'react'
import {
  CalendarDays,
  ClipboardCheck,
  List,
  Receipt,
  Utensils,
  X,
} from 'lucide-react'

export interface CustomerHistoryOrder {
  id: string
  date: string
  billNo: string
  amount: number
  items: string[]
}

interface CustomerHistoryModalProps {
  open: boolean
  customerName: string
  customerMobile: string
  orders?: CustomerHistoryOrder[]
  onClose: () => void
}

export function CustomerHistoryModal({
  open,
  customerName,
  customerMobile,
  orders = [],
  onClose,
}: CustomerHistoryModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  const name = customerName.trim() || '—'
  const mobile = customerMobile.trim() || '—'
  const visits = orders.length
  const averageBill =
    visits > 0
      ? orders.reduce((sum, order) => sum + order.amount, 0) / visits
      : null
  const comingSince = orders.length > 0 ? orders[orders.length - 1]?.date : null
  const maxOrdered =
    orders.length > 0
      ? orders.reduce((best, order) =>
          order.amount > best.amount ? order : best,
        ).items[0] ?? '—'
      : null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close customer history"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Customer History"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">Customer History</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
            <p className="text-sm font-semibold text-ink">{name}</p>
            <p className="text-sm font-medium text-ink">{mobile}</p>
          </div>

          <div className="mb-5 space-y-3">
            <div className="flex items-start gap-2.5 text-sm text-ink">
              <List size={16} className="mt-0.5 shrink-0 text-muted" />
              <div>
                <p className="text-xs text-muted">Max ordered</p>
                <p className="font-semibold">{maxOrdered ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-start gap-2.5 text-sm text-ink">
                <Receipt size={16} className="mt-0.5 shrink-0 text-muted" />
                <div>
                  <p className="text-xs text-muted">Average bill</p>
                  <p className="font-semibold">
                    {averageBill != null
                      ? `₹${averageBill.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-ink">
                <CalendarDays size={16} className="mt-0.5 shrink-0 text-muted" />
                <div>
                  <p className="text-xs text-muted">Coming since</p>
                  <p className="font-semibold">{comingSince ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-sm text-ink">
                <ClipboardCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-muted"
                />
                <div>
                  <p className="text-xs text-muted">Visits did</p>
                  <p className="font-semibold">{visits} times</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-ink">
              Below are the past orders within one month (upto 25 orders)
            </p>
            <p className="mt-1 text-xs text-muted">
              Terms: Only available items will be appeared on billing screen once
              you reorder.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-page text-muted">
                <Utensils size={28} strokeWidth={1.5} />
              </div>
              <p className="text-sm text-muted">Records not available</p>
            </div>
          ) : (
            <ul className="divide-y divide-line rounded-lg border border-line">
              {orders.slice(0, 25).map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-start justify-between gap-2 px-3 py-3 text-sm"
                >
                  <div>
                    <p className="font-semibold text-ink">Bill #{order.billNo}</p>
                    <p className="text-xs text-muted">{order.date}</p>
                    <p className="mt-1 text-xs text-muted">
                      {order.items.join(', ')}
                    </p>
                  </div>
                  <p className="font-semibold text-accent">
                    ₹
                    {order.amount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
