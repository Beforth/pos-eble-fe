import { useState } from 'react'

import { showToast } from '../../utils/toast'
import { Calendar, RotateCcw, Search } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { ListSearch } from '../../components/common/ListSearch'
import { SortableTh } from '../../components/common/SortableTh'
import { useListQuery } from '../../hooks/useListQuery'
import { SearchableSelect } from '../../components/inventory/SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

interface SupportTicketEntry {
  id: string
  ticketNo: string
  category: string
  subject: string
  createdDate: string
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
}

const SAMPLE_TICKETS: SupportTicketEntry[] = [
  {
    id: 'st-1',
    ticketNo: 'SUP-89201',
    category: 'Billing',
    subject: 'Printer disconnection issue on thermal biller',
    createdDate: '10 Aug 2026 14:20',
    status: 'Resolved',
  },
  {
    id: 'st-2',
    ticketNo: 'SUP-89145',
    category: 'Aggregator',
    subject: 'Swiggy menu sync failure notification',
    createdDate: '08 Aug 2026 11:05',
    status: 'Closed',
  },
]

const CATEGORY_OPTIONS = [
  'All',
  'Billing',
  'Hardware & Printer',
  'Aggregator & Online',
  'Inventory & Stock',
  'Account & Configuration',
]

export default function SupportManagement() {
  const [supportNo, setSupportNo] = useState('')
  const [category, setCategory] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isSearched, setIsSearched] = useState(true)
  const [tickets, setTickets] = useState<SupportTicketEntry[]>([])
  const { search, setSearch, sortKey, sortDir, toggleSort, visible } =
    useListQuery(
      tickets,
      (row) => [row.ticketNo, row.category, row.subject, row.createdDate, row.status],
      (row, key) => {
        if (key === 'category') return row.category
        if (key === 'subject') return row.subject
        if (key === 'createdDate') return row.createdDate
        if (key === 'status') return row.status
        return row.ticketNo
      },
    )


  function handleSearch() {
    setIsSearched(true)
    const q = supportNo.trim().toLowerCase()
    if (!q && category === 'All' && !startDate && !endDate) {
      setTickets([])
    } else {
      setTickets(
        SAMPLE_TICKETS.filter(
          (t) =>
            !q ||
            t.ticketNo.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q),
        ),
      )
    }
    showToast('Search applied')
  }

  function handleShowAll() {
    setSupportNo('')
    setCategory('All')
    setStartDate('')
    setEndDate('')
    setTickets(SAMPLE_TICKETS)
    setIsSearched(true)
    showToast('Filters cleared')
  }

  return (
    <ReportsPageShell
      title="Support Management"
      activeItem="user-logs-support-mgmt"
    >

      <div className="space-y-4">
        {/* Filter Controls */}
        <div className="rounded-xl border border-line bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-4">
            <label className="min-w-[180px] flex-1 text-xs font-semibold text-muted">
              Support No.
              <input
                type="text"
                value={supportNo}
                onChange={(event) => setSupportNo(event.target.value)}
                placeholder=""
                className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
              />
            </label>

            <div className="min-w-[180px] flex-1">
              <span className="text-xs font-semibold text-muted">
                Select Category
              </span>
              <div className="mt-1">
                <SearchableSelect
                  label=""
                  value={category}
                  options={CATEGORY_OPTIONS}
                  onChange={setCategory}
                />
              </div>
            </div>

            <label className="min-w-[180px] flex-1 text-xs font-semibold text-muted">
              Start Date
              <div className="relative mt-1">
                <input
                  type="text"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  placeholder=""
                  className="h-10 w-full rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
                <Calendar
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </label>

            <label className="min-w-[180px] flex-1 text-xs font-semibold text-muted">
              End Date
              <div className="relative mt-1">
                <input
                  type="text"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  placeholder=""
                  className="h-10 w-full rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
                <Calendar
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </label>

            <div className="flex items-center gap-2">
              <PrimaryButton onClick={handleSearch}>
                <Search size={15} />
                Search
              </PrimaryButton>
              <OutlineButton variant="gray" onClick={handleShowAll}>
                <RotateCcw size={15} />
                Clear Filter
              </OutlineButton>
            </div>
          </div>
        </div>

        {/* Content Card / Empty State / Table */}
        <div className="min-h-[380px] overflow-hidden rounded-xl border border-line bg-card p-6">
          {isSearched && tickets.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
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
                  placeholder="Search tickets"
                />
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <SortableTh columnKey="ticketNo" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3">Support Ticket No.</SortableTh>
                    <SortableTh columnKey="category" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3">Category</SortableTh>
                    <SortableTh columnKey="subject" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3">Subject / Issue</SortableTh>
                    <SortableTh columnKey="createdDate" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} className="px-4 py-3">Created Date</SortableTh>
                    <SortableTh columnKey="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" className="px-4 py-3">Status</SortableTh>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((t) => (
                    <tr
                      key={t.id}
                      className="transition-colors hover:bg-page/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-primary">
                        {t.ticketNo}
                      </td>
                      <td className="px-4 py-3 text-muted">{t.category}</td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {t.subject}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">
                        {t.createdDate}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                          {t.status}
                        </span>
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
