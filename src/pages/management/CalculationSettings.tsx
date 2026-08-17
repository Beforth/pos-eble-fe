import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'
const selectClass = inputClass

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
      className={`grid gap-2 sm:grid-cols-[280px_minmax(0,1fr)] sm:gap-4 ${
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

export default function CalculationSettings() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const [roundOff, setRoundOff] = useState('Normal')
  const [roundIncrement, setRoundIncrement] = useState('1 (Default)')
  const [decimalPoints, setDecimalPoints] = useState('2')

  const [displayServiceCharge, setDisplayServiceCharge] = useState(false)

  const [showContainerCharge, setShowContainerCharge] = useState(true)
  const [containerLabel, setContainerLabel] = useState('Container Charge')
  const [containerMode, setContainerMode] = useState('Item Wise')
  const [autoContainer, setAutoContainer] = useState<string[]>([
    'PARCEL',
    'DINE IN',
  ])
  const [taxOnContainer, setTaxOnContainer] = useState(true)
  const [containerAmountRule, setContainerAmountRule] = useState('None')
  const [containerAmount, setContainerAmount] = useState('5')

  const [showDeliveryCharge, setShowDeliveryCharge] = useState(true)
  const [defaultDeliveryCharge, setDefaultDeliveryCharge] = useState('0')
  const [taxOnDelivery, setTaxOnDelivery] = useState(false)
  const [deliveryAmountRule, setDeliveryAmountRule] = useState('None')
  const [deliveryAmount, setDeliveryAmount] = useState('0')

  const [taxBeforeDiscount, setTaxBeforeDiscount] = useState(false)
  const [backwardTaxAfterDiscount, setBackwardTaxAfterDiscount] =
    useState(false)
  const [specialDiscountOn, setSpecialDiscountOn] = useState('Total')
  const [autoItemCategoryDiscount, setAutoItemCategoryDiscount] =
    useState(false)
  const [showItemCategoryDiscountBox, setShowItemCategoryDiscountBox] =
    useState(false)
  const [applyBogoAuto, setApplyBogoAuto] = useState(false)
  const [commonCoupon, setCommonCoupon] = useState(false)
  const [ignoreAddonInDiscount, setIgnoreAddonInDiscount] = useState(true)
  const [specialDiscountReasonMandatory, setSpecialDiscountReasonMandatory] =
    useState(false)

  const [assignBillToKotUser, setAssignBillToKotUser] = useState(false)
  const [saveKotOnSaveBill, setSaveKotOnSaveBill] = useState(true)
  const [considerNonPreparedKot, setConsiderNonPreparedKot] = useState(true)
  const [mergeDuplicateItems, setMergeDuplicateItems] = useState(true)
  const [splitBillMultiGroups, setSplitBillMultiGroups] = useState(true)
  const [autoFinalizeOrder, setAutoFinalizeOrder] = useState(false)
  const [kotResetFrom, setKotResetFrom] = useState('1')

  const [disableChargesOnComp, setDisableChargesOnComp] = useState(true)
  const [saveSpecialNoteMaster, setSaveSpecialNoteMaster] = useState(false)
  const [displaySurcharge, setDisplaySurcharge] = useState(false)

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

  function handleSave() {
    if (!containerLabel.trim()) {
      showToast('Container Charge Label is required')
      return
    }
    if (!defaultDeliveryCharge.trim()) {
      showToast('Default Delivery Charge is required')
      return
    }
    if (!kotResetFrom.trim()) {
      showToast('Everyday reset KOT number is required')
      return
    }
    showToast('Calculation settings saved')
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
        The Following Settings Are Used To Configure Calculation Of Certain
        Attributes In The Billing Screen.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-8 p-5 sm:p-6">
          <Section title="Round-Off Options">
            <FormRow label="Round off options for billing">
              <RadioGroup
                name="round-off"
                value={roundOff}
                options={['Normal', 'Round off up', 'Round off down', 'None']}
                onChange={setRoundOff}
              />
            </FormRow>
            <FormRow
              label="Round the number to the increments of"
              required
            >
              <select
                value={roundIncrement}
                onChange={(event) => setRoundIncrement(event.target.value)}
                className={selectClass}
              >
                {['1 (Default)', '0.5', '0.25', '0.1', '5', '10'].map(
                  (option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ),
                )}
              </select>
              <Help>
                The number is rounded to the selected increment (e.g. if 0.25 is
                selected, 2.20 rounds to 2.25).
              </Help>
            </FormRow>
            <FormRow
              label="Select decimal points for invoice calculation and Menu price input"
              required
            >
              <select
                value={decimalPoints}
                onChange={(event) => setDecimalPoints(event.target.value)}
                className={selectClass}
              >
                {['0', '1', '2', '3'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <Help>
                Rounding is based on the selected decimal points (e.g. if 1 is
                selected, 0.9277 rounds to 1.0).
              </Help>
            </FormRow>
          </Section>

          <Section
            title="Service Charge"
            description="The following settings describes the settings related to the service charge in the billing screen."
          >
            <CheckRow
              checked={displayServiceCharge}
              onChange={setDisplayServiceCharge}
              label="Display & Calculate Service Charge"
            />
            <Help>
              According to Central Consumer Protection Authority guidelines,
              service charges cannot be added by default and outlets cannot
              charge taxes on service charges.
            </Help>
          </Section>

          <Section
            title="Container Charge"
            description="The following settings describes the settings related to the container charge in the billing screen."
          >
            <CheckRow
              checked={showContainerCharge}
              onChange={setShowContainerCharge}
              label="Show Container Charge On Billing Screen"
            />
            <FormRow label="Container Charge Label" required>
              <input
                type="text"
                value={containerLabel}
                onChange={(event) => setContainerLabel(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <FormRow label="Container Charge (Calculation Mode)">
              <RadioGroup
                name="container-mode"
                value={containerMode}
                options={['Item Wise', 'Order Wise', 'Fix Per Item']}
                onChange={setContainerMode}
              />
              <Help>
                This setting defines whether the container charge is item wise
                and order wise.
              </Help>
            </FormRow>
            <FormRow label="Calculate Container Charge Automatically" align="start">
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {['PARCEL', 'DINE IN', 'Dine In'].map((option) => (
                  <label
                    key={option}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={autoContainer.includes(option)}
                      onChange={() =>
                        toggleList(autoContainer, option, setAutoContainer)
                      }
                      className="size-4 cursor-pointer accent-primary"
                    />
                    {option}
                  </label>
                ))}
              </div>
              <Help>
                This setting enables container charge without pressing a button
                beside the label in billing screen.
              </Help>
            </FormRow>
            <CheckRow
              checked={taxOnContainer}
              onChange={setTaxOnContainer}
              label="Calculate tax on Container Charge"
            />
            <FormRow label="Set a specific amount to calculate">
              <RadioGroup
                name="container-amount-rule"
                value={containerAmountRule}
                options={['Greater Than', 'Less Than', 'None']}
                onChange={setContainerAmountRule}
              />
            </FormRow>
            <FormRow label="Amount">
              <input
                type="text"
                value={containerAmount}
                onChange={(event) => setContainerAmount(event.target.value)}
                className={inputClass}
              />
            </FormRow>
          </Section>

          <Section
            title="Delivery Charge"
            description="The following settings describes the settings related to the delivery charge in the billing screen."
          >
            <CheckRow
              checked={showDeliveryCharge}
              onChange={setShowDeliveryCharge}
              label="Show Delivery Charge On Billing Screen"
              help="This setting would describe what would the delivery charge would be displayed as."
            />
            <FormRow
              label="Default Delivery Charge (Only for Delivery)"
              required
            >
              <input
                type="text"
                value={defaultDeliveryCharge}
                onChange={(event) =>
                  setDefaultDeliveryCharge(event.target.value)
                }
                className={inputClass}
              />
            </FormRow>
            <CheckRow
              checked={taxOnDelivery}
              onChange={setTaxOnDelivery}
              label="Calculate tax on Delivery Charge."
            />
            <FormRow label="Set a specific amount to calculate">
              <RadioGroup
                name="delivery-amount-rule"
                value={deliveryAmountRule}
                options={['Greater Than', 'Less Than', 'None']}
                onChange={setDeliveryAmountRule}
              />
            </FormRow>
            <FormRow label="Amount">
              <input
                type="text"
                value={deliveryAmount}
                onChange={(event) => setDeliveryAmount(event.target.value)}
                className={inputClass}
              />
            </FormRow>
          </Section>

          <Section
            title="Discount"
            description="The following settings help in describing the discount in the billing screen."
          >
            <div className="space-y-3">
              <CheckRow
                checked={taxBeforeDiscount}
                onChange={setTaxBeforeDiscount}
                label="Calculate Tax Before Discount Calculation"
              />
              <CheckRow
                checked={backwardTaxAfterDiscount}
                onChange={setBackwardTaxAfterDiscount}
                label="Calculate Backward Tax After Discount"
                help="Note:- Ignore this settings if you are using Forward Tax configuration for your outlet."
              />
            </div>
            <FormRow label="Special Discount Calculation On">
              <RadioGroup
                name="special-discount-on"
                value={specialDiscountOn}
                options={['Total', 'Core']}
                onChange={setSpecialDiscountOn}
              />
              <Help>
                This setting defines whether the discount is on core or total.
              </Help>
            </FormRow>
            <div className="space-y-3">
              <CheckRow
                checked={autoItemCategoryDiscount}
                onChange={setAutoItemCategoryDiscount}
                label="Item/ Category discount auto-applied"
                help="This setting enables discount without pressing a button beside the label in billing screen."
              />
              <CheckRow
                checked={showItemCategoryDiscountBox}
                onChange={setShowItemCategoryDiscountBox}
                label="Show Item/Category wise discount box while adding an item"
              />
              <CheckRow
                checked={applyBogoAuto}
                onChange={setApplyBogoAuto}
                label="Apply Bogo Automatically"
                help="This setting enables Bogo discount without pressing a button in billing screen."
              />
              <CheckRow
                checked={commonCoupon}
                onChange={setCommonCoupon}
                label="Common Coupon Discount"
                help="This setting enables the coupon(s) configured by HO/Chain outlet to be applicable in the outlet."
              />
              <CheckRow
                checked={ignoreAddonInDiscount}
                onChange={setIgnoreAddonInDiscount}
                label="Ignore add-on price while calculating discount (works for all types for discount)"
              />
              <CheckRow
                checked={specialDiscountReasonMandatory}
                onChange={setSpecialDiscountReasonMandatory}
                label="Special discount reason mandatory"
              />
            </div>
          </Section>

          <Section
            title="KOT/Bill"
            description="The following settings describes the settings related to the KOT/Bill in the billing screen."
          >
            <div className="space-y-3">
              <CheckRow
                checked={assignBillToKotUser}
                onChange={setAssignBillToKotUser}
                label="Assign Bill sales to KOT punched user"
                help="When this setting is enabled, the bill sales would be assigned to the user who punched the KOT in the relevant reports."
              />
              <CheckRow
                checked={saveKotOnSaveBill}
                onChange={setSaveKotOnSaveBill}
                label="Save KOT On Save Bill (Only first time not in edit)"
              />
              <CheckRow
                checked={considerNonPreparedKot}
                onChange={setConsiderNonPreparedKot}
                label="Consider Non Prepared KOT in Bill"
                help="When this setting is enabled, even the KOT which is not marked as prepared in the system would be considered while printing bill."
              />
              <CheckRow
                checked={mergeDuplicateItems}
                onChange={setMergeDuplicateItems}
                label="Merge duplicate items"
                help="This setting enables merging same items on billing screen."
              />
              <CheckRow
                checked={splitBillMultiGroups}
                onChange={setSplitBillMultiGroups}
                label="Split a bill when multiple groups are present"
              />
              <CheckRow
                checked={autoFinalizeOrder}
                onChange={setAutoFinalizeOrder}
                label="Auto Finalize Order"
              />
            </div>
            <FormRow label="Everyday reset KOT number from" required>
              <input
                type="text"
                value={kotResetFrom}
                onChange={(event) => setKotResetFrom(event.target.value)}
                className={inputClass}
              />
              <Help>
                When this setting is enabled, the KOT number would reset to this
                particular number at the start of every day.
              </Help>
            </FormRow>
          </Section>

          <Section
            title="Complimentary Bill"
            description="The following settings describes the settings related to complimentary bills."
          >
            <CheckRow
              checked={disableChargesOnComp}
              onChange={setDisableChargesOnComp}
              label="Disable Taxes and other Charges (Packing Charge, Delivery charge, Service charge) on Complimentary Bill"
            />
          </Section>

          <Section
            title="Special Notes"
            description="The following settings describes the settings related to special notes."
          >
            <CheckRow
              checked={saveSpecialNoteMaster}
              onChange={setSaveSpecialNoteMaster}
              label="Save special note into special notes master while saving kot / orders."
            />
          </Section>

          <Section
            title="Surcharge"
            description="The following settings describes the settings related to surcharge."
          >
            <CheckRow
              checked={displaySurcharge}
              onChange={setDisplaySurcharge}
              label="Display & Calculate Surcharge"
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
