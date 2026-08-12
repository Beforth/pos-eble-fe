import { useEffect, useMemo, useState } from 'react'
import { FilePenLine, Search, Trash2, X } from 'lucide-react'
import {
  deleteDraftBill,
  draftAmount,
  draftItemCount,
  loadDraftBills,
  type DraftBill,
} from '../../utils/draftBillStore'

interface DraftBillsModalProps {
  open: boolean
  onClose: () => void
  onResume: (draft: DraftBill) => void
}

function formatWhen(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function draftTitle(draft: DraftBill): string {
  const name = draft.customer.name?.trim()
  if (name) return name
  if (draft.tableNo && draft.tableNo !== 'No table') {
    return `Table ${draft.tableNo}`
  }
  return 'Untitled draft'
}

export function DraftBillsModal({
  open,
  onClose,
  onResume,
}: DraftBillsModalProps) {
  const [drafts, setDrafts] = useState<DraftBill[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open) return
    setDrafts(loadDraftBills())
    setSearch('')
  }, [open])

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return drafts
    return drafts.filter((draft) => {
      const title = draftTitle(draft).toLowerCase()
      const items = draft.lines.map((line) => line.name).join(' ').toLowerCase()
      const table = draft.tableNo.toLowerCase()
      const phone = draft.customer.mobile?.toLowerCase() ?? ''
      return (
        title.includes(q) ||
        items.includes(q) ||
        table.includes(q) ||
        phone.includes(q) ||
        draft.orderType.toLowerCase().includes(q)
      )
    })
  }, [drafts, search])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close drafts"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Draft bills"
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <FilePenLine size={18} className="shrink-0 text-primary" />
            <h2 className="text-base font-semibold text-ink">Draft Bills</h2>
          </div>
          <div className="relative min-w-[160px] flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order / name"
              className="h-9 w-full rounded-lg border border-line bg-card pl-8 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <FilePenLine size={36} className="text-muted" />
              <p className="text-sm font-medium text-ink">No draft bills</p>
              <p className="text-xs text-muted">
                Save an order as draft when the customer needs more time.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted">
              No drafts match “{search.trim()}”.
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((draft) => (
                <li
                  key={draft.id}
                  className="rounded-lg border border-line bg-page/40 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {draftTitle(draft)}
                        <span className="ml-2 text-xs font-normal text-muted">
                          {draft.orderType}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {draft.tableNo !== 'No table'
                          ? `Table ${draft.tableNo} · `
                          : null}
                        {draftItemCount(draft)} item
                        {draftItemCount(draft) === 1 ? '' : 's'}
                        {' · '}₹
                        {draftAmount(draft).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                        })}
                        {' · '}
                        {formatWhen(draft.updatedAt)}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted">
                        {draft.lines.map((line) => line.name).join(', ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      title="Delete draft"
                      aria-label="Delete draft"
                      onClick={() => {
                        deleteDraftBill(draft.id)
                        setDrafts(loadDraftBills())
                      }}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-line text-muted hover:border-primary hover:text-primary"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onResume(draft)}
                    className="mt-3 h-9 w-full rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-hover"
                  >
                    Resume Draft
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
