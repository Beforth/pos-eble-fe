import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Printer, Search, Settings2 } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  buildCoverSizeReportRows,
  coverSizeReportGeneratedLabel,
  loadCoverSizeEntries,
} from '../../utils/coverSizeStore'

export default function CoverSizeReport() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [appliedFrom, setAppliedFrom] = useState('')
  const [appliedTo, setAppliedTo] = useState('')
  const [showPersonsCol, setShowPersonsCol] = useState(true)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [preferenceSaved, setPreferenceSaved] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const reportDateLabel = coverSizeReportGeneratedLabel()

  const displayRows = useMemo(() => {
    void refreshKey
    const entries = loadCoverSizeEntries().filter((entry) => {
      if (appliedFrom && entry.dateKey < appliedFrom) return false
      if (appliedTo && entry.dateKey > appliedTo) return false
      return true
    })
    return buildCoverSizeReportRows(entries)
  }, [appliedFrom, appliedTo, refreshKey])

  function handlePrint() {
    window.print()
  }

  function handleExportExcel() {
    const header = showPersonsCol
      ? ['Date', 'No. of Persons (Success Orders)']
      : ['Date']
    const lines = [
      header.join(','),
      ...displayRows.map((row) =>
        showPersonsCol ? `${row.label},${row.persons}` : row.label,
      ),
    ]
    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cover-size-report-${reportDateLabel}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function applySearch() {
    setAppliedFrom(fromDate)
    setAppliedTo(toDate)
    setRefreshKey((n) => n + 1)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => navigate('/table-view')}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <main className="flex-1 overflow-y-auto bg-white px-4 py-4 sm:px-6">
        <h1 className="mb-3 text-lg font-semibold text-ink">Cover Size Report</h1>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            className="inline-flex h-9 items-center gap-1.5 rounded border border-line bg-white px-3 text-sm text-ink hover:bg-page"
          >
            <Search size={14} className="text-muted" />
            Search
          </button>
          <button
            type="button"
            onClick={() =>
              window.alert('Print configuration will be available soon.')
            }
            className="inline-flex h-9 items-center gap-1.5 rounded border border-line bg-white px-3 text-sm text-ink hover:bg-page"
          >
            <Settings2 size={14} className="text-muted" />
            Print Configuration
          </button>
        </div>

        {searchOpen ? (
          <div className="mb-3 flex flex-wrap items-end gap-3 rounded border border-line bg-page/60 p-3">
            <label className="flex flex-col gap-1 text-xs text-muted">
              From
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-9 rounded border border-line bg-white px-2 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              To
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="h-9 rounded border border-line bg-white px-2 text-sm text-ink outline-none focus:border-primary"
              />
            </label>
            <button
              type="button"
              onClick={applySearch}
              className="inline-flex h-9 items-center rounded bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Apply
            </button>
          </div>
        ) : null}

        <div className="overflow-hidden rounded border border-line bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnsOpen((open) => !open)}
                className="inline-flex h-8 items-center rounded bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Columns
              </button>
              {columnsOpen ? (
                <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded border border-line bg-white p-2 shadow-lg">
                  <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink hover:bg-page">
                    <input
                      type="checkbox"
                      checked={showPersonsCol}
                      onChange={(event) =>
                        setShowPersonsCol(event.target.checked)
                      }
                      className="accent-primary"
                    />
                    No. of Persons (Success Orders)
                  </label>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                setPreferenceSaved(true)
                window.setTimeout(() => setPreferenceSaved(false), 2000)
              }}
              className="inline-flex h-8 items-center rounded border border-line bg-white px-3 text-sm text-ink hover:bg-page"
            >
              {preferenceSaved ? 'Saved' : 'Save Preference'}
            </button>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex h-8 items-center rounded border border-line bg-white px-3 text-sm text-ink hover:bg-page"
              >
                Export Excel
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex h-8 items-center gap-1.5 rounded border border-line bg-white px-3 text-sm text-ink hover:bg-page"
              >
                <Printer size={14} className="text-muted" />
                Print
              </button>
            </div>
          </div>

          <div className="border-b border-line bg-[#f3f3f3] px-3 py-2 text-sm font-medium text-ink">
            Cover Size Report - {reportDateLabel}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <thead>
                <tr className="bg-white">
                  <th className="border-b border-r border-line px-3 py-2 text-left font-semibold text-ink" />
                  {showPersonsCol ? (
                    <th className="border-b border-line px-3 py-2 text-left font-semibold text-ink">
                      No. of Persons (Success Orders)
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {displayRows.length <= 1 && displayRows[0]?.persons === 0 ? (
                  <tr>
                    <td
                      colSpan={showPersonsCol ? 2 : 1}
                      className="border-b border-line px-3 py-8 text-center text-sm text-muted"
                    >
                      No cover size data yet. Enter no. of persons on billing,
                      send KOT / settle the order, then reopen this report.
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row) => (
                    <tr key={row.label} className="bg-white hover:bg-page/50">
                      <td
                        className={`border-b border-r border-line px-3 py-2 text-ink ${
                          row.isTotal ? 'font-semibold' : ''
                        }`}
                      >
                        {row.label}
                      </td>
                      {showPersonsCol ? (
                        <td className="border-b border-line px-3 py-2 text-ink">
                          {row.persons}
                        </td>
                      ) : null}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
