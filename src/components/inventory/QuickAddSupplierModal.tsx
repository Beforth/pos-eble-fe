import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { SearchableSelect } from './SearchableSelect'
import {
  OutlineButton,
  PrimaryButton,
} from '../menu/MenuActionButtons'

const TYPE_OPTIONS = ['Both', 'Purchase', 'Sale'] as const

export interface QuickAddSupplierValues {
  name: string
  company: string
  phone: string
  registeredUnderGst: boolean
  type: (typeof TYPE_OPTIONS)[number]
}

interface QuickAddSupplierModalProps {
  open: boolean
  onClose: () => void
  onSave: (values: QuickAddSupplierValues) => Promise<boolean>
  saving?: boolean
}

export function QuickAddSupplierModal({
  open,
  onClose,
  onSave,
  saving = false,
}: QuickAddSupplierModalProps) {
  const titleId = useId()
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [registeredUnderGst, setRegisteredUnderGst] = useState('Yes')
  const [type, setType] = useState<(typeof TYPE_OPTIONS)[number]>('Both')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setName('')
    setCompany('')
    setPhone('')
    setRegisteredUnderGst('Yes')
    setType('Both')
    setError('')
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  async function handleSave() {
    if (saving) return
    const trimmedName = name.trim()
    const trimmedCompany = company.trim()
    if (!trimmedName) {
      setError('Name is required')
      return
    }
    if (!trimmedCompany) {
      setError('Company is required')
      return
    }
    setError('')
    const ok = await onSave({
      name: trimmedName,
      company: trimmedCompany,
      phone: phone.trim(),
      registeredUnderGst: registeredUnderGst === 'Yes',
      type,
    })
    if (ok) onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-line bg-card shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 id={titleId} className="text-base font-semibold text-ink">
              Add Supplier / Third Party
            </h2>
            <p className="mt-1 text-sm text-muted">
              Save the supplier here and keep filling this screen. You can add
              extra details later from the Suppliers tab.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 rounded-md p-1 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Name <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Company <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SearchableSelect
              label="Registered Under GST"
              required
              value={registeredUnderGst}
              options={['Yes', 'No']}
              placeholder="Please select"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={setRegisteredUnderGst}
            />
            <SearchableSelect
              label="Type"
              required
              value={type}
              options={[...TYPE_OPTIONS]}
              placeholder="Please select"
              searchPlaceholder="Search"
              includePlaceholderOption={false}
              onChange={(value) =>
                setType((value as (typeof TYPE_OPTIONS)[number]) || 'Both')
              }
            />
          </div>
          {error ? <p className="text-sm text-primary">{error}</p> : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <OutlineButton variant="gray" onClick={onClose}>
            Cancel
          </OutlineButton>
          <PrimaryButton onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}
