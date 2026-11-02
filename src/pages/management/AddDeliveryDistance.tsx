import { useEffect, useMemo, useState } from 'react'

import { Route as RouteIcon } from 'lucide-react'
import { showToast } from '../../utils/toast'
import { useNavigate, useParams } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import {
  createDeliveryDistanceApi,
  listDeliveryDistancesApi,
  updateDeliveryDistanceApi,
} from '../../services/outletService'

function Field({
  label,
  hint,
  prefix,
  suffix,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string
  hint: string
  prefix?: string
  suffix?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-ink">
        {label} <span className="text-primary">*</span>
      </span>
      <span className="flex h-11 items-center overflow-hidden rounded-lg border border-line bg-card focus-within:border-primary">
        {prefix ? (
          <span className="flex h-full items-center border-r border-line bg-page px-3 text-sm font-medium text-muted">
            {prefix}
          </span>
        ) : null}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-muted/60 disabled:cursor-not-allowed"
        />
        {suffix ? (
          <span className="flex h-full items-center border-l border-line bg-page px-3 text-sm font-medium text-muted">
            {suffix}
          </span>
        ) : null}
      </span>
      <span className="mt-1 block text-xs text-muted">{hint}</span>
    </label>
  )
}

export default function AddDeliveryDistance() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { encryptedOutletId } = useAuth()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id || !encryptedOutletId) return
    let cancelled = false
    listDeliveryDistancesApi(encryptedOutletId)
      .then((rows) => {
        const row = rows.find((item) => item.id === id)
        if (cancelled || !row) return
        setFrom(row.from_km)
        setTo(row.to_km)
        setPrice(row.charge)
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

  const title = useMemo(
    () => (isEdit ? 'Edit Distance' : 'Add Distance'),
    [isEdit],
  )


  function goBack() {
    navigate('/management/configuration/delivery-distance')
  }

  async function handleSave() {
    if (!from.trim() || !to.trim() || !price.trim()) {
      showToast('Please fill all required fields')
      return
    }
    if (!encryptedOutletId || saving) return
    const payload = { from_km: from.trim(), to_km: to.trim(), charge: price.trim() }
    setSaving(true)
    try {
      if (isEdit && id) {
        await updateDeliveryDistanceApi(encryptedOutletId, id, payload)
        showToast('Distance updated')
      } else {
        await createDeliveryDistanceApi(encryptedOutletId, payload)
        showToast('Distance saved')
      }
      window.setTimeout(goBack, 700)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const fromNum = Number(from)
  const toNum = Number(to)
  const priceNum = Number(price)
  const previewReady =
    from.trim() !== '' &&
    to.trim() !== '' &&
    price.trim() !== '' &&
    Number.isFinite(fromNum) &&
    Number.isFinite(toNum) &&
    Number.isFinite(priceNum) &&
    toNum > fromNum

  return (
    <ReportsPageShell title={title} activeItem="config-delivery-distance">
      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-6">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <RouteIcon size={20} />
          </span>
          <div>
            <h2 className="text-base font-bold text-ink">
              {isEdit ? 'Edit delivery distance' : 'New delivery distance'}
            </h2>
            <p className="text-xs text-muted">
              Set the delivery charge for orders delivered within a distance range.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="From"
              suffix="km"
              placeholder="0"
              hint="Start of the range, included."
              value={from}
              onChange={setFrom}
              disabled={loading}
            />
            <Field
              label="To"
              suffix="km"
              placeholder="3"
              hint="End of the range, not included."
              value={to}
              onChange={setTo}
              disabled={loading}
            />
          </div>
          <Field
            label="Delivery charge"
            prefix="₹"
            placeholder="30"
            hint="What the customer pays for a delivery in this range."
            value={price}
            onChange={setPrice}
            disabled={loading}
          />

          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              previewReady
                ? 'border-primary/20 bg-primary/5 text-ink'
                : 'border-dashed border-line bg-page text-muted'
            }`}
          >
            {previewReady ? (
              <>
                A delivery of <strong>{fromNum} km</strong> up to (not including){' '}
                <strong>{toNum} km</strong> is charged <strong>₹{priceNum}</strong>.
              </>
            ) : (
              'Fill in the range and the charge to see how it will apply.'
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-page px-5 py-4 sm:px-6">
          <OutlineButton variant="gray" onClick={goBack}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={() => void handleSave()} disabled={saving || loading}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Distance'}
          </PrimaryButton>
        </div>
      </div>
    </ReportsPageShell>
  )
}
