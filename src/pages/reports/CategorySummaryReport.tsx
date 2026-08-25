import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Printer, Search } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { menuItems, baseMenuCategories } from '../../mocks/menuItemsData'

export default function CategorySummaryReport() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [search, setSearch] = useState('')

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const grouped: Record<string, { items: number; revenue: number }> = {}
    for (const item of menuItems) {
      const cat = baseMenuCategories.find((c) => c.id === item.categoryId)
      const catName = cat?.name ?? 'Other'
      if (!grouped[catName]) grouped[catName] = { items: 0, revenue: 0 }
      grouped[catName].items += 1
      grouped[catName].revenue += item.price
    }
    let result = Object.entries(grouped).map(([category, data]) => ({
      category,
      items: data.items,
      revenue: data.revenue,
    }))
    if (q) {
      result = result.filter((r) => r.category.toLowerCase().includes(q))
    }
    return result
  }, [search])

  const totalItems = rows.reduce((s, r) => s + r.items, 0)
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)

  function handleExport() {
    const lines = ['Category,Items,Revenue', ...rows.map((r) => `${r.category},${r.items},${r.revenue.toFixed(2)}`)]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'category-summary.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader billNo={billNo} onBillNoChange={setBillNo} onNewOrder={() => navigate('/table-view')} onViewKot={() => navigate('/billing?kot=1')} />
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Category Summary</h1>
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Categories</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{rows.length}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Items</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{totalItems}</p>
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
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="h-9 w-full rounded-lg border border-line bg-page pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Category</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Items</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.category} className="hover:bg-page/40">
                    <td className="px-4 py-2.5 font-medium text-ink">{r.category}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{r.items}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-accent">₹{r.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line bg-page/60 font-bold">
                  <td className="px-4 py-2.5 text-ink">Total</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink">{totalItems}</td>
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
