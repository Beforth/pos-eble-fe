import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const inputClass =
  'h-10 w-full max-w-xs rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'
const selectClass = inputClass

const BATCH_SIZES = ['10', '20', '30', '50', '100']
const SYNC_MINUTES = ['1', '2', '3', '5', '10', '15', '30']
const SYNC_SECONDS = ['1', '2', '3', '5', '10', '15', '30']

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
      className={`grid gap-2 sm:grid-cols-[300px_minmax(0,1fr)] sm:gap-4 ${
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

export default function BillingSystemSettings() {
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const [batchSize, setBatchSize] = useState('20')
  const [orderLimit, setOrderLimit] = useState('500')
  const [autoSyncTime, setAutoSyncTime] = useState('5')
  const [pendingSyncTime, setPendingSyncTime] = useState('5')
  const [captainIntranetSync, setCaptainIntranetSync] = useState('5')
  const [editOrdersMinutes, setEditOrdersMinutes] = useState('2880')
  const [autoSettleAfterPrint, setAutoSettleAfterPrint] = useState('')
  const [syncUse, setSyncUse] = useState('Secured')
  const [cancelHours, setCancelHours] = useState('168')

  const [paymentRequestSync, setPaymentRequestSync] = useState('5')
  const [checkPaymentRequestSync, setCheckPaymentRequestSync] = useState('5')
  const [voiceQrPayments, setVoiceQrPayments] = useState(false)

  const [refreshAfterBillPrint, setRefreshAfterBillPrint] = useState('0')
  const [managerPassword, setManagerPassword] = useState('')
  const [idleLogoutMins, setIdleLogoutMins] = useState('0')
  const [logsModifiedAfterPrint, setLogsModifiedAfterPrint] = useState(true)
  const [logsOrdersUpdated, setLogsOrdersUpdated] = useState(false)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function handleSave() {
    if (!orderLimit.trim() || !editOrdersMinutes.trim()) {
      showToast('Please fill required fields')
      return
    }
    if (!paymentRequestSync.trim() || !checkPaymentRequestSync.trim()) {
      showToast('Payment sync times are required')
      return
    }
    if (!refreshAfterBillPrint.trim() || !idleLogoutMins.trim()) {
      showToast('Please fill required display and security fields')
      return
    }
    const hours = Number(cancelHours)
    if (Number.isFinite(hours) && hours > 744) {
      showToast('Maximum cancellation window is 744 hours (31 days)')
      return
    }
    showToast('Billing system settings saved')
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
        These Settings Configure The Display Type, Order And Payment
        Synchronization Time(S) And The Additional Peripherals With The System
        Like KDS.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-8 p-5 sm:p-6">
          <Section title="Order And Order Sync Settings">
            <FormRow label="Sync Batch Packet Size">
              <select
                value={batchSize}
                onChange={(event) => setBatchSize(event.target.value)}
                className={selectClass}
              >
                {BATCH_SIZES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <Help>The number of orders that would be synced in one packet.</Help>
            </FormRow>

            <FormRow label="Default Order Limit" required>
              <input
                type="text"
                value={orderLimit}
                onChange={(event) => setOrderLimit(event.target.value)}
                className={inputClass}
              />
              <Help>
                The maximum number of orders that would be displayed in PoS.
              </Help>
            </FormRow>

            <FormRow label="Default Auto Sync Time">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={autoSyncTime}
                  onChange={(event) => setAutoSyncTime(event.target.value)}
                  className={selectClass}
                >
                  {SYNC_MINUTES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-muted">min</span>
              </div>
              <Help>
                The time taken for the orders to be synced with the dashboard
                automatically. Please note internet must be connected to enable
                auto-sync.
              </Help>
            </FormRow>

            <FormRow label="Default Pending Order Sync Time">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={pendingSyncTime}
                  onChange={(event) => setPendingSyncTime(event.target.value)}
                  className={selectClass}
                >
                  {SYNC_SECONDS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-muted">sec</span>
              </div>
              <Help>
                The time taken for the pending orders to be synced with the
                dashboard. Please note internet must be connected to enable
                auto-sync.
              </Help>
            </FormRow>

            <FormRow label="Default Captain Order Intranet Sync Time">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={captainIntranetSync}
                  onChange={(event) =>
                    setCaptainIntranetSync(event.target.value)
                  }
                  className={selectClass}
                >
                  {SYNC_SECONDS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-muted">sec</span>
              </div>
            </FormRow>

            <FormRow label="No. of Minutes to Edit Orders" required>
              <input
                type="text"
                value={editOrdersMinutes}
                onChange={(event) => setEditOrdersMinutes(event.target.value)}
                className={inputClass}
              />
            </FormRow>

            <FormRow label="No. of Minutes to Auto Settle After Print">
              <input
                type="text"
                value={autoSettleAfterPrint}
                onChange={(event) => setAutoSettleAfterPrint(event.target.value)}
                className={inputClass}
              />
              <Help>
                Note: The order cannot be modified once it is auto settled,
                despite the relevant rights to modify order is given.
              </Help>
            </FormRow>

            <FormRow label="For sync use">
              <RadioGroup
                name="sync-use"
                value={syncUse}
                options={['Secured', 'Normal']}
                onChange={setSyncUse}
              />
            </FormRow>

            <FormRow label="Number of hours for which the order can be cancelled from the dashboard">
              <input
                type="text"
                value={cancelHours}
                onChange={(event) => setCancelHours(event.target.value)}
                className={inputClass}
              />
              <Help>
                Note: The user can select a maximum of 744 hours for cancellation
                (31 days), the default selection if of 168 hours (7 days).
              </Help>
            </FormRow>
          </Section>

          <Section
            title="Payment Sync Settings"
            description="The following settings are related to Payment synchronization settings"
          >
            <FormRow label="Payment request sync time" required>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={paymentRequestSync}
                  onChange={(event) => setPaymentRequestSync(event.target.value)}
                  className={inputClass}
                />
                <span className="text-sm text-muted">secs</span>
              </div>
            </FormRow>
            <FormRow label="Check payment request sync time" required>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={checkPaymentRequestSync}
                  onChange={(event) =>
                    setCheckPaymentRequestSync(event.target.value)
                  }
                  className={inputClass}
                />
                <span className="text-sm text-muted">secs</span>
              </div>
            </FormRow>
            <CheckRow
              checked={voiceQrPayments}
              onChange={setVoiceQrPayments}
              label="Enable voice notification on received Static QR payments"
            />
          </Section>

          <Section
            title="Display Settings"
            description="The following settings would be used to configure the display settings of the PoS"
          >
            <FormRow label="Billing Screen Refresh After No. Of Bill Print" required>
              <input
                type="text"
                value={refreshAfterBillPrint}
                onChange={(event) =>
                  setRefreshAfterBillPrint(event.target.value)
                }
                className={inputClass}
              />
              <Help>
                This setting describes after how many bill prints would the
                screen refreshes.
              </Help>
            </FormRow>
          </Section>

          <Section
            title="Security Setting"
            description="The following settings help in determining the settings related to security of the application."
          >
            <FormRow label="Default Manager Password for Desktop Use">
              <input
                type="password"
                value={managerPassword}
                onChange={(event) => setManagerPassword(event.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </FormRow>
            <FormRow label="User Idle time for Logout" required>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={idleLogoutMins}
                  onChange={(event) => setIdleLogoutMins(event.target.value)}
                  className={inputClass}
                />
                <span className="text-sm text-muted">mins</span>
              </div>
            </FormRow>
          </Section>

          <Section title="Logging Settings">
            <div className="space-y-3">
              <CheckRow
                checked={logsModifiedAfterPrint}
                onChange={setLogsModifiedAfterPrint}
                label="Display logs for orders modified after bill print"
                help="Once enabled the logs of orders are modified post bill print, either through POS or web, would be displayed."
              />
              <CheckRow
                checked={logsOrdersUpdated}
                onChange={setLogsOrdersUpdated}
                label="Display Logs for orders updated"
                help="Once enabled the logs of orders are updated post bill print, either through POS or web, would be displayed."
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
    </ReportsPageShell>
  )
}
