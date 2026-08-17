import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronLeft, Home, Printer } from 'lucide-react'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
import {
  INVOICE_REPORT_COLUMNS,
  INVOICE_REPORT_ROWS,
  INVOICE_RESTAURANT_OPTIONS,
  summarizeInvoiceReport,
  type InvoiceReportColumnKey,
  type InvoiceReportRow,
} from '../../mocks/invoiceReportData'

function formatAmount(value: number) {
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

function ColumnsMenu({
  visible,
  onToggle,
}: {
  visible: Record<InvoiceReportColumnKey, boolean>
  onToggle: (key: InvoiceReportColumnKey) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-primary bg-card px-3 text-sm font-medium text-primary hover:bg-primary/5"
      >
        Columns
        <ChevronDown size={14} />
      </button>
      {open ? (
        <ul className="absolute left-0 z-40 mt-1.5 max-h-72 w-56 overflow-y-auto rounded-lg border border-line bg-card py-1 shadow-lg">
          {INVOICE_REPORT_COLUMNS.map((column) => (
            <li key={column.key}>
              <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-page">
                <input
                  type="checkbox"
                  checked={visible[column.key]}
                  disabled={column.key === 'restaurant'}
                  onChange={() => onToggle(column.key)}
                  className="accent-primary"
                />
                <span className="min-w-0 truncate">{column.label}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function cellValue(row: InvoiceReportRow, key: InvoiceReportColumnKey) {
  switch (key) {
    case 'restaurant':
      return row.restaurant
    case 'billStarting':
    case 'billEnding':
    case 'totalBills':
    case 'salesBillCount':
    case 'cancelBillCount':
      return String(row[key])
    case 'salesBillAmount':
    case 'cancelBillAmount':
      return formatAmount(row[key])
  }
}

function totalCell(
  stats: Record<string, number> | null,
  key: InvoiceReportColumnKey,
) {
  if (!stats) return '—'
  if (
    key === 'restaurant' ||
    key === 'billStarting' ||
    key === 'billEnding'
  ) {
    return ''
  }
  if (key === 'salesBillAmount' || key === 'cancelBillAmount') {
    return formatAmount(stats[key] ?? 0)
  }
  return String(stats[key] ?? 0)
}

export default function InvoiceReport() {
  const navigate = useNavigate()
  const [startDate, setStartDate] = useState('2026-08-12')
  const [endDate, setEndDate] = useState('2026-08-12')
  const [restaurant, setRestaurant] = useState('')
  const [appliedRestaurant, setAppliedRestaurant] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [visible, setVisible] = useState<
    Record<InvoiceReportColumnKey, boolean>
  >(() =>
    Object.fromEntries(
      INVOICE_REPORT_COLUMNS.map((column) => [column.key, true]),
    ) as Record<InvoiceReportColumnKey, boolean>,
  )

  const columns = useMemo(
    () => INVOICE_REPORT_COLUMNS.filter((column) => visible[column.key]),
    [visible],
  )

  const rows = useMemo(() => {
    if (!appliedRestaurant) return INVOICE_REPORT_ROWS
    return INVOICE_REPORT_ROWS.filter(
      (row) => row.restaurant === appliedRestaurant,
    )
  }, [appliedRestaurant])

  const totals = useMemo(() => summarizeInvoiceReport(rows), [rows])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSearch() {
    setAppliedRestaurant(restaurant)
    showToast('Report updated')
  }

  function toggleColumn(key: InvoiceReportColumnKey) {
    if (key === 'restaurant') return
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <ReportsPageShell
      title={
        <nav className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-muted">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-primary hover:underline"
            aria-label="Home"
          >
            <Home size={15} />
          </Link>
          <span>/</span>
          <Link
            to="/reports/other-reports"
            className="text-primary hover:underline"
          >
            Reports
          </Link>
          <span>/</span>
          <span className="font-semibold text-ink">
            Invoice Report: All Restaurants
          </span>
        </nav>
      }
      activeItem="other-reports"
      actions={
        <button
          type="button"
          onClick={() => navigate('/reports/other-reports')}
          className="inline-flex h-9 items-center gap-1 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ChevronLeft size={15} />
          Back
        </button>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-3">
        <label className="text-xs text-muted">
          Order Date
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-9 rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
            />
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-9 rounded-md border border-line bg-card px-2.5 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
        </label>

        <div className="min-w-[220px] flex-1">
          <SearchableSelect
            label="Restaurants"
            value={restaurant}
            options={INVOICE_RESTAURANT_OPTIONS}
            placeholder="Choose Restaurant"
            searchPlaceholder="Search restaurant"
            includePlaceholderOption
            onChange={setRestaurant}
          />
        </div>

        <PrimaryButton onClick={handleSearch}>Search</PrimaryButton>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <ColumnsMenu visible={visible} onToggle={toggleColumn} />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => showToast('Exporting Excel…')}
            className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Excel
          </button>
          <button
            type="button"
            onClick={() => {
              window.print()
              showToast('Print dialog opened')
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-ink px-3 text-sm font-semibold text-white hover:bg-ink/90"
          >
            <Printer size={14} />
            Print
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-page">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`whitespace-nowrap px-3 py-2.5 text-xs font-semibold text-ink ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line bg-[#fff8e8] text-ink">
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={`whitespace-nowrap px-3 py-2 tabular-nums ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    {index === 0 ? 'Total' : totalCell(totals, column.key)}
                  </td>
                ))}
              </tr>

              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-10 text-center text-muted"
                  >
                    No invoice records found for the selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-b-0 hover:bg-page/50"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`whitespace-nowrap px-3 py-2.5 text-ink tabular-nums ${
                          column.align === 'right'
                            ? 'text-right'
                            : column.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                        }`}
                      >
                        {cellValue(row, column.key)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-2.5 text-xs text-muted">
          Showing {rows.length === 0 ? 0 : 1} to {rows.length} of {rows.length}{' '}
          entries
        </div>
      </div>
    </ReportsPageShell>
  )
}
