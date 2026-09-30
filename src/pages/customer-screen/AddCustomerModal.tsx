import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { showToast } from '../../utils/toast'
import {
  findOrCreateCustomerApi,
  updateCustomerApi,
  type CustomerDto,
} from '../../services/customerService'

interface AddCustomerModalProps {
  open: boolean
  customer: CustomerDto | null
  outletId: string
  onClose: () => void
  onSaved: (customer: CustomerDto) => void
}

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  gstin: '',
  address: '',
}

export function AddCustomerModal({
  open,
  customer,
  outletId,
  onClose,
  onSaved,
}: AddCustomerModalProps) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const isEdit = Boolean(customer)

  useEffect(() => {
    if (!open) return
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        gstin: customer.gstin,
        address: customer.address,
      })
    } else {
      setForm(EMPTY)
    }
    setError(null)
    setSaving(false)
  }, [open, customer])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  async function handleSave() {
    const name = form.name.trim()
    const phone = form.phone.replace(/\D/g, '').slice(0, 10)
    if (!name) {
      setError('Customer name is required')
      return
    }
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit phone number')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const body = {
        name,
        phone,
        gstin: form.gstin.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      }
      const saved = customer
        ? await updateCustomerApi(outletId, customer.id, body)
        : await findOrCreateCustomerApi(outletId, body)
      showToast(saved.id === customer?.id ? 'Customer updated' : 'Customer added')
      onSaved(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save customer')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close customer form"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit Customer' : 'Add Customer'}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-bold text-ink">
            {isEdit ? 'Edit Customer' : 'Add Customer'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <label className="block text-sm font-medium text-ink">
            Name*
            <input
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Phone*
            <input
              value={form.phone}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  phone: event.target.value.replace(/\D/g, '').slice(0, 10),
                }))
              }
              inputMode="numeric"
              className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            GSTIN
            <input
              value={form.gstin}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, gstin: event.target.value }))
              }
              className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Address
            <input
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
              className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          {error ? <p className="text-xs text-primary">{error}</p> : null}
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-line bg-white px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </footer>
      </div>
    </div>
  )
}