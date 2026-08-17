import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

export default function AddDenomination() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [available, setAvailable] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState('')

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/accounting/denomination')
  }

  function handleSave() {
    if (!value.trim()) {
      setError('Denomination is required')
      return
    }
    setError('')
    showToast('Denomination saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell
      title="Add Denomination"
      activeItem="acct-denomination"
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="rounded-xl border border-line bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
          <label className="min-w-0 flex-1 space-y-1.5">
            <span className="text-sm font-medium text-ink">
              Denomination <span className="text-danger">*</span>
            </span>
            <input
              type="text"
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                if (error) setError('')
              }}
              className={`h-10 w-full rounded-md border bg-card px-3 text-sm text-ink outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${
                error ? 'border-danger' : 'border-line'
              }`}
            />
            {error ? <span className="text-xs text-danger">{error}</span> : null}
          </label>

          <label className="inline-flex h-10 shrink-0 items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={available}
              onChange={(event) => setAvailable(event.target.checked)}
              className="size-4 rounded border-line accent-primary"
            />
            Available
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <OutlineButton variant="gray" onClick={goBack}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </div>
    </ReportsPageShell>
  )
}
