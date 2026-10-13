import { useEffect, useState, type ReactNode } from 'react'
import { Loader2, RefreshCw, X } from 'lucide-react'
import { formatINR, formatNumber } from '../../utils/format'
import {
  liveBoardKotsApi,
  liveBoardOrdersApi,
  type LiveBoardRecord,
} from '../../services/orderService'

interface LiveOrdersDetailModalProps {
  open: boolean
  outletId: string
  board: 'running' | 'pending'
  rowId: string
  title: string
  icon: ReactNode
  onClose: () => void
}

function statusChip(status: string): string {
  if (status === 'printed' || status === 'Ready') return 'bg-success/10 text-success'
  if (status === 'saved') return 'bg-accent/10 text-accent'
  return 'bg-primary/10 text-primary'
}

export function LiveOrdersDetailModal({
  open,
  outletId,
  board,
  rowId,
  title,
  icon,
  onClose,
}: LiveOrdersDetailModalProps) {
  const [records, setRecords] = useState<LiveBoardRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (!open || !outletId) return
    let cancelled = false
    setLoading(true)
    const fetcher =
      board === 'running'
        ? liveBoardOrdersApi(outletId, rowId)
        : liveBoardKotsApi(outletId, rowId)
    fetcher
      .then((rows) => {
        if (cancelled) return
        setRecords(rows)
        setError(false)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, outletId, board, rowId, reload])

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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close live orders detail"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 flex max-h-[min(90vh,640px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <span className="flex size-7 items-center justify-center rounded-lg bg-page text-muted">
              {icon}
            </span>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <Loader2 size={22} className="animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <p className="text-sm font-semibold text-ink">
                Couldn't load {title.toLowerCase()}
              </p>
              <button
                type="button"
                onClick={() => setReload((key) => key + 1)}
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink transition-colors hover:border-muted"
              >
                <RefreshCw size={15} className="text-muted" />
                Retry
              </button>
            </div>
          ) : records.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <p className="text-sm font-medium text-muted">
                No {title.toLowerCase()} right now.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {records.map((record) => {
                if (record.kind === 'order') {
                  return (
                    <li key={record.id}>
                      <div className="rounded-xl border border-line bg-card p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-ink">
                              Order {record.orderNo}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusChip(record.status)}`}
                            >
                              {record.status}
                            </span>
                          </div>
                          <p className="shrink-0 text-sm font-bold text-ink tabular-nums">
                            {formatINR(record.total, 2)}
                          </p>
                        </div>
                        <p className="mt-1 text-xs text-muted">
                          {record.customerName || 'Walk-in'} ·{' '}
                          {formatNumber(record.itemCount)} item
                          {record.itemCount === 1 ? '' : 's'}
                          {record.billNo ? ` · Bill ${record.billNo}` : ''}
                        </p>
                        <ul className="mt-3 space-y-1 border-t border-line pt-3">
                          {record.items.map((item, index) => (
                            <li
                              key={`${record.id}-${index}`}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <span className="min-w-0 truncate text-ink">
                                {item.name}
                                <span className="text-muted">
                                  {' '}
                                  × {formatNumber(Number(item.qty || 0))}
                                </span>
                              </span>
                              <span className="shrink-0 tabular-nums text-ink">
                                {formatINR(Number(item.total_price || 0), 2)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  )
                }
                return (
                  <li key={record.id}>
                    <div className="rounded-xl border border-line bg-card p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-ink">
                            KOT {record.kotNo}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusChip(record.status)}`}
                          >
                            {record.status}
                          </span>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-ink tabular-nums">
                          {formatINR(record.total, 2)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {record.tableNo ? `Table ${record.tableNo} · ` : ''}
                        {record.customerName} ·{' '}
                        {formatNumber(record.itemCount)} item
                        {record.itemCount === 1 ? '' : 's'}
                      </p>
                      <ul className="mt-3 space-y-1 border-t border-line pt-3">
                        {record.items.map((item, index) => (
                          <li
                            key={`${record.id}-${index}`}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="min-w-0 truncate text-ink">
                              {item.name}
                              <span className="text-muted">
                                {' '}
                                × {formatNumber(Number(item.qty || 0))}
                              </span>
                            </span>
                            <span className="shrink-0 tabular-nums text-ink">
                              {formatINR(Number(item.total_price || 0), 2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}