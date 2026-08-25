import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Printer } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { ALL_RESTAURANT_SALES_ROWS, summarizeAllRestaurantSales } from '../../mocks/allRestaurantSalesData'

export default function SalesSummaryReport() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')

  const stats = useMemo(() => summarizeAllRestaurantSales(ALL_RESTAURANT_SALES_ROWS), [])

  function handleExport() {
    const header = 'Restaurant,Invoice From,Invoice To,Bills,My Amount,Discount,Net Sales,Tax,Round Off,Tip,Total Sales'
    const lines = [header, ...ALL_RESTAURANT_SALES_ROWS.map((r) => `${r.restaurant},${r.invoiceFrom},${r.invoiceTo},${r.totalBills},${r.myAmount},${r.totalDiscount},${r.netSales},${r.totalTax},${r.roundOff},${r.tip},${r.totalSales}`)]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'sales-summary.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader billNo={billNo} onBillNoChange={setBillNo} onNewOrder={() => navigate('/table-view')} onViewKot={() => navigate('/billing?kot=1')} />
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Sales Summary</h1>
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
            <p className="mt-1 text-xl font-extrabold text-ink">{stats?.total?.totalBills ?? 0}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Net Sales</p>
            <p className="mt-1 text-xl font-extrabold text-accent">₹{(stats?.total?.netSales ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Tax</p>
            <p className="mt-1 text-xl font-extrabold text-accent">₹{(stats?.total?.totalTax ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Sales</p>
            <p className="mt-1 text-xl font-extrabold text-accent">₹{(stats?.total?.totalSales ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Restaurant</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted">Invoice Nos.</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted">Bills</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">My Amount</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Discount</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Net Sales</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Tax</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Round Off</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Tip</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ALL_RESTAURANT_SALES_ROWS.map((r) => (
                  <tr key={r.id} className="hover:bg-page/40">
                    <td className="px-4 py-2.5 font-medium text-ink">{r.restaurant}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-muted">{r.invoiceFrom}–{r.invoiceTo}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums text-ink">{r.totalBills}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">₹{r.myAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">₹{r.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">₹{r.netSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">₹{r.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">{r.roundOff}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">₹{r.tip}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-accent">₹{r.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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
