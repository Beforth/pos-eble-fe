import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Info, X } from 'lucide-react'
import { Button } from './Button'
import { TooltipWrapper } from './TooltipWrapper'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  /** Name of the thing being acted on, rendered as a highlighted chip. */
  target?: string
  message?: ReactNode
  /** Bulleted "what this affects" list. Omit for a tighter dialog. */
  consequences?: string[]
  /**
   * Truthful outcome line. Supplied per call site on purpose: a soft-deleted
   * record is restorable, but an unsaved cart edit is simply gone. Never let
   * this default to "cannot be undone" â€” see STANDARDS.md Â§19.
   */
  note?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` for destructive actions, `primary` for reversible ones. */
  tone?: 'danger' | 'primary'
  /** Tighter layout for high-frequency edits (cart lines, applied discounts). */
  compact?: boolean
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  target,
  message,
  consequences,
  note,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
  compact = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const titleId = useId()
  const bodyId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  // Close on Escape and keep Tab inside the panel while it is open.
  useEffect(() => {
    if (!open) return
    restoreFocusRef.current = document.activeElement as HTMLElement | null

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (loading) return
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey && (active === first || !panelRef.current.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, loading, onClose])

  // Lock the page behind the dialog, and put focus on Cancel so Enter can never
  // confirm a destructive action by reflex.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const raf = requestAnimationFrame(() => cancelRef.current?.focus())
    return () => {
      document.body.style.overflow = previous
      cancelAnimationFrame(raf)
      restoreFocusRef.current?.focus?.()
    }
  }, [open])

  if (!open) return null

  const isDanger = tone === 'danger'
  const chipTone = isDanger ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'
  const hasBody = Boolean(message || consequences?.length || note)

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={() => {
          if (!loading) onClose()
        }}
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hasBody ? bodyId : undefined}
        className={`relative z-10 flex w-full flex-col overflow-hidden border border-line bg-card shadow-2xl ${
          compact ? 'max-w-sm rounded-xl' : 'max-w-md rounded-xl'
        }`}
      >
        <div className="flex items-start gap-3 border-b border-line px-5 py-4">
          {!compact && (
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${chipTone}`}
              aria-hidden="true"
            >
              <AlertTriangle size={20} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold text-ink">
              {title}
            </h2>
            {target ? (
              <span
                className={`mt-1.5 inline-flex max-w-full items-center rounded-md px-2 py-1 text-sm font-semibold ${chipTone}`}
              >
                <span className="truncate">{target}</span>
              </span>
            ) : null}
          </div>
            <TooltipWrapper label="Close">
              <button
                type="button"
                aria-label="Close"
                disabled={loading}
                onClick={onClose}
                className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-page hover:text-ink disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </TooltipWrapper>
        </div>

        {hasBody ? (
          <div id={bodyId} className={compact ? 'px-5 py-3.5' : 'px-5 py-4'}>
            {message ? (
              <p className="text-sm leading-relaxed text-ink">{message}</p>
            ) : null}

            {consequences?.length ? (
              <ul className={message ? 'mt-3 space-y-1.5' : 'space-y-1.5'}>
                {consequences.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-relaxed text-ink">
                    <span
                      className="mt-1.5 size-1 shrink-0 rounded-full bg-muted"
                      aria-hidden="true"
                    />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {note ? (
              <div
                className={`flex gap-2 rounded-lg border border-line bg-page px-3 py-2.5 ${
                  consequences?.length || message ? 'mt-3.5' : ''
                }`}
              >
                <Info size={14} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-muted">{note}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          className={`flex items-center justify-end gap-2 border-t border-line ${
            compact ? 'px-5 py-3' : 'px-5 py-3.5'
          }`}
        >
          <Button
            ref={cancelRef}
            variant="outline"
            size={compact ? 'sm' : 'md'}
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            size={compact ? 'sm' : 'md'}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
