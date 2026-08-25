import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Printer } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { PAX_SALES_ROWS, summarizePaxSales } from '../../mocks/paxSalesReportData'

export default function ExecutiveSalesSummaryReport() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')

  const stats = useMemo(() => summarizePaxSales(PAX_SALES_ROWS), [])

  function handleExport() {
    const header = 'Executive,Pax,Sales,APC'
    const lines = [header, ...PAX_SALES_ROWS.map((r) => `${r.name},${r.totalPax},${r.totalSales},${r.apc}`)]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'executive-sales-summary.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader billNo={billNo} onBillNoChange={setBillNo} onNewOrder={() => navigate('/table-view')} onViewKot={() => navigate('/billing?kot=1')} />
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Executive Sales Summary</h1>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleExport} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page">
              <Download size={14} className="text-muted" /> Export CSV
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page">
              <Printer size={14} className="text-muted" /> Print
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Pax</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{stats?.totalPax ?? 0}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Sales</p>
            <p className="mt-1 text-xl font-extrabold text-accent">₹{(stats?.totalSales ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Avg. Cost / Pax</p>
            <p className="mt-1 text-xl font-extrabold text-ink">₹{(stats?.apc ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Executive</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Total Pax</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Total Sales</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">APC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {PAX_SALES_ROWS.map((r) => (
                  <tr key={r.id} className="hover:bg-page/40">
                    <td className="px-4 py-2.5 font-medium text-ink">{r.name}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{r.totalPax}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-accent">₹{r.totalSales.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">₹{r.apc.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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
