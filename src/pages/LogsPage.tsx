import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Printer, Search } from 'lucide-react'
import { BillingHeader } from '../components/billing/BillingHeader'

interface LogRow {
  id: string
  timestamp: string
  user: string
  action: string
  details: string
}

const LOG_ROWS: LogRow[] = [
  { id: 'l1', timestamp: '25 Aug 2026, 09:12 AM', user: 'Utkarsh Gosavi', action: 'Order Created', details: 'Bill #56978 — Dine In, ₹300' },
  { id: 'l2', timestamp: '25 Aug 2026, 09:15 AM', user: 'Utkarsh Gosavi', action: 'KOT Sent', details: 'KOT #1042 — 3 items to Kitchen' },
  { id: 'l3', timestamp: '25 Aug 2026, 09:30 AM', user: 'System', action: 'Order Settled', details: 'Bill #56978 — Cash, ₹300' },
  { id: 'l4', timestamp: '25 Aug 2026, 09:45 AM', user: 'Raju Shah', action: 'Item Modified', details: 'Bill #56979 — Added Extra Cheese (+₹30)' },
  { id: 'l5', timestamp: '25 Aug 2026, 10:02 AM', user: 'Utkarsh Gosavi', action: 'Order Cancelled', details: 'Bill #56980 — Dine In, ₹180' },
  { id: 'l6', timestamp: '25 Aug 2026, 10:15 AM', user: 'Raju Shah', action: 'Payment Changed', details: 'Bill #56981 — Cash → UPI' },
  { id: 'l7', timestamp: '25 Aug 2026, 10:30 AM', user: 'Utkarsh Gosavi', action: 'Order Created', details: 'Bill #56982 — Parcel, ₹450' },
  { id: 'l8', timestamp: '25 Aug 2026, 10:45 AM', user: 'System', action: 'KOT Printed', details: 'KOT #1045 — Auto-print triggered' },
  { id: 'l9', timestamp: '25 Aug 2026, 11:00 AM', user: 'Raju Shah', action: 'Discount Applied', details: 'Bill #56982 — 10% flat discount (-₹45)' },
  { id: 'l10', timestamp: '25 Aug 2026, 11:15 AM', user: 'Utkarsh Gosavi', action: 'Order Created', details: 'Bill #56983 — Dine In, ₹720' },
  { id: 'l11', timestamp: '25 Aug 2026, 11:30 AM', user: 'System', action: 'Order Settled', details: 'Bill #56983 — Card, ₹720' },
  { id: 'l12', timestamp: '25 Aug 2026, 11:45 AM', user: 'Raju Shah', action: 'Reprint Requested', details: 'Bill #56978 — Receipt reprinted' },
  { id: 'l13', timestamp: '25 Aug 2026, 12:00 PM', user: 'Utkarsh Gosavi', action: 'Order Created', details: 'Bill #56984 — Dine In, ₹560' },
  { id: 'l14', timestamp: '25 Aug 2026, 12:15 PM', user: 'System', action: 'Sync Completed', details: 'All data synced to server' },
  { id: 'l15', timestamp: '25 Aug 2026, 12:30 PM', user: 'Raju Shah', action: 'Item Modified', details: 'Bill #56984 — Removed Item (-₹120)' },
]

const ACTION_COLORS: Record<string, string> = {
  'Order Created': 'bg-success/10 text-success',
  'KOT Sent': 'bg-primary/10 text-primary',
  'KOT Printed': 'bg-primary/10 text-primary',
  'Order Settled': 'bg-accent/10 text-accent',
  'Order Cancelled': 'bg-danger/10 text-danger',
  'Item Modified': 'bg-deep/10 text-deep',
  'Payment Changed': 'bg-secondary/10 text-secondary',
  'Discount Applied': 'bg-accent/10 text-accent',
  'Reprint Requested': 'bg-page text-muted',
  'Sync Completed': 'bg-success/10 text-success',
}

const PAGE_SIZE = 10

export default function LogsPage() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return LOG_ROWS
    return LOG_ROWS.filter(
      (r) =>
        r.action.toLowerCase().includes(q) ||
        r.user.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q),
    )
  }, [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  function handleExport() {
    const header = 'Timestamp,User,Action,Details'
    const lines = [
      header,
      ...LOG_ROWS.map(
        (r) => `"${r.timestamp}","${r.user}","${r.action}","${r.details}"`,
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'activity-logs.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => navigate('/table-view')}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">Activity Logs</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
            >
              <Download size={14} className="text-muted" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
            >
              <Printer size={14} className="text-muted" />
              Print
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Events', value: LOG_ROWS.length },
            { label: 'Today\'s Orders', value: LOG_ROWS.filter((r) => r.action === 'Order Created').length },
            { label: 'Modifications', value: LOG_ROWS.filter((r) => r.action.includes('Modified')).length },
            { label: 'Cancellations', value: LOG_ROWS.filter((r) => r.action === 'Order Cancelled').length },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-line bg-card p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
              <p className="mt-1 text-xl font-extrabold text-ink">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-line bg-card">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search logs..."
                className="h-9 w-full rounded-lg border border-line bg-page pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
              />
            </div>
            <span className="text-xs text-muted">{filtered.length} events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Timestamp</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">User</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Action</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {pageRows.map((row) => (
                  <tr key={row.id} className="hover:bg-page/40">
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted">{row.timestamp}</td>
                    <td className="px-4 py-2.5 text-sm font-medium text-ink">{row.user}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${ACTION_COLORS[row.action] ?? 'bg-page text-muted'}`}>
                        {row.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-muted">{row.details}</td>
                  </tr>
                ))}
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted">No logs found</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
              <span className="text-xs text-muted">
                Page {safePage} of {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="h-8 rounded-lg border border-line bg-card px-3 text-xs font-medium text-ink hover:bg-page disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 rounded-lg border border-line bg-card px-3 text-xs font-medium text-ink hover:bg-page disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
