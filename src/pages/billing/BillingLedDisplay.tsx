import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

const STORAGE_KEY = 'rajubhai.ledDisplay'

interface LedSettings {
  comPort: string
  baudRate: string
  showTotalLabel: boolean
  textCommand: string
  dataCommand: string
}

const DEFAULTS: LedSettings = {
  comPort: '',
  baudRate: '',
  showTotalLabel: true,
  textCommand: '27,115,50',
  dataCommand: '27,81,65,#petpooja_data,13',
}

function loadSettings(): LedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

const inputClass =
  'h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid items-center gap-2 sm:grid-cols-[1fr_1fr]">
      <span className="text-sm font-medium text-ink">
        {label} <span className="text-primary">*</span>
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  )
}

export default function BillingLedDisplay() {
  const navigate = useNavigate()
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')
  const [form, setForm] = useState<LedSettings>(loadSettings)

  function patch(next: Partial<LedSettings>) {
    setForm((prev) => ({ ...prev, ...next }))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (
      !form.comPort.trim() ||
      !form.baudRate.trim() ||
      !form.textCommand.trim() ||
      !form.dataCommand.trim()
    ) {
      showToast('Fill in all required fields')
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
      showToast('LED display settings saved')
    } catch {
      showToast('Could not save LED display settings')
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-page">
      <BillingHeader
        billNo={billNo}
        onBillNoChange={setBillNo}
        onNewOrder={() => startNewOrder()}
        onViewKot={() => navigate('/billing?kot=1')}
      />

      <div className="flex items-center justify-between border-b border-line bg-card px-5 py-3">
        <h1 className="text-lg font-semibold text-ink">LED Display Settings</h1>
        <button
          type="button"
          onClick={() => navigate('/billing/operations')}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-4 text-sm font-medium text-ink hover:border-primary hover:text-primary"
        >
          <ChevronLeft size={14} />
          Back
        </button>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-8">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-5xl rounded-xl border border-line bg-card"
        >
          <div className="flex max-w-3xl flex-col gap-4 p-6">
            <Field
              label="COM Port"
              value={form.comPort}
              onChange={(comPort) => patch({ comPort })}
            />
            <Field
              label="Baud Rate"
              value={form.baudRate}
              onChange={(baudRate) => patch({ baudRate })}
            />
            <label className="flex items-center gap-2 text-sm text-ink sm:ml-[50%]">
              <input
                type="checkbox"
                checked={form.showTotalLabel}
                onChange={(event) => patch({ showTotalLabel: event.target.checked })}
                className="size-4 accent-primary"
              />
              Show Total Label on led screen
            </label>
            <Field
              label="Text Display Command"
              value={form.textCommand}
              onChange={(textCommand) => patch({ textCommand })}
            />
            <Field
              label="Data Display Command"
              value={form.dataCommand}
              onChange={(dataCommand) => patch({ dataCommand })}
            />
          </div>
          <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
            <button
              type="button"
              onClick={() => navigate('/billing/operations')}
              className="h-10 rounded-lg border border-line bg-card px-5 text-sm font-medium text-ink hover:border-primary hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Test &amp; Save
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
