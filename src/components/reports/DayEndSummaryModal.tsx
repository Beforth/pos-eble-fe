import { useEffect, useState } from 'react'
import { Printer, X } from 'lucide-react'
import type { DayEndSummaryRow } from '../../mocks/dayEndSummaryData'
import {
  getDayEndClosureApi,
  type DayEndClosureDetailDto,
  type DayEndSnapshot,
} from '../../services/orderService'
import { formatNumber } from '../../utils/format'
import {
  DayEndPrintTemplate,
  type BreakoutRow,
} from './DayEndPrintTemplate'

interface DayEndSummaryModalProps {
  open: boolean
  row: DayEndSummaryRow | null
  outletId: string
  onClose: () => void
}

/** Snapshot `payment_types`/`order_types` → breakout rows. */
function snapshotBreakout(
  types: DayEndSnapshot['payment_types'] | undefined,
  row: DayEndSummaryRow,
): BreakoutRow[] {
  if (!types || Object.keys(types).length === 0) {
    return buildBreakout(row).payment
  }
  const entries = Object.entries(types)
  return entries.map(([label, value], index) => ({
    label,
    count: index === entries.length - 1 ? 0 : value.count,
    amount: Number(value.total ?? 0),
  }))
}

/** Snapshot `order_types` → breakout rows. */
function snapshotOrderTypeBreakout(
  types: DayEndSnapshot['order_types'] | undefined,
  row: DayEndSummaryRow,
): BreakoutRow[] {
  if (!types || Object.keys(types).length === 0) {
    return buildBreakout(row).orderType
  }
  const entries = Object.entries(types)
  return entries.map(([label, value], index) => ({
    label,
    count: index === entries.length - 1 ? 0 : value.count,
    amount: Number(value.total ?? 0),
  }))
}

/** Deterministic mock split of a day-end total (stable per row, latest under total). */
function buildBreakout(row: DayEndSummaryRow): {
  payment: BreakoutRow[]
  orderType: BreakoutRow[]
} {
  const seed = [...row.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)

  const paymentWeights = [
    { label: 'Cash', w: 30 },
    { label: 'UPI', w: 45 },
    { label: 'Card', w: 15 },
    { label: 'Online', w: 10 },
  ]
  const typeWeights = [
    { label: 'Dine In', w: 55 },
    { label: 'Delivery', w: 20 },
    { label: 'Pick Up', w: 15 },
    { label: 'Parcel', w: 10 },
  ]

  function split(
    weights: Array<{ label: string; w: number }>,
  ): BreakoutRow[] {
    const totalWeight = weights.reduce(
      (sum, item) => sum + item.w + (seed % 7),
      0,
    )
    let running = 0
    return weights.map((item, index) => {
      const isLast = index === weights.length - 1
      const amount = isLast
        ? row.total - running
        : Math.round(
            (row.total * (item.w + (seed % 5))) / totalWeight,
          )
      running += amount
      const count = isLast
        ? 0
        : Math.max(1, Math.round((amount / row.total) * row.orders))
      return {
        label: item.label,
        count,
        amount,
      }
    })
  }

  return {
    payment: split(paymentWeights),
    orderType: split(typeWeights),
  }
}

function BreakoutTable({
  title,
  rows,
  orderTotal,
}: {
  title: string
  rows: BreakoutRow[]
  orderTotal: number
}) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0)
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[340px] border-collapse text-sm">
        <thead>
          <tr className="bg-primary/5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
            <th className="px-3 py-2.5">{title}</th>
            <th className="px-3 py-2.5 text-center">Orders</th>
            <th className="px-3 py-2.5 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-line">
              <td className="px-3 py-2.5 text-ink">{r.label}</td>
              <td className="px-3 py-2.5 text-center tabular-nums text-muted">
                {r.count === 0 ? '—' : formatNumber(r.count)}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-ink">
                {formatNumber(r.amount)}
              </td>
            </tr>
          ))}
          <tr className="border-t border-line bg-page/60 font-semibold">
            <td className="px-3 py-2.5 text-ink">Total</td>
            <td className="px-3 py-2.5 text-center tabular-nums text-ink">
              {formatNumber(orderTotal)}
            </td>
            <td className="px-3 py-2.5 text-right tabular-nums text-ink">
              {formatNumber(total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function DayEndSummaryModal({
  open,
  row,
  outletId,
  onClose,
}: DayEndSummaryModalProps) {
  const [detail, setDetail] = useState<DayEndClosureDetailDto | null>(null)
  const [printOpen, setPrintOpen] = useState(false)

  useEffect(() => {
    if (!open || !row || !outletId) return
    let cancelled = false
    setDetail(null)
    getDayEndClosureApi(outletId, row.id)
      .then((result) => {
        if (!cancelled) setDetail(result)
      })
      .catch(() => {
        if (!cancelled) setDetail(null)
      })
    return () => {
      cancelled = true
    }
  }, [open, row, outletId])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open || !row) return null

  const summary = detail?.summary ?? null
  const breakout = summary
    ? {
        payment: snapshotBreakout(summary.payment_types, row),
        orderType: snapshotOrderTypeBreakout(summary.order_types, row),
      }
    : buildBreakout(row)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close Day End summary"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Day End Summary ${row.createdDate}`}
        className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">
            Day End Summary [ {row.createdDate} ]
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-auto p-5">
          {summary ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="No. Of Orders" value={formatNumber(summary.orders)} accent={false} />
              <StatCard label="Total" value={`₹${formatNumber(row.total)}`} accent />
              <StatCard label="Settled" value={`₹${formatNumber(Number(summary.settled_total ?? 0))}`} accent={false} />
              <StatCard label="Due" value={`₹${formatNumber(Number(summary.due.total ?? 0))} (${summary.due.count})`} accent={false} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="No. Of Orders" value={formatNumber(row.orders)} accent={false} />
              <StatCard label="Total" value={`₹${formatNumber(row.total)}`} accent />
            </div>
          )}

          {summary ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="My Amount" value={`₹${formatNumber(Number(summary.my_amount ?? 0))}`} accent={false} />
              <StatCard label="Tax" value={`₹${formatNumber(Number(summary.tax ?? 0))}`} accent={false} />
              <StatCard label="Discount" value={`₹${formatNumber(Number(summary.discount ?? 0))}`} accent={false} />
              <StatCard label="KOTs" value={`${summary.kots.count} (${summary.kots.cancelled} cancelled)`} accent={false} />
            </div>
          ) : null}

          <BreakoutTable
            title="Payment Mode"
            rows={breakout.payment}
            orderTotal={row.orders}
          />
          <BreakoutTable
            title="Order Type"
            rows={breakout.orderType}
            orderTotal={row.orders}
          />
        </div>

        <footer className="flex shrink-0 justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={() => setPrintOpen(true)}
            disabled={!detail?.summary}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-4 text-sm font-medium text-ink hover:bg-page disabled:opacity-40"
            title={
              detail?.summary
                ? 'Print 80mm receipt'
                : 'Detail not loaded yet'
            }
          >
            <Printer size={14} className="text-muted" />
            Print
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Close
          </button>
        </footer>
      </div>

      {printOpen && detail ? (
        <DayEndPrintTemplate
          detail={detail}
          row={row}
          payment={breakout.payment}
          orderType={breakout.orderType}
          onClose={() => setPrintOpen(false)}
        />
      ) : null}
    </div>
  )
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border border-line bg-page/60 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-1 text-lg font-bold tabular-nums ${
          accent ? 'text-accent' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  )
}