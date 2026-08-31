import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileText, Search } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import { DAY_END_SUMMARY_ROWS } from '../../mocks/dayEndSummaryData'
import { formatNumber } from '../../utils/format'

const PAGE_SIZE = 15

export default function BillingDayEnd() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')
  const [ignoreDates, setIgnoreDates] = useState(false)
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  const filtered = useMemo(() => {
    if (ignoreDates) return DAY_END_SUMMARY_ROWS
    return DAY_END_SUMMARY_ROWS.filter(
      (row) =>
        (!appliedStart || row.dateKey >= appliedStart) &&
        (!appliedEnd || row.dateKey <= appliedEnd),
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
    setStartDate('')
    setEndDate('')
    setAppliedStart('')
    setAppliedEnd('')
    setIgnoreDates(true)
    setPage(1)
    showToast('Filters cleared')
  }

  function handleExport() {
    const header = 'Date,Orders,Total'
    const lines = [
      header,
      ...filtered.map(
        (r) => `${r.createdDate},${r.orders},${r.total}`,
      ),
    ]
    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'day-end-summary.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => navigate('/table-view')}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      {toast ? (
        <div className="fixed bottom-4 right-4 z-[80] rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Day End Summary</h1>
          <div className="flex items-center gap-2">
            <ExportExcelMenu
              onExportPage={() => showToast('Exporting current page...')}
              onExportAll={() => showToast('Exporting all records...')}
            />
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
            >
              <Download size={14} className="text-muted" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-line bg-card p-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted">
              Start Date
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 rounded-lg border border-line bg-page px-2 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              End Date
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 rounded-lg border border-line bg-page px-2 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              <Search size={14} className="mr-1.5" />
              Search
            </button>
            <button
              type="button"
              onClick={handleShowAll}
              className="inline-flex h-9 items-center rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Clear Filter
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                    Date
                  </th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted">
                    Orders
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">
                    Total
                  </th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-sm text-muted"
                    >
                      No day end records found for the selected dates.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr key={row.id} className="hover:bg-page/40">
                      <td className="px-4 py-2.5 font-medium text-ink">
                        {row.createdDate}
                      </td>
                      <td className="px-4 py-2.5 text-center tabular-nums text-ink">
                        {formatNumber(row.orders)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-accent">
                        ₹{formatNumber(row.total)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              showToast(
                                `Opening summary for ${row.createdDate}`,
                              )
                            }
                            className="inline-flex size-7 items-center justify-center rounded-lg text-muted hover:bg-page hover:text-ink"
                            title="View summary"
                          >
                            <FileText size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              showToast(`Downloading ${row.createdDate}`)
                            }
                            className="inline-flex size-7 items-center justify-center rounded-lg text-muted hover:bg-page hover:text-ink"
                            title="Download"
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalRecords > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
              <span className="text-xs text-muted">
                Showing {fromRecord} to {toRecord} of {totalRecords} records
              </span>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(totalPages, 3) },
                  (_, i) => i + 1,
                )
                  .filter((n) => {
                    if (totalPages <= 3) return true
                    if (safePage <= 2) return n <= 3
                    if (safePage >= totalPages - 1) return n >= totalPages - 2
                    return Math.abs(n - safePage) <= 1
                  })
                  .map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`h-8 min-w-[32px] rounded-lg px-2 text-xs font-medium ${
                        n === safePage
                          ? 'bg-primary text-white'
                          : 'border border-line bg-card text-ink hover:bg-page'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 rounded-lg border border-line bg-card px-3 text-xs font-medium text-ink hover:bg-page disabled:opacity-40"
                >
                  Next
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage(totalPages)}
                  className="h-8 rounded-lg border border-line bg-card px-3 text-xs font-medium text-ink hover:bg-page disabled:opacity-40"
                >
                  Last
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
