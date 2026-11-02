import { useEffect, useMemo, useState } from 'react'

import { showToast } from '../../utils/toast'
import { ArrowLeft, Home, MapPin } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import {
  createAreaDeliveryChargeApi,
  listAreaDeliveryChargesApi,
  updateAreaDeliveryChargeApi,
} from '../../services/outletService'

function Field({
  label,
  hint,
  prefix,
  required,
  value,
  onChange,
  disabled,
  placeholder,
  inputMode,
}: {
  label: string
  hint: string
  prefix?: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  inputMode?: 'decimal'
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink">
        {label} {required ? <span className="text-primary">*</span> : null}
      </span>
      <span className="flex h-11 items-center overflow-hidden rounded-lg border border-line bg-card focus-within:border-primary">
        {prefix ? (
          <span className="flex h-full items-center border-r border-line bg-page px-3 text-sm font-medium text-muted">
            {prefix}
          </span>
        ) : null}
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-muted/60 disabled:cursor-not-allowed"
        />
      </span>
      <span className="mt-1 block text-xs text-muted">{hint}</span>
    </label>
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
  const { encryptedOutletId } = useAuth()
  const [areaLocalityName, setAreaLocalityName] = useState('')
  const [deliveryCharge, setDeliveryCharge] = useState('')
  const [status, setStatus] = useState(true)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id || !encryptedOutletId) return
    let cancelled = false
    listAreaDeliveryChargesApi(encryptedOutletId)
      .then((rows) => {
        const row = rows.find((item) => item.id === id)
        if (cancelled || !row) return
        setAreaLocalityName(row.name)
        setDeliveryCharge(row.charge)
        setStatus(row.is_active)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(error instanceof Error ? error.message : 'Failed to load')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, encryptedOutletId])

  const pageLabel = useMemo(
    () =>
      isEdit
        ? 'Edit Area/Locality Wise Delivery Charges'
        : 'Add Area/Locality Wise Delivery Charges',
    [isEdit],
  )


  function goBack() {
    navigate('/management/configuration/area-locality-delivery')
  }

  async function handleSave() {
    if (!areaLocalityName.trim()) {
      showToast('Area/Locality Name is required')
      return
    }
    if (!encryptedOutletId || saving) return
    const payload = {
      name: areaLocalityName.trim(),
      charge: deliveryCharge.trim() || '0',
      is_active: status,
    }
    setSaving(true)
    try {
      if (isEdit && id) {
        await updateAreaDeliveryChargeApi(encryptedOutletId, id, payload)
        showToast('Delivery charge updated')
      } else {
        await createAreaDeliveryChargeApi(encryptedOutletId, payload)
        showToast('Delivery charge saved')
      }
      window.setTimeout(goBack, 700)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ReportsPageShell
      title={
        <span className="flex flex-wrap items-center gap-1 text-sm! font-medium! sm:text-sm!">
          <Link
            to="/"
            className="inline-flex items-center text-primary hover:underline"
            aria-label="Home"
            data-tooltip="Home"
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

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-6">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin size={20} />
          </span>
          <div>
            <h2 className="text-base font-bold text-ink">
              {isEdit ? 'Edit area / locality charge' : 'New area / locality charge'}
            </h2>
            <p className="text-xs text-muted">
              Set the delivery charge for orders delivered to one area or locality.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Area/Locality Name"
              required
              placeholder="College Road"
              hint="The area or locality customers are delivered to."
              value={areaLocalityName}
              onChange={setAreaLocalityName}
              disabled={loading}
            />
            <Field
              label="Delivery Charge"
              prefix="₹"
              inputMode="decimal"
              placeholder="40"
              hint="Only used for Delivery orders. Leave blank for no charge."
              value={deliveryCharge}
              onChange={setDeliveryCharge}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-page px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Status</p>
              <p className="text-xs text-muted">
                {status
                  ? 'Active: this charge applies to the area.'
                  : 'Inactive: this charge is kept but not used.'}
              </p>
            </div>
            <StatusSwitch checked={status} onChange={setStatus} />
          </div>

          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              areaLocalityName.trim()
                ? 'border-primary/20 bg-primary/5 text-ink'
                : 'border-dashed border-line bg-page text-muted'
            }`}
          >
            {areaLocalityName.trim() ? (
              <>
                Delivery orders to <strong>{areaLocalityName.trim()}</strong> are charged{' '}
                <strong>₹{Number(deliveryCharge) || 0}</strong>.
              </>
            ) : (
              'Enter the area and the charge to see how it will apply.'
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-page px-5 py-4 sm:px-6">
          <OutlineButton variant="gray" onClick={goBack}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={() => void handleSave()} disabled={saving || loading}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Charge'}
          </PrimaryButton>
        </div>
      </div>
    </ReportsPageShell>
  )
}
