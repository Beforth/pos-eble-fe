import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
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
    <ReportsPageShell title="Customer Discount Configuration" activeItem="crm-customers">
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

        {/* Card Container (Matching Screenshot 5432) */}
        <div className="overflow-hidden rounded-xl border border-line bg-card shadow-xs">
          {/* Card Title Header */}
          <div className="border-b border-line px-6 py-4">
            <h2 className="text-lg font-bold text-ink sm:text-xl">
              Customer Discount Configuration
            </h2>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-6">
            {/* Allow Favorite Discount Checkbox & Note */}
            <div className="space-y-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowFavoriteDiscount}
                  onChange={(e) => setAllowFavoriteDiscount(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-line text-primary focus:ring-primary"
                />
                <div className="text-sm font-bold text-ink leading-relaxed">
                  <span>Allow your outlet to configure discount for your Favorite customer</span>{' '}
                  <span className="font-medium text-primary text-xs">
                    [Choose this option if you want to give discount to your special customers. This discount will apply automatically on pos when you made customer selection.]
                  </span>
                </div>
              </label>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Customer Type */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Customer Type
                </label>
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                >
                  <option value="All">All</option>
                  <option value="Favorite">Favorite</option>
                  <option value="VIP">VIP</option>
                  <option value="Regular">Regular</option>
                </select>
              </div>

              {/* Customer Discount Amount */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-muted">
                  Customer Discount Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder=""
                    className="h-10 w-full rounded-md border border-line bg-card pl-3 pr-10 text-sm text-ink outline-none transition-colors focus:border-primary"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted">
                    %
                  </span>
                </div>
              </div>
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
