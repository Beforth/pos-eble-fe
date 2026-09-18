import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Printer } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { ListSearch } from '../../components/common/ListSearch'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import { menuCategories } from '../../mocks/menuCategoriesData'
import { menuItems } from '../../mocks/menuItemsData'

export default function GroupSummaryReport() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')

  const groupedRows = useMemo(() => {
    const topLevel = menuCategories.filter((c) => !c.parentCategory)
    return topLevel.map((cat) => {
      const children = menuCategories.filter((c) => c.parentCategory === cat.name)
      const childIds = new Set(children.map((c) => c.id))
      const catItems = menuItems.filter(
        (item) => item.categoryId === cat.id || childIds.has(item.categoryId),
      )
      return {
        group: cat.name,
        categories: children.length > 0 ? children.length : 1,
        items: catItems.length,
        revenue: catItems.reduce((s, item) => s + item.price, 0),
      }
    })
  }, [])

  const { search, setSearch, sortKey, sortDir, toggleSort, visible } =
    useListQuery(
      groupedRows,
      (row) => [row.group, row.categories, row.items, row.revenue],
      (row, key) => {
        if (key === 'categories') return row.categories
        if (key === 'items') return row.items
        if (key === 'revenue') return row.revenue
        return row.group
      },
    )

  const rows = visible

  const totalGroups = rows.length
  const totalItems = rows.reduce((s, r) => s + r.items, 0)
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0)

  function handleExport() {
    const header = 'Group,Categories,Items,Revenue'
    const lines = [header, ...rows.map((r) => `${r.group},${r.categories},${r.items},${r.revenue.toFixed(2)}`)]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'group-summary.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader billNo={billNo} onBillNoChange={setBillNo} onNewOrder={() => navigate('/table-view')} onViewKot={() => navigate('/billing?kot=1')} />
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Group Summary</h1>
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Groups</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{totalGroups}</p>
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
          <div className="border-b border-line p-3">
            <ListSearch
              value={search}
              onChange={setSearch}
              placeholder="Search groups"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
                  <SortableTh columnKey="group" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">Group</SortableTh>
                  <SortableTh columnKey="categories" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">Categories</SortableTh>
                  <SortableTh columnKey="items" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">Items</SortableTh>
                  <SortableTh columnKey="revenue" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted">Revenue</SortableTh>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.group} className="hover:bg-page/40">
                    <td className="px-4 py-2.5 font-medium text-ink">{r.group}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{r.categories}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{r.items}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-accent">₹{r.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line bg-page/60 font-bold">
                  <td className="px-4 py-2.5 text-ink">Total</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink">{totalGroups}</td>
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
