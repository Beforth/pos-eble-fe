import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Printer, Search } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { OUTLET_ITEM_WISE_ROWS, summarizeOutletItemWise } from '../../mocks/outletItemWiseData'

const PAGE_SIZE = 10

export default function ItemSummaryReport() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return OUTLET_ITEM_WISE_ROWS
    return OUTLET_ITEM_WISE_ROWS.filter(
      (r) => r.item.toLowerCase().includes(q) || r.category.toLowerCase().includes(q),
    )
  }, [search])

  const stats = useMemo(() => summarizeOutletItemWise(filtered), [filtered])
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleExport() {
    const header = 'Category,Item,Qty,Amount,Discount,Tax,Gross Sales'
    const lines = [header, ...filtered.map((r) => `${r.category},${r.item},${r.qty},${r.myAmount},${r.discount},${r.tax},${r.grossSales}`)]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'item-summary.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader billNo={billNo} onBillNoChange={setBillNo} onNewOrder={() => navigate('/table-view')} onViewKot={() => navigate('/billing?kot=1')} />
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Item Summary</h1>
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Items</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{filtered.length}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Qty</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{stats?.total?.qty ?? 0}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Tax</p>
            <p className="mt-1 text-xl font-extrabold text-accent">₹{(stats?.total?.tax ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Gross Sales</p>
            <p className="mt-1 text-xl font-extrabold text-accent">₹{(stats?.total?.grossSales ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search items..." className="h-9 w-full rounded-lg border border-line bg-page pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary" />
            </div>
            <span className="text-xs text-muted">{filtered.length} items</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Category</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Item</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Qty</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Amount</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Tax</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Gross Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pageRows.map((r) => (
                  <tr key={r.id} className="hover:bg-page/40">
                    <td className="px-4 py-2.5 text-muted">{r.category}</td>
                    <td className="px-4 py-2.5 font-medium text-ink">{r.item}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{r.qty}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">₹{r.myAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">₹{r.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-accent">₹{r.grossSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
              <span className="text-xs text-muted">Page {safePage} of {totalPages}</span>
              <div className="flex gap-1">
                <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)} className="h-8 rounded-lg border border-line bg-card px-3 text-xs font-medium text-ink hover:bg-page disabled:opacity-40">Prev</button>
                <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-8 rounded-lg border border-line bg-card px-3 text-xs font-medium text-ink hover:bg-page disabled:opacity-40">Next</button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
