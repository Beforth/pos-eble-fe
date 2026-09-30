import type { ReactNode } from 'react'
import { ConfirmDialog } from './ConfirmDialog'

interface ConfirmDeleteModalProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  target?: string
  consequences?: string[]
  note?: ReactNode
  onConfirm: () => void
  onClose: () => void
}

/**
 * Backwards-compatible shim over `ConfirmDialog`, kept so the existing call
 * sites (parent category, group, table, screens, menu item, physical menu) keep
 * working unchanged while they are migrated to the richer API.
 *
 * Deletes here are soft (see STANDARDS.md §17), so the default note corrects the
 * old "this action cannot be undone" wording. Prefer `ConfirmDialog` directly for
 * new call sites — it does not auto-close, which lets you drive a `loading`
 * state around the API call.
 */
export function ConfirmDeleteModal({
  open,
  title = 'Confirm Delete',
  message,
  confirmLabel = 'Delete',
  target,
  consequences,
  note = 'This record is archived, not erased. It will stop appearing in lists and reports.',
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  return (
    <ConfirmDialog
      open={open}
      title={title}
      target={target}
      message={message}
      consequences={consequences}
      note={note}
      confirmLabel={confirmLabel}
      onConfirm={() => {
        onConfirm()
        onClose()
      }}
      onClose={onClose}
    />
  )
}
