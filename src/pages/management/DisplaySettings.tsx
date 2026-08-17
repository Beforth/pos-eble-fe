import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'
const selectClass = inputClass

const PAYMENT_OPTIONS = [
  'Cash',
  'Card',
  'Due',
  'UPI',
  'Other',
  'Part Payment',
  'Not Paid',
]

const ORDER_TYPES = ['Delivery', 'Pick Up', 'Dine In'] as const

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4 border-b border-line pb-8 last:border-b-0 last:pb-0">
      <div>
        <h2 className="text-base font-bold text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function FormRow({
  label,
  required,
  children,
  align = 'start',
}: {
  label: string
  required?: boolean
  children: ReactNode
  align?: 'start' | 'center'
}) {
  return (
    <div
      className={`grid gap-2 sm:grid-cols-[260px_minmax(0,1fr)] sm:gap-4 ${
        align === 'center' ? 'sm:items-center' : 'sm:items-start'
      }`}
    >
      <div className="text-sm font-medium text-ink sm:pt-2">
        {label} {required ? <span className="text-primary">*</span> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function Help({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>
}

function RadioGroup({
  name,
  value,
  options,
  onChange,
}: {
  name: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {options.map((option) => (
        <label
          key={option}
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
        >
          <input
            type="radio"
            name={name}
            checked={value === option}
            onChange={() => onChange(option)}
            className="size-4 cursor-pointer accent-primary"
          />
          {option}
        </label>
      ))}
    </div>
  )
}

function CheckRow({
  checked,
  onChange,
  label,
  help,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  help?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
      />
      <span>
        <span className="font-medium">{label}</span>
        {help ? <Help>{help}</Help> : null}
      </span>
    </label>
  )
}

function ReasonFields({
  labelPrefix,
  values,
  onChange,
}: {
  labelPrefix: string
  values: string[]
  onChange: (index: number, value: string) => void
}) {
  return (
    <div className="space-y-3">
      {values.map((value, index) => (
        <label key={`${labelPrefix}-${index}`} className="block text-sm text-ink">
          <span className="font-medium">
            {labelPrefix} {index + 1}
            {index === 0 ? ' :' : ' :'}
          </span>
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(index, event.target.value)}
            className={`${inputClass} mt-1.5`}
          />
        </label>
      ))}
    </div>
  )
}

export default function DisplaySettings() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const [layout, setLayout] = useState('Touch Screen')
  const [menuSide, setMenuSide] = useState('On the Left')
  const [defaultScreen, setDefaultScreen] = useState('Billing')
  const [orderLiveView, setOrderLiveView] = useState('Descending')
  const [kotLiveView, setKotLiveView] = useState('Ascending')
  const [addItemPosition, setAddItemPosition] = useState('In Bottom')

  const [virtualKeyboard, setVirtualKeyboard] = useState(true)
  const [vkOrderNumber, setVkOrderNumber] = useState(true)
  const [itemImages, setItemImages] = useState(false)
  const [autoAddItems, setAutoAddItems] = useState(true)
  const [vkShortCode, setVkShortCode] = useState(false)
  const [autoAddVariation, setAutoAddVariation] = useState(false)
  const [displaySearch, setDisplaySearch] = useState(true)
  const [addonMinMax, setAddonMinMax] = useState(false)
  const [displayItemPrice, setDisplayItemPrice] = useState(true)
  const [displaySettleAmount, setDisplaySettleAmount] = useState(true)
  const [settleMandatory, setSettleMandatory] = useState(false)
  const [allowLowerSettle, setAllowLowerSettle] = useState(true)

  const [showTip, setShowTip] = useState(true)
  const [tipSelection, setTipSelection] = useState('None')
  const [tipValue, setTipValue] = useState('')
  const [tipCalcOn, setTipCalcOn] = useState('Total (Total Bill Value)')

  const [showCwt, setShowCwt] = useState(true)
  const [taxAreaOpen, setTaxAreaOpen] = useState(false)
  const [showKotDetails, setShowKotDetails] = useState(true)
  const [mergeEbill, setMergeEbill] = useState(false)
  const [personsMandatory, setPersonsMandatory] = useState(false)
  const [showAddonQty, setShowAddonQty] = useState(true)
  const [printerErrors, setPrinterErrors] = useState(true)
  const [customPaymentMandatory, setCustomPaymentMandatory] = useState(false)
  const [noDecimalQty, setNoDecimalQty] = useState(false)
  const [categoryScheduling, setCategoryScheduling] = useState(false)
  const [suggestedItems, setSuggestedItems] = useState(true)

  const [assignValidation, setAssignValidation] = useState<string[]>([])
  const [markCompleted, setMarkCompleted] = useState<string[]>(['Dine In'])

  const [itemSorting, setItemSorting] = useState('A-Z')
  const [showTableStartBy, setShowTableStartBy] = useState(false)
  const [displayMenu, setDisplayMenu] = useState('None')
  const [openEditAfterPrint, setOpenEditAfterPrint] = useState(false)
  const [orderTypeSelection, setOrderTypeSelection] = useState<string[]>([])
  const [autoOpenSettlement, setAutoOpenSettlement] = useState(false)

  const [defaultOrderType, setDefaultOrderType] = useState('DINE IN')
  const [defaultPaymentType, setDefaultPaymentType] = useState('Other')
  const [defaultCustomPayment, setDefaultCustomPayment] = useState('UPI')
  const [defaultTableNo, setDefaultTableNo] = useState('')
  const [pettyCash, setPettyCash] = useState('2000')
  const [itemQuantityPresets, setItemQuantityPresets] = useState('1,2,3,5,10')
  const [itemPricePresets, setItemPricePresets] = useState('5,10,25,50,100')
  const [defaultQuantity, setDefaultQuantity] = useState('1')
  const [finalizeOrder, setFinalizeOrder] = useState(false)

  const [payOpt1, setPayOpt1] = useState('Cash')
  const [payOpt2, setPayOpt2] = useState('Card')
  const [payOpt3, setPayOpt3] = useState('Due')
  const [payOpt4, setPayOpt4] = useState('Other')

  const [deliveryName, setDeliveryName] = useState('PARCEL')
  const [deliveryEnabled, setDeliveryEnabled] = useState(true)
  const [pickupName, setPickupName] = useState('DINE IN')
  const [pickupEnabled, setPickupEnabled] = useState(true)
  const [dineInName, setDineInName] = useState('Dine In')
  const [dineInEnabled, setDineInEnabled] = useState(true)
  const [extraSectionEnabled, setExtraSectionEnabled] = useState(false)

  const [lockActiveTable, setLockActiveTable] = useState('Save & Print')
  const [releaseTableOn, setReleaseTableOn] = useState('Settle & Save')
  const [releaseSectionOn, setReleaseSectionOn] = useState('Settle & Save')

  const [discountLabel, setDiscountLabel] = useState('Coupon Code')
  const [discountButtonText, setDiscountButtonText] = useState('Apply')
  const [showLeaveNoDiscount, setShowLeaveNoDiscount] = useState(true)
  const [discountAreaOpen, setDiscountAreaOpen] = useState(false)
  const [orderWiseInfo, setOrderWiseInfo] = useState(false)

  const [negativeQtyReason, setNegativeQtyReason] = useState('')
  const [allowNegativeQty, setAllowNegativeQty] = useState(false)

  const [cancelReasons, setCancelReasons] = useState(['', '', '', ''])
  const [releaseKotsOnCancel, setReleaseKotsOnCancel] = useState(false)
  const [cancelOtpEmails, setCancelOtpEmails] = useState('')

  const [editReasons, setEditReasons] = useState(['', '', '', ''])
  const [editOtpEmails, setEditOtpEmails] = useState('')

  const [compReasons, setCompReasons] = useState(['', '', '', ''])
  const [compOtpEmails, setCompOtpEmails] = useState('')

  const [returnReasons, setReturnReasons] = useState(['', '', '', ''])
  const [returnOtpEmails, setReturnOtpEmails] = useState('')

  const [settlementReasonRequired, setSettlementReasonRequired] =
    useState(false)
  const [specialDiscountOtp, setSpecialDiscountOtp] = useState('')

  const [ncReasons, setNcReasons] = useState(['', '', '', ''])
  const [kotCancelReasons, setKotCancelReasons] = useState(['', '', '', ''])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function toggleList(
    list: string[],
    value: string,
    setter: (next: string[]) => void,
  ) {
    setter(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value],
    )
  }

  function updateReasons(
    setter: (next: string[]) => void,
    values: string[],
    index: number,
    value: string,
  ) {
    const next = [...values]
    next[index] = value
    setter(next)
  }

  function handleSave() {
    if (!discountButtonText.trim()) {
      showToast('Discount Calculate Button Text is required')
      return
    }
    if (deliveryEnabled && !deliveryName.trim()) {
      showToast('Delivery name is required')
      return
    }
    showToast('Display settings saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell title="Outlet Configuration" activeItem="config-outlet">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        The following settings can be used to configure the billing screen and
        its components.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-8 p-5 sm:p-6">
          <Section
            title="Display Settings"
            description="The following setting defines the default value for the components of billing screen."
          >
            <FormRow label="Layout for Billing Screen">
              <RadioGroup
                name="layout"
                value={layout}
                options={['Keyboard', 'Touch Screen']}
                onChange={setLayout}
              />
              <Help>
                Configure the type of display between a touch based or keyboard
                based.
              </Help>
            </FormRow>

            <FormRow label="Display preference for the Menu">
              <RadioGroup
                name="menu-side"
                value={menuSide}
                options={['On the Left', 'On the Right']}
                onChange={setMenuSide}
              />
              <Help>Note: Only for Touch Screen</Help>
            </FormRow>

            <FormRow label="Default Screen to Display">
              <RadioGroup
                name="default-screen"
                value={defaultScreen}
                options={['Billing', 'Table Management']}
                onChange={setDefaultScreen}
              />
              <Help>
                Choose which Layout to get display while opening the POS.
              </Help>
            </FormRow>

            <FormRow label="Order Live View">
              <RadioGroup
                name="order-live"
                value={orderLiveView}
                options={['Ascending', 'Descending']}
                onChange={setOrderLiveView}
              />
              <Help>
                This settings describe how would the orders be displayed in
                Order live view.
              </Help>
            </FormRow>

            <FormRow label="KOT Live View">
              <RadioGroup
                name="kot-live"
                value={kotLiveView}
                options={['Ascending', 'Descending']}
                onChange={setKotLiveView}
              />
              <Help>
                This settings describe how would the orders be displayed in KOT
                live view.
              </Help>
            </FormRow>

            <FormRow label="Add New Item In Cart">
              <RadioGroup
                name="add-item"
                value={addItemPosition}
                options={['In Bottom', 'On Top']}
                onChange={setAddItemPosition}
              />
            </FormRow>
          </Section>

          <Section title="Billing Display Settings">
            <div className="space-y-3">
              <CheckRow
                checked={virtualKeyboard}
                onChange={setVirtualKeyboard}
                label="Enable virtual keyboard in touch"
              />
              <CheckRow
                checked={vkOrderNumber}
                onChange={setVkOrderNumber}
                label="Open virtual keyboard while entering order number in online order food ready text box"
              />
              <CheckRow
                checked={itemImages}
                onChange={setItemImages}
                label="Display item images on the billing screen"
              />
              <CheckRow
                checked={autoAddItems}
                onChange={setAutoAddItems}
                label="Auto add items to billing screen on select"
              />
              <CheckRow
                checked={vkShortCode}
                onChange={setVkShortCode}
                label="Open virtual keyboard for short code search on billing screen"
                help="Only applicable when virtual keyboard is enabled."
              />
              <CheckRow
                checked={autoAddVariation}
                onChange={setAutoAddVariation}
                label="Auto add items to billing screen from variation/addon popup"
              />
              <CheckRow
                checked={displaySearch}
                onChange={setDisplaySearch}
                label="Display Search Item option on billing screen (Only for Touch view)"
              />
              <CheckRow
                checked={addonMinMax}
                onChange={setAddonMinMax}
                label="Addon Min-Max Validation"
              />
              <CheckRow
                checked={displayItemPrice}
                onChange={setDisplayItemPrice}
                label="Display item price"
              />
              <CheckRow
                checked={displaySettleAmount}
                onChange={setDisplaySettleAmount}
                label="Display settle amount Textbox"
              />
              <CheckRow
                checked={settleMandatory}
                onChange={setSettleMandatory}
                label="Make settlement amount mandatory"
                help="Applicable for billers with settlement rights."
              />
              <CheckRow
                checked={allowLowerSettle}
                onChange={setAllowLowerSettle}
                label="Allow user to settle an order with a lower amount"
              />
            </div>
          </Section>

          <Section title="Tip Configuration">
            <CheckRow checked={showTip} onChange={setShowTip} label="Show Tip" />
            <FormRow label="Set Tip selection as">
              <RadioGroup
                name="tip-selection"
                value={tipSelection}
                options={['None', 'Percentage', 'Fixed']}
                onChange={setTipSelection}
              />
              <Help>For customer tip selection in a Kiosk.</Help>
            </FormRow>
            <FormRow label="Set Tip value">
              <input
                type="text"
                value={tipValue}
                onChange={(event) => setTipValue(event.target.value)}
                className={inputClass}
                placeholder="Comma separated values"
              />
            </FormRow>
            <FormRow label="Tip calculation on">
              <RadioGroup
                name="tip-calc"
                value={tipCalcOn}
                options={['Core (Sub Total)', 'Total (Total Bill Value)']}
                onChange={setTipCalcOn}
              />
            </FormRow>
          </Section>

          <Section title="Display & Printing Preferences">
            <div className="space-y-3">
              <CheckRow
                checked={showCwt}
                onChange={setShowCwt}
                label="Show CWT (Category Wise Taxes) Bifurcation On Billing Screen"
              />
              <CheckRow
                checked={taxAreaOpen}
                onChange={setTaxAreaOpen}
                label="By default make tax area open"
                help="Enables default display of the tax area on the billing screen."
              />
              <CheckRow
                checked={showKotDetails}
                onChange={setShowKotDetails}
                label="Show KOT details (KOT ID and Time) while View/Merge KOT"
              />
              <CheckRow
                checked={mergeEbill}
                onChange={setMergeEbill}
                label="Merge ebill and print bill"
                help="Sends an e-bill when the bill is printed."
              />
              <CheckRow
                checked={personsMandatory}
                onChange={setPersonsMandatory}
                label="No. of Persons Mandatory"
              />
              <CheckRow
                checked={showAddonQty}
                onChange={setShowAddonQty}
                label="Show Addon Quantity with the total item quantity (multiplication) to prepare in Bill"
              />
              <CheckRow
                checked={printerErrors}
                onChange={setPrinterErrors}
                label="Display errors while checking printer status"
              />
              <CheckRow
                checked={customPaymentMandatory}
                onChange={setCustomPaymentMandatory}
                label="Custom Payment Information Mandatory"
              />
              <CheckRow
                checked={noDecimalQty}
                onChange={setNoDecimalQty}
                label="Do not allow the biller to punch item quantity in decimal"
              />
              <CheckRow
                checked={categoryScheduling}
                onChange={setCategoryScheduling}
                label="Consider category scheduling for offline billing"
              />
              <CheckRow
                checked={suggestedItems}
                onChange={setSuggestedItems}
                label="Show suggested items against the item selected on billing"
              />
            </div>

            <FormRow label="Assign to validation on billing screen" align="start">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {ORDER_TYPES.map((type) => (
                  <label
                    key={type}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={assignValidation.includes(type)}
                      onChange={() =>
                        toggleList(assignValidation, type, setAssignValidation)
                      }
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </FormRow>

            <FormRow
              label="Mark Order and KOT as completed once the bill is settled"
              align="start"
            >
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {ORDER_TYPES.map((type) => (
                  <label
                    key={type}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={markCompleted.includes(type)}
                      onChange={() =>
                        toggleList(markCompleted, type, setMarkCompleted)
                      }
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </FormRow>

            <FormRow label="Item Sorting">
              <select
                value={itemSorting}
                onChange={(event) => setItemSorting(event.target.value)}
                className={selectClass}
              >
                {['A-Z', 'Z-A', 'Category', 'Custom'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormRow>

            <div className="space-y-3">
              <CheckRow
                checked={showTableStartBy}
                onChange={setShowTableStartBy}
                label="Show table start by / bill created by information on billing screen (Touch Screen)"
              />
            </div>

            <FormRow label="Display Menu">
              <RadioGroup
                name="display-menu"
                value={displayMenu}
                options={['None', 'Group Wise']}
                onChange={setDisplayMenu}
              />
            </FormRow>

            <div className="space-y-3">
              <CheckRow
                checked={openEditAfterPrint}
                onChange={setOpenEditAfterPrint}
                label="Open order in Edit Mode after Save & Print (Everytime)"
              />
            </div>

            <FormRow label="Order Type Selection" align="start">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {ORDER_TYPES.map((type) => (
                  <label
                    key={type}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={orderTypeSelection.includes(type)}
                      onChange={() =>
                        toggleList(
                          orderTypeSelection,
                          type,
                          setOrderTypeSelection,
                        )
                      }
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </FormRow>

            <CheckRow
              checked={autoOpenSettlement}
              onChange={setAutoOpenSettlement}
              label="Auto Open Settlement Popup"
            />
          </Section>

          <Section title="Default Values">
            <FormRow label="Default Order Type">
              <select
                value={defaultOrderType}
                onChange={(event) => setDefaultOrderType(event.target.value)}
                className={selectClass}
              >
                {['DINE IN', 'Delivery', 'Pick Up', 'Takeaway'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Default Payment Type">
              <select
                value={defaultPaymentType}
                onChange={(event) => setDefaultPaymentType(event.target.value)}
                className={selectClass}
              >
                {PAYMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Default Custom Payment Type">
              <select
                value={defaultCustomPayment}
                onChange={(event) =>
                  setDefaultCustomPayment(event.target.value)
                }
                className={selectClass}
              >
                {['UPI', 'HDFC UPI', 'Card', 'Other'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Default Table No.">
              <input
                type="text"
                value={defaultTableNo}
                onChange={(event) => setDefaultTableNo(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <FormRow label={`Default Petty Cash Amount (${brand.currency})`}>
              <input
                type="text"
                value={pettyCash}
                onChange={(event) => setPettyCash(event.target.value)}
                className={inputClass}
              />
              <Help>
                This would be the amount of petty cash that would be populated
                unless another amount is entered.
              </Help>
            </FormRow>
            <FormRow label="Item Quantity">
              <input
                type="text"
                value={itemQuantityPresets}
                onChange={(event) => setItemQuantityPresets(event.target.value)}
                className={inputClass}
              />
              <Help>(Comma separated numeric values only.)</Help>
            </FormRow>
            <FormRow label="Item Price">
              <input
                type="text"
                value={itemPricePresets}
                onChange={(event) => setItemPricePresets(event.target.value)}
                className={inputClass}
              />
              <Help>(Comma separated numeric values only.)</Help>
            </FormRow>
            <FormRow label="Default Quantity">
              <input
                type="text"
                value={defaultQuantity}
                onChange={(event) => setDefaultQuantity(event.target.value)}
                className={inputClass}
              />
              <Help>
                Default Quantity while adding item to cart. Leave it blank if
                the quantity would be entered manually by the user (In Keyboard
                Layout).
              </Help>
            </FormRow>
            <CheckRow
              checked={finalizeOrder}
              onChange={setFinalizeOrder}
              label="Finalize Order"
            />
          </Section>

          <Section
            title="Payment Options In Billing Screen"
            description="The selected payment options would be displayed by default in the billing screen, the remaining payment options would be displayed by clicking More."
          >
            {([
              ['Payment Option 1', payOpt1, setPayOpt1],
              ['Payment Option 2', payOpt2, setPayOpt2],
              ['Payment Option 3', payOpt3, setPayOpt3],
              ['Payment Option 4', payOpt4, setPayOpt4],
            ] as const).map(([label, value, setter]) => (
              <FormRow key={label} label={label}>
                <select
                  value={value}
                  onChange={(event) => setter(event.target.value)}
                  className={selectClass}
                >
                  {PAYMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FormRow>
            ))}
          </Section>

          <Section
            title="Section Configuration"
            description="The following settings are used to configure the settings related to different sections of the billing screen."
          >
            <FormRow label="Delivery" required>
              <input
                type="text"
                value={deliveryName}
                onChange={(event) => setDeliveryName(event.target.value)}
                className={inputClass}
              />
              <Help>
                Above name will be reflected on the billing screen in place of
                Home Delivery. Best seen with 8 characters.
              </Help>
              <div className="mt-2">
                <CheckRow
                  checked={deliveryEnabled}
                  onChange={setDeliveryEnabled}
                  label="Enable this option in the billing screen"
                />
              </div>
            </FormRow>

            <FormRow label="Pick Up" required>
              <input
                type="text"
                value={pickupName}
                onChange={(event) => setPickupName(event.target.value)}
                className={inputClass}
              />
              <Help>
                Assign a name to see on the Pickup section. Best seen with 8
                characters.
              </Help>
              <div className="mt-2">
                <CheckRow
                  checked={pickupEnabled}
                  onChange={setPickupEnabled}
                  label="Enable this option in the billing screen"
                />
              </div>
            </FormRow>

            <FormRow label="Dine In" required>
              <input
                type="text"
                value={dineInName}
                onChange={(event) => setDineInName(event.target.value)}
                className={inputClass}
              />
              <Help>
                Assign a name for the Dine In section on the billing UI.
              </Help>
              <div className="mt-2">
                <CheckRow
                  checked={dineInEnabled}
                  onChange={setDineInEnabled}
                  label="Enable this option in the billing screen"
                />
              </div>
            </FormRow>

            <CheckRow
              checked={extraSectionEnabled}
              onChange={setExtraSectionEnabled}
              label="Enable this option in the billing screen"
              help="Additional custom section slot."
            />
          </Section>

          <Section title="Table Settlement">
            <Help>
              Note:- This configuration will only work with 105.1.0.0 and above.
            </Help>
            <FormRow label="Lock Active Table">
              <RadioGroup
                name="lock-table"
                value={lockActiveTable}
                options={['Save & Print', 'Settle & Save', 'None']}
                onChange={setLockActiveTable}
              />
            </FormRow>
            <FormRow label="Release Table On">
              <RadioGroup
                name="release-table"
                value={releaseTableOn}
                options={['Print Bill', 'Settle & Save']}
                onChange={setReleaseTableOn}
              />
            </FormRow>
            <FormRow label="Release Recent Section On">
              <RadioGroup
                name="release-section"
                value={releaseSectionOn}
                options={['Print Bill', 'Settle & Save']}
                onChange={setReleaseSectionOn}
              />
            </FormRow>
          </Section>

          <Section title="Discount Section">
            <FormRow label="Discount Label">
              <input
                type="text"
                value={discountLabel}
                onChange={(event) => setDiscountLabel(event.target.value)}
                className={inputClass}
              />
              <Help>
                This setting would describe what the discount would be displayed
                as.
              </Help>
            </FormRow>
            <FormRow label="Discount Calculate Button Text" required>
              <input
                type="text"
                value={discountButtonText}
                onChange={(event) => setDiscountButtonText(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <div className="space-y-3">
              <CheckRow
                checked={showLeaveNoDiscount}
                onChange={setShowLeaveNoDiscount}
                label="Display 'Leave as it is. (No Discount)' on Discount Screen?"
              />
              <CheckRow
                checked={discountAreaOpen}
                onChange={setDiscountAreaOpen}
                label="By default make discount area open"
                help="This settings enables default display of discount area in billing screen."
              />
            </div>
          </Section>

          <Section title="Order Wise Information">
            <CheckRow
              checked={orderWiseInfo}
              onChange={setOrderWiseInfo}
              label="Enable Order wise information"
              help="Configure how order-specific info is captured."
            />
          </Section>

          <Section title="Negative Quantity Settings">
            <FormRow label="Negative Quantity Reason">
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  value={negativeQtyReason}
                  onChange={(event) => setNegativeQtyReason(event.target.value)}
                  className={`${inputClass} max-w-md flex-1`}
                />
                <PrimaryButton
                  onClick={() => {
                    if (!negativeQtyReason.trim()) {
                      showToast('Enter a reason first')
                      return
                    }
                    showToast('Negative quantity reason added')
                    setNegativeQtyReason('')
                  }}
                >
                  Add
                </PrimaryButton>
              </div>
            </FormRow>
            <CheckRow
              checked={allowNegativeQty}
              onChange={setAllowNegativeQty}
              label="Allow negative quantity."
            />
          </Section>

          <Section
            title="Order Cancel Reason Settings"
            description="The following settings pertains to configuring the order cancel settings in the billing screen."
          >
            <ReasonFields
              labelPrefix="Order Cancel Reason"
              values={cancelReasons}
              onChange={(index, value) =>
                updateReasons(setCancelReasons, cancelReasons, index, value)
              }
            />
            <CheckRow
              checked={releaseKotsOnCancel}
              onChange={setReleaseKotsOnCancel}
              label="Show Biller an option to release used KOTs while cancelling a bill. (within same day KOTs only.) (So, biller can create new Bill using the older KOTs.)"
            />
            <FormRow label="Order Cancel OTP">
              <input
                type="text"
                value={cancelOtpEmails}
                onChange={(event) => setCancelOtpEmails(event.target.value)}
                className={inputClass}
              />
              <Help>
                Enter Email ID through which you will receive OTP while cancel
                order. You can add more than one with , separated.
              </Help>
            </FormRow>
          </Section>

          <Section
            title="Order Edit Reason Settings"
            description="The following settings pertains to configuring the order edit settings in the billing screen"
          >
            <ReasonFields
              labelPrefix="Order edit Reason"
              values={editReasons}
              onChange={(index, value) =>
                updateReasons(setEditReasons, editReasons, index, value)
              }
            />
            <FormRow label="Order edit OTP">
              <input
                type="text"
                value={editOtpEmails}
                onChange={(event) => setEditOtpEmails(event.target.value)}
                className={inputClass}
              />
              <Help>
                Enter Email ID through which you will receive OTP while edit
                order after print. You can add more than one with , separated.
              </Help>
            </FormRow>
          </Section>

          <Section
            title="Order Complimentary Reason Settings"
            description="The following settings pertains to configuring the order complimentary settings in the billing screen."
          >
            <ReasonFields
              labelPrefix="Order complimentary Reason"
              values={compReasons}
              onChange={(index, value) =>
                updateReasons(setCompReasons, compReasons, index, value)
              }
            />
            <FormRow label="Order Complimentary OTP">
              <input
                type="text"
                value={compOtpEmails}
                onChange={(event) => setCompOtpEmails(event.target.value)}
                className={inputClass}
              />
              <Help>
                Enter Email ID through which you will receive OTP while
                complimentary order. You can add more than one with , separated.
              </Help>
            </FormRow>
          </Section>

          <Section
            title="Order Sales Return Reason Settings"
            description="The following settings pertains to configuring the order sales return settings in the billing screen."
          >
            <ReasonFields
              labelPrefix="Order sales return Reason"
              values={returnReasons}
              onChange={(index, value) =>
                updateReasons(setReturnReasons, returnReasons, index, value)
              }
            />
            <FormRow label="Order Sales Return OTP">
              <input
                type="text"
                value={returnOtpEmails}
                onChange={(event) => setReturnOtpEmails(event.target.value)}
                className={inputClass}
              />
              <Help>
                Enter Email ID through which you will receive OTP while sales
                return order. You can add more than one with , separated.
              </Help>
            </FormRow>
          </Section>

          <Section
            title="Lower / Higher Order Settlement Amount Reason Settings"
            description="The following settings pertains to configuring the order settlement settings in the billing screen."
          >
            <CheckRow
              checked={settlementReasonRequired}
              onChange={setSettlementReasonRequired}
              label="Reason for settling order amount other than the invoice total."
            />
          </Section>

          <Section title="Special Order Discount Settings">
            <FormRow label="Special Discount OTP">
              <input
                type="text"
                value={specialDiscountOtp}
                onChange={(event) => setSpecialDiscountOtp(event.target.value)}
                className={inputClass}
              />
              <Help>
                Enter Email ID through which you will receive OTP while Special
                order discount. You can add more than one with , separated.
              </Help>
            </FormRow>
          </Section>

          <Section title="Item price change (NC) Reason Settings">
            <ReasonFields
              labelPrefix="Item price change (NC) Reason"
              values={ncReasons}
              onChange={(index, value) =>
                updateReasons(setNcReasons, ncReasons, index, value)
              }
            />
          </Section>

          <Section
            title="KOT Cancel Reason Settings"
            description="The following settings pertains to configuring the KOT cancel settings in the billing screen."
          >
            <ReasonFields
              labelPrefix="KOT cancel Reason"
              values={kotCancelReasons}
              onChange={(index, value) =>
                updateReasons(
                  setKotCancelReasons,
                  kotCancelReasons,
                  index,
                  value,
                )
              }
            />
          </Section>
        </div>

        <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-line bg-card/95 px-5 py-4 backdrop-blur sm:px-6">
          <OutlineButton variant="gray" onClick={goBack}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </div>
    </ReportsPageShell>
  )
}
