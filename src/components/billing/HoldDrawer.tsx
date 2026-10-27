import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Loader, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { HoldIcon } from '../icons/HoldIcon'
import { listDraftBillsApi } from '../../services/orderService'
import { draftAmount, draftItemCount, toDraftBill, type DraftBill } from '../../utils/draftBillStore'

interface HoldDrawerProps {
  open: boolean
  onClose: () => void
}

function draftTitle(draft: DraftBill): string {
  const name = draft.customer.name?.trim()
  if (name) return name
  if (draft.tableNo && draft.tableNo !== 'No table') return `Table ${draft.tableNo}`
  return 'Untitled bill'
}

function formatWhen(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** The empty state's picture: the Hold icon in the theme colour. */
function EmptyHoldArt() {
  return (
    <span className="flex size-28 items-center justify-center rounded-full bg-primary/10 text-primary">
      <HoldIcon size={56} strokeWidth={1.5} />
    </span>
  )
}

/** Opens from the header's Hold icon: bills put on hold (saved drafts), ready to resume. */
export function HoldDrawer({ open, onClose }: HoldDrawerProps) {
  const { encryptedOutletId } = useAuth()
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState<DraftBill[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!encryptedOutletId) return
    setLoading(true)
    try {
      const rows = await listDraftBillsApi(encryptedOutletId)
      setDrafts(rows.map(toDraftBill))
    } catch {
      setDrafts([])
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId])

  useEffect(() => {
    if (open) void load()
  }, [open, load])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  function resume(draft: DraftBill) {
    onClose()
    navigate(`/billing?resumeDraft=${encodeURIComponent(draft.id)}`)
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close on hold"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="on-hold-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col rounded-l-2xl bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
          <h2 id="on-hold-title" className="text-base font-medium text-ink">
            On Hold
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-md p-1.5 text-ink hover:bg-page"
          >
            <X size={22} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading && drafts.length === 0 ? (
            <p className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
              <Loader size={16} className="animate-spin" />
              Loading…
            </p>
          ) : drafts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <EmptyHoldArt />
              <p className="text-base font-medium text-ink">No Item Selected</p>
              <p className="text-sm text-muted">
                Please Select Item from Left Menu Item and create new order
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {drafts.map((draft) => (
                <li key={draft.id}>
                  <button
                    type="button"
                    onClick={() => resume(draft)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-page"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">
                        {draftTitle(draft)}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {draftItemCount(draft)} item{draftItemCount(draft) === 1 ? '' : 's'} ·{' '}
                        {formatWhen(draft.updatedAt)}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                      ₹{draftAmount(draft).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  )
}
