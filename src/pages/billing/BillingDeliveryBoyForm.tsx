import { useEffect, useState, type FormEvent } from 'react'

import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { BillingHeader } from '../../components/billing/BillingHeader'
import {
  createDeliveryBoyApi,
  getDeliveryBoyApi,
  updateDeliveryBoyApi,
  type DeliveryBoyForm,
} from '../../services/deliveryBoyService'
import { useNewOrder } from '../../state/useNewOrder'
import { showToast } from '../../utils/toast'

const EMPTY: DeliveryBoyForm = { name: '', username: '', userCode: '', password: '', phone: '' }

const inputClass =
  'h-10 w-full rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none focus:border-primary'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="grid items-center gap-1 sm:grid-cols-[180px_minmax(0,280px)] sm:gap-0">
      <span className="text-sm font-medium text-ink">
        {label}
        {required ? <span className="ml-0.5 text-primary">*</span> : null}
      </span>
      {children}
    </label>
  )
}

/** Add Delivery Boy, or Edit when the route carries an id. */
export default function BillingDeliveryBoyForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const editing = Boolean(id)
  const { startNewOrder } = useNewOrder()
  const [billNo, setBillNo] = useState('')
  const [form, setForm] = useState<DeliveryBoyForm>(EMPTY)
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    getDeliveryBoyApi(id)
      .then((user) => {
        if (cancelled) return
        setForm({
          name: user.first_name || user.name,
          username: user.username,
          userCode: user.user_code ?? '',
          password: '',
          phone: user.phone ?? '',
        })
      })
      .catch((error: unknown) => {
        showToast(error instanceof Error ? error.message : 'Failed to load delivery boy')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  function set<K extends keyof DeliveryBoyForm>(key: K, value: string) {
    setForm((cur) => ({ ...cur, [key]: value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim() || !form.username.trim() || !form.userCode.trim()) {
      showToast('Name, user name and user code are required')
      return
    }
    if (!editing && !form.password) {
      showToast('Password is required')
      return
    }
    setSaving(true)
    try {
      if (id) await updateDeliveryBoyApi(id, form)
      else await createDeliveryBoyApi(form)
      showToast(editing ? 'Delivery boy updated' : 'Delivery boy added')
      navigate('/billing/delivery-boys')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save delivery boy')
    } finally {
      setSaving(false)
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

      <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-ink">
            {editing ? 'Edit Delivery Boy' : 'Add Delivery Boy'}
          </h1>
          <button
            type="button"
            onClick={() => navigate('/billing/delivery-boys')}
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-line bg-card px-3 text-sm font-medium text-ink hover:bg-page"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-line bg-card"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="space-y-3 p-5">
              <Field label="Name" required>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  maxLength={150}
                  className={inputClass}
                />
              </Field>
              <Field label="User Name" required>
                <input
                  value={form.username}
                  onChange={(e) => set('username', e.target.value)}
                  maxLength={150}
                  autoComplete="off"
                  className={inputClass}
                />
              </Field>
              <Field label="User Code" required>
                <input
                  value={form.userCode}
                  onChange={(e) => set('userCode', e.target.value)}
                  maxLength={50}
                  className={inputClass}
                />
              </Field>
              <Field label="Password" required={!editing}>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  autoComplete="new-password"
                  placeholder={editing ? 'Leave blank to keep the current one' : ''}
                  className={inputClass}
                />
              </Field>
              <Field label="Phone Number">
                <input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  inputMode="tel"
                  maxLength={30}
                  className={inputClass}
                />
              </Field>
            </div>
          )}
          <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
            <button
              type="button"
              onClick={() => navigate('/billing/delivery-boys')}
              disabled={saving}
              className="inline-flex h-10 items-center rounded-lg border border-line bg-card px-5 text-sm font-medium text-ink hover:bg-page disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
