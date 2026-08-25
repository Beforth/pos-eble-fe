import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ConfigBreadcrumb,
  ConfigSaveBar,
  ConfigSectionCard,
  MutedHelp,
} from '../../components/management/ConfigSectionCard'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
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
  const [toast, setToast] = useState<string | null>(null)
  const [storeDailyStats, setStoreDailyStats] = useState(true)
  const [sendDailyStats, setSendDailyStats] = useState(true)

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/outlet')
  }

  function handleSave() {
    showToast('SMS configuration saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell
      title={
        <ConfigBreadcrumb onNavigate={goBack} current="SMS Configuration" />
      }
      activeItem="config-outlet"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

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
