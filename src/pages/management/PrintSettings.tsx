import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

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
        {help ? <Help>{help}</Help> : null}
      </span>
    </label>
  )
}

export default function PrintSettings() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

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

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function handleSave() {
    showToast('Print settings saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell title="Outlet Configuration" activeItem="config-outlet">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-40">
          <button
            type="button"
            className="w-full rounded-md bg-primary px-3 py-2.5 text-left text-sm font-semibold text-white"
          >
            Print
          </button>
        </aside>

        <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-line bg-card">
          <div className="space-y-8 p-5 sm:p-6">
            <p className="text-sm text-muted">
              These Settings Configure The Print Settings Of The Bill And KOT Of
              The Orders.
            </p>

            <Section title="Both">
              <CheckRow
                checked={barcodeBoth}
                onChange={setBarcodeBoth}
                label="Show order barcode on both bill and KOT print"
                help={`Scan barcode to mark order food ready. This feature can be managed printer-wise from the printer settings. Riders from Swiggy & Zomato can use the same barcode for order pickup.`}
              />
            </Section>

            <Section
              title="KOT Print"
              description="The following section helps in configuring KOT print settings."
            >
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

              <div className="pt-2">
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
            </Section>

            <Section
              title="Bill Print"
              description="The following section helps in configuring Bill print settings."
            >
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

              <div className="space-y-3 pt-2">
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
            </Section>
          </div>

          <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-line bg-card/95 px-5 py-4 backdrop-blur sm:px-6">
            <OutlineButton variant="gray" onClick={goBack}>
              Cancel
            </OutlineButton>
            <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
          </div>
        </div>
      </div>
    </ReportsPageShell>
  )
}
