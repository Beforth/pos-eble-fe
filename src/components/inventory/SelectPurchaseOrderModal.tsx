import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, FileText, Search, X } from 'lucide-react'

interface SelectPurchaseOrderModalProps {
  open: boolean
  onClose: () => void
  onSelect?: (poNumber: string) => void
  title?: string
}

export function SelectPurchaseOrderModal({
  open,
  onClose,
  onSelect: _onSelect,
  title = 'Purchase Order',
}: SelectPurchaseOrderModalProps) {
  const [query, setQuery] = useState('')
  const [supplierView, setSupplierView] = useState(false)
  const [sort, setSort] = useState('oldest')

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSupplierView(false)
    setSort('oldest')
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="select-po-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2
            id="select-po-title"
            className="text-base font-semibold text-ink"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <label className="relative min-w-[180px] flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Invoice/Request No..."
              className="h-9 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </label>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
            <span
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                supplierView ? 'bg-primary' : 'bg-line'
              }`}
            >
              <input
                type="checkbox"
                checked={supplierView}
                onChange={(event) => setSupplierView(event.target.checked)}
                className="peer sr-only"
              />
              <span
                className={`absolute left-0.5 size-4 rounded-full bg-card shadow transition-transform ${
                  supplierView ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </span>
            Supplier View
          </label>

          <div className="relative">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-9 appearance-none rounded-md border border-line bg-card py-0 pl-3 pr-8 text-sm outline-none focus:border-primary"
            >
              <option value="oldest">Oldest to Newest</option>
              <option value="newest">Newest to Oldest</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <span className="relative mb-4 text-muted">
            <FileText size={56} strokeWidth={1.25} className="text-muted/50" />
            <Search
              size={24}
              className="absolute -bottom-1 -right-2 rounded-full bg-card p-0.5 text-muted"
            />
          </span>
          <p className="text-base font-semibold text-ink">No Record Found</p>
          {query.trim() ? (
            <p className="mt-1 text-sm text-muted">
              No purchase orders match “{query.trim()}”.
            </p>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  )
}
