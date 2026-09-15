import { useEffect, useState } from 'react'

import { showToast } from '../../utils/toast'
import { MessageSquare } from 'lucide-react'
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
import { brand } from '../../theme/brand'

function CheckRow({
  checked,
  onChange,
  label,
  help,
  note,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  help?: string
  note?: string
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
        {note ? (
          <p className="mt-1 text-xs leading-relaxed text-muted">{note}</p>
        ) : null}
      </span>
    </label>
  )
}

export default function SmsConfiguration() {
  const navigate = useNavigate()
  const [storeDailyStats, setStoreDailyStats] = useState(true)
  const [sendDailyStats, setSendDailyStats] = useState(true)
  const { loading, data, save } = useOutletSettings('sms')

  const loadedRef = { current: false }
  useEffect(() => {
    if (!data || loadedRef.current) return
    loadedRef.current = true
    setStoreDailyStats(data.store_daily_stats == null ? true : Boolean(data.store_daily_stats))
    setSendDailyStats(data.send_daily_stats == null ? true : Boolean(data.send_daily_stats))
  }, [data])


  function goBack() {
    navigate('/management/configuration/outlet')
  }

  async function handleSave() {
    try {
      await save({
        store_daily_stats: storeDailyStats,
        send_daily_stats: sendDailyStats,
      })
      showToast('SMS configuration saved')
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save SMS settings',
      )
    }
  }

  if (loading && !data) {
    return <SettingsPageLoading />
  }

  return (
    <ReportsPageShell
      title={
        <ConfigBreadcrumb onNavigate={goBack} current="SMS Configuration" />
      }
      activeItem="config-outlet"
    >

      <p className="-mt-1 mb-5 text-sm text-muted">
        Configure The Option Available To Receive SMS Notifications From{' '}
        {brand.shortName}.
      </p>

      <ConfigSectionCard
        icon={<MessageSquare size={16} />}
        title="Notification Settings"
        description="Choose which daily sales SMS notifications the outlet receives."
      >
        <div className="space-y-4">
          <CheckRow
            checked={storeDailyStats}
            onChange={setStoreDailyStats}
            label="Store Daily Sales Statistics"
            help="Selecting this option will store a daily sales statistics."
            note="This option will be disabled automatically if the outlet is not synced for more than 10 days."
          />
          <CheckRow
            checked={sendDailyStats}
            onChange={setSendDailyStats}
            label="Send Daily Sales Statistics"
            help="Selecting this option will send a daily sales statistics SMS to the registered mobile number."
          />
        </div>
      </ConfigSectionCard>

      <ConfigSaveBar onCancel={goBack} onSave={handleSave} />
    </ReportsPageShell>
  )
}