import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Wallet, X } from 'lucide-react'
import { type OtherPaymentType } from './OtherPaymentModal'
import { usePaymentTypeOptions } from '../../services/usePaymentTypeOptions'
import type { PaymentMethod } from './BillPanel'

const MAIN_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'due', label: 'Due' },
  { id: 'part', label: 'Part' },
]

interface MorePaymentDrawerProps {
  open: boolean
  payment: PaymentMethod
  otherType?: string
  onSelectMethod: (method: PaymentMethod) => void
  onSelectOther: (type: OtherPaymentType) => void
  onClose: () => void
}

function tileClass(active: boolean) {
  return `flex h-20 select-none items-center justify-center rounded-xl border px-2 text-center text-sm font-medium transition-colors ${
    active
      ? 'border-primary bg-primary/10 font-semibold text-primary shadow-sm'
      : 'border-line bg-card text-ink hover:border-primary/40 hover:bg-page'
  }`
}

/** Right-hand drawer with every payment method, opened from the "More" tile. */
export function MorePaymentDrawer({
  open,
  payment,
  otherType,
  onSelectMethod,
  onSelectOther,
  onClose,
}: MorePaymentDrawerProps) {
  const paymentTypeOptions = usePaymentTypeOptions()
  const [otherOpen, setOtherOpen] = useState(true)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <button
        type="button"
        aria-label="Close payment options"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="More payment options"
        className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-card shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold text-ink">More</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-tooltip="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={20} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid grid-cols-3 gap-3">
            {MAIN_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => {
                  onSelectMethod(method.id)
                  onClose()
                }}
                className={tileClass(payment === method.id)}
              >
                {method.label}
              </button>
            ))}
          </div>

          <section>
            <button
              type="button"
              onClick={() => setOtherOpen((prev) => !prev)}
              aria-expanded={otherOpen}
              className="flex w-full items-center justify-between rounded-lg bg-page px-3 py-3 text-sm font-semibold text-ink"
            >
              <span className="inline-flex items-center gap-2">
                <Wallet size={16} className="text-muted" />
                Other
              </span>
              <ChevronDown
                size={16}
                className={`text-muted transition-transform ${otherOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {otherOpen ? (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {paymentTypeOptions.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      onSelectOther(type)
                      onClose()
                    }}
                    className={tileClass(
                      payment === 'other' && otherType === type,
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </aside>
    </div>,
    document.body,
  )
}
