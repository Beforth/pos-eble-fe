import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Calendar, ChevronDown, Grid, MessageSquare, Rocket, Search, Star } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { OutlineButton } from '../../components/menu/MenuActionButtons'

type PrimaryTab = 'petpooja_feedback' | 'complaints' | 'ratings_reviews'
type SubTab = 'customer_wise' | 'feedback_wise'
type PlatformFilter = 'all' | 'zomato' | 'swiggy'

function AggregatorMark({ name }: { name: 'Zomato' | 'Swiggy' }) {
  const isSwiggy = name === 'Swiggy'
  return (
    <span className="relative inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded">
      <img
        src={isSwiggy ? '/swiggy.png' : '/zomato.png'}
        alt={`${name} logo`}
        width={isSwiggy ? 40 : 24}
        height={isSwiggy ? 40 : 24}
        className={
          isSwiggy
            ? 'absolute size-10 max-w-none scale-110 object-cover'
            : 'size-6 object-contain'
        }
      />
    </span>
  )
}

export default function CrmFeedbackPage() {
  const location = useLocation()
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('petpooja_feedback')
  const [subTab, setSubTab] = useState<SubTab>('customer_wise')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [ratingsPlatform, setRatingsPlatform] = useState<'zomato' | 'swiggy'>('zomato')

  // Feedback filters
  const [fromDate, setFromDate] = useState('2026-08-13')
  const [toDate, setToDate] = useState('2026-08-13')
  const [orderType, setOrderType] = useState('All')

  // Complaints filters
  const [complaintFromDate, setComplaintFromDate] = useState('2026-08-08')
  const [complaintToDate, setComplaintToDate] = useState('2026-08-13')
  const [onlineOrderNo, setOnlineOrderNo] = useState('')
  const [complaintStatus, setComplaintStatus] = useState('All')

  // Ratings filters
  const [ratingsDate, setRatingsDate] = useState('Today')
  const [ratingsOrderNo, setRatingsOrderNo] = useState('')

  useEffect(() => {
    if (location.pathname.includes('/onlineorderrating')) {
      setPrimaryTab('ratings_reviews')
    } else if (location.pathname.includes('/customercomplaints')) {
      setPrimaryTab('complaints')
    } else if (location.pathname.includes('/app_list_rating')) {
      setPrimaryTab('petpooja_feedback')
      setSubTab('feedback_wise')
    } else if (location.pathname.includes('/app_list')) {
      setPrimaryTab('petpooja_feedback')
      setSubTab('customer_wise')
    }
  }, [location.pathname])

  function handleSearch() {
    // Search action
  }

  function handleShowAll() {
    setFromDate('2026-08-13')
    setToDate('2026-08-13')
    setOrderType('All')
    setComplaintFromDate('2026-08-08')
    setComplaintToDate('2026-08-13')
    setOnlineOrderNo('')
    setComplaintStatus('All')
    setRatingsDate('Today')
    setRatingsOrderNo('')
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
        {/* Top Announcement Hero Banner (Only in Petpooja Feedback Customer Wise view) */}
        {primaryTab === 'petpooja_feedback' && subTab === 'customer_wise' && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-primary/15 bg-primary/5 p-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Rocket size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-extrabold text-white tracking-wider uppercase">
                    New
                  </span>
                  <h3 className="text-sm font-bold text-ink">
                    Feedback Has Moved To Marketing Automation
                  </h3>
                </div>
                <p className="mt-1 text-xs font-medium text-muted">
                  View and manage all customer feedback, track ratings, and respond smarter — now from one unified portal with deeper insights.
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

        {/* Top Actions Row for Petpooja Feedback */}
        {primaryTab === 'petpooja_feedback' && (
          <div className="flex items-center justify-end gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-line bg-page px-3.5 py-1.5 text-xs font-bold text-ink shadow-2xs">
              <span className="size-2 rounded-full bg-slate-400" />
              <span>
                {subTab === 'feedback_wise'
                  ? 'Total No. of Feedback : 0'
                  : 'Total No. Of Feedback : 0'}
              </span>
            </div>

            <OutlineButton
              variant="gray"
              onClick={() => alert('Exporting feedback excel...')}
            >
              <span>Export Excel</span>
              <ChevronDown size={14} />
            </OutlineButton>
          </div>
        )}

        {/* Primary Tabs Navigation Line */}
        <div className="flex items-center gap-8 border-b border-line">
          <button
            type="button"
            onClick={() => setPrimaryTab('petpooja_feedback')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              primaryTab === 'petpooja_feedback'
                ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            Petpooja Feedback
          </button>

          <button
            type="button"
            onClick={() => setPrimaryTab('complaints')}
            className={`pb-3 text-sm font-bold transition-all relative ${
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
            className={`pb-3 text-sm font-bold transition-all relative ${
              primaryTab === 'ratings_reviews'
                ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            Ratings & Reviews
          </button>
        </div>

        {/* CONTENT FOR PETPOOJA FEEDBACK */}
        {primaryTab === 'petpooja_feedback' && (
          <>
            {/* Sub-Tab Toggle Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSubTab('customer_wise')}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  subTab === 'customer_wise'
                    ? 'border border-primary bg-card text-primary shadow-2xs'
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
                    ? 'border border-primary bg-card text-primary shadow-2xs'
                    : 'border border-line bg-card text-muted hover:text-ink'
                }`}
              >
                Feedback Wise
              </button>
            </div>

            {/* Filter Controls Bar for Customer Wise */}
            {subTab === 'customer_wise' && (
              <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">From</label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="h-10 rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">To</label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="h-10 rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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

                <OutlineButton variant="gray" onClick={() => alert('More filters...')}>
                  More Filters
                </OutlineButton>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="h-10 rounded-md border border-primary bg-card px-6 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
                >
                  Search
                </button>

                <OutlineButton variant="gray" onClick={handleShowAll}>
                  Show All
                </OutlineButton>
              </div>
            )}

            {/* Empty State Container */}
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-line bg-card p-8 text-center shadow-xs">
              <div className="flex size-14 items-center justify-center rounded-full border border-line bg-page text-muted shadow-2xs">
                <Search size={26} />
              </div>
              <h2 className="mt-4 text-lg font-bold tracking-tight text-ink">
                No Results Found.
              </h2>
              <p className="mt-1 text-sm font-medium text-muted">
                We couldn't find a match for your search.
              </p>
            </div>
          </>
        )}

        {/* CONTENT FOR COMPLAINTS (Matching Screenshot 5436 & 5438) */}
        {primaryTab === 'complaints' && (
          <>
            {/* Aggregator Source Filter Pills with OnlineOrders logo sizing */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlatformFilter('all')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  platformFilter === 'all'
                    ? 'border border-primary bg-card text-primary shadow-2xs'
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
                    ? 'border border-rose-500 bg-rose-50 text-rose-700 shadow-2xs'
                    : 'border border-line bg-card text-muted hover:text-ink'
                }`}
              >
                <AggregatorMark name="Zomato" />
                <span>Zomato</span>
              </button>

              <button
                type="button"
                onClick={() => setPlatformFilter('swiggy')}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  platformFilter === 'swiggy'
                    ? 'border border-amber-500 bg-amber-50 text-amber-700 shadow-2xs'
                    : 'border border-line bg-card text-muted hover:text-ink'
                }`}
              >
                <AggregatorMark name="Swiggy" />
                <span>Swiggy</span>
              </button>
            </div>

            {/* Filter Bar for Complaints */}
            <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">From</label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="date"
                    value={complaintFromDate}
                    onChange={(e) => setComplaintFromDate(e.target.value)}
                    className="h-10 rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">To</label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="date"
                    value={complaintToDate}
                    onChange={(e) => setComplaintToDate(e.target.value)}
                    className="h-10 rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
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
                  placeholder=""
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

              <button
                type="button"
                onClick={handleSearch}
                className="h-10 rounded-md border border-primary bg-card px-6 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
              >
                Show
              </button>

              <OutlineButton variant="gray" onClick={handleShowAll}>
                Clear
              </OutlineButton>

              <OutlineButton
                variant="gray"
                onClick={() => alert('Exporting complaints...')}
              >
                Export
              </OutlineButton>
            </div>

            {/* Empty State Area */}
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-line bg-card p-8 text-center shadow-xs">
              <div className="relative flex items-center justify-center py-4">
                <div className="absolute -top-1 -left-4 size-4 rounded-full bg-rose-200/60" />
                <div className="absolute top-0 right-1 size-5 rounded-full bg-rose-300/60" />
                <div className="absolute -bottom-2 -left-2 size-3.5 rounded-full bg-rose-200/60" />
                <div className="absolute -bottom-1 right-2 size-3 rounded-full bg-rose-200/60" />

                <div className="relative flex size-16 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-400 shadow-2xs">
                  <MessageSquare size={30} />
                  <Search
                    size={16}
                    className="absolute -bottom-1 -right-1 text-slate-500"
                  />
                </div>
              </div>

              <h2 className="mt-4 text-base font-bold text-ink sm:text-lg">
                No Complaints Found.
              </h2>
            </div>
          </>
        )}

        {/* CONTENT FOR RATINGS & REVIEWS (Matching Screenshot 5437) */}
        {primaryTab === 'ratings_reviews' && (
          <div className="space-y-6">
            {/* Platform Sub-Tabs (Zomato & Swiggy with AggregatorMark sizing) */}
            <div className="flex items-center gap-6 border-b border-line pb-0">
              <button
                type="button"
                onClick={() => setRatingsPlatform('zomato')}
                className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative ${
                  ratingsPlatform === 'zomato'
                    ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <AggregatorMark name="Zomato" />
                <span>Zomato</span>
              </button>

              <button
                type="button"
                onClick={() => setRatingsPlatform('swiggy')}
                className={`flex items-center gap-2 pb-3 text-sm font-bold transition-all relative ${
                  ratingsPlatform === 'swiggy'
                    ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <AggregatorMark name="Swiggy" />
                <span>Swiggy</span>
              </button>
            </div>

            {/* Filter Bar for Ratings */}
            <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
              <div className="space-y-1.5 min-w-[200px]">
                <label className="block text-sm font-bold text-muted">
                  Date
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="text"
                    value={ratingsDate}
                    onChange={(e) => setRatingsDate(e.target.value)}
                    className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm font-semibold text-ink outline-none transition-colors focus:border-primary"
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
                  placeholder=""
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className="h-10 rounded-md border border-primary bg-card px-6 text-sm font-bold text-primary transition-colors hover:bg-primary/5"
              >
                Show
              </button>

              <OutlineButton variant="gray" onClick={handleShowAll}>
                Clear
              </OutlineButton>

              <OutlineButton
                variant="gray"
                onClick={() => alert('Exporting ratings...')}
              >
                Export
              </OutlineButton>
            </div>

            {/* Ratings Summary Card */}
            <div className="rounded-xl border border-line bg-card p-6 shadow-xs">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 items-center">
                <div className="flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-line pb-6 sm:pb-0 pr-0 sm:pr-6 text-center">
                  <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
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
                        <Star size={12} className="fill-amber-400 text-amber-400" />
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

            <p className="text-center text-sm font-semibold text-ink pt-4">
              No reviews found for the selected filters.
            </p>
          </div>
        )}
      </div>
    </ReportsPageShell>
  )
}
