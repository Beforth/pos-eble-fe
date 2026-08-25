import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Printer } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { INVOICE_REPORT_ROWS, summarizeInvoiceReport } from '../../mocks/invoiceReportData'

export default function TaxSummaryReport() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')

  const stats = useMemo(() => summarizeInvoiceReport(INVOICE_REPORT_ROWS), [])

  function handleExport() {
    const header = 'Restaurant,Bill Start,Bill End,Total Bills,Sales Amount,Cancel Amount'
    const lines = [header, ...INVOICE_REPORT_ROWS.map((r) => `${r.restaurant},${r.billStarting},${r.billEnding},${r.totalBills},${r.salesBillAmount},${r.cancelBillAmount}`)]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'tax-summary.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader billNo={billNo} onBillNoChange={setBillNo} onNewOrder={() => navigate('/table-view')} onViewKot={() => navigate('/billing?kot=1')} />
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Tax Summary</h1>
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Bills</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{stats?.totalBills ?? 0}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Sales Amount</p>
            <p className="mt-1 text-xl font-extrabold text-accent">₹{(stats?.salesBillAmount ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Cancelled Bills</p>
            <p className="mt-1 text-xl font-extrabold text-danger">{stats?.cancelBillCount ?? 0}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Cancelled Amount</p>
            <p className="mt-1 text-xl font-extrabold text-danger">₹{(stats?.cancelBillAmount ?? 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Restaurant</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted">Bill Starting</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted">Bill Ending</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted">Total Bills</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted">Sales Count</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Sales Amount</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted">Cancel Count</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Cancel Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {INVOICE_REPORT_ROWS.map((r) => (
                  <tr key={r.id} className="hover:bg-page/40">
                    <td className="px-4 py-2.5 font-medium text-ink">{r.restaurant}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-muted">{r.billStarting}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-muted">{r.billEnding}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-ink">{r.totalBills}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-ink">{r.salesBillCount}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-accent">₹{r.salesBillAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-ink">{r.cancelBillCount}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-danger">₹{r.cancelBillAmount.toLocaleString('en-IN')}</td>
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
