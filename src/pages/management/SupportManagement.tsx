import { useState } from 'react'
import { Calendar, RotateCcw, Search } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
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
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

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
    showToast('Showing all support tickets')
  }

  return (
    <ReportsPageShell
      title="Support Management"
      activeItem="user-logs-support-mgmt"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

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
                Show All
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-line bg-page text-xs font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3">Support Ticket No.</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Subject / Issue</th>
                    <th className="px-4 py-3">Created Date</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {tickets.map((t) => (
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
          )}
        </div>
      </div>
    </ReportsPageShell>
  )
}
