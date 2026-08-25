import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Printer } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { DAY_END_SUMMARY_ROWS } from '../../mocks/dayEndSummaryData'

const PAGE_SIZE = 10

export default function OrderSummaryReport() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [page, setPage] = useState(1)

  const rows = DAY_END_SUMMARY_ROWS
  const totalOrders = rows.reduce((s, r) => s + r.orders, 0)
  const totalRevenue = rows.reduce((s, r) => s + r.total, 0)
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleExport() {
    const header = 'Date,Orders,Revenue'
    const lines = [header, ...rows.map((r) => `${r.createdDate},${r.orders},${r.total}`)]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'order-summary.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader billNo={billNo} onBillNoChange={setBillNo} onNewOrder={() => navigate('/table-view')} onViewKot={() => navigate('/billing?kot=1')} />
      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Order Summary</h1>
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
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Days</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{rows.length}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Orders</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{totalOrders}</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-3 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Total Revenue</p>
            <p className="mt-1 text-xl font-extrabold text-accent">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Date</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Orders</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pageRows.map((r) => (
                  <tr key={r.id} className="hover:bg-page/40">
                    <td className="px-4 py-2.5 font-medium text-ink">{r.createdDate}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{r.orders}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-accent">₹{r.total.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-line bg-page/60 font-bold">
                  <td className="px-4 py-2.5 text-ink">Total</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink">{totalOrders}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-accent">₹{totalRevenue.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
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
