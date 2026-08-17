import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { OutlineButton, PrimaryButton } from '../menu/MenuActionButtons'

interface ConfirmDeleteModalProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDeleteModal({
  open,
  title = 'Confirm Delete',
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  const titleId = useId()
  const messageId = useId()

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
        aria-label="Close"
        className="absolute inset-0 cursor-pointer bg-ink/40"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-line bg-card shadow-xl [background-color:var(--color-card)]"
      >
        <div className="border-b border-line px-5 py-3.5">
          <h2 id={titleId} className="text-base font-semibold text-ink">
            {title}
          </h2>
        </div>
        <div className="px-5 py-5">
          <p id={messageId} className="text-sm leading-relaxed text-ink">
            {message}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3.5">
          <OutlineButton variant="gray" onClick={onClose}>
            Cancel
          </OutlineButton>
          <PrimaryButton
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}
