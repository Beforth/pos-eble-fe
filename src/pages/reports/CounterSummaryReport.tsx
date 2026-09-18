import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Printer } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { ListSearch } from '../../components/common/ListSearch'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import { INVOICE_REPORT_ROWS, summarizeInvoiceReport } from '../../mocks/invoiceReportData'

export default function CounterSummaryReport() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')

  const baseRows = INVOICE_REPORT_ROWS.map((r) => ({
    ...r,
    avgBill: r.totalBills > 0 ? r.salesBillAmount / r.totalBills : 0,
  }))

  const { search, setSearch, sortKey, sortDir, toggleSort, visible } =
    useListQuery(
      baseRows,
      (row) => [
        row.restaurant,
        row.billStarting,
        row.billEnding,
        row.totalBills,
        row.salesBillAmount,
        row.avgBill,
      ],
      (row, key) => {
        if (key === 'billRange') return `${row.billStarting}-${row.billEnding}`
        if (key === 'totalBills') return row.totalBills
        if (key === 'salesBillAmount') return row.salesBillAmount
        if (key === 'avgBill') return row.avgBill
        return row.restaurant
      },
    )

  const stats = useMemo(() => summarizeInvoiceReport(visible), [visible])

  function handleExport() {
    const header = 'Counter,Bills,Sales Amount,Avg Bill Value'
    const lines = [
      header,
      ...visible.map((r) =>
        `${r.restaurant},${r.totalBills},${r.salesBillAmount},${r.totalBills > 0 ? (r.salesBillAmount / r.totalBills).toFixed(2) : '0'}`,
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'counter-summary.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader billNo={billNo} onBillNoChange={setBillNo} onNewOrder={() => navigate('/table-view')} onViewKot={() => navigate('/billing?kot=1')} />
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Counter Summary</h1>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleExport} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page">
              <Download size={14} className="text-muted" /> Export CSV
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page">
              <Printer size={14} className="text-muted" /> Print
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Counters</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{visible.length}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Bills</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{stats?.totalBills ?? 0}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Sales</p>
            <p className="mt-1 text-xl font-extrabold text-accent">₹{(stats?.salesBillAmount ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Avg Bill Value</p>
            <p className="mt-1 text-xl font-extrabold text-ink">
              ₹{((stats?.totalBills ?? 0) > 0 ? ((stats?.salesBillAmount ?? 0) / (stats?.totalBills ?? 1)).toFixed(2) : '0.00')}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card">
          <div className="border-b border-line p-3">
            <ListSearch
              value={search}
              onChange={setSearch}
              placeholder="Search counters"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
                  <SortableTh columnKey="restaurant" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">Counter</SortableTh>
                  <SortableTh columnKey="billRange" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="center" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">Bill Range</SortableTh>
                  <SortableTh columnKey="totalBills" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="center" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">Total Bills</SortableTh>
                  <SortableTh columnKey="salesBillAmount" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">Sales Amount</SortableTh>
                  <SortableTh columnKey="avgBill" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">Avg Bill Value</SortableTh>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((r) => (
                  <tr key={r.id} className="hover:bg-page/40">
                    <td className="px-4 py-2.5 font-medium text-ink">{r.restaurant}</td>
                    <td className="px-4 py-2.5 text-center text-muted">{r.billStarting} – {r.billEnding}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-ink">{r.totalBills}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-accent">₹{r.salesBillAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">₹{r.avgBill.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
