import { useEffect, useState } from 'react'

import { showToast } from '../../utils/toast'
import {
  CreditCard,
  History,
  Monitor,
  RefreshCw,
  ShieldCheck,
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
  'h-10 w-full max-w-xs rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'
const selectClass = inputClass

const BATCH_SIZES = ['10', '20', '30', '50', '100']
const SYNC_MINUTES = ['1', '2', '3', '5', '10', '15', '30']
const SYNC_SECONDS = ['1', '2', '3', '5', '10', '15', '30']

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

export default function BillingSystemSettings() {
  const navigate = useNavigate()

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

  const { loading, data, save } = useOutletSettings('billing-system')

  const loadedRef = { current: false }
  useEffect(() => {
    if (!data || loadedRef.current) return
    loadedRef.current = true
    const value = data
    if (value.sync_batch_size != null) setBatchSize(String(value.sync_batch_size))
    if (value.default_order_limit != null) setOrderLimit(String(value.default_order_limit))
    if (value.auto_sync_time_mins != null) setAutoSyncTime(String(value.auto_sync_time_mins))
    if (value.pending_order_sync_time_secs != null)
      setPendingSyncTime(String(value.pending_order_sync_time_secs))
    if (value.captain_order_intranet_sync_secs != null)
      setCaptainIntranetSync(String(value.captain_order_intranet_sync_secs))
    if (value.edit_orders_minutes != null)
      setEditOrdersMinutes(String(value.edit_orders_minutes))
    if (value.auto_settle_after_print_minutes != null)
      setAutoSettleAfterPrint(String(value.auto_settle_after_print_minutes))
    if (value.sync_use) setSyncUse(String(value.sync_use))
    if (value.order_cancel_hours != null)
      setCancelHours(String(value.order_cancel_hours))
    if (value.payment_request_sync_secs != null)
      setPaymentRequestSync(String(value.payment_request_sync_secs))
    if (value.check_payment_request_sync_secs != null)
      setCheckPaymentRequestSync(String(value.check_payment_request_sync_secs))
    if (value.voice_notification_qr_payments != null)
      setVoiceQrPayments(Boolean(value.voice_notification_qr_payments))
    if (value.billing_screen_refresh_after_print != null)
      setRefreshAfterBillPrint(String(value.billing_screen_refresh_after_print))
    if (value.user_idle_logout_mins != null)
      setIdleLogoutMins(String(value.user_idle_logout_mins))
    if (value.logs_modified_after_print != null)
      setLogsModifiedAfterPrint(Boolean(value.logs_modified_after_print))
    if (value.logs_orders_updated != null)
      setLogsOrdersUpdated(Boolean(value.logs_orders_updated))
  }, [data])


  function goBack() {
    navigate('/management/configuration/outlet')
  }

  async function handleSave() {
    const requiredFields: Array<[string, string]> = [
      [batchSize, 'Sync Batch Packet Size'],
      [orderLimit, 'Default Order Limit'],
      [autoSyncTime, 'Default Auto Sync Time'],
      [pendingSyncTime, 'Default Pending Order Sync Time'],
      [captainIntranetSync, 'Default Captain Order Intranet Sync Time'],
      [editOrdersMinutes, 'No. of Minutes to Edit Orders'],
      [cancelHours, 'Cancellation Window Hours'],
      [paymentRequestSync, 'Payment Request Sync Time'],
      [checkPaymentRequestSync, 'Check Payment Request Sync Time'],
      [refreshAfterBillPrint, 'Billing Screen Refresh After Print'],
      [idleLogoutMins, 'User Idle Time for Logout'],
    ]
    const missing = requiredFields
      .filter(([value]) => !value.trim())
      .map(([, label]) => label)
    if (missing.length > 0) {
      showToast(`Required field${missing.length > 1 ? 's' : ''} missing: ${missing.join(', ')}`)
      return
    }
    const hours = Number(cancelHours)
    if (Number.isFinite(hours) && hours > 744) {
      showToast('Maximum cancellation window is 744 hours (31 days)')
      return
    }
    const payload: OutletSettingsRecord = {
      sync_batch_size: batchSize,
      default_order_limit: orderLimit,
      auto_sync_time_mins: autoSyncTime,
      pending_order_sync_time_secs: pendingSyncTime,
      captain_order_intranet_sync_secs: captainIntranetSync,
      edit_orders_minutes: editOrdersMinutes,
      auto_settle_after_print_minutes: autoSettleAfterPrint,
      sync_use: syncUse,
      order_cancel_hours: cancelHours,
      payment_request_sync_secs: paymentRequestSync,
      check_payment_request_sync_secs: checkPaymentRequestSync,
      voice_notification_qr_payments: voiceQrPayments,
      billing_screen_refresh_after_print: refreshAfterBillPrint,
      user_idle_logout_mins: idleLogoutMins,
      logs_modified_after_print: logsModifiedAfterPrint,
      logs_orders_updated: logsOrdersUpdated,
    }
    if (managerPassword.trim()) {
      payload.manager_password = managerPassword.trim()
    }
    try {
      await save(payload)
      showToast('Billing system settings saved')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save billing system settings',
      )
    }
  }

  if (loading && !data) {
    return <SettingsPageLoading />
  }

  return (
    <ReportsPageShell title={<ConfigBreadcrumb onNavigate={goBack} current="Billing System" />} activeItem="config-outlet">

      <p className="-mt-1 mb-5 text-sm text-muted">
        These Settings Configure The Display Type, Order And Payment
        Synchronization Time(S) And The Additional Peripherals With The System
        Like KDS.
      </p>

      <ConfigSectionCard
        icon={<RefreshCw size={16} />}
        title="Order And Order Sync Settings"
        description="Order limits and synchronization intervals with the dashboard."
      >
        <div className="space-y-4">
          <ConfigFormRow label="Sync Batch Packet Size" align="center">
            <>
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
              <MutedHelp>
                The number of orders that would be synced in one packet.
              </MutedHelp>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="Default Order Limit" required align="center">
            <>
              <input
                type="text"
                value={orderLimit}
                onChange={(event) => setOrderLimit(event.target.value)}
                className={inputClass}
              />
              <MutedHelp>
                The maximum number of orders that would be displayed in PoS.
              </MutedHelp>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="Default Auto Sync Time" align="center">
            <>
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
              <MutedHelp>
                The time taken for the orders to be synced with the dashboard
                automatically. Please note internet must be connected to enable
                auto-sync.
              </MutedHelp>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="Default Pending Order Sync Time" align="center">
            <>
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
              <MutedHelp>
                The time taken for the pending orders to be synced with the
                dashboard. Please note internet must be connected to enable
                auto-sync.
              </MutedHelp>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="Default Captain Order Intranet Sync Time" align="center">
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
          </ConfigFormRow>

          <ConfigFormRow label="No. of Minutes to Edit Orders" required align="center">
            <input
              type="text"
              value={editOrdersMinutes}
              onChange={(event) => setEditOrdersMinutes(event.target.value)}
              className={inputClass}
            />
          </ConfigFormRow>

          <ConfigFormRow label="No. of Minutes to Auto Settle After Print" align="center">
            <>
              <input
                type="text"
                value={autoSettleAfterPrint}
                onChange={(event) => setAutoSettleAfterPrint(event.target.value)}
                className={inputClass}
              />
              <MutedHelp>
                Note: The order cannot be modified once it is auto settled,
                despite the relevant rights to modify order is given.
              </MutedHelp>
            </>
          </ConfigFormRow>

          <ConfigFormRow label="For sync use" align="center">
            <RadioGroup
              name="sync-use"
              value={syncUse}
              options={['Secured', 'Normal']}
              onChange={setSyncUse}
            />
          </ConfigFormRow>

          <ConfigFormRow label="Number of hours for which the order can be cancelled from the dashboard" align="center">
            <>
              <input
                type="text"
                value={cancelHours}
                onChange={(event) => setCancelHours(event.target.value)}
                className={inputClass}
              />
              <MutedHelp>
                Note: The user can select a maximum of 744 hours for cancellation
                (31 days), the default selection if of 168 hours (7 days).
              </MutedHelp>
            </>
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<CreditCard size={16} />}
        title="Payment Sync Settings"
        description="The following settings are related to Payment synchronization settings"
      >
        <div className="space-y-4">
          <ConfigFormRow label="Payment request sync time" required align="center">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={paymentRequestSync}
                onChange={(event) => setPaymentRequestSync(event.target.value)}
                className={inputClass}
              />
              <span className="text-sm text-muted">secs</span>
            </div>
          </ConfigFormRow>
          <ConfigFormRow label="Check payment request sync time" required align="center">
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
          </ConfigFormRow>
          <CheckRow
            checked={voiceQrPayments}
            onChange={setVoiceQrPayments}
            label="Enable voice notification on received Static QR payments"
          />
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<Monitor size={16} />}
        title="Display Settings"
        description="The following settings would be used to configure the display settings of the PoS"
      >
        <ConfigFormRow label="Billing Screen Refresh After No. Of Bill Print" required align="center">
          <>
            <input
              type="text"
              value={refreshAfterBillPrint}
              onChange={(event) =>
                setRefreshAfterBillPrint(event.target.value)
              }
              className={inputClass}
            />
            <MutedHelp>
              This setting describes after how many bill prints would the
              screen refreshes.
            </MutedHelp>
          </>
        </ConfigFormRow>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<ShieldCheck size={16} />}
        title="Security Setting"
        description="The following settings help in determining the settings related to security of the application."
      >
        <div className="space-y-4">
          <ConfigFormRow label="Default Manager Password for Desktop Use" align="center">
            <input
              type="password"
              value={managerPassword}
              onChange={(event) => setManagerPassword(event.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </ConfigFormRow>
          <ConfigFormRow label="User Idle time for Logout" required align="center">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={idleLogoutMins}
                onChange={(event) => setIdleLogoutMins(event.target.value)}
                className={inputClass}
              />
              <span className="text-sm text-muted">mins</span>
            </div>
          </ConfigFormRow>
        </div>
      </ConfigSectionCard>

      <ConfigSectionCard
        icon={<History size={16} />}
        title="Logging Settings"
        description="Control which order modification logs are recorded and displayed."
      >
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
      </ConfigSectionCard>

      <ConfigSaveBar onCancel={goBack} onSave={handleSave} />
    </ReportsPageShell>
  )
}
