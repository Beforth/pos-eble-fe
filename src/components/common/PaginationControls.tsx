import { useMemo } from 'react'

interface PaginationControlsProps {
  totalRecords: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions?: number[]
}

export function PaginationControls({
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationControlsProps) {
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalRecords / pageSize)),
    [totalRecords, pageSize],
  )

  const activePage = Math.min(Math.max(1, currentPage), totalPages)

  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxVisible = 5
    let start = Math.max(1, activePage - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }, [activePage, totalPages])

  const startRecord = totalRecords === 0 ? 0 : (activePage - 1) * pageSize + 1
  const endRecord = Math.min(activePage * pageSize, totalRecords)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted">
          {totalRecords === 0
            ? 'Showing 0 records'
            : `Showing ${startRecord} to ${endRecord} of ${totalRecords} records`}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value))
              onPageChange(1)
            }}
            className="h-8 rounded-md border border-line bg-card px-2 text-xs font-medium text-ink outline-none focus:border-primary"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={activePage <= 1}
          onClick={() => onPageChange(1)}
          className="h-8 rounded-lg border border-line px-2.5 text-sm font-medium text-ink hover:bg-page disabled:opacity-40"
        >
          First
        </button>
        <button
          type="button"
          disabled={activePage <= 1}
          onClick={() => onPageChange(activePage - 1)}
          className="h-8 rounded-lg border border-line px-2.5 text-sm font-medium text-ink hover:bg-page disabled:opacity-40"
        >
          Prev
        </button>
        {pageNumbers.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPageChange(n)}
            className={`flex size-8 items-center justify-center rounded-lg border text-sm font-medium ${
              activePage === n
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-card text-ink hover:bg-page'
            }`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          disabled={activePage >= totalPages}
          onClick={() => onPageChange(activePage + 1)}
          className="h-8 rounded-lg border border-line px-2.5 text-sm font-medium text-ink hover:bg-page disabled:opacity-40"
        >
          Next
        </button>
        <button
          type="button"
          disabled={activePage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="h-8 rounded-lg border border-line px-2.5 text-sm font-medium text-ink hover:bg-page disabled:opacity-40"
        >
          Last
        </button>
      </div>
    </div>
  )
}
