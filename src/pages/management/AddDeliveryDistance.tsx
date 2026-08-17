import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function FormRow({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center sm:gap-4">
      <label className="text-sm font-medium text-ink">
        {label} {required ? <span className="text-primary">*</span> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export default function AddDeliveryDistance() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [toast, setToast] = useState<string | null>(null)
  const [from, setFrom] = useState(isEdit ? '0' : '')
  const [to, setTo] = useState(isEdit ? '5' : '')
  const [price, setPrice] = useState(isEdit ? '30' : '')

  const title = useMemo(
    () => (isEdit ? 'Edit Distance' : 'Add Distance'),
    [isEdit],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/delivery-distance')
  }

  function handleSave() {
    if (!from.trim() || !to.trim() || !price.trim()) {
      showToast('Please fill all required fields')
      return
    }
    showToast(isEdit ? 'Distance updated' : 'Distance saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell title={title} activeItem="config-delivery-distance">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-5 p-5 sm:p-6">
          <FormRow label="From" required>
            <input
              type="text"
              inputMode="decimal"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className={inputClass}
            />
          </FormRow>
          <FormRow label="To" required>
            <input
              type="text"
              inputMode="decimal"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className={inputClass}
            />
          </FormRow>
          <FormRow label="Price" required>
            <input
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className={inputClass}
            />
          </FormRow>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-primary/5 px-5 py-4 sm:px-6">
          <OutlineButton variant="gray" onClick={goBack}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </div>
    </ReportsPageShell>
  )
}
