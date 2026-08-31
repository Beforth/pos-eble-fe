import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Printer, Search } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { OUTLET_ITEM_WISE_ROWS } from '../../mocks/outletItemWiseData'

export default function VariationSummaryReport() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const grouped: Record<string, { qty: number; revenue: number; tax: number }> = {}
    for (const item of OUTLET_ITEM_WISE_ROWS) {
      const variation = item.item
      if (!grouped[variation]) grouped[variation] = { qty: 0, revenue: 0, tax: 0 }
      grouped[variation].qty += item.qty
      grouped[variation].revenue += item.grossSales
      grouped[variation].tax += item.tax
    }
    let result = Object.entries(grouped).map(([variation, data]) => ({
      variation,
      qty: data.qty,
      revenue: data.revenue,
      tax: data.tax,
    }))
    if (q) result = result.filter((r) => r.variation.toLowerCase().includes(q))
    return result
  }, [search])

  const totalQty = rows.reduce((s, r) => s + r.qty, 0)
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)
  const totalTax = rows.reduce((s, r) => s + r.tax, 0)

  function handleExport() {
    const header = 'Variation,Qty,Tax,Revenue'
    const lines = [header, ...rows.map((r) => `${r.variation},${r.qty},${r.tax.toFixed(2)},${r.revenue.toFixed(2)}`)]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'variation-summary.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader billNo={billNo} onBillNoChange={setBillNo} onNewOrder={() => navigate('/table-view')} onViewKot={() => navigate('/billing?kot=1')} />
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Variation Summary</h1>
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Variations</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{rows.length}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Qty</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{totalQty}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Revenue</p>
            <p className="mt-1 text-xl font-extrabold text-accent">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search variations..." className="h-9 w-full rounded-lg border border-line bg-page pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Variation</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Qty</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Tax</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.variation} className="hover:bg-page/40">
                    <td className="px-4 py-2.5 font-medium text-ink">{r.variation}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{r.qty}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">₹{r.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-accent">₹{r.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line bg-page/60 font-bold">
                  <td className="px-4 py-2.5 text-ink">Total</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink">{totalQty}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink">₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-accent">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
