import { useState } from 'react'
import { Search } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { ListSearch } from '../../components/common/ListSearch'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'

interface NotificationLogEntry {
  id: string
  dateTime: string
  title: string
  message: string
  type: string
  target: string
}

export default function NotificationLogs() {
  const [notifications] = useState<NotificationLogEntry[]>([])
  const { search, setSearch, sortKey, sortDir, toggleSort, visible } =
    useListQuery(
      notifications,
      (row) => [row.dateTime, row.title, row.message, row.type, row.target],
      (row, key) => {
        if (key === 'title') return row.title
        if (key === 'message') return row.message
        if (key === 'type') return row.type
        if (key === 'target') return row.target
        return row.dateTime
      },
    )

  return (
    <ReportsPageShell
      title="Notifications"
      activeItem="user-logs-notification"
    >
      <div className="space-y-4">
        {/* Content Card / Empty State / Table */}
        <div className="min-h-[420px] overflow-hidden rounded-xl border border-line bg-card p-6">
          {notifications.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-page text-muted/60">
                <Search size={28} strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-bold text-ink">No Results Found.</h3>
              <p className="mt-1 text-xs text-muted">
                We couldn't find a match for your search.
              </p>
            </div>
          ) : (
            <div>
              <div className="border-b border-line p-4">
                <ListSearch
                  value={search}
                  onChange={setSearch}
                  placeholder="Search notifications"
                />
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <SortableTh
                      columnKey="dateTime"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                      className="px-4 py-3"
                    >
                      Date & Time
                    </SortableTh>
                    <SortableTh
                      columnKey="title"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                      className="px-4 py-3"
                    >
                      Notification Title
                    </SortableTh>
                    <SortableTh
                      columnKey="message"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                      className="px-4 py-3"
                    >
                      Message
                    </SortableTh>
                    <SortableTh
                      columnKey="type"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                      className="px-4 py-3"
                    >
                      Type
                    </SortableTh>
                    <SortableTh
                      columnKey="target"
                      sortKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggleSort}
                      align="right"
                      className="px-4 py-3"
                    >
                      Recipient
                    </SortableTh>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((n) => (
                    <tr
                      key={n.id}
                      className="transition-colors hover:bg-page/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                        {n.dateTime}
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">
                        {n.title}
                      </td>
                      <td className="px-4 py-3 text-muted">{n.message}</td>
                      <td className="px-4 py-3 font-medium text-primary">
                        {n.type}
                      </td>
                      <td className="px-4 py-3 text-right text-muted">
                        {n.target}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </div>
      </div>
    </ReportsPageShell>
  )
}
