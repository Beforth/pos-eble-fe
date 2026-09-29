import { useEffect, useState } from 'react'

import { showToast } from '../../utils/toast'
import {
  BadgePercent,
  Bike,
  Gift,
  Package,
  Percent,
  Printer,
  StickyNote,
  Tag,
  Utensils,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ConfigBreadcrumb,
  ConfigFormRow,
  ConfigSaveBar,
  ConfigSectionCard,
  MutedHelp,
} from '../../components/management/ConfigSectionCard'
import { SettingsPageLoading } from '../../components/management/SettingsPageLoading'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { useOutletSettings } from '../../services/useOutletSettings'
import type { OutletSettingsRecord } from '../../services/outletService'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'
const selectClass = inputClass

const ROUND_INCREMENT_OPTIONS: Record<string, string> = {
  '1 (Default)': '1',
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
        {help ? <MutedHelp>{help}</MutedHelp> : null}
      </span>
    </label>
  )
}

export default function CalculationSettings() {
  const navigate = useNavigate()

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
  const [containerTaxPercent, setContainerTaxPercent] = useState('0')

  const [showDeliveryCharge, setShowDeliveryCharge] = useState(true)
  const [defaultDeliveryCharge, setDefaultDeliveryCharge] = useState('0')
  const [taxOnDelivery, setTaxOnDelivery] = useState(false)
  const [deliveryAmountRule, setDeliveryAmountRule] = useState('None')
  const [deliveryAmount, setDeliveryAmount] = useState('0')
  const [deliveryTaxPercent, setDeliveryTaxPercent] = useState('0')

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

  const { loading, data, save } = useOutletSettings('calculations')

  const loadedRef = { current: false }
  useEffect(() => {
    if (!data || loadedRef.current) return
    loadedRef.current = true
    const value = data
    if (value.round_off_mode) setRoundOff(String(value.round_off_mode))
    if (value.round_off_increment != null) {
      const stored = String(value.round_off_increment)
      setRoundIncrement(
        Object.entries(ROUND_INCREMENT_OPTIONS).find(
          ([, code]) => code === stored,
        )?.[0] ?? stored,
      )
    }
    if (value.invoice_decimal_points != null)
      setDecimalPoints(String(value.invoice_decimal_points))
    if (value.display_calc_service_charge != null)
      setDisplayServiceCharge(Boolean(value.display_calc_service_charge))
    if (value.display_calc_surcharge != null)
      setDisplaySurcharge(Boolean(value.display_calc_surcharge))
    if (value.show_container_charge != null)
      setShowContainerCharge(Boolean(value.show_container_charge))
    if (value.container_charge_label) setContainerLabel(String(value.container_charge_label))
    if (value.container_charge_mode) setContainerMode(String(value.container_charge_mode))
    if (Array.isArray(value.container_charge_auto_types))
      setAutoContainer(value.container_charge_auto_types as string[])
    if (value.tax_on_container_charge != null)
      setTaxOnContainer(Boolean(value.tax_on_container_charge))
    if (value.container_charge_threshold)
      setContainerAmountRule(String(value.container_charge_threshold))
    if (value.container_charge_amount != null)
      setContainerAmount(String(value.container_charge_amount))
    if (value.container_charge_tax_percent != null)
      setContainerTaxPercent(String(value.container_charge_tax_percent))
    if (value.show_delivery_charge != null)
      setShowDeliveryCharge(Boolean(value.show_delivery_charge))
    if (value.default_delivery_charge != null)
      setDefaultDeliveryCharge(String(value.default_delivery_charge))
    if (value.tax_on_delivery_charge != null)
      setTaxOnDelivery(Boolean(value.tax_on_delivery_charge))
    if (value.delivery_charge_threshold)
      setDeliveryAmountRule(String(value.delivery_charge_threshold))
    if (value.delivery_charge_amount != null)
      setDeliveryAmount(String(value.delivery_charge_amount))
    if (value.delivery_charge_tax_percent != null)
      setDeliveryTaxPercent(String(value.delivery_charge_tax_percent))
    if (value.tax_before_discount != null)
      setTaxBeforeDiscount(Boolean(value.tax_before_discount))
    if (value.backward_tax_after_discount != null)
      setBackwardTaxAfterDiscount(Boolean(value.backward_tax_after_discount))
    if (value.special_discount_on) setSpecialDiscountOn(String(value.special_discount_on))
    if (value.item_category_discount_autoapply != null)
      setAutoItemCategoryDiscount(Boolean(value.item_category_discount_autoapply))
    if (value.show_item_category_discount_box != null)
      setShowItemCategoryDiscountBox(Boolean(value.show_item_category_discount_box))
    if (value.bogo_autoapply != null) setApplyBogoAuto(Boolean(value.bogo_autoapply))
    if (value.common_coupon_discount != null)
      setCommonCoupon(Boolean(value.common_coupon_discount))
    if (value.ignore_addon_price_for_discount != null)
      setIgnoreAddonInDiscount(Boolean(value.ignore_addon_price_for_discount))
    if (value.special_discount_reason_mandatory != null)
      setSpecialDiscountReasonMandatory(Boolean(value.special_discount_reason_mandatory))
    if (value.assign_bill_sales_to_kot_user != null)
      setAssignBillToKotUser(Boolean(value.assign_bill_sales_to_kot_user))
    if (value.save_kot_on_save_bill != null)
      setSaveKotOnSaveBill(Boolean(value.save_kot_on_save_bill))
    if (value.consider_non_prepared_kot != null)
      setConsiderNonPreparedKot(Boolean(value.consider_non_prepared_kot))
    if (value.merge_duplicate_items_kot != null)
      setMergeDuplicateItems(Boolean(value.merge_duplicate_items_kot))
    if (value.split_bill_multiple_groups != null)
      setSplitBillMultiGroups(Boolean(value.split_bill_multiple_groups))
    if (value.auto_finalize_order != null)
      setAutoFinalizeOrder(Boolean(value.auto_finalize_order))
    if (value.kot_reset_from != null) setKotResetFrom(String(value.kot_reset_from))
    if (value.complimentary_disable_taxes_charges != null)
      setDisableChargesOnComp(Boolean(value.complimentary_disable_taxes_charges))
    if (value.save_special_note_master != null)
      setSaveSpecialNoteMaster(Boolean(value.save_special_note_master))
  }, [data])


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

  async function handleSave() {
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
    const payload: OutletSettingsRecord = {
      round_off_mode: roundOff,
      round_off_increment: ROUND_INCREMENT_OPTIONS[roundIncrement] ?? roundIncrement,
      invoice_decimal_points: decimalPoints,
      display_calc_service_charge: displayServiceCharge,
      display_calc_surcharge: displaySurcharge,
      show_container_charge: showContainerCharge,
      container_charge_label: containerLabel,
      container_charge_mode: containerMode,
      container_charge_auto_types: autoContainer,
      tax_on_container_charge: taxOnContainer,
      container_charge_threshold: containerAmountRule,
      container_charge_amount: containerAmount,
      container_charge_tax_percent: containerTaxPercent,
      show_delivery_charge: showDeliveryCharge,
      default_delivery_charge: defaultDeliveryCharge,
      tax_on_delivery_charge: taxOnDelivery,
      delivery_charge_threshold: deliveryAmountRule,
      delivery_charge_amount: deliveryAmount,
      delivery_charge_tax_percent: deliveryTaxPercent,
      tax_before_discount: taxBeforeDiscount,
      backward_tax_after_discount: backwardTaxAfterDiscount,
      special_discount_on: specialDiscountOn,
      item_category_discount_autoapply: autoItemCategoryDiscount,
      show_item_category_discount_box: showItemCategoryDiscountBox,
      bogo_autoapply: applyBogoAuto,
      common_coupon_discount: commonCoupon,
      ignore_addon_price_for_discount: ignoreAddonInDiscount,
      special_discount_reason_mandatory: specialDiscountReasonMandatory,
      assign_bill_sales_to_kot_user: assignBillToKotUser,
      save_kot_on_save_bill: saveKotOnSaveBill,
      consider_non_prepared_kot: considerNonPreparedKot,
      merge_duplicate_items_kot: mergeDuplicateItems,
      split_bill_multiple_groups: splitBillMultiGroups,
      auto_finalize_order: autoFinalizeOrder,
      kot_reset_from: kotResetFrom,
      complimentary_disable_taxes_charges: disableChargesOnComp,
      save_special_note_master: saveSpecialNoteMaster,
    }
    try {
      await save(payload)
      showToast('Calculation settings saved')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save calculation settings',
      )
    }
  }

  if (loading && !data) {
    return <SettingsPageLoading />
  }

  return (
    <ReportsPageShell title={<ConfigBreadcrumb onNavigate={goBack} current="Calculations" />} activeItem="config-outlet">

      <p className="-mt-1 mb-5 text-sm text-muted">
        The Following Settings Are Used To Configure Calculation Of Certain
        Attributes In The Billing Screen.
      </p>

      <ConfigSectionCard
        icon={<Percent size={16} />}
        title="Round-Off Options"
        description="Rounding behaviour applied to bill totals and menu price inputs."
      >
        <div className="space-y-4">
          <ConfigFormRow label="Round off options for billing" align="center">
            <RadioGroup
              name="round-off"
              value={roundOff}
              options={['Normal', 'Round off up', 'Round off down', 'None']}
              onChange={setRoundOff}
            />
          </ConfigFormRow>
          <ConfigFormRow
            label="Round the number to the increments of"
            required
            align="center"
          >
            <>
              <select
                value={roundIncrement}
                onChange={(event) => setRoundIncrement(event.target.value)}
                className={`${selectClass} max-w-xs`}
              >
                {['1 (Default)', '0.5', '0.25', '0.1', '5', '10'].map(
                  (option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ),
                )}
              </select>
              <MutedHelp>
                The number is rounded to the selected increment (e.g. if 0.25 is
                selected, 2.20 rounds to 2.25).
              </MutedHelp>
            </>
          </ConfigFormRow>
          <ConfigFormRow
            label="Select decimal points for invoice calculation and Menu price input"
            required
            align="center"
          >
            <>
              <select
                value={decimalPoints}
                onChange={(event) => setDecimalPoints(event.target.value)}
                className={`${selectClass} max-w-xs`}
              >
                {['0', '1', '2', '3'].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <MutedHelp>
                Rounding is based on the selected decimal points (e.g. if 1 is
                selected, 0.9277 rounds to 1.0).
              </MutedHelp>
            </>
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Utensils size={16} />}
        title="Service Charge"
        description="The following settings describes the settings related to the service charge in the billing screen."
      >
        <CheckRow
          checked={displayServiceCharge}
          onChange={setDisplayServiceCharge}
          label="Display & Calculate Service Charge"
        />
        <MutedHelp>
          According to Central Consumer Protection Authority guidelines,
          service charges cannot be added by default and outlets cannot
          charge taxes on service charges.
        </MutedHelp>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Package size={16} />}
        title="Container Charge"
        description="The following settings describes the settings related to the container charge in the billing screen."
      >
        <div className="space-y-4">
          <CheckRow
            checked={showContainerCharge}
            onChange={setShowContainerCharge}
            label="Show Container Charge On Billing Screen"
          />
          <ConfigFormRow label="Container Charge Label" required align="center">
            <input
              type="text"
              value={containerLabel}
              onChange={(event) => setContainerLabel(event.target.value)}
              className={`${inputClass} max-w-xs`}
            />
          </ConfigFormRow>
          <ConfigFormRow label="Container Charge (Calculation Mode)" align="center">
            <>
              <RadioGroup
                name="container-mode"
                value={containerMode}
                options={['Item Wise', 'Order Wise', 'Fix Per Item']}
                onChange={setContainerMode}
              />
              <MutedHelp>
                This setting defines whether the container charge is item wise
                and order wise.
              </MutedHelp>
            </>
          </ConfigFormRow>
          <ConfigFormRow label="Calculate Container Charge Automatically">
            <>
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
              <MutedHelp>
                This setting enables container charge without pressing a button
                beside the label in billing screen.
              </MutedHelp>
            </>
          </ConfigFormRow>
          <CheckRow
            checked={taxOnContainer}
            onChange={setTaxOnContainer}
            label="Calculate tax on Container Charge"
          />
          <ConfigFormRow label="Container Charge Tax (%)" align="center">
            <input
              type="text"
              inputMode="decimal"
              value={containerTaxPercent}
              onChange={(event) => setContainerTaxPercent(event.target.value)}
              className={`${inputClass} max-w-xs`}
            />
            <MutedHelp>
              Single rate applied to the container charge when the toggle above is
              on. Leave 0 for no tax.
            </MutedHelp>
          </ConfigFormRow>
          <ConfigFormRow label="Set a specific amount to calculate" align="center">
            <RadioGroup
              name="container-amount-rule"
              value={containerAmountRule}
              options={['Greater Than', 'Less Than', 'None']}
              onChange={setContainerAmountRule}
            />
          </ConfigFormRow>
          <ConfigFormRow label="Amount" align="center">
            <input
              type="text"
              value={containerAmount}
              onChange={(event) => setContainerAmount(event.target.value)}
              className={`${inputClass} max-w-xs`}
            />
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Bike size={16} />}
        title="Delivery Charge"
        description="The following settings describes the settings related to the delivery charge in the billing screen."
      >
        <div className="space-y-4">
          <CheckRow
            checked={showDeliveryCharge}
            onChange={setShowDeliveryCharge}
            label="Show Delivery Charge On Billing Screen"
            help="This setting would describe what would the delivery charge would be displayed as."
          />
          <ConfigFormRow
            label="Default Delivery Charge (Only for Delivery)"
            required
            align="center"
          >
            <input
              type="text"
              value={defaultDeliveryCharge}
              onChange={(event) =>
                setDefaultDeliveryCharge(event.target.value)
              }
              className={`${inputClass} max-w-xs`}
            />
          </ConfigFormRow>
          <CheckRow
            checked={taxOnDelivery}
            onChange={setTaxOnDelivery}
            label="Calculate tax on Delivery Charge."
          />
          <ConfigFormRow label="Delivery Charge Tax (%)" align="center">
            <input
              type="text"
              inputMode="decimal"
              value={deliveryTaxPercent}
              onChange={(event) => setDeliveryTaxPercent(event.target.value)}
              className={`${inputClass} max-w-xs`}
            />
            <MutedHelp>
              Single rate applied to the delivery charge when the toggle above is
              on. Leave 0 for no tax.
            </MutedHelp>
          </ConfigFormRow>
          <ConfigFormRow label="Set a specific amount to calculate" align="center">
            <RadioGroup
              name="delivery-amount-rule"
              value={deliveryAmountRule}
              options={['Greater Than', 'Less Than', 'None']}
              onChange={setDeliveryAmountRule}
            />
          </ConfigFormRow>
          <ConfigFormRow label="Amount" align="center">
            <input
              type="text"
              value={deliveryAmount}
              onChange={(event) => setDeliveryAmount(event.target.value)}
              className={`${inputClass} max-w-xs`}
            />
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Tag size={16} />}
        title="Discount"
        description="The following settings help in describing the discount in the billing screen."
      >
        <div className="space-y-4">
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
          <ConfigFormRow label="Special Discount Calculation On" align="center">
            <>
              <RadioGroup
                name="special-discount-on"
                value={specialDiscountOn}
                options={['Total', 'Core']}
                onChange={setSpecialDiscountOn}
              />
              <MutedHelp>
                This setting defines whether the discount is on core or total.
              </MutedHelp>
            </>
          </ConfigFormRow>
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
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Printer size={16} />}
        title="KOT/Bill"
        description="The following settings describes the settings related to the KOT/Bill in the billing screen."
      >
        <div className="space-y-4">
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
          <ConfigFormRow label="Everyday reset KOT number from" required align="center">
            <>
              <input
                type="text"
                value={kotResetFrom}
                onChange={(event) => setKotResetFrom(event.target.value)}
                className={`${inputClass} max-w-xs`}
              />
              <MutedHelp>
                When this setting is enabled, the KOT number would reset to this
                particular number at the start of every day.
              </MutedHelp>
            </>
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Gift size={16} />}
        title="Complimentary Bill"
        description="The following settings describes the settings related to complimentary bills."
      >
        <CheckRow
          checked={disableChargesOnComp}
          onChange={setDisableChargesOnComp}
          label="Disable Taxes and other Charges (Packing Charge, Delivery charge, Service charge) on Complimentary Bill"
        />
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<StickyNote size={16} />}
        title="Special Notes"
        description="The following settings describes the settings related to special notes."
      >
        <CheckRow
          checked={saveSpecialNoteMaster}
          onChange={setSaveSpecialNoteMaster}
          label="Save special note into special notes master while saving kot / orders."
        />
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<BadgePercent size={16} />}
        title="Surcharge"
        description="The following settings describes the settings related to surcharge."
      >
        <CheckRow
          checked={displaySurcharge}
          onChange={setDisplaySurcharge}
          label="Display & Calculate Surcharge"
        />
      </ConfigSectionCard>

      <ConfigSaveBar onCancel={goBack} onSave={handleSave} />
    </ReportsPageShell>
  )
}
