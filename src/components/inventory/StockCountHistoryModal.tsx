import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { History, Trash2, Upload, X } from 'lucide-react'
import { showToast } from '../../utils/toast'
import { ApiError } from '../../services/apiClient'
import {
  deleteStockEntryApi,
  formatInventoryStamp,
  listAllStockEntriesApi,
  type StockEntry,
} from '../../services/inventoryService'
import type { StockCountKind } from './stockCountShared'
import {
  OutlineButton,
  PrimaryButton,
} from '../menu/MenuActionButtons'

interface StockCountHistoryModalProps {
  open: boolean
  onClose: () => void
  outletId: string
  kind: StockCountKind
  canWrite: boolean
  onOpenEntry: (entry: StockEntry) => void
}

const KIND_LABEL: Record<StockCountKind, string> = {
  available: 'Available',
  closing: 'Closing',
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function shiftIso(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function StockCountHistoryModal({
  open,
  onClose,
  outletId,
  kind,
  canWrite,
  onOpenEntry,
}: StockCountHistoryModalProps) {
  const titleId = useId()
  const [dateFrom, setDateFrom] = useState(shiftIso(-30))
  const [dateTo, setDateTo] = useState(todayIso())
  const [entries, setEntries] = useState<StockEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<StockEntry | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await listAllStockEntriesApi(outletId, {
        kind,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
      setEntries(rows)
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : 'Unable to load count history',
      )
    } finally {
      setLoading(false)
    }
  }, [outletId, kind, dateFrom, dateTo])

  useEffect(() => {
    if (!open) return
    void load()
  }, [open, load])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setConfirmDelete(null)
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  const totals = useMemo(() => {
    let lines = 0
    for (const entry of entries) lines += entry.lines.length
    return { lines }
  }, [entries])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close history"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <History size={18} className="text-primary" />
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {KIND_LABEL[kind]} stock count history
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex flex-wrap items-end gap-2 border-b border-line px-5 py-3">
          <label className="text-xs font-medium text-ink">
            From
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="mt-1 block h-8 rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="text-xs font-medium text-ink">
            To
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="mt-1 block h-8 rounded-md border border-line bg-card px-2 text-sm outline-none focus:border-primary"
            />
          </label>
          <span className="ml-auto text-xs text-muted">
            {entries.length} entries · {totals.lines} lines
          </span>
          <OutlineButton variant="gray" onClick={() => void load()}>
            Refresh
          </OutlineButton>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <p className="px-5 py-10 text-center text-sm text-muted">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              No saved counts in this date range
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-page text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-2 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Cycle</th>
                  <th className="px-3 py-2 font-semibold">Lines</th>
                  <th className="px-3 py-2 font-semibold">Note</th>
                  <th className="px-3 py-2 font-semibold">Last saved</th>
                  <th className="px-5 py-2 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-5 py-2.5 font-medium text-ink">
                      {entry.stock_date}
                    </td>
                    <td className="px-3 py-2.5 text-muted">
                      {entry.cycle}
                      <span className="block text-xs text-muted">
                        {entry.period_label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-ink">{entry.lines.length}</td>
                    <td className="max-w-[220px] truncate px-3 py-2.5 text-muted">
                      {entry.note || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted">
                      {formatInventoryStamp(entry.updated_at)}
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <OutlineButton
                          variant="gray"
                          onClick={() => onOpenEntry(entry)}
                        >
                          <Upload size={14} />
                          Open
                        </OutlineButton>
                        {canWrite ? (
                          <button
                            type="button"
                            aria-label={`Delete count for ${entry.stock_date}`}
                            onClick={() => setConfirmDelete(entry)}
                            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-line bg-card text-muted hover:border-primary hover:text-primary"
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-line bg-primary/5 px-5 py-3">
            <p className="flex-1 text-sm text-ink">
              Delete the {KIND_LABEL[kind].toLowerCase()} count for{' '}
              <span className="font-semibold">{confirmDelete.stock_date}</span>?
              The stock balance goes back to what it was before this count.
            </p>
            <OutlineButton
              variant="gray"
              onClick={() => setConfirmDelete(null)}
            >
              Keep
            </OutlineButton>
            <PrimaryButton
              onClick={async () => {
                const target = confirmDelete
                setConfirmDelete(null)
                if (!target) return
                try {
                  await deleteStockEntryApi(outletId, target.id)
                  showToast(
                    `${KIND_LABEL[kind]} count for ${target.stock_date} deleted`,
                  )
                  await load()
                } catch (err) {
                  showToast(
                    err instanceof ApiError
                      ? err.message
                      : 'Unable to delete count',
                  )
                }
              }}
            >
              Delete count
            </PrimaryButton>
          </div>
        ) : (
          <footer className="flex justify-end border-t border-line px-5 py-3">
            <OutlineButton variant="gray" onClick={onClose}>
              Close
            </OutlineButton>
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
