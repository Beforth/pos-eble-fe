import { useEffect, useRef, useState } from 'react'

/** Largest quantity a single cart line accepts - stops a stray extra digit. */
export const MAX_LINE_QTY = 9999

interface QtyInputProps {
  value: number
  /** Accessible name, e.g. "Quantity for Dabeli". */
  label: string
  /** Called with a whole number from 1 to MAX_LINE_QTY, only when it changed. */
  onCommit: (qty: number) => void
}

/**
 * Editable quantity for a cart line, so 100 of an item is typed once instead
 * of tapped 100 times. The draft is local while typing; Enter or leaving the
 * box commits it. An empty box, 0 or junk reverts to the current quantity -
 * removing a line stays on the minus button.
 */
export function QtyInput({ value, label, onCommit }: QtyInputProps) {
  const [draft, setDraft] = useState(String(value))
  const [editing, setEditing] = useState(false)
  // Escape reverts; the blur it triggers must not commit the stale draft.
  const cancelled = useRef(false)

  // Follow the +/- buttons (and any other change) while the box is idle.
  useEffect(() => {
    if (!editing) setDraft(String(value))
  }, [value, editing])

  function commit() {
    setEditing(false)
    if (cancelled.current) {
      cancelled.current = false
      setDraft(String(value))
      return
    }
    const next = Number(draft)
    if (!Number.isInteger(next) || next < 1) {
      setDraft(String(value))
      return
    }
    const clamped = Math.min(next, MAX_LINE_QTY)
    setDraft(String(clamped))
    if (clamped !== value) onCommit(clamped)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      aria-label={label}
      value={draft}
      onFocus={(event) => {
        setEditing(true)
        event.currentTarget.select()
      }}
      onChange={(event) =>
        setDraft(event.target.value.replace(/\D/g, '').slice(0, 4))
      }
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur()
        } else if (event.key === 'Escape') {
          cancelled.current = true
          event.currentTarget.blur()
        }
      }}
      className="h-6 w-11 rounded border border-line bg-card text-center text-sm font-semibold tabular-nums text-ink outline-none focus:border-primary"
    />
  )
}
