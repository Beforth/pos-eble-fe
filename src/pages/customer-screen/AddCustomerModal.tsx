import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { CustomerRow } from './customersData'

interface AddCustomerModalProps {
  open: boolean
  customer: CustomerRow | null
  onClose: () => void
  onSave: (customer: Omit<CustomerRow, 'id' | 'orders' | 'lastVisit'> & {
    id?: string
  }) => void
}

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  address: '',
  locality: '',
  dueAmount: '',
  loyaltyPoints: '',
}

export function AddCustomerModal({
  open,
  customer,
  onClose,
  onSave,
}: AddCustomerModalProps) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const isEdit = Boolean(customer)

  useEffect(() => {
    if (!open) return
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        locality: customer.locality,
        dueAmount: customer.dueAmount ? String(customer.dueAmount) : '',
        loyaltyPoints: customer.loyaltyPoints
          ? String(customer.loyaltyPoints)
          : '',
      })
    } else {
      setForm(EMPTY)
    }
    setError(null)
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

  function handleSave() {
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
    onSave({
      id: customer?.id,
      name,
      phone,
      email: form.email.trim(),
      address: form.address.trim(),
      locality: form.locality.trim(),
      dueAmount: Number(form.dueAmount) || 0,
      loyaltyPoints: Number(form.loyaltyPoints) || 0,
    })
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
            Address
            <input
              value={form.address}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, address: event.target.value }))
              }
              className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm font-medium text-ink">
            Locality
            <input
              value={form.locality}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, locality: event.target.value }))
              }
              className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-ink">
              Due Amount (₹)
              <input
                type="number"
                min={0}
                value={form.dueAmount}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    dueAmount: event.target.value,
                  }))
                }
                className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Loyalty Points
              <input
                type="number"
                min={0}
                value={form.loyaltyPoints}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    loyaltyPoints: event.target.value,
                  }))
                }
                className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>
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
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  )
}
