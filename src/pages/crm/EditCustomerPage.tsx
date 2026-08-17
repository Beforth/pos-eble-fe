import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton, OutlineButton } from '../../components/menu/MenuActionButtons'

export default function EditCustomerPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('9422433249')
  const [name, setName] = useState('joshi')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [anniversary, setAnniversary] = useState('')
  const [address, setAddress] = useState('')
  const [locality, setLocality] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const [gstNo, setGstNo] = useState('')
  const [tags, setTags] = useState('')
  const [customerRemark, setCustomerRemark] = useState('')
  const [markFavorite, setMarkFavorite] = useState(false)
  const [noUpdates, setNoUpdates] = useState(false)

  function handleSave() {
    if (!phone) {
      alert('Phone number is required!')
      return
    }
    alert('Customer updated successfully!')
    navigate('/crm/customers')
  }

  function handleCancel() {
    navigate('/crm/customers')
  }

  return (
    <ReportsPageShell title="Edit Customer" activeItem="crm-customers">
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-xs font-bold text-ink shadow-2xs hover:bg-page transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Customers</span>
          </button>
        </div>

        {/* Edit Customer Card Container (Matching Screenshot 5433) */}
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-xs">
          {/* Card Title Header */}
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-lg font-bold text-ink sm:text-xl">
              Edit Customer
            </h2>
          </div>

          {/* Form Fields Body */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Phone <span className="text-primary">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder=""
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-10 w-full rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>

              {/* Date of Anniversary */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Date of Anniversary
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={anniversary}
                    onChange={(e) => setAnniversary(e.target.value)}
                    className="h-10 w-full rounded-md border border-line bg-card pl-3 pr-9 text-sm text-ink outline-none transition-colors focus:border-primary [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                  <Calendar
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                </div>
              </div>

              {/* Primary Address */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Primary Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder=""
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              {/* Primary Locality */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Primary Locality
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder=""
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              {/* Credit Limit */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Credit Limit
                </label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder=""
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              {/* GST No */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  GST No
                </label>
                <input
                  type="text"
                  value={gstNo}
                  onChange={(e) => setGstNo(e.target.value)}
                  placeholder=""
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Tags
                </label>
                <select
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                >
                  <option value="">Select Tag</option>
                  <option value="VIP">VIP</option>
                  <option value="Regular">Regular</option>
                </select>
              </div>

              {/* Customer Remark (Spans 2 Columns) */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                <label className="block text-sm font-bold text-muted">
                  Customer Remark
                </label>
                <textarea
                  rows={2}
                  value={customerRemark}
                  onChange={(e) => setCustomerRemark(e.target.value)}
                  placeholder=""
                  className="w-full rounded-md border border-line bg-card p-3 text-sm text-ink outline-none transition-colors focus:border-primary resize-y"
                />
              </div>
            </div>

            {/* Checkboxes Row */}
            <div className="flex flex-wrap items-center gap-8 pt-2">
              <label className="flex items-center gap-2.5 text-sm font-bold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={markFavorite}
                  onChange={(e) => setMarkFavorite(e.target.checked)}
                  className="size-4 rounded border-line text-primary focus:ring-primary"
                />
                <span>Mark As Favorite</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm font-bold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={noUpdates}
                  onChange={(e) => setNoUpdates(e.target.checked)}
                  className="size-4 rounded border-line text-primary focus:ring-primary"
                />
                <span>Do not send any Updates</span>
              </label>
            </div>
          </div>

          {/* Bottom Action Footer Bar */}
          <div className="flex items-center justify-end gap-3 border-t border-line bg-page/40 p-4">
            <OutlineButton variant="gray" onClick={handleCancel}>
              Cancel
            </OutlineButton>

            <PrimaryButton onClick={handleSave}>
              Save Changes
            </PrimaryButton>
          </div>
        </div>
      </div>
    </ReportsPageShell>
  )
}
