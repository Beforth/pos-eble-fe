import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Calendar, Lock, Megaphone } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton, OutlineButton } from '../../components/menu/MenuActionButtons'

type TabType = 'campaigns' | 'sms_balance' | 'whatsapp_balance'

export default function CrmCampaignPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('campaigns')

  // Campaigns filters
  const [scheduleFrom, setScheduleFrom] = useState('')
  const [scheduleTo, setScheduleTo] = useState('')
  const [campaignType, setCampaignType] = useState('All')
  const [channel, setChannel] = useState('All')
  const [campaignName, setCampaignName] = useState('')
  const [selectStatus, setSelectStatus] = useState('All')

  // Balance filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectType, setSelectType] = useState('All')
  const [selectPlanType, setSelectPlanType] = useState('All')
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  useEffect(() => {
    if (location.pathname.includes('/paid_services')) {
      setActiveTab('sms_balance')
    } else if (location.pathname.includes('/watsup_services')) {
      setActiveTab('whatsapp_balance')
    } else if (location.pathname.includes('/send_sms_history') || location.pathname.includes('/campaign')) {
      setActiveTab('campaigns')
    }
  }, [location.pathname])

  function handleSearch() {
    // Search action
  }

  function handleShowAll() {
    setScheduleFrom('')
    setScheduleTo('')
    setCampaignType('All')
    setChannel('All')
    setCampaignName('')
    setSelectStatus('All')
    setStartDate('')
    setEndDate('')
    setSelectType('All')
    setSelectPlanType('All')
    showToast('Filters cleared')
  }

  return (
    <ReportsPageShell
      title={
        activeTab === 'sms_balance'
          ? 'SMS Balance'
          : activeTab === 'whatsapp_balance'
            ? 'WhatsApp Balance'
            : 'Campaigns'
      }
      activeItem="crm-campaign"
    >
      <div className="space-y-6">
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div />

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'campaigns' && (
              <>
                {/* SMS Balance Pill */}
                <div className="flex items-center gap-1.5 rounded-full border border-line bg-page px-3.5 py-1.5 text-xs font-bold text-ink shadow-xs">
                  <span className="size-2 rounded-full bg-sky-500" />
                  <span>SMS Balance : 0</span>
                </div>

                {/* WhatsApp Balance Pill */}
                <div className="flex items-center gap-1.5 rounded-full border border-line bg-page px-3.5 py-1.5 text-xs font-bold text-ink shadow-xs">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>WhatsApp Balance : 0</span>
                </div>

                {/* Unlock Button */}
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-xs font-bold text-success shadow-xs hover:bg-success/15 transition-colors"
                >
                  <Lock size={14} />
                  <span>Unlock</span>
                </button>

                {/* Create Campaign CTA */}
                <PrimaryButton onClick={() => navigate('/crm/campaign/create')}>
                  Create Campaign
                </PrimaryButton>
              </>
            )}

            {activeTab === 'sms_balance' && (
              <div className="flex items-center gap-1.5 rounded-full border border-line bg-page px-3.5 py-1.5 text-xs font-bold text-ink shadow-xs">
                <span className="size-2 rounded-full bg-sky-500" />
                <span>SMS Balance : 0</span>
              </div>
            )}

            {activeTab === 'whatsapp_balance' && (
              <div className="flex items-center gap-1.5 rounded-full border border-line bg-page px-3.5 py-1.5 text-xs font-bold text-ink shadow-xs">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>WhatsApp Balance : 0.00</span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation Line */}
        <div className="flex items-center gap-8 border-b border-line">
          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'campaigns'
                ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            Campaigns
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sms_balance')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'sms_balance'
                ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            SMS Balance
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp_balance')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'whatsapp_balance'
                ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2.5px] after:rounded-t after:bg-primary'
                : 'text-muted hover:text-ink'
            }`}
          >
            WhatsApp Balance
          </button>
        </div>

        {/* Filter Controls Bar for Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Schedule From */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Schedule From
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={scheduleFrom}
                    onChange={(e) => setScheduleFrom(e.target.value)}
                    className="h-10 w-full rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>

              {/* Schedule To */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Schedule To
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={scheduleTo}
                    onChange={(e) => setScheduleTo(e.target.value)}
                    className="h-10 w-full rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>

              {/* Campaign Type */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Campaign Type
                </label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                >
                  <option value="All">All</option>
                  <option value="SMS">SMS</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                </select>
              </div>

              {/* Channel */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                >
                  <option value="All">All</option>
                  <option value="Promotional">Promotional</option>
                  <option value="Transactional">Transactional</option>
                </select>
              </div>

              {/* Campaign Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder=""
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>

            {/* Row 2: Select Status & Action Buttons */}
            <div className="flex flex-wrap items-end gap-3 pt-2">
              <div className="space-y-1.5 min-w-[200px] max-w-xs">
                <label className="block text-sm font-bold text-muted">
                  Select Status
                </label>
                <select
                  value={selectStatus}
                  onChange={(e) => setSelectStatus(e.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                >
                  <option value="All">All</option>
                  <option value="Completed">Completed</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <PrimaryButton onClick={handleSearch}>
                Search
              </PrimaryButton>

              <OutlineButton variant="gray" onClick={handleShowAll}>
                Clear Filter
              </OutlineButton>
            </div>
          </div>
        )}

        {/* Filter Controls Bar for SMS Balance */}
        {activeTab === 'sms_balance' && (
          <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
            {/* Start Date */}
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

            {/* End Date */}
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

            {/* Select Type */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-muted">
                Select Type
              </label>
              <select
                value={selectType}
                onChange={(e) => setSelectType(e.target.value)}
                className="h-10 min-w-[150px] rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
              >
                <option value="All">All</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </div>

            {/* Select Plan Type */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-muted">
                Select Plan Type
              </label>
              <select
                value={selectPlanType}
                onChange={(e) => setSelectPlanType(e.target.value)}
                className="h-10 min-w-[150px] rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
              >
                <option value="All">All</option>
                <option value="Promotional">Promotional</option>
                <option value="Transactional">Transactional</option>
              </select>
            </div>

            <PrimaryButton onClick={handleSearch}>
              Search
            </PrimaryButton>

            <OutlineButton variant="gray" onClick={handleShowAll}>
              Clear Filter
            </OutlineButton>
          </div>
        )}

        {/* Filter Controls Bar for WhatsApp Balance */}
        {activeTab === 'whatsapp_balance' && (
          <div className="flex flex-wrap items-end gap-3.5 rounded-xl border border-line bg-card p-4 sm:p-5 shadow-xs">
            {/* Start Date */}
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

            {/* End Date */}
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

            {/* Select Type */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-muted">
                Select Type
              </label>
              <select
                value={selectType}
                onChange={(e) => setSelectType(e.target.value)}
                className="h-10 min-w-[150px] rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
              >
                <option value="All">All</option>
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
            </div>

            <PrimaryButton onClick={handleSearch}>
              Search
            </PrimaryButton>

            <OutlineButton variant="gray" onClick={handleShowAll}>
              Clear Filter
            </OutlineButton>
          </div>
        )}

        {/* Enhanced Empty State */}
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-line bg-card p-8 text-center shadow-xs">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Megaphone size={30} />
          </div>

          <h2 className="mt-5 text-lg font-bold tracking-tight text-ink">
            No campaigns yet
          </h2>

          <p className="mt-2 max-w-sm text-sm font-medium text-muted leading-relaxed">
            Create your first campaign to start reaching customers via SMS, WhatsApp, or Email.
          </p>

          <div className="mt-6">
            <PrimaryButton onClick={() => navigate('/crm/campaign/create')}>
              Create Campaign
            </PrimaryButton>
          </div>
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
