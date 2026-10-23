import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Search } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

type NotificationStatus = 'Unread' | 'Read' | 'Discard'

const STATUSES: NotificationStatus[] = ['Read', 'Unread', 'Discard']

interface NotificationRow {
  id: string
  module: string
  message: string
  /** Line items listed under the message, e.g. the items of a cancelled invoice. */
  items?: { name: string; qty: number }[]
  displayAt: string
  status: NotificationStatus
  createdAt: string
}

/** Alerts have no backend feed yet, so the listing starts empty. */
const INITIAL_ROWS: NotificationRow[] = []

export default function NotificationListing() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')
  const [rows, setRows] = useState<NotificationRow[]>(INITIAL_ROWS)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [nextStatus, setNextStatus] = useState<NotificationStatus>('Read')

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (row) =>
        row.message.toLowerCase().includes(q) ||
        row.module.toLowerCase().includes(q),
    )
  }, [rows, search])

  const allSelected =
    visible.length > 0 && visible.every((row) => selected.has(row.id))

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(visible.map((row) => row.id)))
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function changeStatus() {
    if (selected.size === 0) {
      showToast('Select at least one notification')
      return
    }
    setRows((prev) =>
      prev.map((row) =>
        selected.has(row.id) ? { ...row, status: nextStatus } : row,
      ),
    )
    setSelected(new Set())
    showToast('Status updated')
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3">
        <h1 className="text-lg font-bold text-ink">Notification Listing</h1>
        <button
          type="button"
          onClick={() => navigate('/billing/operations')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      </div>

      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 py-4 sm:px-5">
        <div className="relative w-56">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="h-10 w-full rounded-lg border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none placeholder:text-ink focus:border-primary"
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-line bg-card shadow-sm">
          <div className="flex items-center gap-3 p-3">
            <select
              value={nextStatus}
              onChange={(event) =>
                setNextStatus(event.target.value as NotificationStatus)
              }
              aria-label="New status"
              className="h-10 w-28 rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={changeStatus}
              className="h-10 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
            >
              Change Status
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-page text-left font-semibold text-ink">
                  <th className="w-12 px-4 py-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all notifications"
                      className="size-4 accent-primary"
                    />
                  </th>
                  <th className="px-3 py-4">Module</th>
                  <th className="px-3 py-4">Message</th>
                  <th className="px-3 py-4">Display DateTime</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted">
                      No notifications found.
                    </td>
                  </tr>
                ) : (
                  visible.map((row) => (
                    <tr key={row.id} className="border-t border-line align-middle">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={() => toggleOne(row.id)}
                          aria-label="Select notification"
                          className="size-4 accent-primary"
                        />
                      </td>
                      <td className="px-3 py-4 text-ink">{row.module}</td>
                      <td className="px-3 py-4 text-ink">
                        <p>{row.message}</p>
                        {row.items && row.items.length > 0 && (
                          <>
                            <p>Below are the items which are being cancelled in this invoice.</p>
                            <ul className="mt-1 list-disc bg-page px-6 py-2">
                              {row.items.map((item) => (
                                <li key={item.name} className="py-1">
                                  <span className="inline-flex w-full justify-between pl-4 pr-24">
                                    <span>{item.name}</span>
                                    <span>{item.qty}</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-ink">{row.displayAt}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-md bg-page px-2.5 py-1 text-xs text-ink">
                          {row.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-ink">{row.createdAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
