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
  align = 'center',
}: {
  label: string
  required?: boolean
  children: ReactNode
  align?: 'start' | 'center'
}) {
  return (
    <div
      className={`grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4 ${
        align === 'start' ? 'sm:items-start' : 'sm:items-center'
      }`}
    >
      <label className="text-sm font-medium text-ink">
        {label} {required ? <span className="text-primary">*</span> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export default function AddSubOrderType() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [toast, setToast] = useState<string | null>(null)
  const [name, setName] = useState(isEdit ? 'Parcel' : '')
  const [status, setStatus] = useState(true)

  const title = useMemo(
    () => (isEdit ? 'Edit Sub Order Type' : 'Add Sub Order Type'),
    [isEdit],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/sub-order-type')
  }

  function handleSave() {
    if (!name.trim()) {
      showToast('Name is required')
      return
    }
    showToast(isEdit ? 'Sub order type updated' : 'Sub order type saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell title={title} activeItem="config-sub-order-type">
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-6 p-5 sm:p-6">
          <FormRow label="Name" required>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClass}
            />
          </FormRow>

          <FormRow label="Status">
            <input
              type="checkbox"
              checked={status}
              onChange={(event) => setStatus(event.target.checked)}
              className="size-4 cursor-pointer accent-primary"
              aria-label="Status"
            />
          </FormRow>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-card px-5 py-4 sm:px-6">
          <OutlineButton variant="gray" onClick={goBack}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={handleSave}>Save Changes</PrimaryButton>
        </div>
      </div>
    </ReportsPageShell>
  )
}
