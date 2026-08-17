import { useState } from 'react'
import { Plus, Trash2, Shield, Info } from 'lucide-react'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton, OutlineButton } from '../../components/menu/MenuActionButtons'

function AggregatorMark({ name }: { name: 'Zomato' | 'Swiggy' }) {
  const isSwiggy = name === 'Swiggy'
  return (
    <span className="relative inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md">
      <img
        src={isSwiggy ? '/swiggy.png' : '/zomato.png'}
        alt={`${name} logo`}
        width={isSwiggy ? 44 : 28}
        height={isSwiggy ? 44 : 28}
        className={
          isSwiggy
            ? 'absolute size-11 max-w-none scale-125 object-cover'
            : 'size-7 object-contain'
        }
      />
    </span>
  )
}

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
          <div className="overflow-hidden rounded-xl border border-line bg-card shadow-xs">
            <nav className="flex flex-col divide-y divide-line">
              <button
                type="button"
                onClick={() => setActiveTab('pos-subscription')}
                className={`flex items-center text-left text-sm transition-all ${
                  activeTab === 'pos-subscription'
                    ? 'border-l-4 border-primary bg-primary/10 font-bold text-primary py-3.5 pl-4 pr-3'
                    : 'border-l-4 border-transparent py-3.5 pl-4 pr-3 font-medium text-muted hover:bg-page hover:text-ink'
                }`}
              >
                POS Subscription
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('online-orders')}
                className={`flex items-center text-left text-sm transition-all ${
                  activeTab === 'online-orders'
                    ? 'border-l-4 border-primary bg-primary/10 font-bold text-primary py-3.5 pl-4 pr-3'
                    : 'border-l-4 border-transparent py-3.5 pl-4 pr-3 font-medium text-muted hover:bg-page hover:text-ink'
                }`}
              >
                Online Orders Integration
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tally-integration')}
                className={`flex items-center text-left text-sm transition-all ${
                  activeTab === 'tally-integration'
                    ? 'border-l-4 border-primary bg-primary/10 font-bold text-primary py-3.5 pl-4 pr-3'
                    : 'border-l-4 border-transparent py-3.5 pl-4 pr-3 font-medium text-muted hover:bg-page hover:text-ink'
                }`}
              >
                Tally Integration
              </button>
            </nav>
          </div>
        </div>

        {/* Right Form Details Panel */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-xs">
            {/* ONLINE ORDERS INTEGRATION TAB */}
            {activeTab === 'online-orders' && (
              <>
                {/* Platform Header Tabs (Zomato & Swiggy) */}
                <div className="flex border-b border-line bg-page/40 px-6 pt-3">
                  <button
                    type="button"
                    onClick={() => setPlatform('zomato')}
                    className={`flex items-center gap-2.5 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
                      platform === 'zomato'
                        ? 'border-primary text-primary bg-card rounded-t-lg shadow-2xs'
                        : 'border-transparent text-muted hover:text-ink'
                    }`}
                  >
                    <AggregatorMark name="Zomato" />
                    <span>Zomato</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlatform('swiggy')}
                    className={`flex items-center gap-2.5 border-b-2 px-5 py-3 text-sm font-bold transition-all ${
                      platform === 'swiggy'
                        ? 'border-primary text-primary bg-card rounded-t-lg shadow-2xs'
                        : 'border-transparent text-muted hover:text-ink'
                    }`}
                  >
                    <AggregatorMark name="Swiggy" />
                    <span>Swiggy</span>
                  </button>
                </div>

                {/* Sub-Layout: Left Outlets List & Right Zomato/Swiggy Form */}
                <div className="grid grid-cols-1 border-b border-line lg:grid-cols-12">
                  {/* Left Outlet List */}
                  <div className="border-b border-line p-4 lg:col-span-4 lg:border-b-0 lg:border-r bg-page/20">
                    <button
                      type="button"
                      onClick={() => setSelectedOutlet("Annapurna's R...")}
                      className="flex w-full items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-3.5 text-left transition-colors"
                    >
                      <span className="truncate text-sm font-bold text-ink">
                        Annapurna's R...
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        Active
                      </span>
                    </button>
                  </div>

                  {/* Right Form Fields */}
                  <div className="p-6 space-y-6 lg:col-span-8">
                    {/* Header Outlet Code */}
                    <div className="flex flex-wrap items-center justify-between border-b border-line pb-4">
                      <div>
                        {platform === 'zomato' ? (
                          <>
                            <h3 className="text-base font-bold text-ink">
                              Outlet Code : 5sbhwvqj
                            </h3>
                            <p className="text-sm font-medium text-muted mt-0.5">
                              Unique code for each outlet registered on Zomato
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-base font-bold text-ink">
                              Restaurant Code : 5sbhwvqj
                            </h3>
                            <h3 className="text-base font-bold text-ink">
                              Vendor Code : 776370
                            </h3>
                          </>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-muted">
                        Identifier :
                      </span>
                    </div>

                    {/* 1. GST Register Checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-ink select-none">
                      <input
                        type="checkbox"
                        checked={notRegisteredGst}
                        onChange={(e) => setNotRegisteredGst(e.target.checked)}
                        className="size-4 rounded accent-primary cursor-pointer"
                      />
                      <span>Restaurant Is Not Registered Under GST</span>
                    </label>

                    {/* 2. GST Information Note On Bill Print */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-ink">
                        GST Information Note On Bill Print
                      </label>
                      <textarea
                        rows={2}
                        value={gstNote}
                        onChange={(e) => setGstNote(e.target.value)}
                        className="w-full rounded-md border border-line bg-card p-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                      />
                    </div>

                    {/* 3. Order Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-ink">
                        Order Type <span className="text-danger">*</span>
                      </label>
                      {platform === 'zomato' ? (
                        <select
                          value={zomatoOrderType}
                          onChange={(e) => setZomatoOrderType(e.target.value)}
                          className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                        >
                          <option value="Zomato">Zomato</option>
                          <option value="Swiggy">Swiggy</option>
                          <option value="Direct Delivery">Direct Delivery</option>
                        </select>
                      ) : (
                        <select
                          value={swiggyOrderType}
                          onChange={(e) => setSwiggyOrderType(e.target.value)}
                          className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                        >
                          <option value="Swiggy">Swiggy</option>
                          <option value="Zomato">Zomato</option>
                          <option value="Direct Delivery">Direct Delivery</option>
                        </select>
                      )}
                    </div>

                    {/* ZOMATO ONLY: Allow Item Tags */}
                    {platform === 'zomato' && (
                      <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-ink select-none">
                        <input
                          type="checkbox"
                          checked={allowItemTags}
                          onChange={(e) => setAllowItemTags(e.target.checked)}
                          className="size-4 rounded accent-primary cursor-pointer"
                        />
                        <span>
                          Allow Item Tags To Participate In Zomato Campaign
                        </span>
                      </label>
                    )}

                    {/* 4. Commission Rate */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-ink">
                        Commission Rate %
                      </label>
                      <input
                        type="text"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(e.target.value)}
                        className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary"
                      />
                    </div>

                    {/* ZOMATO ONLY: Consider All Discounts */}
                    {platform === 'zomato' && (
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-ink select-none">
                          <input
                            type="checkbox"
                            checked={considerAllDiscounts}
                            onChange={(e) => setConsiderAllDiscounts(e.target.checked)}
                            className="size-4 rounded accent-primary cursor-pointer"
                          />
                          <span>Consider All Discounts</span>
                        </label>
                        <p className="pl-7 text-xs font-medium text-muted">
                          Note:- It will take both zomato and restaurants discounts.
                        </p>
                      </div>
                    )}

                    {/* 5. Do Not Print Bill */}
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-ink select-none">
                      <input
                        type="checkbox"
                        checked={doNotPrintBill}
                        onChange={(e) => setDoNotPrintBill(e.target.checked)}
                        className="size-4 rounded accent-primary cursor-pointer"
                      />
                      <span>Do Not Print Bill</span>
                    </label>

                    {/* 6. Do Not Print Kot */}
                    <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-ink select-none">
                      <input
                        type="checkbox"
                        checked={doNotPrintKot}
                        onChange={(e) => setDoNotPrintKot(e.target.checked)}
                        className="size-4 rounded accent-primary cursor-pointer"
                      />
                      <span>Do Not Print Kot</span>
                    </label>

                    {/* 7. Do Not Print E-Commerce Operators GST */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-ink select-none">
                        <input
                          type="checkbox"
                          checked={doNotPrintEcommerceGst}
                          onChange={(e) => setDoNotPrintEcommerceGst(e.target.checked)}
                          className="size-4 rounded accent-primary cursor-pointer"
                        />
                        <span>
                          Do Not Print E-Commerce Operators. GST Levied On The Bills Printed
                        </span>
                      </label>
                      <p className="pl-7 text-xs font-medium text-muted">
                        Note: If Enabled, The GST Amount Deducted By E-Commerce Operators Will Not Be Included In The Invoices Generated.
                      </p>
                    </div>

                    {/* 8. Enable auto mark food ready Box */}
                    <div className="space-y-4 rounded-xl border border-line bg-page/40 p-4 sm:p-5">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={enableAutoFoodReady}
                          onChange={(e) => setEnableAutoFoodReady(e.target.checked)}
                          className="mt-0.5 size-4 rounded accent-primary cursor-pointer"
                        />
                        <div>
                          <span className="text-sm font-bold text-ink block">
                            Enable auto mark food ready
                          </span>
                          <span className="text-xs font-medium text-muted mt-0.5 block">
                            Recommended specifically for restaurants with pre-packed or fast-packing items only.
                          </span>
                        </div>
                      </label>

                      {/* Nested Order Packing Checklist */}
                      <div className="rounded-xl border border-line bg-card p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-bold text-ink">
                            <Shield size={18} className="text-primary" />
                            <span>Order Packing Checklist</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPackingChecklist(!packingChecklist)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${
                              packingChecklist ? 'bg-primary' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 size-4 rounded-full bg-white transition-transform ${
                                packingChecklist ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-xs font-medium text-muted leading-relaxed">
                          Ensure no items are missed while packing. Staff must confirm each item via checklist before marking order as "Food Ready".
                        </p>
                        <div className="flex items-start gap-2 text-xs font-medium text-ink bg-page p-3 rounded-lg border border-line">
                          <Info size={16} className="shrink-0 text-muted mt-0.5" />
                          <span>
                            When enabled, Auto Food Ready will not work for these orders. Orders must be manually marked ready after checklist completion.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ZOMATO ONLY: Packaging Charge Applicable On / Type */}
                    {platform === 'zomato' && (
                      <>
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-ink">
                            Packaging Charge Applicable On
                          </label>
                          <div className="flex flex-wrap items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="radio"
                                name="pkg-app"
                                checked={packagingApplicableOn === 'item'}
                                onChange={() => setPackagingApplicableOn('item')}
                                className="size-4 accent-primary cursor-pointer"
                              />
                              <span>Item</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="radio"
                                name="pkg-app"
                                checked={packagingApplicableOn === 'order'}
                                onChange={() => setPackagingApplicableOn('order')}
                                className="size-4 accent-primary cursor-pointer"
                              />
                              <span>Order</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="radio"
                                name="pkg-app"
                                checked={packagingApplicableOn === 'none'}
                                onChange={() => setPackagingApplicableOn('none')}
                                className="size-4 accent-primary cursor-pointer"
                              />
                              <span>None</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-ink">
                            Packaging Charge Type <span className="text-danger">*</span>
                          </label>
                          <div className="flex flex-wrap items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="radio"
                                name="pkg-type"
                                checked={packagingChargeType === 'item'}
                                onChange={() => setPackagingChargeType('item')}
                                className="size-4 accent-primary cursor-pointer"
                              />
                              <span>Consider from item</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="radio"
                                name="pkg-type"
                                checked={packagingChargeType === 'fixed'}
                                onChange={() => setPackagingChargeType('fixed')}
                                className="size-4 accent-primary cursor-pointer"
                              />
                              <span>Fixed</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="radio"
                                name="pkg-type"
                                checked={packagingChargeType === 'percentage'}
                                onChange={() => setPackagingChargeType('percentage')}
                                className="size-4 accent-primary cursor-pointer"
                              />
                              <span>Percentage</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="radio"
                                name="pkg-type"
                                checked={packagingChargeType === 'slabwise'}
                                onChange={() => setPackagingChargeType('slabwise')}
                                className="size-4 accent-primary cursor-pointer"
                              />
                              <span>Packing charge Slabwise Strictly</span>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 9. Auto Accept Orders Once Arrived */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-ink">
                        Auto Accept Orders Once Arrived
                      </label>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                          <input
                            type="radio"
                            name="auto-accept"
                            checked={autoAcceptOrders === 'on'}
                            onChange={() => setAutoAcceptOrders('on')}
                            className="size-4 accent-primary cursor-pointer"
                          />
                          <span>On</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                          <input
                            type="radio"
                            name="auto-accept"
                            checked={autoAcceptOrders === 'off'}
                            onChange={() => setAutoAcceptOrders('off')}
                            className="size-4 accent-primary cursor-pointer"
                          />
                          <span>Off</span>
                        </label>
                      </div>
                      <p className="text-xs font-medium text-muted leading-relaxed">
                        Note : Make sure, your KOT printer is assigned properly while enabling auto accept flag. If not, this will result into queuing of the KOT print. Change in auto accept flag will take a minute to get reflect once changed.
                      </p>
                    </div>

                    {/* 10. Auto Accept Timing */}
                    <div className="space-y-3 rounded-xl border border-line p-4 sm:p-5">
                      <div className="flex items-center justify-between border-b border-line pb-3">
                        <h4 className="text-sm font-bold text-ink">Auto Accept Timing</h4>
                        <OutlineButton variant="primary" onClick={addTimingRow}>
                          <Plus size={15} />
                          <span>Add new</span>
                        </OutlineButton>
                      </div>

                      <div className="space-y-3">
                        {(platform === 'zomato' ? zomatoTimings : swiggyTimings).map(
                          (timing) => (
                            <div
                              key={timing.id}
                              className="flex flex-wrap items-center gap-4 rounded-lg bg-page/60 p-3.5"
                            >
                              <label className="flex-1 text-sm font-semibold text-muted">
                                From <span className="text-danger">*</span>
                                <select
                                  value={timing.from}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    if (platform === 'zomato') {
                                      setZomatoTimings((prev) =>
                                        prev.map((t) =>
                                          t.id === timing.id
                                            ? { ...t, from: val }
                                            : t,
                                        ),
                                      )
                                    } else {
                                      setSwiggyTimings((prev) =>
                                        prev.map((t) =>
                                          t.id === timing.id
                                            ? { ...t, from: val }
                                            : t,
                                        ),
                                      )
                                    }
                                  }}
                                  className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
                                >
                                  <option value="00:00">00:00</option>
                                  <option value="03:30">03:30</option>
                                  <option value="06:00">06:00</option>
                                  <option value="12:00">12:00</option>
                                  <option value="18:00">18:00</option>
                                </select>
                              </label>

                              <label className="flex-1 text-sm font-semibold text-muted">
                                To <span className="text-danger">*</span>
                                <select
                                  value={timing.to}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    if (platform === 'zomato') {
                                      setZomatoTimings((prev) =>
                                        prev.map((t) =>
                                          t.id === timing.id ? { ...t, to: val } : t,
                                        ),
                                      )
                                    } else {
                                      setSwiggyTimings((prev) =>
                                        prev.map((t) =>
                                          t.id === timing.id ? { ...t, to: val } : t,
                                        ),
                                      )
                                    }
                                  }}
                                  className="mt-1 h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
                                >
                                  <option value="24:00">24:00</option>
                                  <option value="09:30">09:30</option>
                                  <option value="12:00">12:00</option>
                                  <option value="18:00">18:00</option>
                                </select>
                              </label>

                              {(platform === 'zomato'
                                ? zomatoTimings.length
                                : swiggyTimings.length) > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => removeTimingRow(timing.id)}
                                  className="mt-6 text-muted hover:text-danger"
                                >
                                  <Trash2 size={18} />
                                </button>
                              ) : null}
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* SWIGGY ONLY: Apply Packaging Charge */}
                    {platform === 'swiggy' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-ink">
                          Apply Packaging Charge
                        </label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                            <input
                              type="radio"
                              name="apply-pkg"
                              checked={applyPackagingCharge === 'no'}
                              onChange={() => setApplyPackagingCharge('no')}
                              className="size-4 accent-primary cursor-pointer"
                            />
                            <span>No</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                            <input
                              type="radio"
                              name="apply-pkg"
                              checked={applyPackagingCharge === 'yes'}
                              onChange={() => setApplyPackagingCharge('yes')}
                              className="size-4 accent-primary cursor-pointer"
                            />
                            <span>Yes</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* SWIGGY ONLY: Change Status On Swiggy Container */}
                    {platform === 'swiggy' && (
                      <div className="rounded-xl border border-line bg-card p-5 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between border-b border-line pb-3">
                          <h4 className="text-sm font-bold text-ink">
                            Change Status On Swiggy
                          </h4>
                          <OutlineButton
                            variant="gray"
                            onClick={() => showToast('Updating Swiggy status…')}
                          >
                            <span>Update Status</span>
                          </OutlineButton>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-ink">
                            Change The Status To Mark Your Restaurant Status On Swiggy
                          </label>
                          <div className="space-y-2 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="radio"
                                name="swiggy-deliv-status"
                                checked={swiggyDeliveryStatus === 'open'}
                                onChange={() => setSwiggyDeliveryStatus('open')}
                                className="size-4 accent-primary cursor-pointer"
                              />
                              <span>Open for Delivery</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="radio"
                                name="swiggy-deliv-status"
                                checked={swiggyDeliveryStatus === 'closed'}
                                onChange={() => setSwiggyDeliveryStatus('closed')}
                                className="size-4 accent-primary cursor-pointer"
                              />
                              <span>Closed for Delivery</span>
                            </label>
                          </div>
                          <p className="text-xs font-medium text-muted leading-relaxed pt-1">
                            NOTE Select the above option to change the availability for Swiggy Online Order acceptance. If you select 'Closed for Delivery' will change the Swiggy status as 'Closed' so you won't get any online order from Swiggy for today
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SWIGGY ONLY: Change Opening Timing On Swiggy */}
                    {platform === 'swiggy' && (
                      <div className="flex items-center justify-between rounded-xl border border-line bg-page/40 p-4">
                        <span className="text-sm font-bold text-ink">
                          Change Opening Timing On Swiggy
                        </span>
                        <OutlineButton
                          variant="gray"
                          onClick={() => showToast('Checking opening timing status…')}
                        >
                          <span>Check Status</span>
                        </OutlineButton>
                      </div>
                    )}

                    {/* SWIGGY ONLY: Self Delivery Box */}
                    {platform === 'swiggy' && (
                      <div className="rounded-xl border border-line bg-card p-5 space-y-4 shadow-xs">
                        <h4 className="text-sm font-bold text-ink border-b border-line pb-3">
                          Self Delivery
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-ink">
                            Enable Self Delivery
                          </span>
                          <button
                            type="button"
                            onClick={() => setEnableSelfDelivery(!enableSelfDelivery)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${
                              enableSelfDelivery ? 'bg-primary' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`absolute top-1 left-1 size-4 rounded-full bg-white transition-transform ${
                                enableSelfDelivery ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ZOMATO ONLY: Paneer/Cheese & Action Cards */}
                    {platform === 'zomato' && (
                      <>
                        <div className="space-y-2">
                          <label className="block text-sm font-bold text-ink">
                            Paneer/Cheese Declaration Configuration
                          </label>
                          <div className="flex flex-wrap items-center gap-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="checkbox"
                                checked={naturalPaneer}
                                onChange={(e) => setNaturalPaneer(e.target.checked)}
                                className="size-4 rounded accent-primary cursor-pointer"
                              />
                              <span>Natural (Paneer / Cheese)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="checkbox"
                                checked={analoguePaneer}
                                onChange={(e) => setAnaloguePaneer(e.target.checked)}
                                className="size-4 rounded accent-primary cursor-pointer"
                              />
                              <span>Analogue Paneer</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                              <input
                                type="checkbox"
                                checked={analogueCheese}
                                onChange={(e) => setAnalogueCheese(e.target.checked)}
                                className="size-4 rounded accent-primary cursor-pointer"
                              />
                              <span>Analogue Cheese</span>
                            </label>
                          </div>
                          <p className="text-xs font-medium text-muted leading-relaxed">
                            Note : As per government guidelines, restaurants using paneer or cheese must declare whether the product used is Regular (Dairy) or Analogue before pushing the menu to Zomato.
                          </p>
                        </div>

                        <div className="space-y-3 pt-2">
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
                              className="flex items-center justify-between rounded-xl border border-line bg-page/40 p-4"
                            >
                              <span className="text-sm font-bold text-ink">
                                {actionTitle}
                              </span>
                              <OutlineButton
                                variant="gray"
                                onClick={() => showToast(`Checking status for ${actionTitle}…`)}
                              >
                                <span>Check Status</span>
                              </OutlineButton>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* POS SUBSCRIPTION TAB */}
            {activeTab === 'pos-subscription' && (
              <div className="p-6 space-y-6 flex-1">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-ink">
                    How Would You Like To Send The Ebill Messages To You Customers?
                  </label>
                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                      <input
                        type="radio"
                        name="ebill-type-pos"
                        checked={messageType === 'text'}
                        onChange={() => setMessageType('text')}
                        className="size-4 cursor-pointer accent-primary"
                      />
                      <span>Text message</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-ink select-none">
                      <input
                        type="radio"
                        name="ebill-type-pos"
                        checked={messageType === 'whatsapp'}
                        onChange={() => setMessageType('whatsapp')}
                        className="size-4 cursor-pointer accent-primary"
                      />
                      <span>WhatsApp Message</span>
                    </label>
                  </div>
                  <p className="text-xs text-muted font-medium pt-1">
                    [Note: This configuration would not work if you have an active WhatsApp campaign or Green Receipt to send the ebill to customers.]
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-ink">
                    Provide No. Of Days To Set As POS Subscription Link Expiry Time.
                  </label>
                  <input
                    type="text"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="h-10 w-full max-w-xl rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
                  />
                  <p className="text-xs text-muted font-medium">
                    [Mentioning " 0 " days will consider as Link will not to expire ever.]
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-ink">
                    Sender ID
                  </label>
                  <input
                    type="text"
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder=""
                    className="h-10 w-full max-w-xl rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary"
                  />
                  <p className="text-xs text-muted font-medium max-w-xl">
                    [Enter your 6 characters Sender ID. The sender ID is the name of the eBill sender which will display on the customer's phone eg. DM-PPOOJA or MD-PTPOOJ.]
                  </p>
                </div>
              </div>
            )}

            {/* TALLY INTEGRATION TAB */}
            {activeTab === 'tally-integration' && (
              <div className="p-6 space-y-5 flex-1">
                <h3 className="text-sm font-bold text-ink">Active Plan</h3>

                <div className="overflow-hidden rounded-xl border border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-sky-50/50 border-b border-line text-xs font-bold text-ink">
                      <tr>
                        <th className="px-4 py-3 font-bold w-24">Sr No.</th>
                        <th className="px-4 py-3 font-bold">Plan</th>
                        <th className="px-4 py-3 font-bold">Range</th>
                        <th className="px-4 py-3 font-bold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line bg-card">
                      <tr>
                        <td className="px-4 py-3 font-semibold text-ink">1</td>
                        <td className="px-4 py-3 font-semibold text-ink">Custom plan</td>
                        <td className="px-4 py-3 font-semibold text-ink">16 Mar 2024 To 4 Aug 2024</td>
                        <td className="px-4 py-3 text-ink"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom Action Footer Bar */}
            {activeTab !== 'tally-integration' && (
              <div className="flex items-center justify-end border-t border-line bg-page p-4">
                <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </ReportsPageShell>
  )
}
