import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Calendar,
  ChevronDown,
  Download,
  Filter,
  Grid,
  MessageSquare,
  RefreshCw,
  Rocket,
  Search,
  Star,
  TrendingUp,
} from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { OutlineButton } from '../../components/menu/MenuActionButtons'
import { AggregatorLogo } from '../../components/common/AggregatorLogo'

type PrimaryTab = 'pos_eble_feedback' | 'complaints' | 'ratings_reviews'
type SubTab = 'customer_wise' | 'feedback_wise'
type PlatformFilter = 'all' | 'zomato' | 'swiggy'

export default function CrmFeedbackPage() {
  const location = useLocation()
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('pos_eble_feedback')
  const [subTab, setSubTab] = useState<SubTab>('customer_wise')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [ratingsPlatform, setRatingsPlatform] = useState<'zomato' | 'swiggy'>('zomato')

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [orderType, setOrderType] = useState('All')

  const [complaintFromDate, setComplaintFromDate] = useState('')
  const [complaintToDate, setComplaintToDate] = useState('')
  const [onlineOrderNo, setOnlineOrderNo] = useState('')
  const [complaintStatus, setComplaintStatus] = useState('All')

  const [ratingsDate, setRatingsDate] = useState('')
  const [ratingsOrderNo, setRatingsOrderNo] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  useEffect(() => {
    if (location.pathname.includes('/onlineorderrating')) {
      setPrimaryTab('ratings_reviews')
    } else if (location.pathname.includes('/customercomplaints')) {
      setPrimaryTab('complaints')
    } else if (location.pathname.includes('/app_list_rating')) {
      setPrimaryTab('pos_eble_feedback')
      setSubTab('feedback_wise')
    } else if (location.pathname.includes('/app_list')) {
      setPrimaryTab('pos_eble_feedback')
      setSubTab('customer_wise')
    }
  }, [location.pathname])

  function handleSearch() {}

  function handleShowAll() {
    setFromDate('')
    setToDate('')
    setOrderType('All')
    setComplaintFromDate('')
    setComplaintToDate('')
    setOnlineOrderNo('')
    setComplaintStatus('All')
    setRatingsDate('')
    setRatingsOrderNo('')
    showToast('Filters cleared')
  }

  return (
    <ReportsPageShell
      title={
        primaryTab === 'ratings_reviews'
          ? 'Customer Ratings'
          : primaryTab === 'complaints'
            ? 'Customer Complaints'
            : 'Feedback'
      }
      activeItem="crm-feedback"
    >
      <div className="space-y-6">
        {/* Announcement Banner */}
        {primaryTab === 'pos_eble_feedback' && subTab === 'customer_wise' && (
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
                    Feedback Has Moved To Marketing Automation
                  </h3>
                </div>
                <p className="mt-1 text-xs font-medium text-muted">
                  View and manage all customer feedback, track ratings, and
                  respond smarter — now from one unified portal with deeper
                  insights.
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
        )}

        {/* Summary Stats — POS-Eble Feedback */}
        {primaryTab === 'pos_eble_feedback' && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Total Feedback
                  </p>
                  <p className="text-xl font-extrabold text-ink">0</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    This Week
                  </p>
                  <p className="text-xl font-extrabold text-ink">0</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-deep">
                  <Star size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Avg Rating
                  </p>
                  <p className="text-xl font-extrabold text-ink">0.0</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats — Complaints */}
        {primaryTab === 'complaints' && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Total Complaints
                  </p>
                  <p className="text-xl font-extrabold text-ink">0</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Open
                  </p>
                  <p className="text-xl font-extrabold text-ink">0</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Resolved
                  </p>
                  <p className="text-xl font-extrabold text-ink">0</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats — Ratings */}
        {primaryTab === 'ratings_reviews' && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Star size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Total Reviews
                  </p>
                  <p className="text-xl font-extrabold text-ink">0</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary/20 text-deep">
                  <Star size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Avg Rating
                  </p>
                  <p className="text-xl font-extrabold text-ink">0.0</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-card p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                    5-Star Reviews
                  </p>
                  <p className="text-xl font-extrabold text-ink">0</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Actions Row */}
        {primaryTab === 'pos_eble_feedback' && (
          <div className="flex items-center justify-end gap-3">
            <OutlineButton
              variant="gray"
              onClick={() => alert('Exporting feedback excel...')}
            >
              <Download size={14} />
              <span>Export Excel</span>
              <ChevronDown size={14} />
            </OutlineButton>
          </div>
        )}

        {/* Primary Tabs Navigation */}
        <div className="flex items-center gap-8 overflow-x-auto border-b border-line">
          <button
            type="button"
            onClick={() => setPrimaryTab('pos_eble_feedback')}
            className={`whitespace-nowrap pb-3 text-sm font-bold transition-all relative ${
              primaryTab === 'pos_eble_feedback'
                ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            POS-Eble Feedback
          </button>

          <button
            type="button"
            onClick={() => setPrimaryTab('complaints')}
            className={`whitespace-nowrap pb-3 text-sm font-bold transition-all relative ${
              primaryTab === 'complaints'
                ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            Complaints
          </button>

          <button
            type="button"
            onClick={() => setPrimaryTab('ratings_reviews')}
            className={`whitespace-nowrap pb-3 text-sm font-bold transition-all relative ${
              primaryTab === 'ratings_reviews'
                ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            Ratings & Reviews
          </button>
        </div>

        {/* ─── PETPOOJA FEEDBACK CONTENT ─── */}
        {primaryTab === 'pos_eble_feedback' && (
          <>
            {/* Sub-Tab Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSubTab('customer_wise')}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  subTab === 'customer_wise'
                    ? 'border border-primary bg-primary/5 text-primary shadow-xs'
                    : 'border border-line bg-card text-muted hover:text-ink'
                }`}
              >
                Customer Wise
              </button>

              <button
                type="button"
                onClick={() => setSubTab('feedback_wise')}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  subTab === 'feedback_wise'
                    ? 'border border-primary bg-primary/5 text-primary shadow-xs'
                    : 'border border-line bg-card text-muted hover:text-ink'
                }`}
              >
                Feedback Wise
              </button>
            </div>

            {/* Customer Wise Filter Bar */}
            {subTab === 'customer_wise' && (
              <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    From
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
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
                    To
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
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
                    Order Type
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="h-10 min-w-[160px] rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                  >
                    <option value="All">All</option>
                    <option value="Dine In">Dine In</option>
                    <option value="Takeaway">Takeaway</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </div>

                <OutlineButton
                  variant="gray"
                  onClick={() => alert('More filters...')}
                >
                  <Filter size={14} />
                  More Filters
                </OutlineButton>

                <OutlineButton
                  variant="primary"
                  onClick={handleSearch}
                >
                  <Search size={14} />
                  Search
                </OutlineButton>

                <OutlineButton variant="gray" onClick={handleShowAll}>
                  Clear Filter
                </OutlineButton>
              </div>
            )}

            {/* Feedback Wise Filter Bar */}
            {subTab === 'feedback_wise' && (
              <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    From
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
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
                    To
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
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
                    Order Type
                  </label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="h-10 min-w-[160px] rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                  >
                    <option value="All">All</option>
                    <option value="Dine In">Dine In</option>
                    <option value="Takeaway">Takeaway</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </div>

                <OutlineButton
                  variant="primary"
                  onClick={handleSearch}
                >
                  <Search size={14} />
                  Search
                </OutlineButton>

                <OutlineButton variant="gray" onClick={handleShowAll}>
                  Clear Filter
                </OutlineButton>
              </div>
            )}

            {/* Empty State */}
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-line bg-card p-8 text-center shadow-xs">
              <div className="flex size-14 items-center justify-center rounded-full border border-line bg-page text-muted shadow-xs">
                <Search size={26} />
              </div>
              <h2 className="mt-4 text-lg font-bold tracking-tight text-ink">
                No Results Found.
              </h2>
              <p className="mt-1 text-sm font-medium text-muted">
                We couldn't find a match for your search. Try adjusting your
                filters or date range.
              </p>
              <OutlineButton
                variant="gray"
                onClick={handleShowAll}
                className="mt-4"
              >
                Clear Filter
              </OutlineButton>
            </div>
          </>
        )}

        {/* ─── COMPLAINTS CONTENT ─── */}
        {primaryTab === 'complaints' && (
          <>
            {/* Platform Filter Pills */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlatformFilter('all')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  platformFilter === 'all'
                    ? 'border border-primary bg-primary/5 text-primary shadow-xs'
                    : 'border border-line bg-card text-muted hover:text-ink'
                }`}
              >
                <Grid size={16} />
                <span>All</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatformFilter('zomato')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  platformFilter === 'zomato'
                    ? 'border border-danger/40 bg-danger/5 text-danger shadow-xs'
                    : 'border border-line bg-card text-muted hover:text-ink'
                }`}
              >
                <AggregatorLogo name="Zomato" size="xs" />
                <span>Zomato</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatformFilter('swiggy')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  platformFilter === 'swiggy'
                    ? 'border border-accent/40 bg-accent/5 text-accent shadow-xs'
                    : 'border border-line bg-card text-muted hover:text-ink'
                }`}
              >
                <AggregatorLogo name="Swiggy" size="xs" />
                <span>Swiggy</span>
              </button>
            </div>

            {/* Complaints Filter Bar */}
            <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  From
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={complaintFromDate}
                    onChange={(e) => setComplaintFromDate(e.target.value)}
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
                  To
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={complaintToDate}
                    onChange={(e) => setComplaintToDate(e.target.value)}
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
                  Online Order No
                </label>
                <input
                  type="text"
                  value={onlineOrderNo}
                  onChange={(e) => setOnlineOrderNo(e.target.value)}
                  className="h-10 w-full min-w-[180px] rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Status
                </label>
                <select
                  value={complaintStatus}
                  onChange={(e) => setComplaintStatus(e.target.value)}
                  className="h-10 min-w-[160px] rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                >
                  <option value="All">All</option>
                  <option value="Open">Open</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <OutlineButton
                variant="primary"
                onClick={handleSearch}
              >
                <Search size={14} />
                Show
              </OutlineButton>

              <OutlineButton variant="gray" onClick={handleShowAll}>
                Clear
              </OutlineButton>

              <OutlineButton
                variant="gray"
                onClick={() => alert('Exporting complaints...')}
              >
                <Download size={14} />
                Export
              </OutlineButton>
            </div>

            {/* Empty State */}
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-line bg-card p-8 text-center shadow-xs">
              <div className="flex size-16 items-center justify-center rounded-full border border-line bg-page text-muted shadow-xs">
                <MessageSquare size={30} />
              </div>
              <h2 className="mt-4 text-base font-bold text-ink sm:text-lg">
                No Complaints Found.
              </h2>
              <p className="mt-1 text-sm font-medium text-muted">
                No complaints match your current filters. Try a different date
                range or status.
              </p>
              <OutlineButton
                variant="gray"
                onClick={handleShowAll}
                className="mt-4"
              >
                Clear Filter
              </OutlineButton>
            </div>
          </>
        )}

        {/* ─── RATINGS & REVIEWS CONTENT ─── */}
        {primaryTab === 'ratings_reviews' && (
          <div className="space-y-6">
            {/* Platform Sub-Tabs */}
            <div className="flex items-center gap-6 border-b border-line pb-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setRatingsPlatform('zomato')}
                className={`flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-bold transition-all relative ${
                  ratingsPlatform === 'zomato'
                    ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <AggregatorLogo name="Zomato" size="xs" />
                <span>Zomato</span>
              </button>

              <button
                type="button"
                onClick={() => setRatingsPlatform('swiggy')}
                className={`flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-bold transition-all relative ${
                  ratingsPlatform === 'swiggy'
                    ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <AggregatorLogo name="Swiggy" size="xs" />
                <span>Swiggy</span>
              </button>
            </div>

            {/* Ratings Filter Bar */}
            <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
              <div className="space-y-1.5 min-w-[200px]">
                <label className="block text-sm font-bold text-muted">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={ratingsDate}
                    onChange={(e) => setRatingsDate(e.target.value)}
                    className="h-10 w-full rounded-md border border-line bg-card pl-3 pr-9 text-sm font-semibold text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>

              <div className="space-y-1.5 min-w-[200px]">
                <label className="block text-sm font-bold text-muted">
                  Online Order No
                </label>
                <input
                  type="text"
                  value={ratingsOrderNo}
                  onChange={(e) => setRatingsOrderNo(e.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              <OutlineButton
                variant="primary"
                onClick={handleSearch}
              >
                <Search size={14} />
                Show
              </OutlineButton>

              <OutlineButton variant="gray" onClick={handleShowAll}>
                Clear
              </OutlineButton>

              <OutlineButton
                variant="gray"
                onClick={() => alert('Exporting ratings...')}
              >
                <Download size={14} />
                Export
              </OutlineButton>
            </div>

            {/* Ratings Summary Card */}
            <div className="rounded-xl border border-line bg-card p-6 shadow-xs">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 items-center">
                <div className="flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-line pb-6 sm:pb-0 pr-0 sm:pr-6 text-center">
                  <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">
                    TOTAL REVIEWS
                  </span>
                  <span className="mt-1 text-4xl font-extrabold text-ink">
                    0
                  </span>
                </div>

                <div className="sm:col-span-3 space-y-2.5">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div
                      key={stars}
                      className="flex items-center gap-3 text-xs font-bold text-muted"
                    >
                      <div className="flex items-center gap-1 w-8 shrink-0">
                        <span>{stars}</span>
                        <Star
                          size={12}
                          className="fill-secondary text-secondary"
                        />
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-page border border-line">
                        <div className="h-full bg-primary/20 w-0 transition-all duration-300" />
                      </div>

                      <span className="w-4 text-right text-muted font-semibold">
                        0
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-card p-8 text-center shadow-xs">
              <div className="flex size-16 items-center justify-center rounded-full border border-line bg-page text-muted shadow-xs">
                <Star size={30} />
              </div>
              <h2 className="mt-4 text-base font-bold text-ink sm:text-lg">
                No Reviews Found.
              </h2>
              <p className="mt-1 text-sm font-medium text-muted">
                No reviews match your current filters. Try selecting a different
                date or platform.
              </p>
              <OutlineButton
                variant="gray"
                onClick={handleShowAll}
                className="mt-4"
              >
                Clear Filter
              </OutlineButton>
            </div>

            {/* Data Freshness */}
            <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted">
              <RefreshCw size={12} />
              <span>Data refreshed on page load</span>
            </div>
          </div>
        )}
      </div>
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-medium text-ink shadow-lg">
          {toast}
        </div>
      ) : null}
    </ReportsPageShell>
  )
}
