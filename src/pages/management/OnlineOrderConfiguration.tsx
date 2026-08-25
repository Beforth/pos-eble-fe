import { useState } from 'react'
import {
  CalendarClock,
  Clock,
  Settings2,
  Timer,
  Zap,
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
import { brand } from '../../theme/brand'

const inputClass =
  'h-10 w-full max-w-xs rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'
const selectClass = inputClass

const AUTO_CANCEL_OPTIONS = ['5', '10', '15', '20', '30', '45', '60']
const REMINDER_OPTIONS = ['15', '30', '45', '60', '90', '120']

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

export default function OnlineOrderConfiguration() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const [kotAfterAutoAccept, setKotAfterAutoAccept] = useState(true)
  const [kotInAdvanceOrder, setKotInAdvanceOrder] = useState(false)
  const [billAfterAutoAccept, setBillAfterAutoAccept] = useState(true)

  const [ignoreDeliveryCharge, setIgnoreDeliveryCharge] = useState(false)
  const [deliveryCharges, setDeliveryCharges] = useState('0')
  const [minOrderAmount, setMinOrderAmount] = useState('0')
  const [autoCancelDuration, setAutoCancelDuration] = useState('15')
  const [acceptOnlinePayment, setAcceptOnlinePayment] = useState(false)
  const [generateInvoicesOnAccept, setGenerateInvoicesOnAccept] = useState(true)

  const [minPrepTime, setMinPrepTime] = useState('30')
  const [minDeliveryTime, setMinDeliveryTime] = useState('30')

  const [priorReminder, setPriorReminder] = useState('60')
  const [noMemoAdvance, setNoMemoAdvance] = useState(false)
  const [kotOnMemoAdvance, setKotOnMemoAdvance] = useState(true)
  const [manualInvoiceFromMemo, setManualInvoiceFromMemo] = useState(false)
  const [printKotOnlineAdvance, setPrintKotOnlineAdvance] = useState(false)
  const [skipOfflineStockCheck, setSkipOfflineStockCheck] = useState(false)
  const [minAdvanceAmountValidation, setMinAdvanceAmountValidation] =
    useState(false)

  const [turnOffDuration, setTurnOffDuration] = useState('None')

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function handleSave() {
    showToast('Online order configuration saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell
      title={
        <ConfigBreadcrumb
          onNavigate={goBack}
          current="Online / Advance Order Configuration"
        />
      }
      activeItem="config-outlet"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        Configuration System Level Parameters Such As Auto Accept, Cancellation
        Timings Etc. Of An Online Order/Advance Order.
      </p>

      <ConfigSectionCard
        icon={<Zap size={16} />}
        title="Online Order Auto Acceptance"
        description="Settings for actions that occur after an online order is automatically accepted."
      >
        <div className="space-y-3">
          <CheckRow
            checked={kotAfterAutoAccept}
            onChange={setKotAfterAutoAccept}
            label="KOT print after autoaccept"
            help="Print a Kitchen Order Ticket immediately upon auto-acceptance."
          />
          <CheckRow
            checked={kotInAdvanceOrder}
            onChange={setKotInAdvanceOrder}
            label="KOT in Advance order"
            help="Create a KOT specifically for advance orders."
          />
          <CheckRow
            checked={billAfterAutoAccept}
            onChange={setBillAfterAutoAccept}
            label="Bill print after autoaccept"
            help="Print a bill as soon as an online order is auto-accepted."
          />
        </div>
        <MutedHelp>
          To enable auto-acceptance, visit settings for Swiggy, Zomato, online
          ordering widgets, or Menu QR under the Marketplace section.
        </MutedHelp>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Settings2 size={16} />}
        title="Online Orders System Configuration"
        description="Financial and logistics parameters for online orders."
      >
        <div className="space-y-4">
          <CheckRow
            checked={ignoreDeliveryCharge}
            onChange={setIgnoreDeliveryCharge}
            label="Ignore Online Order Delivery Charge"
            help="If checked, delivery charges sent by external platforms will be ignored in the invoice total."
          />
          <ConfigFormRow label={`Delivery Charges (${brand.currency})`}>
            <>
              <input
                type="text"
                value={deliveryCharges}
                onChange={(event) => setDeliveryCharges(event.target.value)}
                className={inputClass}
              />
              <MutedHelp>
                Enter default delivery charge to enable across all online
                ordering channels to set.
              </MutedHelp>
            </>
          </ConfigFormRow>
          <ConfigFormRow label={`Minimum Order Amount (${brand.currency})`}>
            <>
              <input
                type="text"
                value={minOrderAmount}
                onChange={(event) => setMinOrderAmount(event.target.value)}
                className={inputClass}
              />
              <MutedHelp>
                Enter minimum order amount. this field is not being used by all
                provider.
              </MutedHelp>
            </>
          </ConfigFormRow>
          <ConfigFormRow label="Auto Cancel Duration" align="center">
            <>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={autoCancelDuration}
                  onChange={(event) =>
                    setAutoCancelDuration(event.target.value)
                  }
                  className={selectClass}
                >
                  {AUTO_CANCEL_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-muted">minutes</span>
              </div>
              <MutedHelp>
                if order is not accepted within time set above, order will get
                rejected.
              </MutedHelp>
            </>
          </ConfigFormRow>
          <CheckRow
            checked={acceptOnlinePayment}
            onChange={setAcceptOnlinePayment}
            label="Accept Online Payment"
            help="Click here if you are accpeting online payments. this info is not synced with every third parties."
          />
          <CheckRow
            checked={generateInvoicesOnAccept}
            onChange={setGenerateInvoicesOnAccept}
            label="Generate invoices when orders accepted using the acceptance app or web dashboard?"
            help={`Orders accepted using the Acceptance app or web dashboard will have a unique series of invoice IDs (Ex: O1, O2, O3....) and these orders will not be visible on the ${brand.shortName} desktop/android.`}
          />
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Timer size={16} />}
        title="Delivery And Preparation Time"
      >
        <div className="space-y-4">
          <ConfigFormRow label="Minimum Preparation Time" align="center">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={minPrepTime}
                onChange={(event) => setMinPrepTime(event.target.value)}
                className={inputClass}
              />
              <span className="text-sm text-muted">min</span>
            </div>
          </ConfigFormRow>
          <ConfigFormRow label="Minimum Delivery Time" align="center">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={minDeliveryTime}
                onChange={(event) => setMinDeliveryTime(event.target.value)}
                className={inputClass}
              />
              <span className="text-sm text-muted">min</span>
            </div>
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<CalendarClock size={16} />}
        title="Advance Order Setting"
        description="The following settings related to an advance order."
      >
        <div className="space-y-4">
          <ConfigFormRow label="Prior Reminder for Advance Order" align="center">
            <>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={priorReminder}
                  onChange={(event) => setPriorReminder(event.target.value)}
                  className={selectClass}
                >
                  {REMINDER_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-muted">minutes</span>
              </div>
              <MutedHelp>
                Please set the time to change the prior reminder of an advance
                order.
              </MutedHelp>
            </>
          </ConfigFormRow>

          <div className="space-y-3">
            <CheckRow
              checked={noMemoAdvance}
              onChange={setNoMemoAdvance}
              label="Do not create memo for advance orders (Offline Orders Only)"
            />
            <CheckRow
              checked={kotOnMemoAdvance}
              onChange={setKotOnMemoAdvance}
              label="Create kot on creating memo for advance orders (Offline orders Only)"
            />
            <CheckRow
              checked={manualInvoiceFromMemo}
              onChange={setManualInvoiceFromMemo}
              label="Create invoice from memo manually after settlement"
              help="When enabled, invoice for settled orders won't be created automatically. The biller must manually create invoice from advanced order grid."
            />
            <CheckRow
              checked={printKotOnlineAdvance}
              onChange={setPrintKotOnlineAdvance}
              label="Print Kot on accepting online advance order"
            />
            <CheckRow
              checked={skipOfflineStockCheck}
              onChange={setSkipOfflineStockCheck}
              label="Do not check offline stock at time of advance order"
            />
            <CheckRow
              checked={minAdvanceAmountValidation}
              onChange={setMinAdvanceAmountValidation}
              label="Enable Minimum Advance Amount Validation"
            />
          </div>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Clock size={16} />}
        title="Set Custom Turn-Off Time"
        description="Enable to predefine a specific time for items to become unavailable for online orders when turning off an item. You can then quickly select this saved time whenever you turn off an item for online orders."
      >
        <ConfigFormRow label="Select Duration" align="center">
          <RadioGroup
            name="turn-off-duration"
            value={turnOffDuration}
            options={['None', 'Day(s)', 'Hour(s)', 'Minute(s)']}
            onChange={setTurnOffDuration}
          />
        </ConfigFormRow>
      </ConfigSectionCard>

      <ConfigSaveBar onCancel={goBack} onSave={handleSave} />
    </ReportsPageShell>
  )
}
