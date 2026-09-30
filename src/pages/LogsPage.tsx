<<<<<<< HEAD
import { useState } from 'react'
=======
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
>>>>>>> origin/main
import { useNavigate } from 'react-router-dom'
import { Download, Printer } from 'lucide-react'
import { BillingHeader } from '../components/billing/BillingHeader'
<<<<<<< HEAD
import { ListSearch } from '../components/common/ListSearch'
import { SortableTh } from '../components/common/SortableTh'
import { useListQuery } from '../hooks/useListQuery'

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
=======
import { useAuth } from '../auth/AuthContext'
import { showToast } from '../utils/toast'
import {
  listActivityLogsApi,
  type ActivityLogDto,
  type ActivityLogSource,
} from '../services/orderService'
>>>>>>> origin/main

const ACTION_COLORS: Record<string, string> = {
  'Order Created': 'bg-success/10 text-success',
  'KOT Sent': 'bg-primary/10 text-primary',
  'KOT Modified': 'bg-deep/10 text-deep',
  'KOT Cancelled': 'bg-danger/10 text-danger',
  'KOT Deleted': 'bg-page text-muted',
  'Order Settled': 'bg-accent/10 text-accent',
  'Order Cancelled': 'bg-danger/10 text-danger',
  'Order Modified': 'bg-deep/10 text-deep',
  'Payment Changed': 'bg-secondary/10 text-secondary',
  'Due Collected': 'bg-accent/10 text-accent',
  'Reprint Requested': 'bg-page text-muted',
  'Bill Split': 'bg-primary/10 text-primary',
  'Bill No Allocated': 'bg-page text-muted',
}

const PAGE_SIZE = 10

function formatLogTimestamp(value: string): string {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

interface ActivityLogsViewProps {
  source: ActivityLogSource
  header: ReactNode
  newOrderPath: string
}

export function ActivityLogsView({
  source,
  header,
  newOrderPath,
}: ActivityLogsViewProps) {
  const { encryptedOutletId } = useAuth()
  const navigate = useNavigate()
<<<<<<< HEAD
  const [billNo, setBillNo] = useState('')
  const [page, setPage] = useState(1)
  const { search, setSearch, sortKey, sortDir, toggleSort, visible } =
    useListQuery(
      LOG_ROWS,
      (row) => [row.timestamp, row.user, row.action, row.details],
      (row, key) => {
        if (key === 'user') return row.user
        if (key === 'action') return row.action
        if (key === 'details') return row.details
        return row.timestamp
      },
    )

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = visible.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )
=======
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<ActivityLogDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!encryptedOutletId) {
      setRows([])
      setTotalCount(0)
      return
    }
    setLoading(true)
    try {
      const data = await listActivityLogsApi(encryptedOutletId, {
        source,
        search: appliedSearch || undefined,
        page,
        page_size: PAGE_SIZE,
      })
      setRows(data.results)
      setTotalCount(data.count)
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to load activity logs',
      )
      setRows([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [encryptedOutletId, source, appliedSearch, page])

  useEffect(() => {
    void load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const stats = useMemo(() => {
    const created = rows.filter((r) => r.action === 'Order Created').length
    const modified = rows.filter((r) => r.action.includes('Modified')).length
    const cancelled = rows.filter(
      (r) => r.action === 'Order Cancelled' || r.action === 'KOT Cancelled',
    ).length
    return { created, modified, cancelled }
  }, [rows])

  function handleSearch() {
    setPage(1)
    setAppliedSearch(search.trim())
  }
>>>>>>> origin/main

  function handleExport() {
    const headerRow = 'Timestamp,User,Action,Details'
    const lines = [
      headerRow,
      ...rows.map(
        (r) =>
          `"${formatLogTimestamp(r.created_at)}","${r.by || '—'}","${r.action}","${(r.details || '').replace(/"/g, '""')}"`,
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${source}-activity-logs.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      {header}

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">
            Activity Logs
            <span className="ml-2 text-sm font-medium capitalize text-muted">
              ({source === 'captain' ? 'Captain Orders' : 'Billing'})
            </span>
          </h1>
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
            <button
              type="button"
              onClick={() => navigate(newOrderPath)}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              New Order
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Events', value: totalCount },
            { label: "Page · Orders", value: stats.created },
            { label: 'Page · Modifications', value: stats.modified },
            { label: 'Page · Cancellations', value: stats.cancelled },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-line bg-card p-3 text-center"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {label}
              </p>
              <p className="mt-1 text-xl font-extrabold text-ink">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-line bg-card">
<<<<<<< HEAD
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <ListSearch
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Search logs..."
              className="sm:max-w-xs"
            />
            <span className="text-xs text-muted">{visible.length} events</span>
=======
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
            <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
                placeholder="Search logs..."
                className="h-9 w-full rounded-lg border border-line bg-page pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted focus:border-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="h-9 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Search
            </button>
            <span className="text-xs text-muted">
              {loading ? 'Loading…' : `${totalCount} events`}
            </span>
>>>>>>> origin/main
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-page/60">
<<<<<<< HEAD
                  <SortableTh
                    columnKey="timestamp"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted"
                  >
                    Timestamp
                  </SortableTh>
                  <SortableTh
                    columnKey="user"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted"
                  >
                    User
                  </SortableTh>
                  <SortableTh
                    columnKey="action"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted"
                  >
                    Action
                  </SortableTh>
                  <SortableTh
                    columnKey="details"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-muted"
                  >
                    Details
                  </SortableTh>
=======
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                    Timestamp
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                    User
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                    Action
                  </th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted">
                    Details
                  </th>
>>>>>>> origin/main
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-page/40">
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs text-muted">
                      {formatLogTimestamp(row.created_at)}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-medium text-ink">
                      {row.by || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          ACTION_COLORS[row.action] ?? 'bg-page text-muted'
                        }`}
                      >
                        {row.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-muted">
                      {row.details || '—'}
                    </td>
                  </tr>
                ))}
                {!loading && rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-sm text-muted"
                    >
                      No logs found
                    </td>
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
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
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

export default function LogsPage() {
  const navigate = useNavigate()
  const [billNo, setBillNo] = useState('')

  return (
    <ActivityLogsView
      source="billing"
      newOrderPath="/table-view"
      header={
        <BillingHeader
          billNo={billNo}
          onBillNoChange={setBillNo}
          onNewOrder={() => navigate('/table-view')}
          onViewKot={() => navigate('/billing?kot=1')}
        />
      }
    />
  )
}
