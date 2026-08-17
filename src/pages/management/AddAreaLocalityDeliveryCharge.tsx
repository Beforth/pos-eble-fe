import { useMemo, useState, type ReactNode } from 'react'
import { ArrowLeft, Home } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
      className={`grid gap-2 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-4 ${
        align === 'start' ? 'sm:items-start' : 'sm:items-center'
      }`}
    >
      <label className="text-sm font-medium text-ink sm:pt-1">
        {label} {required ? <span className="text-primary">*</span> : null}
      </label>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function StatusSwitch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Status"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-line'
      }`}
    >
      <span
        className={`inline-block size-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

export default function AddAreaLocalityDeliveryCharge() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [toast, setToast] = useState<string | null>(null)
  const [areaLocalityName, setAreaLocalityName] = useState(
    isEdit ? 'College Road' : '',
  )
  const [deliveryCharge, setDeliveryCharge] = useState(isEdit ? '40' : '')
  const [status, setStatus] = useState(true)

  const pageLabel = useMemo(
    () =>
      isEdit
        ? 'Edit Area/Locality Wise Delivery Charges'
        : 'Add Area/Locality Wise Delivery Charges',
    [isEdit],
  )

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  function goBack() {
    navigate('/management/configuration/area-locality-delivery')
  }

  function handleSave() {
    if (!areaLocalityName.trim()) {
      showToast('Area/Locality Name is required')
      return
    }
    showToast(isEdit ? 'Delivery charge updated' : 'Delivery charge saved')
    window.setTimeout(goBack, 700)
  }

  return (
    <ReportsPageShell
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:underline"
            aria-label="Home"
          >
            <Home size={14} />
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link
            to="/management/configuration"
            className="text-primary hover:underline"
          >
            Configuration
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <Link
            to="/management/configuration/area-locality-delivery"
            className="text-primary hover:underline"
          >
            Area/Locality Wise Delivery Charges
          </Link>
          <span className="font-normal text-muted">&gt;</span>
          <span className="font-semibold text-ink">{pageLabel}</span>
        </span>
      }
      activeItem="config-area-locality-delivery"
      actions={
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      }
    >
      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="mb-4">
        <h1 className="text-lg font-bold text-ink sm:text-xl">{pageLabel}</h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-5 p-5 sm:p-6">
          <FormRow label="Area/Locality Name" required>
            <input
              type="text"
              value={areaLocalityName}
              onChange={(event) => setAreaLocalityName(event.target.value)}
              className={inputClass}
            />
          </FormRow>

          <FormRow label="Delivery Charge" align="start">
            <div>
              <input
                type="text"
                inputMode="decimal"
                value={deliveryCharge}
                onChange={(event) => setDeliveryCharge(event.target.value)}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-muted">
                Note: Only for Delivery Order Type
              </p>
            </div>
          </FormRow>

          <FormRow label="Status" required>
            <StatusSwitch checked={status} onChange={setStatus} />
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
