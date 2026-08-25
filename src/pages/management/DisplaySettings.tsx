import { useState } from 'react'
import {
  Armchair,
  BadgePercent,
  Ban,
  CircleDollarSign,
  ClipboardList,
  Gift,
  IndianRupee,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Minus,
  Monitor,
  Pencil,
  Printer,
  Scale,
  Tag,
  Undo2,
  Wallet,
  XCircle,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ConfigBreadcrumb,
  ConfigFormRow,
  ConfigSaveBar,
  ConfigSectionCard,
  MutedHelp,
} from '../../components/management/ConfigSectionCard'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { PrimaryButton } from '../../components/menu/MenuActionButtons'
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
        {help ? <MutedHelp>{help}</MutedHelp> : null}
      </span>
    </label>
  )
}

function CheckboxList({
  options,
  values,
  onToggle,
}: {
  options: readonly string[]
  values: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {options.map((option) => (
        <label
          key={option}
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
        >
          <input
            type="checkbox"
            checked={values.includes(option)}
            onChange={() => onToggle(option)}
            className="size-4 cursor-pointer accent-primary"
          />
          {option}
        </label>
      ))}
    </div>
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
    <ReportsPageShell title={<ConfigBreadcrumb onNavigate={goBack} current="Display" />} activeItem="config-outlet">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        The following settings can be used to configure the billing screen and
        its components.
      </p>

      <ConfigSectionCard
        icon={<LayoutDashboard size={16} />}
        title="Display Settings"
        description="The following setting defines the default value for the components of billing screen."
      >
        <div className="space-y-4">
          <ConfigFormRow label="Layout for Billing Screen">
            <>
              <RadioGroup
                name="layout"
                value={layout}
                options={['Keyboard', 'Touch Screen']}
                onChange={setLayout}
              />
              <MutedHelp>
                Configure the type of display between a touch based or keyboard
                based.
              </MutedHelp>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="Display preference for the Menu">
            <>
              <RadioGroup
                name="menu-side"
                value={menuSide}
                options={['On the Left', 'On the Right']}
                onChange={setMenuSide}
              />
              <MutedHelp>Note: Only for Touch Screen</MutedHelp>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="Default Screen to Display">
            <>
              <RadioGroup
                name="default-screen"
                value={defaultScreen}
                options={['Billing', 'Table Management']}
                onChange={setDefaultScreen}
              />
              <MutedHelp>
                Choose which Layout to get display while opening the POS.
              </MutedHelp>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="Order Live View">
            <>
              <RadioGroup
                name="order-live"
                value={orderLiveView}
                options={['Ascending', 'Descending']}
                onChange={setOrderLiveView}
              />
              <MutedHelp>
                This settings describe how would the orders be displayed in
                Order live view.
              </MutedHelp>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="KOT Live View">
            <>
              <RadioGroup
                name="kot-live"
                value={kotLiveView}
                options={['Ascending', 'Descending']}
                onChange={setKotLiveView}
              />
              <MutedHelp>
                This settings describe how would the orders be displayed in KOT
                live view.
              </MutedHelp>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="Add New Item In Cart">
            <RadioGroup
              name="add-item"
              value={addItemPosition}
              options={['In Bottom', 'On Top']}
              onChange={setAddItemPosition}
            />
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Monitor size={16} />}
        title="Billing Display Settings"
      >
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
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<CircleDollarSign size={16} />}
        title="Tip Configuration"
      >
        <div className="space-y-4">
          <CheckRow checked={showTip} onChange={setShowTip} label="Show Tip" />
          <ConfigFormRow label="Set Tip selection as">
            <>
              <RadioGroup
                name="tip-selection"
                value={tipSelection}
                options={['None', 'Percentage', 'Fixed']}
                onChange={setTipSelection}
              />
              <MutedHelp>For customer tip selection in a Kiosk.</MutedHelp>
            </>
          </ConfigFormRow>
          <ConfigFormRow label="Set Tip value" align="center">
            <input
              type="text"
              value={tipValue}
              onChange={(event) => setTipValue(event.target.value)}
              className={`${inputClass} max-w-xs`}
              placeholder="Comma separated values"
            />
          </ConfigFormRow>
          <ConfigFormRow label="Tip calculation on">
            <RadioGroup
              name="tip-calc"
              value={tipCalcOn}
              options={['Core (Sub Total)', 'Total (Total Bill Value)']}
              onChange={setTipCalcOn}
            />
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Printer size={16} />}
        title="Display & Printing Preferences"
      >
        <div className="space-y-4">
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

          <ConfigFormRow label="Assign to validation on billing screen">
            <CheckboxList
              options={ORDER_TYPES}
              values={assignValidation}
              onToggle={(value) =>
                toggleList(assignValidation, value, setAssignValidation)
              }
            />
          </ConfigFormRow>

          <ConfigFormRow label="Mark Order and KOT as completed once the bill is settled">
            <CheckboxList
              options={ORDER_TYPES}
              values={markCompleted}
              onToggle={(value) =>
                toggleList(markCompleted, value, setMarkCompleted)
              }
            />
          </ConfigFormRow>

          <ConfigFormRow label="Item Sorting" align="center">
            <select
              value={itemSorting}
              onChange={(event) => setItemSorting(event.target.value)}
              className={`${selectClass} max-w-xs`}
            >
              {['A-Z', 'Z-A', 'Category', 'Custom'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </ConfigFormRow>

          <CheckRow
            checked={showTableStartBy}
            onChange={setShowTableStartBy}
            label="Show table start by / bill created by information on billing screen (Touch Screen)"
          />

          <ConfigFormRow label="Display Menu">
            <RadioGroup
              name="display-menu"
              value={displayMenu}
              options={['None', 'Group Wise']}
              onChange={setDisplayMenu}
            />
          </ConfigFormRow>

          <CheckRow
            checked={openEditAfterPrint}
            onChange={setOpenEditAfterPrint}
            label="Open order in Edit Mode after Save & Print (Everytime)"
          />

          <ConfigFormRow label="Order Type Selection">
            <CheckboxList
              options={ORDER_TYPES}
              values={orderTypeSelection}
              onToggle={(value) =>
                toggleList(orderTypeSelection, value, setOrderTypeSelection)
              }
            />
          </ConfigFormRow>

          <CheckRow
            checked={autoOpenSettlement}
            onChange={setAutoOpenSettlement}
            label="Auto Open Settlement Popup"
          />
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<ListChecks size={16} />}
        title="Default Values"
      >
        <div className="space-y-4">
          <ConfigFormRow label="Default Order Type" align="center">
            <select
              value={defaultOrderType}
              onChange={(event) => setDefaultOrderType(event.target.value)}
              className={`${selectClass} max-w-xs`}
            >
              {['DINE IN', 'Delivery', 'Pick Up', 'Takeaway'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </ConfigFormRow>
          <ConfigFormRow label="Default Payment Type" align="center">
            <select
              value={defaultPaymentType}
              onChange={(event) => setDefaultPaymentType(event.target.value)}
              className={`${selectClass} max-w-xs`}
            >
              {PAYMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </ConfigFormRow>
          <ConfigFormRow label="Default Custom Payment Type" align="center">
            <select
              value={defaultCustomPayment}
              onChange={(event) =>
                setDefaultCustomPayment(event.target.value)
              }
              className={`${selectClass} max-w-xs`}
            >
              {['UPI', 'HDFC UPI', 'Card', 'Other'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </ConfigFormRow>
          <ConfigFormRow label="Default Table No." align="center">
            <input
              type="text"
              value={defaultTableNo}
              onChange={(event) => setDefaultTableNo(event.target.value)}
              className={`${inputClass} max-w-xs`}
            />
          </ConfigFormRow>
          <ConfigFormRow label={`Default Petty Cash Amount (${brand.currency})`} align="center">
            <>
              <input
                type="text"
                value={pettyCash}
                onChange={(event) => setPettyCash(event.target.value)}
                className={`${inputClass} max-w-xs`}
              />
              <MutedHelp>
                This would be the amount of petty cash that would be populated
                unless another amount is entered.
              </MutedHelp>
            </>
          </ConfigFormRow>
          <ConfigFormRow label="Item Quantity" align="center">
            <>
              <input
                type="text"
                value={itemQuantityPresets}
                onChange={(event) => setItemQuantityPresets(event.target.value)}
                className={`${inputClass} max-w-xs`}
              />
              <MutedHelp>(Comma separated numeric values only.)</MutedHelp>
            </>
          </ConfigFormRow>
          <ConfigFormRow label="Item Price" align="center">
            <>
              <input
                type="text"
                value={itemPricePresets}
                onChange={(event) => setItemPricePresets(event.target.value)}
                className={`${inputClass} max-w-xs`}
              />
              <MutedHelp>(Comma separated numeric values only.)</MutedHelp>
            </>
          </ConfigFormRow>
          <ConfigFormRow label="Default Quantity" align="center">
            <>
              <input
                type="text"
                value={defaultQuantity}
                onChange={(event) => setDefaultQuantity(event.target.value)}
                className={`${inputClass} max-w-xs`}
              />
              <MutedHelp>
                Default Quantity while adding item to cart. Leave it blank if
                the quantity would be entered manually by the user (In Keyboard
                Layout).
              </MutedHelp>
            </>
          </ConfigFormRow>
          <CheckRow
            checked={finalizeOrder}
            onChange={setFinalizeOrder}
            label="Finalize Order"
          />
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Wallet size={16} />}
        title="Payment Options In Billing Screen"
        description="The selected payment options would be displayed by default in the billing screen, the remaining payment options would be displayed by clicking More."
      >
        <div className="space-y-4">
          {([
            ['Payment Option 1', payOpt1, setPayOpt1],
            ['Payment Option 2', payOpt2, setPayOpt2],
            ['Payment Option 3', payOpt3, setPayOpt3],
            ['Payment Option 4', payOpt4, setPayOpt4],
          ] as const).map(([label, value, setter]) => (
            <ConfigFormRow key={label} label={label} align="center">
              <select
                value={value}
                onChange={(event) => setter(event.target.value)}
                className={`${selectClass} max-w-xs`}
              >
                {PAYMENT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </ConfigFormRow>
          ))}
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<LayoutGrid size={16} />}
        title="Section Configuration"
        description="The following settings are used to configure the settings related to different sections of the billing screen."
      >
        <div className="space-y-4">
          <ConfigFormRow label="Delivery" required>
            <>
              <input
                type="text"
                value={deliveryName}
                onChange={(event) => setDeliveryName(event.target.value)}
                className={`${inputClass} max-w-md`}
              />
              <MutedHelp>
                Above name will be reflected on the billing screen in place of
                Home Delivery. Best seen with 8 characters.
              </MutedHelp>
              <div className="pt-1">
                <CheckRow
                  checked={deliveryEnabled}
                  onChange={setDeliveryEnabled}
                  label="Enable this option in the billing screen"
                />
              </div>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="Pick Up" required>
            <>
              <input
                type="text"
                value={pickupName}
                onChange={(event) => setPickupName(event.target.value)}
                className={`${inputClass} max-w-md`}
              />
              <MutedHelp>
                Assign a name to see on the Pickup section. Best seen with 8
                characters.
              </MutedHelp>
              <div className="pt-1">
                <CheckRow
                  checked={pickupEnabled}
                  onChange={setPickupEnabled}
                  label="Enable this option in the billing screen"
                />
              </div>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="Dine In" required>
            <>
              <input
                type="text"
                value={dineInName}
                onChange={(event) => setDineInName(event.target.value)}
                className={`${inputClass} max-w-md`}
              />
              <MutedHelp>
                Assign a name for the Dine In section on the billing UI.
              </MutedHelp>
              <div className="pt-1">
                <CheckRow
                  checked={dineInEnabled}
                  onChange={setDineInEnabled}
                  label="Enable this option in the billing screen"
                />
              </div>
            </>
          </ConfigFormRow>

          <CheckRow
            checked={extraSectionEnabled}
            onChange={setExtraSectionEnabled}
            label="Enable this option in the billing screen"
            help="Additional custom section slot."
          />
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Armchair size={16} />}
        title="Table Settlement"
      >
        <div className="space-y-4">
          <MutedHelp>
            Note:- This configuration will only work with 105.1.0.0 and above.
          </MutedHelp>
          <ConfigFormRow label="Lock Active Table">
            <RadioGroup
              name="lock-table"
              value={lockActiveTable}
              options={['Save & Print', 'Settle & Save', 'None']}
              onChange={setLockActiveTable}
            />
          </ConfigFormRow>
          <ConfigFormRow label="Release Table On">
            <RadioGroup
              name="release-table"
              value={releaseTableOn}
              options={['Print Bill', 'Settle & Save']}
              onChange={setReleaseTableOn}
            />
          </ConfigFormRow>
          <ConfigFormRow label="Release Recent Section On">
            <RadioGroup
              name="release-section"
              value={releaseSectionOn}
              options={['Print Bill', 'Settle & Save']}
              onChange={setReleaseSectionOn}
            />
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Tag size={16} />}
        title="Discount Section"
      >
        <div className="space-y-4">
          <ConfigFormRow label="Discount Label" align="center">
            <>
              <input
                type="text"
                value={discountLabel}
                onChange={(event) => setDiscountLabel(event.target.value)}
                className={`${inputClass} max-w-md`}
              />
              <MutedHelp>
                This setting would describe what the discount would be displayed
                as.
              </MutedHelp>
            </>
          </ConfigFormRow>
          <ConfigFormRow label="Discount Calculate Button Text" required align="center">
            <input
              type="text"
              value={discountButtonText}
              onChange={(event) => setDiscountButtonText(event.target.value)}
              className={`${inputClass} max-w-xs`}
            />
          </ConfigFormRow>
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
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<ClipboardList size={16} />}
        title="Order Wise Information"
      >
        <CheckRow
          checked={orderWiseInfo}
          onChange={setOrderWiseInfo}
          label="Enable Order wise information"
          help="Configure how order-specific info is captured."
        />
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Minus size={16} />}
        title="Negative Quantity Settings"
      >
        <div className="space-y-4">
          <ConfigFormRow label="Negative Quantity Reason">
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
          </ConfigFormRow>
          <CheckRow
            checked={allowNegativeQty}
            onChange={setAllowNegativeQty}
            label="Allow negative quantity."
          />
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Ban size={16} />}
        title="Order Cancel Reason Settings"
        description="The following settings pertains to configuring the order cancel settings in the billing screen."
      >
        <div className="space-y-4">
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
          <ConfigFormRow label="Order Cancel OTP" align="center">
            <>
              <input
                type="text"
                value={cancelOtpEmails}
                onChange={(event) => setCancelOtpEmails(event.target.value)}
                className={`${inputClass} max-w-md`}
              />
              <MutedHelp>
                Enter Email ID through which you will receive OTP while cancel
                order. You can add more than one with , separated.
              </MutedHelp>
            </>
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Pencil size={16} />}
        title="Order Edit Reason Settings"
        description="The following settings pertains to configuring the order edit settings in the billing screen"
      >
        <div className="space-y-4">
          <ReasonFields
            labelPrefix="Order edit Reason"
            values={editReasons}
            onChange={(index, value) =>
              updateReasons(setEditReasons, editReasons, index, value)
            }
          />
          <ConfigFormRow label="Order edit OTP" align="center">
            <>
              <input
                type="text"
                value={editOtpEmails}
                onChange={(event) => setEditOtpEmails(event.target.value)}
                className={`${inputClass} max-w-md`}
              />
              <MutedHelp>
                Enter Email ID through which you will receive OTP while edit
                order after print. You can add more than one with , separated.
              </MutedHelp>
            </>
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Gift size={16} />}
        title="Order Complimentary Reason Settings"
        description="The following settings pertains to configuring the order complimentary settings in the billing screen."
      >
        <div className="space-y-4">
          <ReasonFields
            labelPrefix="Order complimentary Reason"
            values={compReasons}
            onChange={(index, value) =>
              updateReasons(setCompReasons, compReasons, index, value)
            }
          />
          <ConfigFormRow label="Order Complimentary OTP" align="center">
            <>
              <input
                type="text"
                value={compOtpEmails}
                onChange={(event) => setCompOtpEmails(event.target.value)}
                className={`${inputClass} max-w-md`}
              />
              <MutedHelp>
                Enter Email ID through which you will receive OTP while
                complimentary order. You can add more than one with , separated.
              </MutedHelp>
            </>
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Undo2 size={16} />}
        title="Order Sales Return Reason Settings"
        description="The following settings pertains to configuring the order sales return settings in the billing screen."
      >
        <div className="space-y-4">
          <ReasonFields
            labelPrefix="Order sales return Reason"
            values={returnReasons}
            onChange={(index, value) =>
              updateReasons(setReturnReasons, returnReasons, index, value)
            }
          />
          <ConfigFormRow label="Order Sales Return OTP" align="center">
            <>
              <input
                type="text"
                value={returnOtpEmails}
                onChange={(event) => setReturnOtpEmails(event.target.value)}
                className={`${inputClass} max-w-md`}
              />
              <MutedHelp>
                Enter Email ID through which you will receive OTP while sales
                return order. You can add more than one with , separated.
              </MutedHelp>
            </>
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Scale size={16} />}
        title="Lower / Higher Order Settlement Amount Reason Settings"
        description="The following settings pertains to configuring the order settlement settings in the billing screen."
      >
        <CheckRow
          checked={settlementReasonRequired}
          onChange={setSettlementReasonRequired}
          label="Reason for settling order amount other than the invoice total."
        />
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<BadgePercent size={16} />}
        title="Special Order Discount Settings"
      >
        <ConfigFormRow label="Special Discount OTP" align="center">
          <>
            <input
              type="text"
              value={specialDiscountOtp}
              onChange={(event) => setSpecialDiscountOtp(event.target.value)}
              className={`${inputClass} max-w-md`}
            />
            <MutedHelp>
              Enter Email ID through which you will receive OTP while Special
              order discount. You can add more than one with , separated.
            </MutedHelp>
          </>
        </ConfigFormRow>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<IndianRupee size={16} />}
        title="Item price change (NC) Reason Settings"
      >
        <ReasonFields
          labelPrefix="Item price change (NC) Reason"
          values={ncReasons}
          onChange={(index, value) =>
            updateReasons(setNcReasons, ncReasons, index, value)
          }
        />
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<XCircle size={16} />}
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
      </ConfigSectionCard>

      <ConfigSaveBar onCancel={goBack} onSave={handleSave} />
    </ReportsPageShell>
  )
}
