import { useState, type ReactNode } from 'react'
import {
  Calculator,
  ChefHat,
  Info,
  Link2,
  MessageSquare,
  Milk,
  Package,
  Plus,
  RefreshCw,
  Shield,
  ShoppingBag,
  Smartphone,
  TableProperties,
  Trash2,
  Zap,
} from 'lucide-react'
import {
  ConfigFormRow,
  ConfigSectionCard,
  MutedHelp,
} from '../../components/management/ConfigSectionCard'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { AggregatorLogo } from '../../components/common/AggregatorLogo'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary'

function CheckRow({
  checked,
  onChange,
  label,
  help,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  help?: ReactNode
}) {
  return (
    <div>
      <label className="flex cursor-pointer select-none items-center gap-3 text-sm font-medium text-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 shrink-0 cursor-pointer accent-primary"
        />
        <span>{label}</span>
      </label>
      {help ? (
        <div className="pl-7">
          <MutedHelp>{help}</MutedHelp>
        </div>
      ) : null}
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  label,
  icon,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  icon?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
        {icon}
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted/30'
        }`}
      >
        <span
          className={`absolute left-1 top-1 size-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

const TIME_FROM_OPTIONS = ['00:00', '03:30', '06:00', '12:00', '18:00']
const TIME_TO_OPTIONS = ['24:00', '09:30', '12:00', '18:00']

export default function MarketplaceSettingPage() {
  const [activeTab, setActiveTab] = useState<
    'pos-subscription' | 'online-orders' | 'tally-integration'
  >('online-orders')

  // Online Orders Platform Tab State
  const [platform, setPlatform] = useState<'zomato' | 'swiggy'>('swiggy')
  const [, setSelectedOutlet] = useState("Annapurna's R...")

  // Shared Online Orders Form States
  const [notRegisteredGst, setNotRegisteredGst] = useState(false)
  const [gstNote, setGstNote] = useState('Tax to be paid under section 9(5) by Eco')
  const [commissionRate, setCommissionRate] = useState('33')
  const [doNotPrintBill, setDoNotPrintBill] = useState(false)
  const [doNotPrintKot, setDoNotPrintKot] = useState(false)
  const [doNotPrintEcommerceGst, setDoNotPrintEcommerceGst] = useState(false)

  // Auto mark food ready & packing checklist
  const [enableAutoFoodReady, setEnableAutoFoodReady] = useState(false)
  const [packingChecklist, setPackingChecklist] = useState(false)

  // Auto accept orders
  const [autoAcceptOrders, setAutoAcceptOrders] = useState<'on' | 'off'>('on')
  const [zomatoTimings, setZomatoTimings] = useState<
    { id: string; from: string; to: string }[]
  >([{ id: 'tz-1', from: '00:00', to: '24:00' }])

  const [swiggyTimings, setSwiggyTimings] = useState<
    { id: string; from: string; to: string }[]
  >([{ id: 'ts-1', from: '03:30', to: '09:30' }])

  // Zomato Specific States
  const [zomatoOrderType, setZomatoOrderType] = useState('Zomato')
  const [allowItemTags, setAllowItemTags] = useState(true)
  const [considerAllDiscounts, setConsiderAllDiscounts] = useState(true)
  const [packagingApplicableOn, setPackagingApplicableOn] = useState<
    'item' | 'order' | 'none'
  >('item')
  const [packagingChargeType, setPackagingChargeType] = useState<
    'item' | 'fixed' | 'percentage' | 'slabwise'
  >('item')
  const [naturalPaneer, setNaturalPaneer] = useState(false)
  const [analoguePaneer, setAnaloguePaneer] = useState(false)
  const [analogueCheese, setAnalogueCheese] = useState(false)

  // Swiggy Specific States
  const [swiggyOrderType, setSwiggyOrderType] = useState('Swiggy')
  const [applyPackagingCharge, setApplyPackagingCharge] = useState<'no' | 'yes'>('no')
  const [swiggyDeliveryStatus, setSwiggyDeliveryStatus] = useState<
    'open' | 'closed'
  >('open')
  const [enableSelfDelivery, setEnableSelfDelivery] = useState(false)

  // POS Subscription Form State
  const [messageType, setMessageType] = useState<'text' | 'whatsapp'>('whatsapp')
  const [expiryDays, setExpiryDays] = useState('2')
  const [senderId, setSenderId] = useState('')

  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  function handleSave() {
    showToast('Marketplace settings saved successfully')
  }

  function addTimingRow() {
    const newId = `t-${Date.now()}`
    if (platform === 'zomato') {
      setZomatoTimings((prev) => [...prev, { id: newId, from: '00:00', to: '24:00' }])
    } else {
      setSwiggyTimings((prev) => [...prev, { id: newId, from: '03:30', to: '09:30' }])
    }
    showToast('Added new auto accept timing window')
  }

  function removeTimingRow(id: string) {
    if (platform === 'zomato') {
      setZomatoTimings((prev) => prev.filter((t) => t.id !== id))
    } else {
      setSwiggyTimings((prev) => prev.filter((t) => t.id !== id))
    }
  }

  function updateTiming(timingId: string, key: 'from' | 'to', value: string) {
    if (platform === 'zomato') {
      setZomatoTimings((prev) =>
        prev.map((t) => (t.id === timingId ? { ...t, [key]: value } : t)),
      )
    } else {
      setSwiggyTimings((prev) =>
        prev.map((t) => (t.id === timingId ? { ...t, [key]: value } : t)),
      )
    }
  }

  const NAV_ITEMS: Array<{
    id: typeof activeTab
    label: string
    icon: ReactNode
  }> = [
    { id: 'pos-subscription', label: 'POS Subscription', icon: <Smartphone size={16} /> },
    { id: 'online-orders', label: 'Online Orders Integration', icon: <ShoppingBag size={16} /> },
    { id: 'tally-integration', label: 'Tally Integration', icon: <Calculator size={16} /> },
  ]

  return (
    <ReportsPageShell
      title="Marketplace Settings"
      activeItem="explore-products-marketplace-setting"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Sub-Menu Navigation */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-line bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <nav className="flex flex-col divide-y divide-line">
              {NAV_ITEMS.map((item) => {
                const active = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2.5 py-3.5 pl-4 pr-3 text-left text-sm transition-all ${
                      active
                        ? 'border-l-4 border-primary bg-primary/10 font-semibold text-primary'
                        : 'border-l-4 border-transparent font-medium text-muted hover:bg-page hover:text-ink'
                    }`}
                  >
                    <span className={active ? 'text-primary' : 'text-muted'}>
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="min-w-0 md:col-span-8 lg:col-span-9">
          {/* ONLINE ORDERS INTEGRATION TAB */}
          {activeTab === 'online-orders' ? (
            <>
              {/* Platform Tabs (Zomato & Swiggy) */}
              <div className="mb-4 flex gap-1 border-b border-line">
                {(['zomato', 'swiggy'] as const).map((id) => {
                  const active = platform === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPlatform(id)}
                      className={`inline-flex items-center gap-2.5 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted hover:text-ink'
                      }`}
                    >
                      <AggregatorLogo name={id === 'zomato' ? 'Zomato' : 'Swiggy'} size="sm" />
                      <span>{id === 'zomato' ? 'Zomato' : 'Swiggy'}</span>
                    </button>
                  )
                })}
              </div>

              <ConfigSectionCard
                icon={<Link2 size={16} />}
                title="Integration Details"
                description={`Codes identifying this outlet on ${platform === 'zomato' ? 'Zomato' : 'Swiggy'}.`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedOutlet("Annapurna's R...")}
                      className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-left transition-colors"
                    >
                      <span className="max-w-[160px] truncate text-sm font-semibold text-ink">
                        Annapurna's R...
                      </span>
                      <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                        Active
                      </span>
                    </button>
                    <div>
                      {platform === 'zomato' ? (
                        <>
                          <p className="text-sm font-semibold text-ink">
                            Outlet Code : 5sbhwvqj
                          </p>
                          <MutedHelp>
                            Unique code for each outlet registered on Zomato
                          </MutedHelp>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-ink">
                            Restaurant Code : 5sbhwvqj
                          </p>
                          <p className="text-sm font-semibold text-ink">
                            Vendor Code : 776370
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-muted">
                    Identifier :
                  </span>
                </div>
              </ConfigSectionCard>

              <ConfigSectionCard
                icon={<MessageSquare size={16} />}
                title="GST & Billing"
                description="How GST information and invoices are handled for orders from this platform."
              >
                <div className="space-y-4">
                  <CheckRow
                    checked={notRegisteredGst}
                    onChange={setNotRegisteredGst}
                    label="Restaurant Is Not Registered Under GST"
                  />

                  <ConfigFormRow label="GST Information Note On Bill Print">
                    <textarea
                      rows={2}
                      value={gstNote}
                      onChange={(e) => setGstNote(e.target.value)}
                      className="w-full rounded-md border border-line bg-card p-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                    />
                  </ConfigFormRow>

                  <ConfigFormRow
                    label={
                      <>
                        Order Type <span className="text-danger">*</span>
                      </>
                    }
                    align="center"
                  >
                    {platform === 'zomato' ? (
                      <select
                        value={zomatoOrderType}
                        onChange={(e) => setZomatoOrderType(e.target.value)}
                        className={`${inputClass} max-w-md`}
                      >
                        <option value="Zomato">Zomato</option>
                        <option value="Swiggy">Swiggy</option>
                        <option value="Direct Delivery">Direct Delivery</option>
                      </select>
                    ) : (
                      <select
                        value={swiggyOrderType}
                        onChange={(e) => setSwiggyOrderType(e.target.value)}
                        className={`${inputClass} max-w-md`}
                      >
                        <option value="Swiggy">Swiggy</option>
                        <option value="Zomato">Zomato</option>
                        <option value="Direct Delivery">Direct Delivery</option>
                      </select>
                    )}
                  </ConfigFormRow>

                  {platform === 'zomato' ? (
                    <CheckRow
                      checked={allowItemTags}
                      onChange={setAllowItemTags}
                      label="Allow Item Tags To Participate In Zomato Campaign"
                    />
                  ) : null}

                  <ConfigFormRow label="Commission Rate %" align="center">
                    <input
                      type="text"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      className={`${inputClass} max-w-md`}
                    />
                  </ConfigFormRow>

                  {platform === 'zomato' ? (
                    <CheckRow
                      checked={considerAllDiscounts}
                      onChange={setConsiderAllDiscounts}
                      label="Consider All Discounts"
                      help="Note:- It will take both zomato and restaurants discounts."
                    />
                  ) : null}

                  <CheckRow
                    checked={doNotPrintBill}
                    onChange={setDoNotPrintBill}
                    label="Do Not Print Bill"
                  />
                  <CheckRow
                    checked={doNotPrintKot}
                    onChange={setDoNotPrintKot}
                    label="Do Not Print Kot"
                  />
                  <CheckRow
                    checked={doNotPrintEcommerceGst}
                    onChange={setDoNotPrintEcommerceGst}
                    label="Do Not Print E-Commerce Operators. GST Levied On The Bills Printed"
                    help="Note: If Enabled, The GST Amount Deducted By E-Commerce Operators Will Not Be Included In The Invoices Generated."
                  />
                </div>
              </ConfigSectionCard>

              <ConfigSectionCard
                icon={<ChefHat size={16} />}
                title="Food Ready & Packing"
                description="Automate marking orders ready and confirm packing via checklist."
              >
                <div className="space-y-4">
                  <CheckRow
                    checked={enableAutoFoodReady}
                    onChange={setEnableAutoFoodReady}
                    label="Enable auto mark food ready"
                    help="Recommended specifically for restaurants with pre-packed or fast-packing items only."
                  />

                  <div className="rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                    <ToggleSwitch
                      checked={packingChecklist}
                      onChange={setPackingChecklist}
                      label="Order Packing Checklist"
                      icon={<Shield size={16} className="text-primary" />}
                    />
                    <MutedHelp>
                      Ensure no items are missed while packing. Staff must confirm
                      each item via checklist before marking order as "Food Ready".
                    </MutedHelp>
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs font-medium text-ink">
                      <Info size={16} className="mt-0.5 shrink-0 text-muted" />
                      <span>
                        When enabled, Auto Food Ready will not work for these
                        orders. Orders must be manually marked ready after
                        checklist completion.
                      </span>
                    </div>
                  </div>
                </div>
              </ConfigSectionCard>

              <ConfigSectionCard
                icon={<Zap size={16} />}
                title="Auto Accept Orders"
                description="Accept incoming platform orders automatically within chosen time windows."
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-6">
                    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name="auto-accept"
                        checked={autoAcceptOrders === 'on'}
                        onChange={() => setAutoAcceptOrders('on')}
                        className="size-4 cursor-pointer accent-primary"
                      />
                      On
                    </label>
                    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name="auto-accept"
                        checked={autoAcceptOrders === 'off'}
                        onChange={() => setAutoAcceptOrders('off')}
                        className="size-4 cursor-pointer accent-primary"
                      />
                      Off
                    </label>
                  </div>
                  <MutedHelp>
                    Note : Make sure, your KOT printer is assigned properly while
                    enabling auto accept flag. If not, this will result into
                    queuing of the KOT print. Change in auto accept flag will take
                    a minute to get reflect once changed.
                  </MutedHelp>

                  <div className="rounded-xl border border-line p-4">
                    <div className="flex items-center justify-between border-b border-line pb-3">
                      <h4 className="text-sm font-semibold text-ink">
                        Auto Accept Timing
                      </h4>
                      <OutlineButton variant="primary" onClick={addTimingRow}>
                        <Plus size={15} />
                        <span>Add new</span>
                      </OutlineButton>
                    </div>

                    <div className="space-y-3 pt-3">
                      {(platform === 'zomato' ? zomatoTimings : swiggyTimings).map(
                        (timing) => (
                          <div
                            key={timing.id}
                            className="flex flex-wrap items-end gap-3 rounded-lg bg-page/60 p-3.5"
                          >
                            <label className="min-w-[140px] flex-1 text-xs font-semibold text-muted">
                              From <span className="text-danger">*</span>
                              <select
                                value={timing.from}
                                onChange={(e) =>
                                  updateTiming(timing.id, 'from', e.target.value)
                                }
                                className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
                              >
                                {TIME_FROM_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label className="min-w-[140px] flex-1 text-xs font-semibold text-muted">
                              To <span className="text-danger">*</span>
                              <select
                                value={timing.to}
                                onChange={(e) =>
                                  updateTiming(timing.id, 'to', e.target.value)
                                }
                                className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
                              >
                                {TIME_TO_OPTIONS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>

                            {(platform === 'zomato'
                              ? zomatoTimings.length
                              : swiggyTimings.length) > 1 ? (
                              <button
                                type="button"
                                aria-label="Remove timing window"
                                onClick={() => removeTimingRow(timing.id)}
                                className="inline-flex h-10 w-10 items-center justify-center text-muted hover:text-danger"
                              >
                                <Trash2 size={18} />
                              </button>
                            ) : null}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </ConfigSectionCard>

              <ConfigSectionCard
                icon={<Package size={16} />}
                title="Packaging Charges"
                description="Configure how packaging charges apply to platform orders."
              >
                {platform === 'zomato' ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-ink">
                        Packaging Charge Applicable On
                      </p>
                      <div className="flex flex-wrap items-center gap-6">
                        {(
                          [
                            ['item', 'Item'],
                            ['order', 'Order'],
                            ['none', 'None'],
                          ] as const
                        ).map(([value, label]) => (
                          <label
                            key={value}
                            className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink"
                          >
                            <input
                              type="radio"
                              name="pkg-app"
                              checked={packagingApplicableOn === value}
                              onChange={() => setPackagingApplicableOn(value)}
                              className="size-4 cursor-pointer accent-primary"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-ink">
                        Packaging Charge Type <span className="text-danger">*</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-6">
                        {(
                          [
                            ['item', 'Consider from item'],
                            ['fixed', 'Fixed'],
                            ['percentage', 'Percentage'],
                            ['slabwise', 'Packing charge Slabwise Strictly'],
                          ] as const
                        ).map(([value, label]) => (
                          <label
                            key={value}
                            className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink"
                          >
                            <input
                              type="radio"
                              name="pkg-type"
                              checked={packagingChargeType === value}
                              onChange={() => setPackagingChargeType(value)}
                              className="size-4 cursor-pointer accent-primary"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-6">
                    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name="apply-pkg"
                        checked={applyPackagingCharge === 'no'}
                        onChange={() => setApplyPackagingCharge('no')}
                        className="size-4 cursor-pointer accent-primary"
                      />
                      No
                    </label>
                    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name="apply-pkg"
                        checked={applyPackagingCharge === 'yes'}
                        onChange={() => setApplyPackagingCharge('yes')}
                        className="size-4 cursor-pointer accent-primary"
                      />
                      Yes
                    </label>
                  </div>
                )}
              </ConfigSectionCard>

              {platform === 'zomato' ? (
                <ConfigSectionCard
                  icon={<Milk size={16} />}
                  title="Paneer/Cheese Declaration"
                  description="Declare the type of paneer or cheese used before pushing the menu."
                >
                  <div className="space-y-3">
                    <CheckRow
                      checked={naturalPaneer}
                      onChange={setNaturalPaneer}
                      label="Natural (Paneer / Cheese)"
                    />
                    <CheckRow
                      checked={analoguePaneer}
                      onChange={setAnaloguePaneer}
                      label="Analogue Paneer"
                    />
                    <CheckRow
                      checked={analogueCheese}
                      onChange={setAnalogueCheese}
                      label="Analogue Cheese"
                    />
                    <MutedHelp>
                      Note : As per government guidelines, restaurants using
                      paneer or cheese must declare whether the product used is
                      Regular (Dairy) or Analogue before pushing the menu to
                      Zomato.
                    </MutedHelp>
                  </div>
                </ConfigSectionCard>
              ) : null}

              <ConfigSectionCard
                icon={<RefreshCw size={16} />}
                title={
                  platform === 'zomato'
                    ? 'Zomato Status & Actions'
                    : 'Swiggy Status & Actions'
                }
                description="Sync availability status and timings with the platform."
              >
                {platform === 'swiggy' ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-line bg-card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                        <h4 className="text-sm font-semibold text-ink">
                          Change Status On Swiggy
                        </h4>
                        <OutlineButton
                          variant="gray"
                          onClick={() => showToast('Updating Swiggy status…')}
                        >
                          <span>Update Status</span>
                        </OutlineButton>
                      </div>

                      <div className="space-y-2 pt-3">
                        <p className="text-sm font-semibold text-ink">
                          Change The Status To Mark Your Restaurant Status On
                          Swiggy
                        </p>
                        <div className="space-y-2 pt-1">
                          <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink">
                            <input
                              type="radio"
                              name="swiggy-deliv-status"
                              checked={swiggyDeliveryStatus === 'open'}
                              onChange={() => setSwiggyDeliveryStatus('open')}
                              className="size-4 cursor-pointer accent-primary"
                            />
                            Open for Delivery
                          </label>
                          <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink">
                            <input
                              type="radio"
                              name="swiggy-deliv-status"
                              checked={swiggyDeliveryStatus === 'closed'}
                              onChange={() => setSwiggyDeliveryStatus('closed')}
                              className="size-4 cursor-pointer accent-primary"
                            />
                            Closed for Delivery
                          </label>
                        </div>
                        <MutedHelp>
                          NOTE Select the above option to change the availability
                          for Swiggy Online Order acceptance. If you select 'Closed
                          for Delivery' will change the Swiggy status as 'Closed'
                          so you won't get any online order from Swiggy for today
                        </MutedHelp>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-page/40 p-4">
                      <span className="text-sm font-semibold text-ink">
                        Change Opening Timing On Swiggy
                      </span>
                      <OutlineButton
                        variant="gray"
                        onClick={() => showToast('Checking opening timing status…')}
                      >
                        <span>Check Status</span>
                      </OutlineButton>
                    </div>

                    <div className="rounded-xl border border-line bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                      <h4 className="mb-3 border-b border-line pb-3 text-sm font-semibold text-ink">
                        Self Delivery
                      </h4>
                      <ToggleSwitch
                        checked={enableSelfDelivery}
                        onChange={setEnableSelfDelivery}
                        label="Enable Self Delivery"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      'Change Status On Zomato',
                      'Check Outlet Logistics Status On Zomato',
                      'Change Outlet Takeaway Status On Zomato',
                      'Change Outlet Delivery Timings On Zomato',
                      'Change Outlet Self Delivery Timings On Zomato',
                      'Change Outlet Takeaway Timings On Zomato',
                    ].map((actionTitle) => (
                      <div
                        key={actionTitle}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-page/40 p-4"
                      >
                        <span className="text-sm font-semibold text-ink">
                          {actionTitle}
                        </span>
                        <OutlineButton
                          variant="gray"
                          onClick={() =>
                            showToast(`Checking status for ${actionTitle}…`)
                          }
                        >
                          <span>Check Status</span>
                        </OutlineButton>
                      </div>
                    ))}
                  </div>
                )}
              </ConfigSectionCard>

              <div className="sticky bottom-0 z-20 -mx-1 mt-4 flex justify-end border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
                <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
              </div>
            </>
          ) : null}

          {/* POS SUBSCRIPTION TAB */}
          {activeTab === 'pos-subscription' ? (
            <>
              <ConfigSectionCard
                icon={<MessageSquare size={16} />}
                title="Ebill Messages"
                description="Choose how eBill messages reach your customers."
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-6">
                    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name="ebill-type-pos"
                        checked={messageType === 'text'}
                        onChange={() => setMessageType('text')}
                        className="size-4 cursor-pointer accent-primary"
                      />
                      Text message
                    </label>
                    <label className="inline-flex cursor-pointer select-none items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name="ebill-type-pos"
                        checked={messageType === 'whatsapp'}
                        onChange={() => setMessageType('whatsapp')}
                        className="size-4 cursor-pointer accent-primary"
                      />
                      WhatsApp Message
                    </label>
                  </div>
                  <MutedHelp>
                    [Note: This configuration would not work if you have an active
                    WhatsApp campaign or Green Receipt to send the ebill to
                    customers.]
                  </MutedHelp>
                </div>
              </ConfigSectionCard>

              <ConfigSectionCard
                icon={<Link2 size={16} />}
                title="Subscription Link"
                description="Control expiry and sender identity of POS subscription links."
              >
                <div className="space-y-4">
                  <ConfigFormRow label="POS Subscription Link Expiry Time (Days)" align="center">
                    <>
                      <input
                        type="text"
                        value={expiryDays}
                        onChange={(e) => setExpiryDays(e.target.value)}
                        className={`${inputClass} max-w-md`}
                      />
                      <MutedHelp>
                        [Mentioning " 0 " days will consider as Link will not to
                        expire ever.]
                      </MutedHelp>
                    </>
                  </ConfigFormRow>

                  <ConfigFormRow label="Sender ID" align="center">
                    <>
                      <input
                        type="text"
                        value={senderId}
                        onChange={(e) => setSenderId(e.target.value)}
                        className={`${inputClass} max-w-md`}
                      />
                      <MutedHelp>
                        [Enter your 6 characters Sender ID. The sender ID is the
                        name of the eBill sender which will display on the
                        customer's phone eg. DM-PPOOJA or MD-PTPOOJ.]
                      </MutedHelp>
                    </>
                  </ConfigFormRow>
                </div>
              </ConfigSectionCard>

              <div className="sticky bottom-0 z-20 -mx-1 mt-4 flex justify-end border-t border-line bg-page/95 px-1 py-3 backdrop-blur">
                <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
              </div>
            </>
          ) : null}

          {/* TALLY INTEGRATION TAB */}
          {activeTab === 'tally-integration' ? (
            <ConfigSectionCard
              icon={<TableProperties size={16} />}
              title="Active Plan"
              description="Your current Tally integration plan."
            >
              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-primary/5 text-xs font-semibold text-ink">
                    <tr>
                      <th className="w-24 px-4 py-3 font-semibold">Sr No.</th>
                      <th className="px-4 py-3 font-semibold">Plan</th>
                      <th className="px-4 py-3 font-semibold">Range</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line bg-card">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-ink">1</td>
                      <td className="px-4 py-3 font-semibold text-ink">
                        Custom plan
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">
                        16 Mar 2024 To 4 Aug 2024
                      </td>
                      <td className="px-4 py-3 text-ink"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ConfigSectionCard>
          ) : null}
        </div>
      </div>
    </ReportsPageShell>
  )
}
