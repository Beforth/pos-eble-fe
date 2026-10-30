import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  /** 1-based current page. */
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

/** Page numbers to show: the ends, the current page and its neighbours, with gaps as `null`. */
function pageItems(page: number, pages: number): (number | null)[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const wanted = new Set([1, 2, pages - 1, pages, page - 1, page, page + 1])
  const sorted = [...wanted]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b)
  const items: (number | null)[] = []
  sorted.forEach((n, index) => {
    if (index > 0 && n - sorted[index - 1] > 1) items.push(null)
    items.push(n)
  })
  return items
}

const buttonClass =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-colors'

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total <= pageSize) return null
  const current = Math.min(Math.max(1, page), pages)
  const from = (current - 1) * pageSize + 1
  const to = Math.min(current * pageSize, total)

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-sm text-muted">
        Showing <span className="font-semibold text-ink">{from}–{to}</span> of{' '}
        <span className="font-semibold text-ink">{total}</span>
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => current > 1 && onPageChange(current - 1)}
          aria-disabled={current === 1}
          aria-label="Previous page"
          data-tooltip="Previous page"
          className={`${buttonClass} border-line bg-card text-ink hover:bg-page aria-disabled:cursor-not-allowed aria-disabled:opacity-40`}
        >
          <ChevronLeft size={16} />
        </button>
        {pageItems(current, pages).map((item, index) =>
          item === null ? (
            <span key={`gap-${index}`} className="px-1 text-muted" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-label={`Page ${item}`}
              aria-current={item === current ? 'page' : undefined}
              className={`${buttonClass} ${
                item === current
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-card text-ink hover:bg-page'
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => current < pages && onPageChange(current + 1)}
          aria-disabled={current === pages}
          aria-label="Next page"
          data-tooltip="Next page"
          className={`${buttonClass} border-line bg-card text-ink hover:bg-page aria-disabled:cursor-not-allowed aria-disabled:opacity-40`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  )
}
