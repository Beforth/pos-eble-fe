import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { Download, FileText } from 'lucide-react'
import { ExportExcelMenu } from '../../components/all-orders/ExportExcelMenu'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { DayEndSummaryModal } from '../../components/reports/DayEndSummaryModal'
import type { DayEndSummaryRow } from '../../mocks/dayEndSummaryData'
import { formatNumber } from '../../utils/format'
import {
  listDayEndClosuresApi,
  toDayEndSummaryRow,
} from '../../services/orderService'
import { useAuth } from '../../auth/AuthContext'

const PAGE_SIZE = 15

function downloadCsv(rows: DayEndSummaryRow[], filename: string) {
  const lines = [
    'Date,Orders,Total',
    ...rows.map((r) => `${r.createdDate},${r.orders},${r.total}`),
  ]
  const blob = new Blob([lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function DayEndSummary() {
  const { encryptedOutletId } = useAuth()
  const [rows, setRows] = useState<DayEndSummaryRow[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStart, setAppliedStart] = useState('')
  const [appliedEnd, setAppliedEnd] = useState('')
  const [ignoreDates, setIgnoreDates] = useState(false)
  const [page, setPage] = useState(1)
  const [viewRow, setViewRow] = useState<DayEndSummaryRow | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!encryptedOutletId) return
    listDayEndClosuresApi(encryptedOutletId)
      .then((dtos) => {
        if (!cancelled) setRows(dtos.map(toDayEndSummaryRow))
      })
      .catch(() => {
        if (!cancelled) setRows([])
      })
    return () => {
      cancelled = true
    }
  }, [encryptedOutletId])

  const filtered = useMemo(() => {
    if (ignoreDates) return rows
    return rows.filter(
      (row) =>
        (!appliedStart || row.dateKey >= appliedStart) &&
        (!appliedEnd || row.dateKey <= appliedEnd),
    )
  }, [appliedEnd, appliedStart, ignoreDates, rows])

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

  return (
    <ReportsPageShell
      title="Day End Summary"
      activeItem="day-end-summary"
      actions={
        <ExportExcelMenu
          onExportPage={() => downloadCsv(pageRows, 'day-end-summary-page.csv')}
          onExportAll={() => downloadCsv(filtered, 'day-end-summary-all.csv')}
        />
      }
    >
      <DayEndSummaryModal
        open={Boolean(viewRow)}
        row={viewRow}
        outletId={encryptedOutletId ?? ''}
        onClose={() => setViewRow(null)}
      />

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
                          data-tooltip="View summary"
                          aria-label={`View summary for ${row.createdDate}`}
                          onClick={() => setViewRow(row)}
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-page hover:text-primary"
                        >
                          <FileText size={16} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          data-tooltip="Download summary"
                          aria-label={`Download summary for ${row.createdDate}`}
                          onClick={() =>
                            downloadCsv(
                              [row],
                              `day-end-summary-${row.dateKey}.csv`,
                            )
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
