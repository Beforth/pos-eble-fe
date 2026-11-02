import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { showToast } from '../../utils/toast'
import { useNavigate, useParams } from 'react-router-dom'
import { ReportsPageShell } from '../../components/layout/ReportsPageShell'
import {
  OutlineButton,
  PrimaryButton,
} from '../../components/menu/MenuActionButtons'
import { useAuth } from '../../auth/AuthContext'
import {
  createSubOrderTypeApi,
  listSubOrderTypesApi,
  updateSubOrderTypeApi,
  type SubOrderTypeKind,
  type SubOrderTypeOrderType,
} from '../../services/outletService'
import { ORDER_TYPE_LABEL, ORDER_TYPE_OPTIONS } from './subOrderTypeLabels'

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
  const { encryptedOutletId } = useAuth()
  const [name, setName] = useState('')
  const [status, setStatus] = useState(true)
  const [orderTypes, setOrderTypes] = useState<SubOrderTypeOrderType[]>(['dine-in'])
  const [kind, setKind] = useState<SubOrderTypeKind>('manual')
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id || !encryptedOutletId) return
    let cancelled = false
    listSubOrderTypesApi(encryptedOutletId)
      .then((rows) => {
        const row = rows.find((item) => item.id === id)
        if (cancelled || !row) return
        setName(row.name)
        setStatus(row.is_active)
        setOrderTypes(row.order_types)
        setKind(row.kind)
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
    () => (isEdit ? 'Edit Sub Order Type' : 'Add Sub Order Type'),
    [isEdit],
  )


  function goBack() {
    navigate('/management/configuration/sub-order-type')
  }

  function toggleOrderType(type: SubOrderTypeOrderType) {
    setOrderTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type],
    )
  }

  async function handleSave() {
    if (!name.trim()) {
      showToast('Name is required')
      return
    }
    if (orderTypes.length === 0) {
      showToast('Pick at least one order type')
      return
    }
    if (!encryptedOutletId || saving) return
    setSaving(true)
    try {
      if (isEdit && id) {
        await updateSubOrderTypeApi(
          encryptedOutletId,
          id,
          kind === 'manual'
            ? { name: name.trim(), order_types: orderTypes, is_active: status }
            : { is_active: status },
        )
        showToast('Sub order type updated')
      } else {
        await createSubOrderTypeApi(encryptedOutletId, {
          name: name.trim(),
          order_types: orderTypes,
          is_active: status,
        })
        showToast('Sub order type saved')
      }
      window.setTimeout(goBack, 700)
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ReportsPageShell title={title} activeItem="config-sub-order-type">

      <div className="overflow-hidden rounded-xl border border-line bg-card">
        <div className="space-y-6 p-5 sm:p-6">
          <FormRow label="Name" required>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={loading || kind !== 'manual'}
              className={inputClass}
            />
          </FormRow>

          <FormRow label="Order Type" required align="start">
            <div className="flex flex-wrap gap-4">
              {ORDER_TYPE_OPTIONS.map((type) => (
                <label key={type} className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={orderTypes.includes(type)}
                    onChange={() => toggleOrderType(type)}
                    disabled={loading || kind !== 'manual'}
                    className="size-4 cursor-pointer accent-primary"
                  />
                  {ORDER_TYPE_LABEL[type]}
                </label>
              ))}
            </div>
          </FormRow>

          <FormRow label="Status">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={status}
                onChange={(event) => setStatus(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
                aria-label="Status"
              />
              <span
                className={`text-sm ${
                  status ? 'font-medium text-primary' : 'text-muted'
                }`}
              >
                {status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </FormRow>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-line bg-card px-5 py-4 sm:px-6">
          <OutlineButton variant="gray" onClick={goBack}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={() => void handleSave()} disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save Changes'}
          </PrimaryButton>
        </div>
      </div>
    </ReportsPageShell>
  )
}
