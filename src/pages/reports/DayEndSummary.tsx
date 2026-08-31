import { useMemo, useState } from 'react'
import { Download, FileText } from 'lucide-react'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { DAY_END_SUMMARY_ROWS } from '../../mocks/dayEndSummaryData'
import { formatNumber } from '../../utils/format'

const PAGE_SIZE = 15

export default function DayEndSummary() {
  const [startDate, setStartDate] = useState('2026-07-13')
  const [endDate, setEndDate] = useState('2026-08-12')
  const [appliedStart, setAppliedStart] = useState('2026-07-13')
  const [appliedEnd, setAppliedEnd] = useState('2026-08-12')
  const [ignoreDates, setIgnoreDates] = useState(false)
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  const filtered = useMemo(() => {
    if (ignoreDates) return DAY_END_SUMMARY_ROWS
    return DAY_END_SUMMARY_ROWS.filter(
      (row) => row.dateKey >= appliedStart && row.dateKey <= appliedEnd,
    )
  }, [appliedEnd, appliedStart, ignoreDates])

  const totalRecords = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )
  const fromRecord = totalRecords === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const toRecord = Math.min(safePage * PAGE_SIZE, totalRecords)

  function handleSearch() {
    setAppliedStart(startDate)
    setAppliedEnd(endDate)
    setIgnoreDates(false)
    setPage(1)
  }

  function handleShowAll() {
    setStartDate('2026-07-13')
    setEndDate('2026-08-12')
    setAppliedStart('2026-07-13')
    setAppliedEnd('2026-08-12')
    setIgnoreDates(true)
    setPage(1)
    showToast('Filters cleared')
  }

  return (
    <ReportsPageShell
      title="Day End Summary"
      activeItem="day-end-summary"
      actions={
        <ExportExcelMenu
          onExportPage={() => showToast('Exporting current page…')}
          onExportAll={() => showToast('Exporting all records…')}
        />
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="text-xs text-muted">
          Start Date
          <input
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="mt-1 block h-9 min-w-[160px] rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <label className="text-xs text-muted">
          End Date
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="mt-1 block h-9 min-w-[160px] rounded-lg border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          onClick={handleSearch}
          className="inline-flex h-9 items-center rounded-lg border border-primary px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleShowAll}
          className="inline-flex h-9 items-center rounded-lg border border-line px-4 text-sm font-medium text-ink transition-colors hover:bg-page"
        >
          Clear Filter
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-page text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold normal-case tracking-normal text-ink">
                  Created Date
                </th>
                <th className="px-4 py-3 text-center font-semibold normal-case tracking-normal text-ink">
                  No. Of Orders
                </th>
                <th className="px-4 py-3 text-center font-semibold normal-case tracking-normal text-ink">
                  Total (₹)
                </th>
                <th className="px-4 py-3 text-center font-semibold normal-case tracking-normal text-ink">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-16 text-center text-sm text-muted"
                  >
                    No day end summary records found for the selected dates.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-b-0 hover:bg-page/60"
                  >
                    <td className="px-4 py-3.5 text-ink">{row.createdDate}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums text-ink">
                      {formatNumber(row.orders)}
                    </td>
                    <td className="px-4 py-3.5 text-center tabular-nums text-ink">
                      {formatNumber(row.total)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          title="View summary"
                          aria-label={`View summary for ${row.createdDate}`}
                          onClick={() =>
                            showToast(`Opening summary for ${row.createdDate}`)
                          }
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-page hover:text-primary"
                        >
                          <FileText size={16} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          title="Download summary"
                          aria-label={`Download summary for ${row.createdDate}`}
                          onClick={() =>
                            showToast(`Downloading ${row.createdDate}`)
                          }
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-page hover:text-primary"
                        >
                          <Download size={16} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-page/40 px-4 py-2.5">
          <p className="text-xs text-ink">
            Showing {fromRecord} to {toRecord} of {formatNumber(totalRecords)}{' '}
            records
          </p>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
              const active = safePage === n
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`flex h-8 min-w-8 items-center justify-center rounded border bg-card px-2.5 text-sm font-medium text-ink ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-line hover:border-muted'
                  }`}
                >
                  {n}
                </button>
              )
            })}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-8 items-center justify-center rounded border border-line bg-card px-3 text-sm font-medium text-ink hover:border-muted disabled:opacity-40"
            >
              Next
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage(totalPages)}
              className="flex h-8 items-center justify-center rounded border border-line bg-card px-3 text-sm font-medium text-ink hover:border-muted disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </ReportsPageShell>
  )
}
