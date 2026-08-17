import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton, OutlineButton } from '../../components/menu/MenuActionButtons'

export default function CreateCampaignPage() {
  const navigate = useNavigate()
  const [campaignType, setCampaignType] = useState('Schedule')
  const [campaignName, setCampaignName] = useState('')
  const [senderId, setSenderId] = useState('')
  const [scheduleDate, setScheduleDate] = useState('2026-08-13T15:09')
  const [recipients, setRecipients] = useState('')

  function handleSave() {
    alert('Campaign saved successfully!')
    navigate('/crm/campaign')
  }

  function handleCancel() {
    navigate('/crm/campaign')
  }

  return (
    <ReportsPageShell title="Create Campaign" activeItem="crm-campaign">
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-xs font-bold text-ink shadow-2xs hover:bg-page transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Campaigns</span>
          </button>
        </div>

        {/* Top Expiration Banner (Matching Screenshot 5427) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/80 p-4 shadow-2xs">
          <p className="text-xs font-semibold text-rose-800">
            This page will expire soon. To visit the new and improved Campaign flow for enhanced functionality.
          </p>
          <OutlineButton variant="gray" onClick={() => alert('Navigating to new Campaign flow...')}>
            Click Here
          </OutlineButton>
        </div>

        {/* Main Card */}
        <div className="space-y-6 rounded-xl border border-line bg-card p-6 shadow-xs">
          {/* Section Title & TRAI Regulations Disclaimer */}
          <div className="space-y-3 border-b border-line pb-5">
            <h2 className="text-lg font-bold text-ink sm:text-xl">
              Campaign Details
            </h2>

            <div className="space-y-2 text-xs font-medium text-muted leading-relaxed">
              <p>
                In compliance to a TRAI Regulation, the telecom operators will not share the status of the SMS delivered. So, Petpooja will also not be able to share such a status report with you. To have the least SMS delivery failure, kindly ensure below before firing SMS campaigns:
              </p>

              <ul className="ml-2 space-y-1 list-disc list-inside font-semibold text-ink">
                <li>Your sender ID is registered with TRAI, &</li>
                <li>
                  Your promotional SMS template is registered with TRAI (every single change in the template would require you to get it approved from TRAI)
                </li>
              </ul>

              <p className="pt-1 font-semibold text-ink">
                Petpooja will not be responsible for SMS delivery failure.
              </p>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Campaign Type */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-muted">
                Campaign Type <span className="text-primary">*</span>
              </label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
              >
                <option value="Schedule">Schedule</option>
                <option value="Instant">Instant</option>
              </select>
            </div>

            {/* Campaign Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-muted">
                Campaign Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder=""
                className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
              />
            </div>

            {/* Sender ID */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-muted">
                Sender ID <span className="text-primary">*</span>
              </label>
              <select
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
              >
                <option value="">Select Sender ID</option>
              </select>
              <p className="text-xs font-semibold text-primary">
                Note:- Your sms balance is zero.Please buy any sms plan to request sms sender id.
              </p>
            </div>

            {/* Schedule Date */}
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-muted">
                Schedule Date <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
                <Calendar
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
              <p className="text-xs font-medium text-muted">
                Note:- Please schedule at least 30 minutes in advance.
              </p>
            </div>

            {/* Recipients */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-bold text-muted">
                Recipients <span className="text-primary">*</span>
              </label>
              <select
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
              >
                <option value="">Select Recipients</option>
                <option value="All Users">All Users (191)</option>
              </select>
            </div>
          </div>

          {/* Select Template Section */}
          <div className="space-y-4 border-t border-line pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-ink">
                Select Template
              </h3>

              <PrimaryButton onClick={() => alert('Request Template modal...')}>
                Request Template
              </PrimaryButton>
            </div>

            <p className="text-xs font-medium text-primary leading-relaxed">
              Note:- You can either choose a template from the predefined choices or use "Request Template" to get your personal template approved. Once approved, it will be added to the choose template list. Please take a look at the predefined templates or call us on 07969 223344 for details.
            </p>

            <OutlineButton variant="gray" onClick={() => alert('Choosing template...')}>
              Choose Template
            </OutlineButton>
          </div>

          {/* Bottom Warning & Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-line pt-6">
            <p className="max-w-xl text-xs font-semibold text-primary leading-relaxed">
              Note:-Sending promotional SMSes for a large number of customer could take atleast 2 hours to execute,so please plan the campaign accordingly
            </p>

            <div className="flex items-center gap-3">
              <OutlineButton variant="gray" onClick={handleCancel}>
                Cancel
              </OutlineButton>
              <PrimaryButton onClick={handleSave}>
                Save Changes
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </ReportsPageShell>
  )
}
