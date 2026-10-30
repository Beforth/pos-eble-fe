import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, X } from 'lucide-react'
import { OutlineButton, PrimaryButton } from '../menu/MenuActionButtons'

const DEFAULT_STEPS = [
  {
    title: 'Prepare your data',
    body: 'Download the sample Excel/CSV template and fill quantity (and unit where asked) for each raw material row. Do not rename header columns.',
  },
  {
    title: 'Upload the file',
    body: 'Use Import Via Excel, choose your completed .xlsx / .xls / .csv file (max 10MB), then review any highlighted errors before confirming.',
  },
  {
    title: 'Save stock',
    body: 'On Add Stock, enter quantities for the selected date and stock-update cycle, then Save. Use Reset to clear unsaved entries.',
  },
  {
    title: 'Verify',
    body: 'Check Current Stock report or the dashboard after save to confirm balances moved as expected.',
  },
]

interface StockStepGuideModalProps {
  open: boolean
  onClose: () => void
  title?: string
  steps?: { title: string; body: string }[]
  footerActions?: ReactNode
}

export function StockStepGuideModal({
  open,
  onClose,
  title = 'Step-by-step guide',
  steps = DEFAULT_STEPS,
  footerActions,
}: StockStepGuideModalProps) {
  const titleId = useId()

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

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close guide"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-line bg-card shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {steps.map((step, index) => (
            <article key={step.title} className="flex gap-3">
              <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </div>
            </article>
          ))}
        </div>
        <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">
          {footerActions}
          <OutlineButton variant="gray" onClick={onClose}>
            Close
          </OutlineButton>
          <PrimaryButton onClick={onClose}>Got it</PrimaryButton>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
