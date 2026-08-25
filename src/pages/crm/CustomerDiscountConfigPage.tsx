import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Info,
  Percent,
  Tag,
  ToggleLeft,
  Users,
} from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton, OutlineButton } from '../../components/menu/MenuActionButtons'

export default function CustomerDiscountConfigPage() {
  const navigate = useNavigate()
  const [allowFavoriteDiscount, setAllowFavoriteDiscount] = useState(false)
  const [customerType, setCustomerType] = useState('All')
  const [discountAmount, setDiscountAmount] = useState('')

  function handleSave() {
    alert('Customer discount configuration saved successfully!')
    navigate('/crm/customers')
  }

  function handleCancel() {
    navigate('/crm/customers')
  }

  return (
    <ReportsPageShell
      title="Customer Discount Configuration"
      activeItem="crm-customers"
    >
      <div className="space-y-6">
        {/* Back Button */}
        <OutlineButton variant="gray" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Customers</span>
        </OutlineButton>

        {/* Card Container */}
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-xs">
          {/* Card Header */}
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-lg font-bold text-ink sm:text-xl">
              Customer Discount Configuration
            </h2>
            <p className="mt-1 text-xs font-medium text-muted">
              Configure automatic discounts for your customers based on type and
              favourite status.
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* Info Box */}
            <div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Info size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-ink">
                    How Discount Configuration Works
                  </h4>
                  <p className="text-xs font-medium text-muted leading-relaxed">
                    When enabled, the configured discount will apply
                    automatically at POS whenever you select a matching customer.
                    Choose the customer type below and set the discount
                    percentage.
                  </p>
                </div>
              </div>
            </div>

            {/* Section: Enable Discount */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ToggleLeft size={14} />
                </div>
                <h3 className="text-sm font-bold text-ink">
                  Enable Customer Discount
                </h3>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowFavoriteDiscount}
                  onChange={(e) => setAllowFavoriteDiscount(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-line text-primary focus:ring-primary"
                />
                <div className="text-sm font-bold text-ink leading-relaxed">
                  <span>
                    Allow your outlet to configure discount for your Favorite
                    customer
                  </span>
                </div>
              </label>
            </div>

            {/* Section: Discount Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary/20 text-deep">
                  <Tag size={14} />
                </div>
                <h3 className="text-sm font-bold text-ink">Discount Settings</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    Customer Type
                  </label>
                  <div className="relative">
                    <select
                      value={customerType}
                      onChange={(e) => setCustomerType(e.target.value)}
                      className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                    >
                      <option value="All">All</option>
                      <option value="Favorite">Favorite</option>
                      <option value="VIP">VIP</option>
                      <option value="Regular">Regular</option>
                    </select>
                    <Users
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-muted">
                    Customer Discount Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      min="0"
                      max="100"
                      className="h-10 w-full rounded-md border border-line bg-card pl-9 pr-10 text-sm text-ink outline-none transition-colors focus:border-primary"
                    />
                    <Percent
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">
                      %
                    </span>
                  </div>
                </div>
              </div>
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
