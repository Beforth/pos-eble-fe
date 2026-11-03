import { Fragment, useCallback, useEffect, useRef, useState } from 'react'

import { showToast } from '../../utils/toast'
import { downloadCsv } from '../../utils/exportCsv'
import { ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { InventoryPageShell } from '../layout/InventoryPageShell'
import { SearchableSelect } from './SearchableSelect'
import { ReportEmptyState } from './ReportUnavailableNotice'
import { OutlineButton } from '../menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import { ApiError } from '../../services/apiClient'
import {
  INV_REPORT_PERMISSION,
  type PaymentSummaryReport,
} from '../../services/inventoryService'

const todayIso = () => new Date().toISOString().slice(0, 10)
const monthStartIso = () => `${todayIso().slice(0, 8)}01`

function ExportMenu({
  onExportPage,
  onExportAll,
}: {
  onExportPage: () => void
  onExportAll: () => void
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

  const items = [
    { label: 'Export Current Page', onClick: onExportPage },
    { label: 'Export All', onClick: onExportAll },
  ]

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
      >
        <FileText size={15} className="text-muted" />
        Export
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open ? (
        <ul className="absolute right-0 z-40 mt-1.5 min-w-[180px] overflow-hidden rounded-md border border-line bg-card py-1 shadow-lg">
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => {
                  item.onClick()
                  setOpen(false)
                }}
                className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-page"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** One report page: parties with total / paid / pending, payments in a detail row. */
export function PaymentSummaryReportPage({
  title,
  partyFilterLabel,
  partyColumn,
  totalColumn,
  fileName,
  emptyTitle,
  load,
}: {
  title: string
  partyFilterLabel: string
  partyColumn: string
  totalColumn: string
  fileName: string
  emptyTitle: string
  load: (
    outletId: string,
    params: { search?: string; dateFrom: string; dateTo: string },
  ) => Promise<PaymentSummaryReport>
}) {
  const { encryptedOutletId, hasPermission } = useAuth()
  const canRead = hasPermission(INV_REPORT_PERMISSION)
  const [party, setParty] = useState('All')
  const [fromDate, setFromDate] = useState(monthStartIso)
  const [toDate, setToDate] = useState(todayIso)
  const [applied, setApplied] = useState({
    party: 'All',
    fromDate: monthStartIso(),
    toDate: todayIso(),
  })
  const [report, setReport] = useState<PaymentSummaryReport>({
    rows: [],
    totals: { total: '0', paid: '0', pending: '0' },
  })
  const [partyNames, setPartyNames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set())

  const fetchReport = useCallback(async () => {
    if (!encryptedOutletId || !canRead) return
    setLoading(true)
    try {
      const data = await load(encryptedOutletId, {
        search: applied.party === 'All' ? undefined : applied.party,
        dateFrom: applied.fromDate,
        dateTo: applied.toDate,
      })
      setReport(data)
      if (applied.party === 'All') {
        setPartyNames(data.rows.map((row) => row.party_name))
      }
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : `Unable to load ${title}`)
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, canRead, applied, load, title])

  useEffect(() => {
    void fetchReport()
  }, [fetchReport])

  function handleSearch() {
    setApplied({ party, fromDate, toDate })
  }

  function handleClear() {
    setParty('All')
    setFromDate(monthStartIso())
    setToDate(todayIso())
    setApplied({ party: 'All', fromDate: monthStartIso(), toDate: todayIso() })
  }

  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function exportRows(suffix: 'page' | 'all') {
    const lines: (string | number)[][] = []
    for (const row of report.rows) {
      let balance = Number.parseFloat(row.total) || 0
      if (row.payments.length === 0) {
        lines.push(['', row.party_name, '', 0, balance])
      }
      for (const payment of row.payments) {
        balance -= Number.parseFloat(payment.amount) || 0
        lines.push([
          payment.date,
          row.party_name,
          payment.method,
          payment.amount,
          balance.toFixed(3),
        ])
      }
    }
    downloadCsv(
      `${fileName}-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Date', partyColumn, 'Payment Mode', 'Paid Amount (₹)', 'Balance (₹)'],
      lines,
    )
    showToast(`Exported ${lines.length} rows`)
  }

  return (
    <InventoryPageShell activeItem="other-reports">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-ink">{title}</h1>
        <ExportMenu
          onExportPage={() => exportRows('page')}
          onExportAll={() => exportRows('all')}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-4">
        <div className="min-w-[180px]">
          <SearchableSelect
            label={partyFilterLabel}
            value={party}
            options={['All', ...partyNames]}
            placeholder="All"
            searchPlaceholder="Search"
            includePlaceholderOption={false}
            onChange={setParty}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="h-10 rounded-md border border-line bg-card px-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <OutlineButton onClick={handleSearch}>Search</OutlineButton>
        <OutlineButton variant="gray" onClick={handleClear}>
          Clear
        </OutlineButton>
      </div>

      {report.rows.length === 0 ? (
        loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading report…</p>
        ) : (
          <ReportEmptyState title={emptyTitle} />
        )
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-card">
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-left text-sm">
              <thead className="border-b border-line bg-page text-xs font-semibold text-ink">
                <tr>
                  <th className="w-10 px-3 py-2.5" />
                  <th className="px-3 py-2.5">{partyColumn}</th>
                  <th className="px-3 py-2.5 text-right">{totalColumn}</th>
                  <th className="px-3 py-2.5 text-right">Paid (₹)</th>
                  <th className="px-3 py-2.5 text-right">Pending (₹)</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row, index) => (
                  <Fragment key={row.party_name}>
                    <tr
                      className={`border-b border-line ${
                        index % 2 === 1 ? 'bg-page/50' : 'bg-card'
                      }`}
                    >
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          aria-label={`Show payments of ${row.party_name}`}
                          onClick={() => toggle(row.party_name)}
                          className="inline-flex size-6 items-center justify-center rounded text-muted hover:bg-page"
                        >
                          {expanded.has(row.party_name) ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-2 font-medium text-ink">
                        {row.party_name}
                      </td>
                      <td className="px-3 py-2 text-right">{row.total}</td>
                      <td className="px-3 py-2 text-right">{row.paid}</td>
                      <td className="px-3 py-2 text-right font-semibold text-ink">
                        {row.pending}
                      </td>
                    </tr>
                    {expanded.has(row.party_name) ? (
                      <tr className="border-b border-line bg-page/50">
                        <td />
                        <td colSpan={4} className="px-3 py-2">
                          {row.payments.length === 0 ? (
                            <p className="text-xs text-muted">
                              No payments made yet.
                            </p>
                          ) : (
                            <table className="w-full text-xs">
                              <thead className="text-muted">
                                <tr>
                                  <th className="py-1 text-left font-semibold">Date</th>
                                  <th className="py-1 text-left font-semibold">Mode</th>
                                  <th className="py-1 text-left font-semibold">Document</th>
                                  <th className="py-1 text-right font-semibold">Amount (₹)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.payments.map((payment, paymentIndex) => (
                                  <tr key={paymentIndex}>
                                    <td className="py-1">{payment.date}</td>
                                    <td className="py-1">{payment.method}</td>
                                    <td className="py-1">
                                      {payment.document_number || '-'}
                                    </td>
                                    <td className="py-1 text-right">
                                      {payment.amount}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
                <tr className="bg-page font-semibold text-ink">
                  <td />
                  <td className="px-3 py-2.5">Total</td>
                  <td className="px-3 py-2.5 text-right">{report.totals.total}</td>
                  <td className="px-3 py-2.5 text-right">{report.totals.paid}</td>
                  <td className="px-3 py-2.5 text-right">
                    {report.totals.pending}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </InventoryPageShell>
  )
}
