import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { brand } from '../../theme/brand'

function Help({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs leading-relaxed text-muted">{children}</p>
}

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
        {help ? <Help>{help}</Help> : null}
        {note ? (
          <p className="mt-1 text-xs leading-relaxed text-primary/90">{note}</p>
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
    <ReportsPageShell title="Outlet Configuration" activeItem="config-outlet">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <p className="-mt-1 mb-5 text-sm text-muted">
        Configure The Option Available To Receive SMS Notifications From{' '}
        {brand.shortName}.
      </p>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-6 p-5 sm:p-6">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink">
              Notification Settings
            </h2>
          </div>

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
