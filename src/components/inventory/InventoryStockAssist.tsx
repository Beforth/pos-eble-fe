import { useEffect, useRef, useState } from 'react'
import { History, X } from 'lucide-react'

import { ApiError } from '../../services/apiClient'
import {
  getRawMaterialStockActivityApi,
  type RawMaterial,
  type RawMaterialStockActivity,
} from '../../services/inventoryService'

/**
 * Parse the raw material name out of an "Insufficient stock for X." error
 * message. Used to highlight the matching row red.
 */
export function getInsufficientStockMaterial(message: string) {
  const match = message.match(/Insufficient stock for (.+?)\./i)
  return match?.[1]?.trim() ?? ''
}

// ---------------------------------------------------------------------------
// StockAvailabilityButton
// ---------------------------------------------------------------------------
// Shows available stock qty inline (always visible when a material is
// selected) and opens a slide-over drawer with the full stock-movement
// history when clicked.

export function StockAvailabilityButton({
  outletId,
  material,
}: {
  outletId: string
  material?: RawMaterial
}) {
  const [open, setOpen] = useState(false)
  const [activity, setActivity] = useState<RawMaterialStockActivity | null>(null)
  const [error, setError] = useState('')

  // Reset cached activity when the material changes
  useEffect(() => {
    setActivity(null)
    setError('')
  }, [material?.id])

  useEffect(() => {
    if (!open || !material) return
    setError('')
    void getRawMaterialStockActivityApi(outletId, material.id)
      .then(setActivity)
      .catch((err) =>
        setError(
          err instanceof ApiError
            ? err.message
            : 'Unable to load stock movements',
        ),
      )
  }, [material, open, outletId])

  if (!material) return null

  const stockQty = activity?.stock_qty ?? material.stock_qty
  const unitName =
    activity?.consumption_unit_name ?? material.consumption_unit.name
  const stockNum = Number(stockQty)
  const isLow = stockNum <= 0

  return (
    <>
      {/* Always-visible inline stock pill */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-semibold transition-colors hover:opacity-80 ${
          isLow
            ? 'bg-red-50 text-red-600'
            : 'bg-emerald-50 text-emerald-700'
        }`}
        title="Click to view stock movement history"
      >
        <History size={11} />
        Stock: {stockQty} {unitName}
      </button>

      {/* Stock-movement side drawer */}
      {open ? (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Close stock history"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/35"
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col border-l border-line bg-card shadow-2xl">
            <div className="flex items-start justify-between border-b border-line p-4">
              <div>
                <h2 className="font-bold text-ink">{material.name}</h2>
                <p className="mt-0.5 text-sm text-muted">
                  Current stock:{' '}
                  <span
                    className={
                      isLow ? 'font-semibold text-red-600' : 'font-semibold text-emerald-700'
                    }
                  >
                    {stockQty} {unitName}
                  </span>
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="rounded p-1.5 text-muted hover:bg-page hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {!activity && !error ? (
                <p className="text-sm text-muted">Loading stock history…</p>
              ) : null}
              {activity ? (
                activity.movements.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted">
                    No stock movements recorded.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-line">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-line bg-page text-xs text-muted">
                        <tr>
                          <th className="px-3 py-2">Date &amp; time</th>
                          <th className="px-3 py-2">Reason</th>
                          <th className="px-3 py-2">Reference</th>
                          <th className="px-3 py-2 text-right">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activity.movements.map((movement) => (
                          <tr
                            key={movement.id}
                            className="border-b border-line last:border-b-0"
                          >
                            <td className="whitespace-nowrap px-3 py-2 text-xs text-muted">
                              {new Date(movement.created_at).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-ink">
                              {movement.reason_label}
                            </td>
                            <td className="px-3 py-2 text-muted">
                              {movement.document_number || '—'}
                            </td>
                            <td
                              className={`px-3 py-2 text-right font-semibold ${
                                Number(movement.qty) < 0
                                  ? 'text-red-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {Number(movement.qty) > 0 ? '+' : ''}
                              {movement.qty}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  )
}

// ---------------------------------------------------------------------------
// StockShortfallNote
// ---------------------------------------------------------------------------
// Rendered inside a row that failed with an "Insufficient stock" error so
// the user can see the available vs required quantities at a glance.

export function StockShortfallNote({
  available,
  required,
  availableUnit,
  requiredUnit,
}: {
  available: string | number
  required: string | number
  availableUnit?: string
  requiredUnit?: string
}) {
  return (
    <p className="mt-1 inline-flex flex-wrap items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 text-[11px] font-semibold text-red-700">
      <span>
        Available: {available}
        {availableUnit ? ` ${availableUnit}` : ''}
      </span>
      <span className="text-red-300">|</span>
      <span>
        Required: {required}
        {requiredUnit ? ` ${requiredUnit}` : ''}
      </span>
    </p>
  )
}

// ---------------------------------------------------------------------------
// useInventoryFormDraft
// ---------------------------------------------------------------------------
// Auto-saves the form to localStorage 400 ms after any change, and exposes
// a "restore draft" / "discard draft" API. Clears on successful save.

export function useInventoryFormDraft<T>(
  key: string,
  value: T,
  onRestore: (draft: T) => void,
) {
  // True once the initial localStorage read has completed
  const readyRef = useRef(false)
  // Non-null while there is an unacknowledged draft the user hasn't seen yet
  const [storedDraft, setStoredDraft] = useState<T | null>(null)

  // On mount: read any existing draft from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) setStoredDraft(JSON.parse(stored) as T)
    } catch {
      localStorage.removeItem(key)
    } finally {
      readyRef.current = true
    }
    // key is intentionally omitted: we only want to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save: runs whenever value changes AFTER the draft has been
  // dismissed (storedDraft === null means the user has dealt with any
  // previous draft and we should start saving the current form state).
  useEffect(() => {
    if (!readyRef.current || storedDraft !== null) return
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // Storage quota exceeded – silently skip
      }
    }, 400)
    return () => window.clearTimeout(timer)
  }, [key, storedDraft, value])

  return {
    /** True when an unrestored draft exists (show the recovery banner). */
    hasDraft: storedDraft !== null,

    /** Apply the stored draft to the form and resume auto-saving. */
    restoreDraft() {
      if (storedDraft) onRestore(storedDraft)
      setStoredDraft(null)
    },

    /** Throw away the stored draft and resume auto-saving. */
    discardDraft() {
      localStorage.removeItem(key)
      setStoredDraft(null)
    },

    /** Called on successful save — removes draft from storage. */
    clearDraft() {
      localStorage.removeItem(key)
      setStoredDraft(null)
    },
  }
}

// ---------------------------------------------------------------------------
// DraftRecoveryBanner
// ---------------------------------------------------------------------------

export function DraftRecoveryBanner({
  visible,
  onRestore,
  onDiscard,
}: {
  visible: boolean
  onRestore: () => void
  onDiscard: () => void
}) {
  if (!visible) return null
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <span>An unsaved draft is available for this form.</span>
      <div className="flex gap-2">
        <button type="button" onClick={onRestore} className="font-bold underline">
          Restore draft
        </button>
        <button type="button" onClick={onDiscard} className="underline">
          Discard
        </button>
      </div>
    </div>
  )
}
