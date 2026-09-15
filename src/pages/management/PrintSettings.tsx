import { useEffect, useState } from 'react'

import { showToast } from '../../utils/toast'
import { Layers, Printer, ReceiptText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ConfigBreadcrumb,
  ConfigSaveBar,
  ConfigSectionCard,
  MutedHelp,
} from '../../components/management/ConfigSectionCard'
import { SettingsPageLoading } from '../../components/management/SettingsPageLoading'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import { useOutletSettings } from '../../services/useOutletSettings'
import type { OutletSettingsRecord } from '../../services/outletService'
import { brand } from '../../theme/brand'

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
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <label
          key={option}
          className="inline-flex cursor-pointer items-start gap-2 text-sm text-ink"
        >
          <input
            type="radio"
            name={name}
            checked={value === option}
            onChange={() => onChange(option)}
            className="mt-0.5 size-4 shrink-0 cursor-pointer accent-primary"
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

export default function PrintSettings() {
  const navigate = useNavigate()

  const [barcodeBoth, setBarcodeBoth] = useState(false)

  const [printKotOnBill, setPrintKotOnBill] = useState(true)
  const [printOnlyModifiedKot, setPrintOnlyModifiedKot] = useState(false)
  const [printOnlyModifiedItems, setPrintOnlyModifiedItems] = useState(false)
  const [printCancelledKot, setPrintCancelledKot] = useState(false)
  const [addonsBelowItem, setAddonsBelowItem] = useState(false)
  const [showDuplicateKot, setShowDuplicateKot] = useState(true)
  const [printDeletedItemsKot, setPrintDeletedItemsKot] = useState(true)
  const [printDeletedSeparateKot, setPrintDeletedSeparateKot] = useState(false)
  const [barcodeOnKot, setBarcodeOnKot] = useState(false)
  const [printKotOnMove, setPrintKotOnMove] = useState(true)
  const [printKotOnStatus, setPrintKotOnStatus] = useState('None')

  const [billBifurcation, setBillBifurcation] = useState('None')
  const [showDuplicateBill, setShowDuplicateBill] = useState(true)
  const [showCustomerPaid, setShowCustomerPaid] = useState(false)
  const [kotAsToken, setKotAsToken] = useState(true)
  const [showAddonsBill, setShowAddonsBill] = useState(true)
  const [barcodeOnBill, setBarcodeOnBill] = useState(false)
  const [mergeDuplicateItem, setMergeDuplicateItem] = useState(true)
  const [displayQtyBreakdown, setDisplayQtyBreakdown] = useState(false)
  const [mergeEbill, setMergeEbill] = useState(false)
  const [saveInvoiceHistory, setSaveInvoiceHistory] = useState(false)

  const { loading, data, save } = useOutletSettings('print')

  const loadedRef = { current: false }
  useEffect(() => {
    if (!data || loadedRef.current) return
    loadedRef.current = true
    const value = data
    if (value.show_order_barcode_bill_kot != null)
      setBarcodeBoth(Boolean(value.show_order_barcode_bill_kot))
    if (value.print_kot_on_print_bill != null)
      setPrintKotOnBill(Boolean(value.print_kot_on_print_bill))
    if (value.print_only_modified_kot != null)
      setPrintOnlyModifiedKot(Boolean(value.print_only_modified_kot))
    if (value.print_only_modified_items_kot != null)
      setPrintOnlyModifiedItems(Boolean(value.print_only_modified_items_kot))
    if (value.print_cancelled_kot != null)
      setPrintCancelledKot(Boolean(value.print_cancelled_kot))
    if (value.print_addons_notes_below_item != null)
      setAddonsBelowItem(Boolean(value.print_addons_notes_below_item))
    if (value.show_duplicate_kot != null)
      setShowDuplicateKot(Boolean(value.show_duplicate_kot))
    if (value.print_deleted_items_kot != null)
      setPrintDeletedItemsKot(Boolean(value.print_deleted_items_kot))
    if (value.print_deleted_items_separate_kot != null)
      setPrintDeletedSeparateKot(Boolean(value.print_deleted_items_separate_kot))
    if (value.show_order_barcode_kot != null)
      setBarcodeOnKot(Boolean(value.show_order_barcode_kot))
    if (value.print_kot_on_table_move != null)
      setPrintKotOnMove(Boolean(value.print_kot_on_table_move))
    if (value.kot_status_print) setPrintKotOnStatus(String(value.kot_status_print))
    if (value.bill_bifurcation) setBillBifurcation(String(value.bill_bifurcation))
    if (value.show_duplicate_bill != null)
      setShowDuplicateBill(Boolean(value.show_duplicate_bill))
    if (value.show_paid_return_bill != null)
      setShowCustomerPaid(Boolean(value.show_paid_return_bill))
    if (value.print_kotno_as_token != null)
      setKotAsToken(Boolean(value.print_kotno_as_token))
    if (value.show_addons_bill != null)
      setShowAddonsBill(Boolean(value.show_addons_bill))
    if (value.show_order_barcode_bill != null)
      setBarcodeOnBill(Boolean(value.show_order_barcode_bill))
    if (value.merge_duplicate_items_bill != null)
      setMergeDuplicateItem(Boolean(value.merge_duplicate_items_bill))
    if (value.display_qty_ordered_items != null)
      setDisplayQtyBreakdown(Boolean(value.display_qty_ordered_items))
    if (value.merge_ebill_print_bill != null)
      setMergeEbill(Boolean(value.merge_ebill_print_bill))
    if (value.save_invoice_print_history != null)
      setSaveInvoiceHistory(Boolean(value.save_invoice_print_history))
  }, [data])


  function goBack() {
    navigate('/management/configuration/outlet')
  }

  async function handleSave() {
    const payload: OutletSettingsRecord = {
      show_order_barcode_bill_kot: barcodeBoth,
      print_kot_on_print_bill: printKotOnBill,
      print_only_modified_kot: printOnlyModifiedKot,
      print_only_modified_items_kot: printOnlyModifiedItems,
      print_cancelled_kot: printCancelledKot,
      print_addons_notes_below_item: addonsBelowItem,
      show_duplicate_kot: showDuplicateKot,
      print_deleted_items_kot: printDeletedItemsKot,
      print_deleted_items_separate_kot: printDeletedSeparateKot,
      show_order_barcode_kot: barcodeOnKot,
      print_kot_on_table_move: printKotOnMove,
      kot_status_print: printKotOnStatus,
      bill_bifurcation: billBifurcation,
      show_duplicate_bill: showDuplicateBill,
      show_paid_return_bill: showCustomerPaid,
      print_kotno_as_token: kotAsToken,
      show_addons_bill: showAddonsBill,
      show_order_barcode_bill: barcodeOnBill,
      merge_duplicate_items_bill: mergeDuplicateItem,
      display_qty_ordered_items: displayQtyBreakdown,
      merge_ebill_print_bill: mergeEbill,
      save_invoice_print_history: saveInvoiceHistory,
    }
    try {
      await save(payload)
      showToast('Print settings saved')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save print settings',
      )
    }
  }

  if (loading && !data) {
    return <SettingsPageLoading />
  }

  return (
    <ReportsPageShell title={<ConfigBreadcrumb onNavigate={goBack} current="Print" />} activeItem="config-outlet">

      <p className="-mt-1 mb-5 text-sm text-muted">
        These Settings Configure The Print Settings Of The Bill And KOT Of
        The Orders.
      </p>

      <ConfigSectionCard
        icon={<Layers size={16} />}
        title="Both"
        description="Settings applied to both bill and KOT prints."
      >
        <CheckRow
          checked={barcodeBoth}
          onChange={setBarcodeBoth}
          label="Show order barcode on both bill and KOT print"
          help={`Scan barcode to mark order food ready. This feature can be managed printer-wise from the printer settings. Riders from Swiggy & Zomato can use the same barcode for order pickup.`}
        />
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Printer size={16} />}
        title="KOT Print"
        description="The following section helps in configuring KOT print settings."
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <CheckRow
              checked={printKotOnBill}
              onChange={setPrintKotOnBill}
              label="Print KOT on Print Bill"
              help="This setting will only work when the print bill action is initiated for the first time, for the reprint of KOT, the user must do that from KOT listing in the PoS."
            />
            <CheckRow
              checked={printOnlyModifiedKot}
              onChange={setPrintOnlyModifiedKot}
              label="Print Only Modified KOT"
              help="This setting when enabled print only the KOT, where modification (i.e item change or item deletion) with the label 'Modified' on the top of the KOT."
            />
            <CheckRow
              checked={printOnlyModifiedItems}
              onChange={setPrintOnlyModifiedItems}
              label="Print Only Modified Items in KOT"
            />
            <CheckRow
              checked={printCancelledKot}
              onChange={setPrintCancelledKot}
              label="Print Cancelled KOT"
            />
            <CheckRow
              checked={addonsBelowItem}
              onChange={setAddonsBelowItem}
              label="Print add-ons and special notes below item row in KOT"
              help="Print add-ons and special notes for the particular item below the item name row in KOT."
            />
            <CheckRow
              checked={showDuplicateKot}
              onChange={setShowDuplicateKot}
              label="Show Duplicate in KOT in case of multiple prints"
              help="Re-printed KOTs will display 'Duplicate' at the top."
            />
            <CheckRow
              checked={printDeletedItemsKot}
              onChange={setPrintDeletedItemsKot}
              label="Print Deleted Items In KOT"
            />
            <CheckRow
              checked={printDeletedSeparateKot}
              onChange={setPrintDeletedSeparateKot}
              label="Print Deleted Items in separate KOT"
            />
            <CheckRow
              checked={barcodeOnKot}
              onChange={setBarcodeOnKot}
              label="Show order barcode on KoT print"
              help={`Scan barcode to mark order food ready. This will not work in the ${brand.shortName} scanner app.`}
            />
            <CheckRow
              checked={printKotOnMove}
              onChange={setPrintKotOnMove}
              label="While moving KOT items from one table to another table print KOT"
            />
          </div>

          <div className="pt-1">
            <p className="mb-2 text-sm font-medium text-ink">
              Print KOT when the status is achieved
            </p>
            <RadioGroup
              name="kot-status"
              value={printKotOnStatus}
              options={['None', 'Food Is Ready', 'Dispatched']}
              onChange={setPrintKotOnStatus}
            />
          </div>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<ReceiptText size={16} />}
        title="Bill Print"
        description="The following section helps in configuring Bill print settings."
      >
        <div className="space-y-4">
          <RadioGroup
            name="bill-bifurcation"
            value={billBifurcation}
            options={[
              'None',
              'Print Category wise Tax(CWT) bifurcation on bill',
              'Print Brand Wise bifurcation on bill',
            ]}
            onChange={setBillBifurcation}
          />

          <div className="space-y-3 pt-1">
            <CheckRow
              checked={showDuplicateBill}
              onChange={setShowDuplicateBill}
              label="Show Duplicate on a bill in case of multiple prints"
              help='Displays "Duplicate" at the top of a reprinted bill.'
            />
            <CheckRow
              checked={showCustomerPaid}
              onChange={setShowCustomerPaid}
              label="Show Customer paid and return to customer in bill print"
            />
            <CheckRow
              checked={kotAsToken}
              onChange={setKotAsToken}
              label="Print KOT no on bill as Token no"
              help="[Note: If this options selected then it shows KOT no. on those bills whose KOT's are available in desktop application.]"
            />
            <CheckRow
              checked={showAddonsBill}
              onChange={setShowAddonsBill}
              label="Show addons in bill print."
            />
            <CheckRow
              checked={barcodeOnBill}
              onChange={setBarcodeOnBill}
              label="Show order barcode on bill print"
              help="Scan barcode to mark order food ready. This feature can be managed printer-wise from the printer settings. Riders from Swiggy & Zomato can use the same barcode for order pickup."
            />
            <CheckRow
              checked={mergeDuplicateItem}
              onChange={setMergeDuplicateItem}
              label="Merge Duplicate Item"
              help="This setting enables merging same items on bill is printed."
            />
            <CheckRow
              checked={displayQtyBreakdown}
              onChange={setDisplayQtyBreakdown}
              label="Display Quantity of ordered items in Bill. (ex. Roti (5 + 1 + 2))"
              help="This setting show item quantity kot wise in bill print."
            />
            <CheckRow
              checked={mergeEbill}
              onChange={setMergeEbill}
              label="Merge ebill and print bill."
              help="This settings send e bill when the bill is printed."
            />
            <CheckRow
              checked={saveInvoiceHistory}
              onChange={setSaveInvoiceHistory}
              label="Save invoice print history."
              help='If the "disable" option is selected, the system will not store or display data in the Invoice History tab. Data will not be saved or shown for as long as the option is disabled.'
            />
          </div>
        </div>
      </ConfigSectionCard>

      <ConfigSaveBar onCancel={goBack} onSave={handleSave} />
    </ReportsPageShell>
  )
}
