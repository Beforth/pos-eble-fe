import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  ChevronDown,
  Download,
  Filter,
  Lock,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  UserRoundX,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton, OutlineButton } from '../../components/menu/MenuActionButtons'

interface CustomerRecord {
  id: string
  name: string
  favourite: string
  phone: string
  email: string
  created: string
  fromWhere: string
}

const CUSTOMERS_DATA: CustomerRecord[] = [
  {
    id: 'cust-1',
    name: 'joshi',
    favourite: 'No',
    phone: '******3249',
    email: '-',
    created: '10 Aug 2026',
    fromWhere: 'POS',
  },
  {
    id: 'cust-2',
    name: 'Eshaan Jolly',
    favourite: 'No',
    phone: '******2702',
    email: '-',
    created: '26 Jul 2026',
    fromWhere: 'POS',
  },
  {
    id: 'cust-3',
    name: 'RAJENDRA',
    favourite: 'No',
    phone: '******3088',
    email: '-',
    created: '9 Jul 2026',
    fromWhere: 'POS',
  },
  {
    id: 'cust-4',
    name: 'SWATI',
    favourite: 'No',
    phone: '******5549',
    email: '-',
    created: '6 Apr 2026',
    fromWhere: 'POS',
  },
  {
    id: 'cust-5',
    name: 'Yash Shimpi',
    favourite: 'No',
    phone: '******3734',
    email: '-',
    created: '15 Mar 2026',
    fromWhere: 'POS',
  },
  {
    id: 'cust-6',
    name: 'DHRAMESH',
    favourite: 'No',
    phone: '******6339',
    email: '-',
    created: '15 Mar 2026',
    fromWhere: 'POS',
  },
]

const DONUT_DATA = [
  { name: 'Without Customer', value: 2749, color: 'var(--color-primary)' },
  { name: 'With Customer', value: 1, color: 'var(--color-secondary)' },
]

const NEW_CUSTOMERS_DATA = [
  { day: '7th Aug', count: 0 },
  { day: '8th Aug', count: 0 },
  { day: '9th Aug', count: 0 },
  { day: '10th Aug', count: 1 },
  { day: '11th Aug', count: 0 },
  { day: '12th Aug', count: 0 },
  { day: '13th Aug', count: 0 },
]

const LOG_PAGE_SIZE = 15

export default function CrmCustomersPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'customers' | 'tags'>('customers')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [fromWhereFilter, setFromWhereFilter] = useState('All')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function clearFilters() {
    setStartDate('')
    setEndDate('')
    setFromWhereFilter('All')
    showToast('Filters cleared')
  }

  const totalRecords = CUSTOMERS_DATA.length

  return (
    <ReportsPageShell title="Customers" activeItem="crm-customers">
      <div className="space-y-6">
        {/* Announcement Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-primary/15 bg-primary/5 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Rocket size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-extrabold text-white tracking-wider uppercase">
                  New
                </span>
                <h3 className="text-sm font-bold text-ink">
                  Customers Has Moved To Marketing Automation
                </h3>
              </div>
              <p className="mt-1 text-xs font-medium text-muted">
                View customer profiles, manage tags, and create segments from one
                unified portal — with richer insights and smarter targeting.
              </p>
            </div>
          </div>

          <OutlineButton
            variant="gray"
            onClick={() => alert('Navigating to Marketing Automation...')}
          >
            Explore Now
          </OutlineButton>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Total Customers
                </p>
                <p className="text-xl font-extrabold text-ink">211</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  New This Week
                </p>
                <p className="text-xl font-extrabold text-ink">1</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-deep">
                <UserRoundX size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Without Phone
                </p>
                <p className="text-xl font-extrabold text-ink">0</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Lock size={18} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  DND Enrolled
                </p>
                <p className="text-xl font-extrabold text-ink">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Title & Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-extrabold text-ink sm:text-2xl">
            Customers
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <OutlineButton
              variant="gray"
              onClick={() => navigate('/crm/customers/discount-config')}
            >
              Customer Discount Configuration
            </OutlineButton>

            <PrimaryButton onClick={() => navigate('/crm/customers/add')}>
              <Plus size={16} />
              <span>Add New Customer</span>
            </PrimaryButton>

            <OutlineButton
              variant="gray"
              onClick={() => alert('Exporting customers...')}
            >
              <Download size={14} />
              <span>Export</span>
              <ChevronDown size={14} />
            </OutlineButton>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-8 border-b border-line">
          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'customers'
                ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            Customers
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tags')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'tags'
                ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            Customer Tags
          </button>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Donut Chart */}
          <div className="rounded-xl border border-line bg-card p-5 shadow-xs">
            <h3 className="text-sm font-bold text-ink">Last 7 Days Orders</h3>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-around gap-4 min-h-[180px]">
              <div className="relative flex size-40 items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={DONUT_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {DONUT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-extrabold text-ink">2749</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-semibold text-muted">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-secondary" />
                  <span>With Customer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-primary" />
                  <span>Without Customer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="rounded-xl border border-line bg-card p-5 shadow-xs">
            <h3 className="text-sm font-bold text-ink">
              Last 7 Days — New Customers
            </h3>

            <div className="mt-4 h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={NEW_CUSTOMERS_DATA}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                  />
                  <YAxis hide />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="var(--color-primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-muted">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <Calendar
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-muted">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
              <Calendar
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-muted">
              From Where
            </label>
            <select
              value={fromWhereFilter}
              onChange={(e) => setFromWhereFilter(e.target.value)}
              className="h-10 min-w-[160px] rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
            >
              <option value="All">All</option>
              <option value="POS">POS</option>
              <option value="Online">Online</option>
            </select>
          </div>

          <OutlineButton variant="gray" onClick={() => alert('More filters...')}>
            <Filter size={14} />
            More Filters
          </OutlineButton>

          <OutlineButton
            variant="primary"
            onClick={() => alert('Searching...')}
          >
            <Search size={14} />
            Search
          </OutlineButton>

          <OutlineButton
            variant="gray"
            onClick={clearFilters}
          >
            Clear Filter
          </OutlineButton>
        </div>

        {/* Customer Data Table */}
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-ink border-collapse">
              <thead>
                <tr className="border-b border-line bg-page/60 text-xs font-bold text-muted uppercase tracking-wider">
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Favourite</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Created ⬇</th>
                  <th className="px-5 py-3.5">From Where</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-medium">
                {CUSTOMERS_DATA.map((cust) => (
                  <tr
                    key={cust.id}
                    className="transition-colors hover:bg-page/40"
                  >
                    <td className="px-5 py-4 font-semibold text-ink">
                      {cust.name}
                    </td>
                    <td className="px-5 py-4 text-muted">{cust.favourite}</td>
                    <td className="px-5 py-4 text-ink font-mono">
                      {cust.phone}
                    </td>
                    <td className="px-5 py-4 text-muted">{cust.email}</td>
                    <td className="px-5 py-4 text-ink">{cust.created}</td>
                    <td className="px-5 py-4 font-semibold text-ink">
                      {cust.fromWhere}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <OutlineButton
                        variant="gray"
                        onClick={() =>
                          navigate(`/crm/customers/edit/${cust.id}`)
                        }
                      >
                        <span className="sr-only">Edit</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </OutlineButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line bg-page/30 p-4 text-xs font-semibold text-muted">
            <div>
              Showing 1 to {LOG_PAGE_SIZE} of {totalRecords} records
            </div>

            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                className="size-8 rounded-lg border border-line bg-card text-ink shadow-xs font-bold"
              >
                1
              </button>
              {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="size-8 rounded-lg border border-line bg-card text-muted hover:bg-page hover:text-ink transition-colors"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                className="h-8 rounded-lg border border-line bg-card px-2.5 text-muted hover:bg-page hover:text-ink transition-colors"
              >
                Next
              </button>
              <button
                type="button"
                className="h-8 rounded-lg border border-line bg-card px-2.5 text-muted hover:bg-page hover:text-ink transition-colors"
              >
                Last
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded bg-accent px-1.5 py-0.5 text-[11px] font-extrabold text-white">
                DND
              </span>
              <button
                type="button"
                onClick={() => alert('DND settings...')}
                className="text-xs font-bold text-muted hover:text-ink hover:underline"
              >
                Do not send any Updates
              </button>
            </div>
          </div>
        </div>

        {/* Data Freshness */}
        <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted">
          <RefreshCw size={12} />
          <span>Data refreshed on page load</span>
        </div>
      </div>
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}
    </ReportsPageShell>
  )
}
