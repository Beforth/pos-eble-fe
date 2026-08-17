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

const APPLY_LOYALTY_TYPES = ['PARCEL', 'DINE IN', 'Dine In'] as const
const SEND_LOYALTY_TYPES = [
  'PARCEL',
  'DINE IN',
  'Dine In',
  'Online Ordering Widget',
  `${brand.shortName} Scan & Order`,
  'Online Order',
] as const

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
  children,
  align = 'start',
}: {
  label: string
  children: ReactNode
  align?: 'start' | 'center'
}) {
  return (
    <div
      className={`grid gap-2 sm:grid-cols-[280px_minmax(0,1fr)] sm:gap-4 ${
        align === 'center' ? 'sm:items-center' : 'sm:items-start'
      }`}
    >
      <div className="text-sm font-medium text-ink sm:pt-2">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function Help({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>
}

function PrimaryHelp({ children }: { children: ReactNode }) {
  return (
    <p className="mt-1.5 text-xs leading-relaxed text-primary/90">{children}</p>
  )
}

function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-ink">
      {children}
    </div>
  )
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

function CheckGroup({
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

export default function ConnectedServicesSettings() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const [manualDayEnd, setManualDayEnd] = useState(false)
  const [blockDayEndActiveTables, setBlockDayEndActiveTables] = useState(false)
  const [blockDayEndUnsync, setBlockDayEndUnsync] = useState(false)
  const [restrictEditAfterDayEnd, setRestrictEditAfterDayEnd] = useState(false)

  const [sendLoyaltyDefault, setSendLoyaltyDefault] = useState(true)
  const [applyLoyaltyTypes, setApplyLoyaltyTypes] = useState<string[]>([
    ...APPLY_LOYALTY_TYPES,
  ])
  const [sendLoyaltyTypes, setSendLoyaltyTypes] = useState<string[]>([
    ...SEND_LOYALTY_TYPES,
  ])
  const [loyaltyOnDiscounted, setLoyaltyOnDiscounted] = useState(true)
  const [sendLoyaltyWhen, setSendLoyaltyWhen] = useState('Print Bill')

  const [cashDrawerCashOnly, setCashDrawerCashOnly] = useState(false)

  const [kdsUpdateOrderScreen, setKdsUpdateOrderScreen] = useState(true)
  const [kdsMarkKotDone, setKdsMarkKotDone] = useState(true)

  const [printKotCaptain, setPrintKotCaptain] = useState(true)
  const [discountCaptain, setDiscountCaptain] = useState(false)
  const [notifyCaptain, setNotifyCaptain] = useState('None')

  const [pinReset, setPinReset] = useState('On Settle & Save')

  const [enableEInvoice, setEnableEInvoice] = useState(false)

  const [barcodePrefix, setBarcodePrefix] = useState('')
  const [weightChars, setWeightChars] = useState('5')
  const [weightDenominator, setWeightDenominator] = useState('1000')
  const [multiItemBarcode, setMultiItemBarcode] = useState(false)

  const [restrictExpenseToday, setRestrictExpenseToday] = useState(false)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function toggleIn(
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
    showToast('Connected services settings saved')
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
        The Following Settings Can Be Used To Configure All The Connected
        Services With The System.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-8 p-5 sm:p-6">
          <Section
            title="Day End Settings"
            description="The following settings helps in configures enabling Day End module in billing screen"
          >
            <div className="space-y-3">
              <CheckRow
                checked={manualDayEnd}
                onChange={setManualDayEnd}
                label="Enable Manual Day End"
              />
              <CheckRow
                checked={blockDayEndActiveTables}
                onChange={setBlockDayEndActiveTables}
                label="Don't allow Day End if there is any active table on Table View Screen."
              />
              <CheckRow
                checked={blockDayEndUnsync}
                onChange={setBlockDayEndUnsync}
                label="Don't allow Day End if there is any un-sync orders data"
              />
              <CheckRow
                checked={restrictEditAfterDayEnd}
                onChange={setRestrictEditAfterDayEnd}
                label="Restrict editing the order once the manual day end operation has been completed"
              />
            </div>
          </Section>

          <Section
            title="Loyalty Settings"
            description="The following settings pertains to configuring the loyalty settings in the billing screen"
          >
            <CheckRow
              checked={sendLoyaltyDefault}
              onChange={setSendLoyaltyDefault}
              label="Make 'Send Loyalty' option set as default on Billing screen."
            />
            <FormRow label="Apply Loyalty points when order punched as" align="start">
              <CheckGroup
                options={APPLY_LOYALTY_TYPES}
                values={applyLoyaltyTypes}
                onToggle={(value) =>
                  toggleIn(applyLoyaltyTypes, value, setApplyLoyaltyTypes)
                }
              />
            </FormRow>
            <FormRow label="Send Loyalty Data when order punched as" align="start">
              <CheckGroup
                options={SEND_LOYALTY_TYPES}
                values={sendLoyaltyTypes}
                onToggle={(value) =>
                  toggleIn(sendLoyaltyTypes, value, setSendLoyaltyTypes)
                }
              />
              <Help>
                This settings describe on which order types the data will be
                send to Loyalty Partners.
              </Help>
            </FormRow>
            <CheckRow
              checked={loyaltyOnDiscounted}
              onChange={setLoyaltyOnDiscounted}
              label="Customers to gain loyalty points for discounted orders."
            />
            <FormRow label="Send Loyalty Data (Only for Table Order)">
              <RadioGroup
                name="send-loyalty-when"
                value={sendLoyaltyWhen}
                options={['Print Bill', 'Settle & Save']}
                onChange={setSendLoyaltyWhen}
              />
              <Help>
                This settings describe when the Loyalty data will be send to
                Loyalty Partners.
              </Help>
            </FormRow>
          </Section>

          <Section
            title="Cash Drawer Settings"
            description="The following settings pertains to configuring the cash drawer in the billing screen"
          >
            <CheckRow
              checked={cashDrawerCashOnly}
              onChange={setCashDrawerCashOnly}
              label="Open cashdrawer for cash payment only"
            />
          </Section>

          <Section
            title="KDS Settings"
            description="The following settings would be used to configure the Kitchen Display System or KDS"
          >
            <div className="space-y-3">
              <CheckRow
                checked={kdsUpdateOrderScreen}
                onChange={setKdsUpdateOrderScreen}
                label="From KDS/KOT live screen send update to order screen."
                help="In case of any update (like marking an item/order ready) in KDS or KOT live view, the update would be also be present in Order screen."
              />
              <CheckRow
                checked={kdsMarkKotDone}
                onChange={setKdsMarkKotDone}
                label="On marking done all items on KDS, Mark KOT as done."
                help="Enabling the setting would mark the full KOT done at all places (including online aggregators) when all the items are marked done."
              />
            </div>
          </Section>

          <Section
            title="Captain App Settings"
            description="The following settings pertains to configuring the Captain App print settings."
          >
            <div className="space-y-3">
              <CheckRow
                checked={printKotCaptain}
                onChange={setPrintKotCaptain}
                label="Print KOT from Captain App"
              />
              <CheckRow
                checked={discountCaptain}
                onChange={setDiscountCaptain}
                label="Allow Discount from Captain APP (Applicable for Dine-in orders only)"
              />
            </div>
            <FormRow label="Notify captain users once the food ready is marked">
              <RadioGroup
                name="notify-captain"
                value={notifyCaptain}
                options={['Item Ready', 'KOT Ready', 'None']}
                onChange={setNotifyCaptain}
              />
            </FormRow>
          </Section>

          <Section
            title="Display Settings"
            description="The following settings would be used to configure the display settings of the PoS"
          >
            <FormRow label="Default Restaurant PIN reset">
              <RadioGroup
                name="pin-reset"
                value={pinReset}
                options={['On Print Bill', 'On Settle & Save']}
                onChange={setPinReset}
              />
            </FormRow>
          </Section>

          <Section
            title="E-Invoice Settings"
            description="The following settings pertains to configuring the e-Invoice settings."
          >
            <CheckRow
              checked={enableEInvoice}
              onChange={setEnableEInvoice}
              label="Enable e-Invoice"
            />
            <InfoBox>
              <p className="mb-2 font-medium text-ink">
                Requirements to generate e-Invoices:
              </p>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
                <li>Outlet GST information must be configured.</li>
                <li>Customer GST number is required on the bill.</li>
                <li>CGST/SGST tax configuration must be set for items.</li>
                <li>HSN numbers should be configured for items.</li>
                <li>Valid buyer address and state code are required.</li>
                <li>Invoice sequence and numbering must be active.</li>
                <li>Recharge e-Invoice credits if balance is low.</li>
                <li>Ensure biller has permission to generate e-Invoice.</li>
                <li>Note: IGST is not supported in this configuration.</li>
              </ol>
            </InfoBox>
          </Section>

          <Section
            title="Barcode Settings"
            description="The following settings pertains to configuring the Barcode settings."
          >
            <FormRow label="Prefix for Barcode">
              <input
                type="text"
                value={barcodePrefix}
                onChange={(event) => setBarcodePrefix(event.target.value)}
                className={inputClass}
              />
              <PrimaryHelp>
                This field is required if want to activate this service settings
                in POS.
              </PrimaryHelp>
            </FormRow>
            <FormRow label="No. of Characters to calculate Weight">
              <input
                type="text"
                value={weightChars}
                onChange={(event) => setWeightChars(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <FormRow label="Weight Denominator">
              <input
                type="text"
                value={weightDenominator}
                onChange={(event) => setWeightDenominator(event.target.value)}
                className={inputClass}
              />
            </FormRow>
            <CheckRow
              checked={multiItemBarcode}
              onChange={setMultiItemBarcode}
              label="Allow entries of multiple items in single barcode/ QR code"
            />
            <div className="rounded-lg border border-line bg-page/50 px-4 py-3">
              <p className="text-sm font-semibold text-primary">
                How to configure?
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Example: For barcode <span className="font-medium text-ink">9002200048</span>,
                if Prefix is <span className="font-medium text-ink">900</span>,
                product code length is remaining middle digits, and weight uses{' '}
                {weightChars || '5'} characters with denominator{' '}
                {weightDenominator || '1000'}, then weight is calculated as{' '}
                <span className="font-medium text-ink">
                  00048 / {weightDenominator || '1000'}
                </span>
                .
              </p>
            </div>
          </Section>

          <Section
            title="Expense Settings"
            description="The following settings pertains to configuring the Expense settings."
          >
            <CheckRow
              checked={restrictExpenseToday}
              onChange={setRestrictExpenseToday}
              label="Restrict users to add expense and withdrawal for current date only."
              help="If the configuration is enabled then the users would only be able to add expense and withdrawal for current date."
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
