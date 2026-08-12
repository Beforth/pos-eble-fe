import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Bold,
  ExternalLink,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
  X,
} from 'lucide-react'
import { PrimaryButton } from '../menu/MenuActionButtons'

interface SalesSettingsDrawerProps {
  open: boolean
  onClose: () => void
  onSave?: () => void
}

type RoundingMode = 'normal' | 'none' | 'up' | 'down'

export function SalesSettingsDrawer({
  open,
  onClose,
  onSave,
}: SalesSettingsDrawerProps) {
  const [invoiceLabel, setInvoiceLabel] = useState('TAX INVOICE')
  const [rounding, setRounding] = useState<RoundingMode>('none')
  const [cessTax, setCessTax] = useState<'yes' | 'no'>('no')
  const [avgPurchasePrice, setAvgPurchasePrice] = useState<'yes' | 'no'>('no')
  const [termsOpen, setTermsOpen] = useState(true)
  const [terms, setTerms] = useState('')

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  function handleSave() {
    onSave?.()
    onClose()
  }

  function RadioGroup({
    name,
    value,
    options,
    onChange,
  }: {
    name: string
    value: string
    options: { value: string; label: string }[]
    onChange: (value: string) => void
  }) {
    return (
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
          >
            <input
              type="radio"
              name={name}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-4 accent-primary"
            />
            {option.label}
          </label>
        ))}
      </div>
    )
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="sales-settings-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2
            id="sales-settings-title"
            className="text-base font-semibold text-ink"
          >
            Sales Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <section>
            <h3 className="mb-2 text-sm font-bold text-ink">
              Email Template Setting
            </h3>
            <div className="flex items-start gap-3 rounded-md border border-line bg-page px-3 py-3">
              <p className="flex-1 text-sm text-ink">
                You can add default email addresses with a custom header colour
                and icon by clicking here.
              </p>
              <button
                type="button"
                aria-label="Open email template settings"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-line bg-card text-muted hover:text-ink"
              >
                <ExternalLink size={14} />
              </button>
            </div>
          </section>

          <section>
            <label className="mb-1.5 block text-sm font-medium text-ink">
              Label for a sales invoice
            </label>
            <input
              type="text"
              value={invoiceLabel}
              onChange={(event) => setInvoiceLabel(event.target.value)}
              className="h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary"
            />
          </section>

          <section>
            <p className="mb-2 text-sm font-medium text-ink">
              Want to round off or set the invoice total amount as a round
              figure?
            </p>
            <RadioGroup
              name="rounding"
              value={rounding}
              onChange={(value) => setRounding(value as RoundingMode)}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'none', label: 'None' },
                { value: 'up', label: 'Round off up' },
                { value: 'down', label: 'Round off down' },
              ]}
            />
          </section>

          <section>
            <p className="mb-2 text-sm font-medium text-ink">
              Would you like to activate cess tax on invoices?
            </p>
            <RadioGroup
              name="cess-tax"
              value={cessTax}
              onChange={(value) => setCessTax(value as 'yes' | 'no')}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
          </section>

          <section>
            <p className="mb-2 text-sm font-medium text-ink">
              Want to display average purchase(without tax) price as internal
              transfer/sale/sale return price?
            </p>
            <RadioGroup
              name="avg-purchase"
              value={avgPurchasePrice}
              onChange={(value) => setAvgPurchasePrice(value as 'yes' | 'no')}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
          </section>

          <section>
            <button
              type="button"
              onClick={() => setTermsOpen((prev) => !prev)}
              className="mb-2 text-left text-sm font-medium text-primary hover:underline"
            >
              Standardise the sales&apos;s terms and conditions. Click here
            </button>
            {termsOpen ? (
              <div className="overflow-hidden rounded-md border border-line">
                <div className="flex flex-wrap gap-0.5 border-b border-line bg-page px-2 py-1.5">
                  {[
                    { icon: List, label: 'Bulleted list' },
                    { icon: ListOrdered, label: 'Numbered list' },
                    { icon: Bold, label: 'Bold' },
                    { icon: Italic, label: 'Italic' },
                    { icon: Underline, label: 'Underline' },
                    { icon: Link2, label: 'Link' },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.label}
                        type="button"
                        aria-label={item.label}
                        className="inline-flex size-8 items-center justify-center rounded text-muted hover:bg-card hover:text-ink"
                      >
                        <Icon size={14} />
                      </button>
                    )
                  })}
                </div>
                <textarea
                  value={terms}
                  onChange={(event) => setTerms(event.target.value)}
                  rows={6}
                  placeholder="Enter terms and conditions"
                  className="w-full resize-y bg-card px-3 py-2 text-sm outline-none"
                />
              </div>
            ) : null}
          </section>
        </div>

        <div className="shrink-0 border-t border-line px-5 py-3">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Cancel
            </button>
            <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
