import { useEffect, useState } from 'react'
import { CalendarClock, X } from 'lucide-react'
import {
  DateTimeField,
  formatDateTimeDisplay,
} from '../common/DateTimeField'
import { PrimaryButton } from './MenuActionButtons'

function roundUpToNextMinute(date: Date): Date {
  const next = new Date(date)
  next.setSeconds(0, 0)
  next.setMinutes(next.getMinutes() + 2)
  return next
}

interface PublishDateModalProps {
  open: boolean
  onClose: () => void
  onSchedule: (startsAt: Date, endsAt: Date) => void
}

export function PublishDateModal({
  open,
  onClose,
  onSchedule,
}: PublishDateModalProps) {
  const [startsAt, setStartsAt] = useState<Date>(() =>
    roundUpToNextMinute(new Date()),
  )
  const [endsAt, setEndsAt] = useState<Date>(() => {
    const next = roundUpToNextMinute(new Date())
    next.setMinutes(next.getMinutes() + 120)
    return next
  })

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

  const now = new Date()
  const invalid =
    startsAt <= now || endsAt <= startsAt || endsAt <= now

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-date-title"
        className="relative z-10 w-full max-w-[560px] rounded-xl border border-line bg-card shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-line px-6 py-4">
          <h2
            id="publish-date-title"
            className="flex min-w-0 items-center gap-2 text-lg font-bold text-ink"
          >
            <CalendarClock size={18} className="shrink-0 text-primary" />
            Schedule Publish
          </h2>
          <button
            type="button"
            aria-label="Close"
            data-tooltip="Close"
            onClick={onClose}
            className="shrink-0 cursor-pointer rounded-lg p-1.5 text-muted hover:bg-page hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <p className="text-sm leading-relaxed text-ink">
            Your menu changes go live at the publish time and are automatically
            reverted at the revert time.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <DateTimeField
              label="Publish on"
              value={startsAt}
              onChange={(date) => setStartsAt(date)}
              zClassName="z-[150]"
            />
            <DateTimeField
              label="Auto revert on"
              value={endsAt}
              onChange={(date) => setEndsAt(date)}
              zClassName="z-[150]"
            />
          </div>

          {invalid ? (
            <p className="text-xs text-danger">
              Publish time must be in the future, and the revert time must be
              after the publish time.
            </p>
          ) : (
            <p className="text-xs text-muted">
              Schedule: publish {formatDateTimeDisplay(startsAt)} · revert{' '}
              {formatDateTimeDisplay(endsAt)}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg px-4 text-sm font-medium text-ink hover:bg-page"
          >
            Cancel
          </button>
          <PrimaryButton
            disabled={invalid}
            onClick={() => onSchedule(startsAt, endsAt)}
          >
            Schedule Publish
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}