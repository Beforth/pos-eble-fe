import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
  X,
} from 'lucide-react'

interface OtherDetailsDrawerProps {
  open: boolean
  onClose: () => void
  /** Transfer only shows register + shipping address. */
  variant?: 'sales' | 'transfer'
}

const DEFAULT_REGISTER_ADDRESS =
  'Shop 01, Sunrich Apartment, Satpur, College Road, Nashik, Nashik, Maharashtra'

const inputClass =
  'h-10 w-full rounded-md border border-line bg-card px-3 text-sm outline-none focus:border-primary'
const textareaClass =
  'w-full resize-y rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-primary'

export function OtherDetailsDrawer({
  open,
  onClose,
  variant = 'sales',
}: OtherDetailsDrawerProps) {
  const [bankName, setBankName] = useState('HDFC Bank')
  const [bankBranch, setBankBranch] = useState('NASHIK ROAD')
  const [ifsc, setIfsc] = useState('HDFC0000456')
  const [accountNumber, setAccountNumber] = useState('50200067505413')
  const [registerAddress, setRegisterAddress] = useState(
    DEFAULT_REGISTER_ADDRESS,
  )
  const [shippingAddress, setShippingAddress] = useState('')
  const [reverseCharge, setReverseCharge] = useState<'yes' | 'no'>('no')
  const [terms, setTerms] = useState('')
  const isTransfer = variant === 'transfer'

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

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close other details"
        onClick={onClose}
        className={`absolute inset-0 cursor-pointer bg-ink/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="other-details-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
          <h2
            id="other-details-title"
            className="text-base font-semibold text-ink"
          >
            Other Details
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

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {!isTransfer ? (
            <>
              <Field label="Bank Name">
                <input
                  type="text"
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Bank Branch">
                <input
                  type="text"
                  value={bankBranch}
                  onChange={(event) => setBankBranch(event.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="IFSC CODE">
                <input
                  type="text"
                  value={ifsc}
                  onChange={(event) => setIfsc(event.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Account Number">
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value)}
                  className={inputClass}
                />
              </Field>
            </>
          ) : null}

          <Field label="Register Address">
            <textarea
              value={registerAddress}
              onChange={(event) => setRegisterAddress(event.target.value)}
              rows={4}
              className={textareaClass}
            />
          </Field>

          <Field label="Shipping Address">
            <textarea
              value={shippingAddress}
              onChange={(event) => setShippingAddress(event.target.value)}
              rows={4}
              className={textareaClass}
            />
          </Field>

          {!isTransfer ? (
            <>
              <section>
                <p className="mb-2 text-sm font-medium text-ink">
                  Whether Tax Payable under Reverse Charge
                </p>
                <div className="flex flex-wrap gap-4">
                  {(['no', 'yes'] as const).map((option) => (
                    <label
                      key={option}
                      className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink"
                    >
                      <input
                        type="radio"
                        name="reverse-charge"
                        checked={reverseCharge === option}
                        onChange={() => setReverseCharge(option)}
                        className="size-4 accent-primary"
                      />
                      {option === 'no' ? 'No' : 'Yes'}
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <p className="mb-2 text-sm font-medium text-ink">
                  Terms & Conditions
                </p>
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
                    className="w-full resize-y bg-card px-3 py-2 text-sm outline-none"
                  />
                </div>
              </section>
            </>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-line px-5 py-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-card px-4 text-sm font-medium text-ink hover:bg-page"
            >
              Close
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  )
}
