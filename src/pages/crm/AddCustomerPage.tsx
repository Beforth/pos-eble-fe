import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  Tag,
  User,
  UserX,
} from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton, OutlineButton } from '../../components/menu/MenuActionButtons'

export default function AddCustomerPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
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
    alert('Customer added successfully!')
    navigate('/crm/customers')
  }

  function handleCancel() {
    navigate('/crm/customers')
  }

  return (
    <ReportsPageShell title="Add Customer" activeItem="crm-customers">
      <div className="space-y-6">
        {/* Back Button */}
        <OutlineButton variant="gray" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Customers</span>
        </OutlineButton>

        {/* Add Customer Card */}
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-xs">
          {/* Card Header */}
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-lg font-bold text-ink sm:text-xl">
              Add Customer
            </h2>
            <p className="mt-1 text-xs font-medium text-muted">
              Fill in the customer details below. Fields marked with{' '}
              <span className="text-primary">*</span> are required.
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Section: Contact Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Phone size={14} />
                </div>
                <h3 className="text-sm font-bold text-ink">
                  Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    Phone <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                    />
                    <Phone
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                    />
                    <User
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                    />
                    <Mail
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>

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
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Personal Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary/20 text-deep">
                  <User size={14} />
                </div>
                <h3 className="text-sm font-bold text-ink">Personal Details</h3>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    Primary Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                    />
                    <MapPin
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    Primary Locality
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                    />
                    <MapPin
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    Tags
                  </label>
                  <div className="relative">
                    <select
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                    >
                      <option value="">Select Tag</option>
                      <option value="VIP">VIP</option>
                      <option value="Regular">Regular</option>
                    </select>
                    <Tag
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Business Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                  <CreditCard size={14} />
                </div>
                <h3 className="text-sm font-bold text-ink">
                  Business Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    Credit Limit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                    />
                    <CreditCard
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    GST No
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={gstNo}
                      onChange={(e) => setGstNo(e.target.value)}
                      className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                    />
                    <FileText
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Remarks */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText size={14} />
                </div>
                <h3 className="text-sm font-bold text-ink">Remarks</h3>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Customer Remark
                </label>
                <textarea
                  rows={2}
                  value={customerRemark}
                  onChange={(e) => setCustomerRemark(e.target.value)}
                  className="w-full rounded-md border border-line bg-card p-3 text-sm text-ink outline-none transition-colors focus:border-primary resize-y"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap items-center gap-8 pt-2">
              <label className="flex items-center gap-2.5 text-sm font-bold text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={markFavorite}
                  onChange={(e) => setMarkFavorite(e.target.checked)}
                  className="size-4 rounded border-line text-primary focus:ring-primary"
                />
                <Heart
                  size={14}
                  className={markFavorite ? 'text-primary' : 'text-muted'}
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
                <UserX
                  size={14}
                  className={noUpdates ? 'text-primary' : 'text-muted'}
                />
                <span>Do not send any Updates</span>
              </label>
            </div>
          </div>

          {/* Footer */}
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
